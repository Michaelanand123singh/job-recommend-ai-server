const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

const jobController = {
    // Main resume upload endpoint
    uploadResume: async (req, res) => {
        try {
            const fileInfo = req.fileInfo;
            console.log(`Processing: ${fileInfo.originalName}`);
            
            const form = new FormData();
            const fileStream = fs.createReadStream(fileInfo.path);
            form.append('file', fileStream, {
                filename: fileInfo.originalName,
                contentType: fileInfo.mimetype
            });
            
            const pythonResponse = await axios.post(
                `${PYTHON_BACKEND_URL}/match-resume`,
                form,
                {
                    headers: { ...form.getHeaders() },
                    timeout: 60000,
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );
            
            // Cleanup file`
            fs.unlink(fileInfo.path, (err) => {
                if (err) console.error('Cleanup error:', err);
            });
            
            // Format response to match frontend expectations
            const formattedResponse = {
                success: true,
                message: 'Resume processed successfully',
                results: {
                    resume_summary: pythonResponse.data.resume_summary,
                    resume_skills: pythonResponse.data.resume_skills,
                    total_jobs_analyzed: pythonResponse.data.total_jobs_analyzed,
                    matches: pythonResponse.data.matches || []
                }
            };
            
            console.log('✅ Sending formatted response:', {
                matchCount: formattedResponse.results.matches.length,
                totalAnalyzed: formattedResponse.results.total_jobs_analyzed
            });
            
            res.json(formattedResponse);
            
        } catch (error) {
            console.error('Upload error:', error.message);
            
            // Cleanup on error
            if (req.fileInfo?.path) {
                fs.unlink(req.fileInfo.path, () => {});
            }
            
            if (error.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    success: false,
                    error: 'Python backend unavailable',
                    message: 'AI service is down. Please try again later.'
                });
            }
            
            res.status(error.response?.status || 500).json({
                success: false,
                error: 'Processing failed',
                message: error.response?.data?.detail || error.message
            });
        }
    },

    // Health check
    healthCheck: async (req, res) => {
        try {
            const pythonResponse = await axios.get(`${PYTHON_BACKEND_URL}/health`, {
                timeout: 5000
            });
            
            res.json({
                status: 'healthy',
                services: {
                    express: 'running',
                    python: pythonResponse.data?.status || 'running'
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                services: {
                    express: 'running',
                    python: 'unavailable'
                },
                error: error.message
            });
        }
    },

    // Job recommendations
    getJobRecommendations: async (req, res) => {
        try {
            const { skills, experience, location } = req.body;
            
            const mockJobs = [
                {
                    id: 1,
                    title: 'Frontend Developer',
                    company: 'Tech Corp',
                    match_percentage: 85,
                    location: 'Remote',
                    salary: '$80,000 - $120,000'
                }
            ];
            
            res.json({
                success: true,
                recommendations: mockJobs,
                total: mockJobs.length
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get recommendations',
                message: error.message
            });
        }
    },

    // Sample jobs - MISSING FUNCTION ADDED
    getSampleJobs: async (req, res) => {
        try {
            const sampleJobs = [
                {
                    id: 1,
                    title: 'Software Engineer',
                    company: 'Tech Solutions Inc',
                    location: 'San Francisco, CA',
                    salary: '$90,000 - $130,000',
                    description: 'Full-stack development role with React and Node.js',
                    requirements: ['JavaScript', 'React', 'Node.js', 'MongoDB']
                },
                {
                    id: 2,
                    title: 'Data Scientist',
                    company: 'Analytics Corp',
                    location: 'New York, NY',
                    salary: '$100,000 - $140,000',
                    description: 'Machine learning and data analysis position',
                    requirements: ['Python', 'TensorFlow', 'SQL', 'Statistics']
                },
                {
                    id: 3,
                    title: 'DevOps Engineer',
                    company: 'Cloud Systems Ltd',
                    location: 'Remote',
                    salary: '$85,000 - $125,000',
                    description: 'Infrastructure automation and deployment',
                    requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD']
                }
            ];

            res.json({
                success: true,
                jobs: sampleJobs,
                total: sampleJobs.length
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get sample jobs',
                message: error.message
            });
        }
    },

    // Track job view - MISSING FUNCTION ADDED
    trackJobView: async (req, res) => {
        try {
            const { jobId, userId } = req.body;
            
            // Here you would typically log to a database
            console.log(`Job ${jobId} viewed by user ${userId || 'anonymous'}`);
            
            res.json({
                success: true,
                message: 'Job view tracked successfully'
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to track job view',
                message: error.message
            });
        }
    },

    // Submit feedback - MISSING FUNCTION ADDED
    submitFeedback: async (req, res) => {
        try {
            const { jobId, rating, feedback, userId } = req.body;
            
            // Here you would typically save to a database
            console.log('Feedback received:', {
                jobId,
                rating,
                feedback,
                userId: userId || 'anonymous',
                timestamp: new Date().toISOString()
            });
            
            res.json({
                success: true,
                message: 'Feedback submitted successfully'
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to submit feedback',
                message: error.message
            });
        }
    }
};

module.exports = jobController;