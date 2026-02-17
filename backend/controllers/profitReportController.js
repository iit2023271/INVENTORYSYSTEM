// ============================================================
// profitReportController.js — PROFIT & LOSS REPORTS
// ============================================================
// PURPOSE:
//   Calculates profit = Total Sales − Total Expenses for a given
//   time period (daily or a custom date range).
//
// DATA SOURCES:
//   Sales:
//     • Order (normal menu orders)       → status = "Completed"
//     • CustomOrder (special orders)     → status = "Completed"
//   Expenses:
//     • RawPurchase (raw material costs) → any status
//
// AGGREGATION PIPELINE:
//   Instead of fetching all documents and summing in JavaScript,
//   we use MongoDB's $aggregate pipeline to do the calculation
//   directly in the database. This is much faster for large datasets.
//
//   Pipeline stages used:
//     $match  → filter documents (like WHERE in SQL)
//     $group  → group and apply accumulator functions (like SUM in SQL)
//
// WHY completedAt FOR SALES?
//   An order placed on Monday but completed on Tuesday should count
//   as Tuesday's sales — that's when the money was received.
//   So we filter by completedAt, not createdAt.
//
// WHY deliveryDate FOR CUSTOM ORDERS?
//   For custom orders, the delivery date represents when the item
//   was handed over and payment collected. That's the relevant date.
// ============================================================

const Order       = require("../models/Order");
const RawPurchase = require("../models/RawPurchase");
const CustomOrder = require("../models/CustomOrder");


// ============================================================
// GET DAILY PROFIT REPORT
// Route: GET /api/reports/profit?date=2024-12-25
// Returns: { date, totalSales, totalExpense, profit }
// ============================================================
exports.getDailyProfit = async (req, res) => {
  try {

    // ── STEP 1: Determine the target date ────────────────────
    let selectedDate = new Date();

    if (req.query.date) {
      selectedDate = new Date(req.query.date);
    }

    // Build start and end of day timestamps
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // ── STEP 2: Calculate normal order sales ──────────────────
    // Aggregate pipeline:
    //   $match → only completed orders, completed on this specific day
    //   $group → sum all totalAmount values into "totalSales"
    const salesAgg = await Order.aggregate([
      {
        $match: {
          status:      "Completed",
          completedAt: { $gte: startOfDay, $lte: endOfDay } // completed on this day
        }
      },
      {
        $group: {
          _id:        null,              // null = group ALL into a single result
          totalSales: { $sum: "$totalAmount" } // sum up the totalAmount field
        }
      }
    ]);

    // salesAgg returns an array. If no results → []. Use ?. and || 0 as fallback.
    const orderSales = salesAgg[0]?.totalSales || 0;

    // ── STEP 3: Calculate custom order sales ──────────────────
    // Custom orders use deliveryDate instead of completedAt
    const customSalesAgg = await CustomOrder.aggregate([
      {
        $match: {
          status:       "Completed",
          deliveryDate: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id:        null,
          totalSales: { $sum: "$totalPrice" } // custom orders use totalPrice field
        }
      }
    ]);

    const customSales = customSalesAgg[0]?.totalSales || 0;

    // Combine both types of sales
    const totalSales = orderSales + customSales;

    // ── STEP 4: Calculate raw material expenses ───────────────
    // Include purchases where EITHER purchaseDate OR createdAt falls on this day.
    // This handles cases where purchaseDate might not be set correctly.
    const expenseAgg = await RawPurchase.aggregate([
      {
        $match: {
          $or: [
            { purchaseDate: { $gte: startOfDay, $lte: endOfDay } },
            { createdAt:    { $gte: startOfDay, $lte: endOfDay } }
          ]
        }
      },
      {
        $group: {
          _id:          null,
          totalExpense: { $sum: "$totalCost" }
        }
      }
    ]);

    const totalExpense = expenseAgg[0]?.totalExpense || 0;

    // ── STEP 5: Calculate profit and respond ──────────────────
    const profit = totalSales - totalExpense;

    res.json({
      date: startOfDay,
      totalSales,
      totalExpense,
      profit  // positive = profit made, negative = loss
    });

  } catch (error) {
    console.error("DAILY PROFIT ERROR:", error);
    res.status(500).json({ message: "Failed to calculate profit" });
  }
};


// ============================================================
// GET PROFIT REPORT FOR A DATE RANGE
// Route: GET /api/reports/profit/range?from=2024-12-01&to=2024-12-31
// Returns: { from, to, totalSales, totalExpense, profit }
// ============================================================
exports.getRangeProfit = async (req, res) => {
  try {

    const { from, to } = req.query;

    // ── Validate: both from and to dates are required ─────────
    if (!from || !to) {
      return res.status(400).json({ message: "From and To dates required" });
    }

    // Build start and end timestamps for the full date range
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);

    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    // ── STEP 1: Normal order sales in range ───────────────────
    // NOTE: Uses createdAt here (not completedAt) — slight inconsistency
    // with the daily report. In practice, consider standardizing.
    const salesAgg = await Order.aggregate([
      {
        $match: {
          status:    "Completed",
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id:        null,
          totalSales: { $sum: "$totalAmount" }
        }
      }
    ]);

    const orderSales = salesAgg[0]?.totalSales || 0;

    // ── STEP 2: Custom order sales in range ───────────────────
    const customSalesAgg = await CustomOrder.aggregate([
      {
        $match: {
          status:       "Completed",
          deliveryDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id:        null,
          totalSales: { $sum: "$totalPrice" }
        }
      }
    ]);

    const customSales = customSalesAgg[0]?.totalSales || 0;

    const totalSales = orderSales + customSales;

    // ── STEP 3: Raw material expenses in range ────────────────
    const expenseAgg = await RawPurchase.aggregate([
      {
        $match: {
          $or: [
            { purchaseDate: { $gte: start, $lte: end } },
            { createdAt:    { $gte: start, $lte: end } }
          ]
        }
      },
      {
        $group: {
          _id:          null,
          totalExpense: { $sum: "$totalCost" }
        }
      }
    ]);

    const totalExpense = expenseAgg[0]?.totalExpense || 0;

    // ── STEP 4: Respond with the range report ─────────────────
    res.json({
      from:         start,
      to:           end,
      totalSales,
      totalExpense,
      profit: totalSales - totalExpense
    });

  } catch (error) {
    console.error("RANGE PROFIT ERROR:", error);
    res.status(500).json({ message: "Failed to load range report" });
  }
};