const { sendResponse } = require("../helper");

module.exports.errorHandler = function (err, req, res, next) {
	console.error(err);
	sendResponse({
		res,
		nStatusCode: err.nStatusCode,
		oData: { error: err.sMessage },
	});
};
