const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio';

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Mongoose will attempt to reconnect automatically.');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
});

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        logger.info('MongoDB connected successfully');
    } catch (err) {
        logger.error('Initial MongoDB connection failed:', err);
        logger.info('Retrying MongoDB connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
}

module.exports = connectDB;

