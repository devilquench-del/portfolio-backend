const Joi = require('joi');

const projectSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    image: Joi.string().uri().optional()
});

module.exports = projectSchema;
