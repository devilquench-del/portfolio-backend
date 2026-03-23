const Joi = require('joi');

const projectSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    desc: Joi.string().min(10).max(1000).required(),
    tech: Joi.string().min(1).max(200).required(),
    image: Joi.string().uri().optional()
});

module.exports = projectSchema;
