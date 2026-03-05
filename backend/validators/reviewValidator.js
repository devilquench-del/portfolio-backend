const Joi = require('joi');

const reviewSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    message: Joi.string().min(5).max(500).required()
});

module.exports = reviewSchema;
