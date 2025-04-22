const { ApiError, sendResponse } = require("../helper");
const { Budget, Expense, Inventory, User } = require("../models");
const mongoose = require("mongoose");
const status = require("http-status").status;
const moment = require("moment");

module.exports.getBudgets = async function (req, res) {
	const iUserId = new mongoose.Types.ObjectId(req.cookies.user);
	if (!mongoose.Types.ObjectId.isValid(iUserId)) {
		throw new ApiError(
			"Invalid user id , it must be in format of object id",
			status.BAD_REQUEST
		);
	}
	const oUser = await User.findById(iUserId);
	if (!oUser) {
		throw new ApiError("User not found , please login", status.NOT_FOUND);
	}

	const oBudget = await Budget.findOne({ iUserId });
	if (!oBudget) {
		throw new ApiError("You don't have a budget", status.NOT_FOUND);
	}

	sendResponse({ res, nStatusCode: 200, oData: oBudget });
};
module.exports.postBudgets = async function (req, res) {
	// const sUserId = "invalid id";
	const iUserId = new mongoose.Types.ObjectId(req.cookies.user);

	if (!mongoose.Types.ObjectId.isValid(iUserId)) {
		throw new ApiError(
			"Invalid user id , it must be in format of object id",
			status.BAD_REQUEST
		);
	}
	const oUser = await User.findById(iUserId);
	if (!oUser) {
		throw new ApiError("User not found , please login", status.NOT_FOUND);
	}
	if (await Budget.findOne({ iUserId })) {
		throw new ApiError("You already have a budget", status.BAD_REQUEST);
	}

	const oBudget = {
		nDailyLimit: req.body.nDailyLimit,
		nWeeklyLimit: req.body.nWeeklyLimit,
		nMonthlyLimit: req.body.nMonthlyLimit,
		iUserId,
	};

	await Budget.create(oBudget);

	sendResponse({
		res,
		nStatusCode: 201,
		oData: "Budget created successfully",
	});
};

