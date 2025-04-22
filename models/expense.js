const mongoose = require("mongoose");
const { aInventoryCategory } = require("../config");

const expenseSchema = new mongoose.Schema(
	{
		aInventoryItems: {
			type: [
				new mongoose.Schema(
					{
						sName: { type: String, required: true },
						sType: { type: String, required: true },
						nQuantity: { type: Number, required: true },
						iItemId: {
							type: mongoose.Schema.Types.ObjectId,
							ref: "Inventory",
							required: true,
						},
						dPurchasedDate: {
							type: Date,
							required: true,
						},
					},
					{ _id: false }
				),
			],
			required: true,
		},
		nAmount: {
			type: Number,
			required: true,
		},
		iUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);
module.exports = mongoose.model("Expense", expenseSchema);
