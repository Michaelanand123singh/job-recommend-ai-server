const express = require('express');
const router = express.Router();

// Import controller
const jobController = require('../controllers/jobController');

// Import upload middleware
const { uploadMiddleware } = require('../middleware/upload');

// Routes
// Health check
router.get('/health', jobController.healthCheck);

// Resume upload route
router.post('/upload', uploadMiddleware, jobController.uploadResume);

// Job recommendations
router.post('/recommendations', jobController.getJobRecommendations);

// Sample jobs
router.get('/jobs', jobController.getSampleJobs);

// Job view tracking
router.post('/track-view', jobController.trackJobView);

// Feedback submission
router.post('/feedback', jobController.submitFeedback);

// Test route
router.get('/test', (req, res) => {
    res.json({ 
        message: 'API Routes working',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;