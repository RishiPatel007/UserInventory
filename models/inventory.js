const mongoose = require("mongoose");
const { aInventoryCategory } = require("../config");

const inventorySchema = new mongoose.Schema({
	sName: {
		type: String,
		required: true,
	},
	sType: {
		type: String,
		enum: aInventoryCategory,
		required: true,
	},
	nQuantity: {
		type: Number,
		required: true,
	},
	nUnitPrice: {
		type: Number,
		required: true,
	},
});
module.exports = mongoose.model("Inventory", inventorySchema);
