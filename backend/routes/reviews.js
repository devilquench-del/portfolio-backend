const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const requireAuth = require('../middleware/requireAuth');
const reviewValidator = require('../validators/reviewValidator');

const router = express.Router();

function formatReview(review) {
    return {
        id: String(review._id),
        name: review.name,
        email: review.email,
        rating: review.rating,
        text: review.text,
        ts: review.ts,
        provider: review.provider,
        approved: review.approved,
        flagged: review.flagged
    };
}

router.get('/', async (req, res, next) => {
    try {
        const reviews = await Review.find({ approved: true }).sort({ ts: -1 }).lean();
        return res.json({ success: true, data: reviews.map((review) => formatReview(review)) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.get('/admin', requireAuth, async (req, res, next) => {
    try {
        const reviews = await Review.find().sort({ ts: -1 }).lean();
        return res.json({ success: true, data: reviews.map((review) => formatReview(review)) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const payload = { ...(req.body || {}) };
        if (payload.message === undefined && payload.text !== undefined) {
            payload.message = payload.text;
        }
        const { error } = reviewValidator.validate(payload);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const { name, email, rating, text, ts, provider, approved, flagged } = req.body || {};
        const parsedRating = Number(rating);

        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ success: false, message: 'rating must be an integer between 1 and 5' });
        }
        if (typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ success: false, message: 'text must be a non-empty string' });
        }

        const created = await Review.create({
            name: typeof name === 'string' && name.trim() ? name.trim() : 'Anonymous',
            email: typeof email === 'string' ? email.trim() : '',
            rating: parsedRating,
            text: text.trim(),
            ts: Number.isFinite(Number(ts)) && Number(ts) > 0 ? Number(ts) : Date.now(),
            provider: typeof provider === 'string' && provider.trim() ? provider.trim() : 'local',
            approved: false,
            flagged: false
        });

        return res.status(201).json({ success: true, data: formatReview(created.toObject()) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.patch('/:id/approve', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'invalid review id' });
        }

        const updated = await Review.findByIdAndUpdate(
            id,
            { approved: true },
            { new: true, runValidators: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ success: false, message: 'review not found' });
        }

        return res.json({ success: true, data: formatReview(updated) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.patch('/:id/reject', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'invalid review id' });
        }

        const deleted = await Review.findByIdAndDelete(id).lean();
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'review not found' });
        }

        return res.json({ success: true, data: formatReview(deleted) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.put('/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { approved, flagged } = req.body || {};
        const hasApproved = approved !== undefined;
        const hasFlagged = flagged !== undefined;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'invalid review id' });
        }
        if (!hasApproved && !hasFlagged) {
            return res.status(400).json({ success: false, message: 'nothing to update' });
        }
        if ((hasApproved && typeof approved !== 'boolean') || (hasFlagged && typeof flagged !== 'boolean')) {
            return res.status(400).json({ success: false, message: 'approved/flagged must be boolean values' });
        }

        const update = {};
        if (hasApproved) update.approved = approved;
        if (hasFlagged) update.flagged = flagged;

        const updated = await Review.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true
        }).lean();

        if (!updated) {
            return res.status(404).json({ success: false, message: 'review not found' });
        }

        return res.json({ success: true, data: formatReview(updated) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'invalid review id' });
        }

        const deleted = await Review.findByIdAndDelete(id).lean();
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'review not found' });
        }

        return res.json({ success: true, data: formatReview(deleted) });
    } catch (err) {
        err.statusCode = 500;
        return next(err);
    }
});

module.exports = router;