module.exports.getExpenses = async function (req, res) {
	const iUserId = new mongoose.Types.ObjectId(req.cookies.user);

	if (!mongoose.Types.ObjectId.isValid(iUserId)) {
		throw new ApiError(
			"Invalid user id , it must be in format of object id",
			status.BAD_REQUEST
		);
	}
	const oUser = await User.findById(iUserId);
	if (!oUser) {
		throw new ApiError("User not found , please login", status.NOT_FOUND);
	}

	const aExpenses = await Expense.find({ iUserId });
	if (aExpenses.length === 0) {
		throw new ApiError("You dont have any expenses", status.NOT_FOUND);
	}

	return sendResponse({ res, nStatusCode: 200, oData: aExpenses });
};
module.exports.postExpenses = async function (req, res) {
	const iUserId = new mongoose.Types.ObjectId(req.cookies.user);

	if (!mongoose.Types.ObjectId.isValid(iUserId)) {
		throw new ApiError(
			"Invalid user id , it must be in format of object id",
			status.BAD_REQUEST
		);
	}

	const oUser = await User.findById(iUserId);
	if (!oUser) {
		throw new ApiError("User not found , please login", status.NOT_FOUND);
	}

	const oBudget = await Budget.findOne({ iUserId });

	if (!oBudget) {
		throw new ApiError(
			"You must have a budget to make purchases",
			status.BAD_REQUEST
		);
	}

	const aInventoryItems = req.body.aInventoryItems;

	let nTotalAmount = 0;

	let oTempInventoryItems = {};
	for (let i = 0; i < aInventoryItems.length; i++) {
		aInventoryItems[i].dPurchasedDate = moment().toDate();

		if (!oTempInventoryItems.hasOwnProperty(aInventoryItems[i].sName)) {
			const oItem = await Inventory.findOne({
				sName: aInventoryItems[i].sName,
			});
			if (oItem.sType !== aInventoryItems[i].sType) {
				throw new ApiError(
					`Wrong category of ${aInventoryItems[i].sName}`,
					400
				);
			}
			oTempInventoryItems[aInventoryItems[i].sName] = oItem.nUnitPrice;
		}

		const mPurchaseDate = moment(aInventoryItems[i].dPurchasedDate);

		const startOfDay = mPurchaseDate.clone().startOf("day").toDate();
		const endOfDay = mPurchaseDate.clone().endOf("day").toDate();

		const startOfWeek = mPurchaseDate.clone().startOf("isoWeek").toDate();
		const endOfWeek = mPurchaseDate.clone().endOf("isoWeek").toDate();

		const startOfMonth = mPurchaseDate.clone().startOf("month").toDate();
		const endOfMonth = mPurchaseDate.clone().endOf("month").toDate();

		const aSameDayExpenses = await Expense.find({
			"aInventoryItems.dPurchasedDate": {
				$gte: startOfDay,
				$lte: endOfDay,
			},
			iUserId,
		});

		const aSameWeekExpenses = await Expense.find({
			"aInventoryItems.dPurchasedDate": {
				$gte: startOfWeek,
				$lte: endOfWeek,
			},
			iUserId,
		});

		const aSameMonthExpenses = await Expense.find({
			"aInventoryItems.dPurchasedDate": {
				$gte: startOfMonth,
				$lte: endOfMonth,
			},
			iUserId,
		});

		const nSameDayExpense = calculateTotal(aSameDayExpenses);
		const nSameWeekExpense = calculateTotal(aSameWeekExpenses);
		const nSameMonthExpense = calculateTotal(aSameMonthExpenses);

		let nItemAmount =
			oTempInventoryItems[aInventoryItems[i].sName] *
			aInventoryItems[i].nQuantity;

		nTotalAmount += nItemAmount;
		if (nSameDayExpense + nTotalAmount > oBudget.nDailyLimit) {
			nTotalAmount -= nItemAmount;
			const nRemainingAmount =
				oBudget.nDailyLimit - nSameDayExpense - nTotalAmount;
			console.log(nRemainingAmount);
			const nSuggestion = Math.floor(
				nRemainingAmount / oTempInventoryItems[aInventoryItems[i].sName]
			);
			if (nSuggestion === 0) {
				if (i === 0) {
					throw new ApiError("Out of budget", 400);
				}
				throw new ApiError(
					`You can have upto ${aInventoryItems[i - 1].nQuantity}${
						aInventoryItems[i - 1].sName
					}`,
					400
				);
			}
			throw new ApiError(
				`You can have upto ${nSuggestion}${aInventoryItems[i].sName}`,
				400
			);
		}
		if (nSameWeekExpense + nTotalAmount > oBudget.nWeeklyLimit) {
			nTotalAmount -= nItemAmount;
			const nRemainingAmount = nSameDayExpense - nTotalAmount;
			const nSuggestion = Math.floor(
				nRemainingAmount / oTempInventoryItems[aInventoryItems[i].sName]
			);
			if (nSuggestion === 0) {
				if (i === 0) {
					throw new ApiError("Out of budget", 400);
				}
				throw new ApiError(
					`You can have upto ${aInventoryItems[i - 1].nQuantity}${
						aInventoryItems[i - 1].sName
					}`,
					400
				);
			}
			throw new ApiError(
				`You can have upto ${nSuggestion}${aInventoryItems[i].sName}`,
				400
			);
		}
		if (nSameMonthExpense + nTotalAmount > oBudget.nMonthlyLimit) {
			nTotalAmount -= nItemAmount;
			const nRemainingAmount = nSameDayExpense - nTotalAmount;
			const nSuggestion = Math.floor(
				nRemainingAmount / oTempInventoryItems[aInventoryItems[i].sName]
			);
			if (nSuggestion === 0) {
				if (i === 0) {
					throw new ApiError("Out of budget", 400);
				}
				throw new ApiError(
					`You can have upto ${aInventoryItems[i - 1].nQuantity}${
						aInventoryItems[i - 1].sName
					}`,
					400
				);
			}
			throw new ApiError(
				`You can have upto ${nSuggestion}${aInventoryItems[i].sName}`,
				400
			);
		}
	}

	for (let i = 0; i < aInventoryItems.length; i++) {
		const oItem = await Inventory.findOne({
			sName: aInventoryItems[i].sName,
		});

		if (oItem.nQuantity < aInventoryItems[i].nQuantity) {
			throw new ApiError(
				`Out of stock , you can only have ${oItem.nQuantity} ${aInventoryItems[i].sName}`,
				400
			);
		}

		aInventoryItems[i].iItemId = oItem._id;
		await Inventory.updateOne(
			{ sName: aInventoryItems[i].sName },
			{ $inc: { nQuantity: -aInventoryItems[i].nQuantity } }
		);
	}

	console.log(aInventoryItems);

	try {
		await Expense.collection.dropIndex("aInventoryItems.sName_1");
	} catch (err) {}
	await Expense.create({
		aInventoryItems,
		nAmount: nTotalAmount,
		iUserId,
	});
	sendResponse({
		res,
		nStatusCode: 200,
		oData: "Expense added successfully",
	});
};
module.exports.deleteExpenses = async function (req, res) {
	const iExpenseId = req.params.id;
	const oResult = await Expense.deleteOne({ _id: iExpenseId });
	if (oResult.deletedCount === 0) {
		throw new ApiError("No expense with this id found");
	}
	sendResponse({
		res,
		nStatusCode: 200,
		oData: "Expense added successfully",
	});
};

function calculateTotal(arr) {
	return arr.reduce((sum, obj) => sum + obj.nAmount, 0);
}
