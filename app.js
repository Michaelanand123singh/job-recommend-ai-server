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
    origin: [
        'http://localhost:3000', 
        'http://localhost:3001',
        'https://job-recommend-ai-client.vercel.app',  // Your Vercel frontend URL
        'https://job-recomend-ai-backend.onrender.com',  // Your Python backend URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

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
        service: 'Job Recommender Express Server',
        environment: process.env.NODE_ENV || 'development',
        python_backend_url: process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Job Recommender API Server',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            upload: 'POST /api/upload',
            jobs: 'GET /api/jobs',
            health: 'GET /health',
            test: 'GET /api/test',
            recommendations: 'POST /api/recommendations'
        },
        cors_origins: [
            'http://localhost:3000',
            'http://localhost:3001', 
            'https://job-recommend-ai-client.vercel.app',
            'https://job-recomend-ai-backend.onrender.com'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        available_routes: [
            'GET /',
            'GET /health',
            'GET /api/test',
            'POST /api/upload',
            'GET /api/jobs',
            'POST /api/recommendations'
        ]
    });
});

module.exports = app;