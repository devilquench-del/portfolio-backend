const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const logger = require('./logger');

async function seedAdmin() {
    try {
        const existing = await Admin.findOne({}).lean();
        if (existing) {
            logger.info('Admin already exists');
            return;
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || '1234';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await Admin.create({
            username: adminEmail,
            password: hashedPassword
        });
        logger.info('Default admin created');
    } catch (err) {
        logger.error('Failed to seed admin:', err.message || err);
    }
}

module.exports = seedAdmin;

