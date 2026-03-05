const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio');
        logger.info('MongoDB connected successfully');
    } catch (err) {
        logger.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

module.exports = connectDB;

