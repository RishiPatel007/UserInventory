const express = require("express");
require("dotenv").config();
require("./db")();
const router = require("./routers/v1");
const { errorHandler } = require("./middlewares/errorHandler");
const { notFound } = require("./helper");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(router);
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, (err) => {
	if (err) {
		console.log(err);
		return;
	}
	console.log(`Listening on port ${process.env.PORT}`);
});
