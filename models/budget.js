const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
	nDailyLimit: {
		type: Number,
		min: 0,
		required: true,
	},
	nWeeklyLimit: {
		type: Number,
		min: 0,
		required: true,
	},
	nMonthlyLimit: {
		type: Number,
		min: 0,
		required: true,
	},
	iUserId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	dCreatedAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Budget", budgetSchema);
