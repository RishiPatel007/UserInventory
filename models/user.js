const mongoose = require("mongoose");
const {
	nMinimumUsernameLength,
	nMaximumUsernameLength,
	rEmailRegex,
	rUsernameRegex,
} = require("../config");

const userSchema = new mongoose.Schema({
	sUsername: {
		type: String,
		required: true,
		unique: true,
		minLength: nMinimumUsernameLength,
		maxLength: nMaximumUsernameLength,
		match: rUsernameRegex,
	},
	sPassword: {
		type: String,
		required: true,
	},
	sEmail: {
		type: String,
		match: rEmailRegex,
		required: true,
		unique: true,
	},
});
module.exports = mongoose.model("User", userSchema);
