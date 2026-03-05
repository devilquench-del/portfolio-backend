const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
    logger.error(err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
    });
};
