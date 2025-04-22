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
	let aSuggestion = [];
	for (let i = 0; i < aInventoryItems.length; i++) {
		aInventoryItems[i].dPurchasedDate = moment().toDate();

		if (!oTempInventoryItems.hasOwnProperty(aInventoryItems[i].sName)) {
			const oItem = await Inventory.findOne({
				sName: aInventoryItems[i].sName,
			});
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

		const nItemAmount =
			oTempInventoryItems[aInventoryItems[i].sName] *
			aInventoryItems[i].nQuantity;

		if (
			nSameDayExpense + nItemAmount > oBudget.nDailyLimit ||
			nSameWeekExpense + nItemAmount > oBudget.nWeeklyLimit ||
			nSameMonthExpense + nItemAmount > oBudget.nMonthlyLimit
		) {
			aSuggestion.push(aInventoryItems[i].sName);
		}
		nTotalAmount += nItemAmount;
	}
	if (aSuggestion.length !== 0) {
		throw new ApiError(
			`Don't have budget , Try removing ${aSuggestion}`,
			400
		);
	}

	for (let i = 0; i < aInventoryItems.length; i++) {
		await Inventory.updateOne(
			{ sName: aInventoryItems[i].sName },
			{ $inc: { nQuantity: -aInventoryItems[i].nQuantity } }
		);
	}

	res.send("postExpenses");
};
module.exports.deleteExpenses = async function (req, res) {
	res.send("deleteExpenses");
};

function calculateTotal(arr) {
	return arr.reduce((sum, obj) => sum + obj.nAmount, 0);
}
