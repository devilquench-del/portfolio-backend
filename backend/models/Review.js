const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        default: 'Anonymous'
    },
    email: {
        type: String,
        trim: true,
        default: ''
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'rating must be an integer'
        }
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    ts: {
        type: Number,
        required: true,
        default: Date.now
    },
    provider: {
        type: String,
        trim: true,
        default: 'local'
    },
    approved: {
        type: Boolean,
        default: false
    },
    flagged: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Review', ReviewSchema);
