const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        desc: {
            type: String,
            required: true,
            trim: true
        },
        tech: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            trim: true,
            default: ''
        },
        imagePublicId: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

module.exports = mongoose.model('Project', ProjectSchema);
