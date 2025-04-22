const { validationResult } = require("express-validator");
const { ApiError, sendResponse } = require("../helper");
const status = require("http-status").status;

module.exports = function validationFailHandler(req, res, next) {
	console.log(req.body);
	if (!validationResult(req).isEmpty()) {
		const errors = [];
		console.log(errors);
		validationResult(req).errors.forEach((oElement) => {
			errors.push(oElement.msg);
		});
		throw new ApiError(errors, status.BAD_REQUEST);
	}
	next();
};
