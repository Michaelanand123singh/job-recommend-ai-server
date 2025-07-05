const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

console.log('Basic imports successful');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import and use routes
console.log('About to import jobRoutes...');
try {
    const jobRoutes = require('./routes/jobRoutes');
    console.log('jobRoutes imported successfully');
    
    // Use the routes
    app.use('/api', jobRoutes);
    console.log('Routes configured successfully');
} catch (error) {
    console.error('Error with jobRoutes:', error.message);
    console.error('Stack:', error.stack);
    throw error;
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Job Recommender Express Server'
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Job Recommender API Server',
        version: '1.0.0',
        endpoints: {
            upload: 'POST /api/upload',
            jobs: 'GET /api/jobs',
            health: 'GET /health',
            test: 'GET /api/test'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

module.exports = app;