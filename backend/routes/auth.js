const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const authValidator = require('../validators/authValidator');
const logger = require('../utils/logger');
const isProduction = process.env.NODE_ENV === 'production';

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Try again later.'
    }
});

router.post('/login', loginLimiter, async (req, res, next) => {
    try {
        const { error } = authValidator.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
        const password = typeof req.body?.password === 'string' ? req.body.password : '';
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }
        if (!process.env.JWT_SECRET) {
            logger.error('JWT_SECRET is not defined. Login cannot issue tokens.');
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        const admin = await Admin.findOne({ username }).lean();
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                username: admin.username,
                role: admin.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Use cross-site compatible cookie settings for separated frontend/backend deployments.
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000
        });

        return res.json({ success: true, message: 'Login successful' });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });
    return res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
