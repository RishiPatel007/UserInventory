const express = require("express");
const { userController } = require("../../controllers");
const { asyncHandler } = require("../../helper");
const {
	postExpense,
	deleteExpense,
} = require("../../validations/expenseValidations");
const validationResult = require("../../middlewares/validationResult");

const router = express.Router();

router.get("/expenses", asyncHandler(userController.getExpenses));

router.post(
	"/expenses",
	postExpense(),
	validationResult,
	asyncHandler(userController.postExpenses)
);

router.delete(
	"/expenses/:id",
	deleteExpense(),
	validationResult,
	asyncHandler(userController.deleteExpenses)
);

module.exports = router;
