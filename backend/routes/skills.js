const express = require('express');
const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const requireAuth = require('../middleware/requireAuth');
const skillValidator = require('../validators/skillValidator');

const router = express.Router();

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatSkill(doc) {
    return {
        id: String(doc._id),
        skill: doc.skill,
        createdAt: doc.createdAt
    };
}

router.get('/', async (req, res, next) => {
    try {
        const skills = await Skill.find().sort({ createdAt: 1 }).lean();
        return res.json({ success: true, data: skills.map((skill) => formatSkill(skill)) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { error } = skillValidator.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const { skill } = req.body || {};
        if (typeof skill !== 'string' || !skill.trim()) {
            return res.status(400).json({ success: false, message: 'skill must be a non-empty string' });
        }

        const normalizedSkill = skill.trim();
        const duplicate = await Skill.findOne({
            skill: { $regex: new RegExp(`^${escapeRegex(normalizedSkill)}$`, 'i') }
        }).lean();
        if (duplicate) {
            return res.status(400).json({ success: false, message: 'skill already exists' });
        }

        const created = await Skill.create({ skill: normalizedSkill });
        return res.status(201).json({ success: true, data: formatSkill(created.toObject()) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.put('/:id', requireAuth, async (req, res, next) => {
    try {
        const { error } = skillValidator.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const { id } = req.params;
        const { skill } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'invalid skill id' });
        }
        if (typeof skill !== 'string' || !skill.trim()) {
            return res.status(400).json({ success: false, message: 'skill must be a non-empty string' });
        }

        const normalizedSkill = skill.trim();
        const duplicate = await Skill.findOne({
            _id: { $ne: id },
            skill: { $regex: new RegExp(`^${escapeRegex(normalizedSkill)}$`, 'i') }
        }).lean();
        if (duplicate) {
            return res.status(400).json({ success: false, message: 'skill already exists' });
        }

        const updated = await Skill.findByIdAndUpdate(
            id,
            { skill: normalizedSkill },
            { new: true, runValidators: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ success: false, message: 'skill not found' });
        }

        return res.json({ success: true, data: formatSkill(updated) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'invalid skill id' });
        }

        const deleted = await Skill.findByIdAndDelete(id).lean();
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'skill not found' });
        }

        return res.json({ success: true, message: 'Skill deleted' });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

module.exports = router;
