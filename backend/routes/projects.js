const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Project = require('../models/Project');
const requireAuth = require('../middleware/requireAuth');
const projectValidator = require('../validators/projectValidator');
const logger = require('../utils/logger');

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png'];
        if (allowed.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('Only JPEG and PNG images are allowed'));
    }
});

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeProject(project) {
    return {
        title: typeof project?.title === 'string' ? project.title.trim() : '',
        desc: typeof project?.desc === 'string' ? project.desc.trim() : '',
        tech: typeof project?.tech === 'string' ? project.tech.trim() : ''
    };
}

function formatProject(doc) {
    return {
        id: String(doc._id),
        title: doc.title,
        desc: doc.desc,
        tech: doc.tech,
        image: doc.image,
        createdAt: doc.createdAt
    };
}

router.get('/', async (req, res, next) => {
    try {
        const projects = await Project.find().sort({ createdAt: 1 }).lean();
        return res.json({ success: true, data: projects.map((project) => formatProject(project)) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.post('/', requireAuth, async (req, res, next) => {
    try {
        const payload = { ...(req.body || {}) };
        if (payload.description === undefined && payload.desc !== undefined) {
            payload.description = payload.desc;
        }
        const { error } = projectValidator.validate(payload);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const normalizedProject = normalizeProject(req.body || {});
        if (typeof req.body?.image === 'string' && req.body.image.trim()) {
            normalizedProject.image = req.body.image.trim();
        }
        if (!normalizedProject.title || !normalizedProject.desc || !normalizedProject.tech) {
            return res.status(400).json({ success: false, message: 'title, desc, and tech must be non-empty strings' });
        }

        const duplicate = await Project.findOne({
            title: { $regex: new RegExp(`^${escapeRegex(normalizedProject.title)}$`, 'i') }
        }).lean();
        if (duplicate) {
            return res.status(400).json({ success: false, message: 'project title already exists' });
        }

        const created = await Project.create(normalizedProject);
        return res.status(201).json({ success: true, data: formatProject(created.toObject()) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.put('/:id', requireAuth, async (req, res, next) => {
    try {
        const payload = { ...(req.body || {}) };
        if (payload.description === undefined && payload.desc !== undefined) {
            payload.description = payload.desc;
        }
        const { error } = projectValidator.validate(payload);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const { id } = req.params;
        const normalizedProject = normalizeProject(req.body || {});
        if (typeof req.body?.image === 'string' && req.body.image.trim()) {
            normalizedProject.image = req.body.image.trim();
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'invalid project id' });
        }
        if (!normalizedProject.title || !normalizedProject.desc || !normalizedProject.tech) {
            return res.status(400).json({ success: false, message: 'title, desc, and tech must be non-empty strings' });
        }

        const duplicate = await Project.findOne({
            _id: { $ne: id },
            title: { $regex: new RegExp(`^${escapeRegex(normalizedProject.title)}$`, 'i') }
        }).lean();
        if (duplicate) {
            return res.status(400).json({ success: false, message: 'project title already exists' });
        }

        const updated = await Project.findByIdAndUpdate(id, normalizedProject, {
            new: true,
            runValidators: true
        }).lean();

        if (!updated) {
            return res.status(404).json({ success: false, message: 'project not found' });
        }

        return res.json({ success: true, data: formatProject(updated) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.post('/:id/upload', requireAuth, (req, res, next) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }

        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: 'invalid project id' });
            }

            const existing = await Project.findById(id).lean();
            if (!existing) {
                return res.status(404).json({ success: false, message: 'project not found' });
            }

            const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const uploadResult = await cloudinary.uploader.upload(dataUri, {
                folder: 'portfolio-projects'
            });

            try {
                await Project.findByIdAndUpdate(
                    id,
                    {
                        image: uploadResult.secure_url,
                        imagePublicId: uploadResult.public_id
                    },
                    { new: true, runValidators: true }
                ).lean();
            } catch (dbUpdateErr) {
                try {
                    await cloudinary.uploader.destroy(uploadResult.public_id);
                } catch (cleanupErr) {
                    logger.error(cleanupErr);
                }
                throw dbUpdateErr;
            }

            if (existing.imagePublicId) {
                try {
                    await cloudinary.uploader.destroy(existing.imagePublicId);
                } catch (cleanupErr) {}
            }

            return res.json({ success: true, url: uploadResult.secure_url });
        } catch (uploadErr) {
            uploadErr.statusCode = 500;
            return next(uploadErr);
        }
    });
});

router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const project = await Project.findById(id).lean();
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (project.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(project.imagePublicId);
            } catch (cloudinaryErr) {
                logger.error(cloudinaryErr);
            }
        }

        const deleted = await Project.findByIdAndDelete(id).lean();
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        return res.json({ success: true, message: 'Project deleted successfully' });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

module.exports = router;
