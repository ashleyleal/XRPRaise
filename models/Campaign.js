const mongoose = require('mongoose');
const contributorSchema = require('./Contributor'); 

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, 
    },
    goal: {
        type: Number,
        required: true,
    },
    creatorId: {
        type: String,
        required: true,
    },
    currentAmount: {
        type: Number,
        default: 0,
    },
    isComplete: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
    },
    timeCreated: {
        type: Date,
        default: Date.now,
    },
    deadline: {
        type: Date,
    },
    contributors: [contributorSchema] 
});

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;
