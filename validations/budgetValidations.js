const { body, param, cookie } = require("express-validator");

module.exports.postBudget = function () {
	return [
		cookie("user").notEmpty().withMessage("user cookie must be present"),
		body().isObject().withMessage("Body must be an Object"),
		body("nDailyLimit")
			.notEmpty()
			.withMessage("Daily limit required")
			.bail()
			.isNumeric()
			.withMessage("Daily limit must be numeric"),
		body("nWeeklyLimit")
			.notEmpty()
			.withMessage("Weekly limit required")
			.bail()
			.isNumeric()
			.withMessage("Weekly limit must be numeric")
			.bail()
			.custom((value, { req }) => {
				if (value < req.body.nDailyLimit) {
					throw new Error(
						"Weekly limit must be greater than daily limit"
					);
				}
				return true;
			}),
		body("nMonthlyLimit")
			.notEmpty()
			.withMessage("Monthly limit required")
			.bail()
			.isNumeric()
			.withMessage("Monthly limit must be numeric")
			.bail()
			.custom((value, { req }) => {
				if (
					value < req.body.nDailyLimit ||
					value < req.body.nWeeklyLimit
				) {
					throw new Error(
						"Weekly limit must be greater than daily limit"
					);
				}
				return true;
			}),
	];
};
