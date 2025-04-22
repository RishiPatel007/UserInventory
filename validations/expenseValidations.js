const { body, param, cookie } = require("express-validator");
const { aInventoryCategory } = require("../config");
const mongoose = require("mongoose");

module.exports.postExpense = function () {
	return [
		body("aInventoryItems")
			.notEmpty()
			.withMessage("aInventory required")
			.bail()
			.isArray()
			.withMessage("aInventory must be an array")
			.bail()
			.custom((val) => val.length !== 0)
			.withMessage("aInventory can't be empty"),
		body("aInventoryItems.*")
			.isObject()
			.withMessage("aInventory contents must be object"),
		body("aInventoryItems.*.sName")
			.notEmpty()
			.withMessage("sName in aInventory required")
			.bail()
			.isString()
			.withMessage("sName must be string"),
		body("aInventoryItems.*.sType")
			.notEmpty()
			.withMessage("sType in aInventory required")
			.bail()
			.isString()
			.withMessage("sType must be string")
			.bail()
			.isIn(aInventoryCategory)
			.withMessage(`sType must be in ${aInventoryCategory}`),
		body("aInventoryItems.*.nQuantity")
			.notEmpty()
			.withMessage("nQuantity in aInventory required")
			.bail()
			.custom((val) => typeof val === "number")
			.withMessage("nQuantity must be numeric")
			.bail()
			.custom((val) => val > 0)
			.withMessage("nQuantity must be greater than 0"),
	];
};
