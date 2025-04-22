const express = require("express");
const { userController } = require("../../controllers");
const { asyncHandler } = require("../../helper");
const { postExpense } = require("../../validations/expenseValidations");
const validationResult = require("../../middlewares/validationResult");

const router = express.Router();

router.get("/expenses", asyncHandler(userController.getExpenses));

router.post(
	"/expenses",
	postExpense(),
	validationResult,
	asyncHandler(userController.postExpenses)
);

router.delete("/expenses/:id", asyncHandler(userController.deleteExpenses));

module.exports = router;
