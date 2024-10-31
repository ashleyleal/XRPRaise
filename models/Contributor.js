const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    time: {
        type: Date,
        default: Date.now,
    },
    contributorId: {
        type: String,  
        required: true,
    }
});

module.exports = contributorSchema;
