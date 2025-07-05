// server.js - Clean version without duplicates
require('dotenv').config();

console.log('Environment variables loaded:');
console.log('SERVER_PORT:', process.env.SERVER_PORT);
console.log('PYTHON_BACKEND_URL:', process.env.PYTHON_BACKEND_URL);

console.log('About to import app.js...');
const app = require('./app');
console.log('app.js imported successfully');

const PORT = process.env.SERVER_PORT || 5000;
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

console.log('About to start server...');
// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT}`);
    console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
    console.log(`🐍 Python backend expected at: ${PYTHON_BACKEND_URL}`);
    console.log(`📊 API endpoints available at: http://localhost:${PORT}/api`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully');
    process.exit(0);
});