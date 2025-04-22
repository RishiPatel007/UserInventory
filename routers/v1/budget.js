const express = require("express");
const { userController } = require("../../controllers");
const { asyncHandler } = require("../../helper");
const { postBudget } = require("../../validations/budgetValidations");
const validationFailHandler = require("../../middlewares/validationResult");
const router = express.Router();

router.get("/budgets", asyncHandler(userController.getBudgets));
router.post(
	"/budgets",
	postBudget(),
	validationFailHandler,
	asyncHandler(userController.postBudgets)
);

module.exports = router;
