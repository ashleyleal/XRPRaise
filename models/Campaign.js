const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: String,
  goal: Number,
  currentAmount: { type: Number, default: 0 },
  creatorId: String,
});

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;
