const express = require("express");
const UserRouter = require("./user");


const router = express.Router();

router.use("/api", UserRouter);

module.exports = router;
