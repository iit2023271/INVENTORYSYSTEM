// ============================================================
// profitReportRoutes.js — PROFIT REPORT ROUTES
// ============================================================
// PURPOSE:
//   Defines endpoints for the owner to view profit reports.
//   Profit = Total Sales − Total Expenses for a given period.
//
// ACCESS CONTROL:
//   Both routes are PROTECTED — financial data is owner-only.
//
// TWO REPORT TYPES:
//   1. Daily   → profit for a single day (default = today)
//   2. Range   → profit across a date range (e.g., this month)
//
// QUERY PARAMETERS USED:
//   /daily-profit?date=2024-12-25
//     → Report for December 25th
//
//   /range-profit?from=2024-12-01&to=2024-12-31
//     → Report for all of December
//
// MOUNTED AT (in server.js):
//   app.use("/api/reports", profitReportRoutes)
//
// FULL URLS:
//   GET /api/reports/daily-profit?date=...             → Single day profit
//   GET /api/reports/range-profit?from=...&to=...      → Date range profit
// ============================================================

const express = require("express");
const {
  getDailyProfit,
  getRangeProfit
} = require("../controllers/profitReportController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/reports/daily-profit?date=2024-12-25
// PROTECTED — Returns sales, expenses, and profit for a single day.
// If no date is provided, the controller defaults to today.
router.get("/daily-profit", authMiddleware, getDailyProfit);

// GET /api/reports/range-profit?from=2024-12-01&to=2024-12-31
// PROTECTED — Returns total sales, expenses, and profit across a date range.
// Both 'from' and 'to' query params are required (validated in the controller).
router.get("/range-profit", authMiddleware, getRangeProfit);

module.exports = router;