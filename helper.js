const status = require("http-status").status;
module.exports.asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports.sendResponse = function ({
	res,
	nStatusCode = 500,
	oData,
	sContentType = "application/json",
}) {
	res.set("Content-Type", sContentType);
	res.status(nStatusCode).send(oData);
};

module.exports.notFound = function notFound(req, res, next) {
	throw new ApiError("Route Not Found", status.NOT_FOUND);
};

class ApiError extends Error {
	constructor(
		sMessage = "Internal Server Error",
		nStatusCode = status.INTERNAL_SERVER_ERROR
	) {
		super(sMessage);
		this.name = "Api Error";
		this.sMessage = sMessage;
		this.nStatusCode = nStatusCode;
	}
}

module.exports.ApiError = ApiError;
