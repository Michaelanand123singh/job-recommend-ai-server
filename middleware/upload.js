const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        cb(null, `${baseName}-${uniqueSuffix}${extension}`);
    }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
    // Check file extension
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Only allow 1 file at a time
    }
});

// Middleware for single file upload
const uploadSingle = upload.single('resume');

// Enhanced middleware with error handling
const uploadMiddleware = (req, res, next) => {
    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Handle Multer-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: 'File too large',
                    message: 'File size should not exceed 10MB'
                });
            } else if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    error: 'Too many files',
                    message: 'Only one file is allowed'
                });
            } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    error: 'Unexpected field',
                    message: 'File should be uploaded with field name "resume"'
                });
            }
            return res.status(400).json({
                error: 'Upload error',
                message: err.message
            });
        } else if (err) {
            // Handle other errors (like file type validation)
            return res.status(400).json({
                error: 'File validation error',
                message: err.message
            });
        }
        
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please select a resume file to upload'
            });
        }
        
        // Add file info to request for use in controllers
        req.fileInfo = {
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype
        };
        
        next();
    });
};

// Cleanup utility to remove old uploaded files
const cleanupOldFiles = (maxAgeHours = 24) => {
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds
    
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err);
            return;
        }
        
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }
                
                const fileAge = Date.now() - stats.mtime.getTime();
                if (fileAge > maxAge) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting old file:', err);
                        } else {
                            console.log(`Deleted old file: ${file}`);
                        }
                    });
                }
            });
        });
    });
};

// Run cleanup every hour
setInterval(() => cleanupOldFiles(24), 60 * 60 * 1000);

module.exports = {
    uploadMiddleware,
    cleanupOldFiles
};