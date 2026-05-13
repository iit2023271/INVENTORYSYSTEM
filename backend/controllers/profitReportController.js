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

const Order = require("../models/Order");
const RawPurchase = require("../models/RawPurchase");
const CustomOrder = require("../models/CustomOrder");

// ============================================================
// GET DAILY PROFIT REPORT
// Route: GET /api/reports/profit?date=2024-12-25
// ============================================================
exports.getDailyProfit = async (req, res) => {
  try {
    let selectedDate = new Date();
    if (req.query.date) {
      selectedDate = new Date(req.query.date);
    }

    // B6 fix also applied — UTC-safe boundaries
    const startOfDay = new Date(
      req.query.date
        ? req.query.date + "T00:00:00.000Z"
        : new Date().toISOString().slice(0, 10) + "T00:00:00.000Z",
    );
    const endOfDay = new Date(
      req.query.date
        ? req.query.date + "T23:59:59.999Z"
        : new Date().toISOString().slice(0, 10) + "T23:59:59.999Z",
    );

    // Normal order sales — filter by completedAt (unchanged, was correct)
    const salesAgg = await Order.aggregate([
      {
        $match: {
          status: "Completed",
          completedAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
        },
      },
    ]);
    const orderSales = salesAgg[0]?.totalSales || 0;

    // Custom order sales — filter by completedAt
    const customSalesAgg = await CustomOrder.aggregate([
      {
        $match: {
          status: "Completed",
          completedAt: { $gte: startOfDay, $lte: endOfDay },
          // Use completedAt for consistency (deliveryDate is the planned date,
          // not necessarily when payment was received)
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const customSales = customSalesAgg[0]?.totalSales || 0;

    const totalSales = orderSales + customSales;

    // ✅ FIX B12: Added status: "Done" — only count confirmed expenses,
    // matching the behaviour of expenseReportController.
    // ❌ OLD: no status filter — counted Pending purchases too, inflating expenses
    const expenseAgg = await RawPurchase.aggregate([
      {
        $match: {
          status: "Done", // ← ADDED
          $or: [
            { purchaseDate: { $gte: startOfDay, $lte: endOfDay } },
            { createdAt: { $gte: startOfDay, $lte: endOfDay } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$totalCost" },
        },
      },
    ]);
    const totalExpense = expenseAgg[0]?.totalExpense || 0;

    const profit = totalSales - totalExpense;

    res.json({
      date: startOfDay,
      totalSales,
      totalExpense,
      profit,
    });
  } catch (error) {
    console.error("DAILY PROFIT ERROR:", error);
    res.status(500).json({ message: "Failed to calculate profit" });
  }
};

// ============================================================
// GET PROFIT REPORT FOR A DATE RANGE
// Route: GET /api/reports/profit/range?from=2024-12-01&to=2024-12-31
//
// B7 FIX: Changed Order filter from createdAt → completedAt.
// This makes the range report consistent with the daily report.
// ============================================================
exports.getRangeProfit = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "From and To dates required" });
    }

    // B6 fix: UTC-safe boundaries
    const start = new Date(from + "T00:00:00.000Z");
    const end = new Date(to + "T23:59:59.999Z");

    // ✅ FIX B7: Changed from createdAt to completedAt
    // ❌ OLD: createdAt → daily and range reports counted the same order on different dates
    const salesAgg = await Order.aggregate([
      {
        $match: {
          status: "Completed",
          completedAt: { $gte: start, $lte: end }, // ← FIXED (was createdAt)
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
        },
      },
    ]);
    const orderSales = salesAgg[0]?.totalSales || 0;

    const customSalesAgg = await CustomOrder.aggregate([
      {
        $match: {
          status: "Completed",
          completedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const customSales = customSalesAgg[0]?.totalSales || 0;
    const totalSales = orderSales + customSales;

    // ✅ FIX B12: Added status: "Done" — consistent with expenseReport
    const expenseAgg = await RawPurchase.aggregate([
      {
        $match: {
          status: "Done", // ← ADDED
          $or: [
            { purchaseDate: { $gte: start, $lte: end } },
            { createdAt: { $gte: start, $lte: end } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$totalCost" },
        },
      },
    ]);
    const totalExpense = expenseAgg[0]?.totalExpense || 0;

    res.json({
      from: start,
      to: end,
      totalSales,
      totalExpense,
      profit: totalSales - totalExpense,
    });
  } catch (error) {
    console.error("RANGE PROFIT ERROR:", error);
    res.status(500).json({ message: "Failed to load range report" });
  }
};
