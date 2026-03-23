const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const logger = require('./logger');

async function seedAdmin() {
    try {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminUsername || !adminPassword) {
            logger.warn('ADMIN_USERNAME or ADMIN_PASSWORD not set in environment. Skipping admin seed.');
            return;
        }
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const existingByUsername = await Admin.findOne({ username: adminUsername });
        if (existingByUsername) {
            const passwordMatches = await bcrypt.compare(adminPassword, existingByUsername.password);
            if (!passwordMatches) {
                existingByUsername.password = hashedPassword;
                await existingByUsername.save();
                logger.info('Admin password updated from environment');
            } else {
                logger.info('Admin already exists with configured credentials');
            }
            return;
        }

        const existingAny = await Admin.findOne({});
        if (existingAny) {
            existingAny.username = adminUsername;
            existingAny.password = hashedPassword;
            await existingAny.save();
            logger.info('Existing admin credentials updated from environment');
            return;
        }

        await Admin.create({ username: adminUsername, password: hashedPassword });
        logger.info('Default admin created from environment');
    } catch (err) {
        logger.error('Failed to seed admin:', err.message || err);
    }
}

module.exports = seedAdmin;

