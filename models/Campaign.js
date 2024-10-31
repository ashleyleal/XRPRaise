const mongoose = require('mongoose');

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
});

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;
