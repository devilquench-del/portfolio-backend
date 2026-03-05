const Joi = require('joi');

const skillSchema = Joi.object({
    skill: Joi.string().min(2).max(50).required()
});

module.exports = skillSchema;
