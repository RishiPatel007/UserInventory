const mongoose = require("mongoose");

async function connectDB() {
	try {
		await mongoose.connect(process.env.DB_PATH);
		console.log("Connection successfull !!");
	} catch (err) {}
}

module.exports = connectDB;
