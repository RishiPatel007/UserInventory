const express = require("express");

const expenseRoutes = require("./expense");
const budgetRoutes = require("./budget");

const router = express.Router();

router.use(expenseRoutes);
router.use(budgetRoutes);

module.exports = router;
