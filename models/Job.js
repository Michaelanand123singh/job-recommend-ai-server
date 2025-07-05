const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        default: 'Not specified'
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String,
        trim: true
    }],
    remote: {
        type: Boolean,
        default: false
    },
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship'],
        default: 'full-time'
    },
    experience: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'lead'],
        default: 'mid'
    },
    url: {
        type: String
    },
    source: {
        type: String,
        default: 'scraped'
    },
    datePosted: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better search performance
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ datePosted: -1 });

module.exports = mongoose.model('Job', jobSchema);