const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema(
    {
        skill: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

module.exports = mongoose.model('Skill', SkillSchema);
