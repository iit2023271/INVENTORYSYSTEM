// ============================================================
// expenseReportRoutes.js — EXPENSE REPORT ROUTES
// ============================================================
// PURPOSE:
//   Defines the endpoint for the owner to view daily expense reports
//   (how much was spent on raw materials on a given day).
//
// ACCESS CONTROL:
//   All expense report routes are PROTECTED with authMiddleware.
//   Financial data should only be visible to the owner.
//
// NOTE ON UNUSED IMPORTS:
//   The original code imports getWeeklyExpense and getMonthlyExpense
//   but those functions don't exist yet in the controller.
//   Only getTodayExpense is actually wired up to a route.
//   This is a reminder that those features are planned but not yet built.
//
// MOUNTED AT (in server.js):
//   app.use("/api/reports", expenseReportRoutes)
//
// FULL URLS:
//   GET /api/reports/daily-expense?date=2024-12-25 → Daily expense (owner only)
// ============================================================

const express = require("express");
const {
  getTodayExpense
  // getWeeklyExpense  ← planned but not yet implemented in controller
  // getMonthlyExpense ← planned but not yet implemented in controller
} = require("../controllers/expenseReportController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/reports/daily-expense?date=2024-12-25
// PROTECTED — returns expense breakdown for a specific day.
// If no date is passed in the query, defaults to today.
router.get("/daily-expense", authMiddleware, getTodayExpense);

module.exports = router;