// ============================================================
// expenseReportController.js — DAILY EXPENSE REPORT
// ============================================================
// PURPOSE:
//   Calculates how much money was spent on raw materials
//   (ingredients, supplies, etc.) on a given day.
//
// DATA SOURCE:
//   RawPurchase model — each document represents one purchase
//   of a raw material (e.g., 10kg of sugar at ₹40/kg = ₹400 total).
//
// IMPORTANT:
//   We ONLY count purchases with status = "Done".
//   Pending purchases haven't been confirmed yet, so we exclude them.
//   This ensures the expense report reflects actual confirmed spending.
//
// HOW THE DATE FILTER WORKS:
//   If the client sends ?date=2024-12-25, we set:
//     start = 2024-12-25 00:00:00.000
//     end   = 2024-12-25 23:59:59.999
//   This captures every purchase made on that entire calendar day.
//   If no date is provided, we default to today.
// ============================================================

const RawPurchase = require("../models/RawPurchase");

// ============================================================
// GET DAILY EXPENSE REPORT
// Route: GET /api/reports/expense?date=2024-12-25
// Returns: { date, totalExpense, items: [...] }
// ============================================================
exports.getTodayExpense = async (req, res) => {
  try {

    // ── STEP 1: Determine which date to report on ─────────────
    // Use the date from the query string if provided, otherwise use today.
    const selectedDate = req.query.date
      ? new Date(req.query.date)
      : new Date();

    // ── STEP 2: Build the start and end of the day ────────────
    // MongoDB stores dates as timestamps. To query a full day,
    // we need the exact start (00:00:00) and end (23:59:59) timestamps.
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);    // midnight start

    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999); // one millisecond before midnight next day

    // ── STEP 3: Fetch only "Done" purchases within this date range ─
    // .populate("rawMaterial") replaces the rawMaterial ObjectId with
    // the actual RawMaterial document (so we can get its name).
    const purchases = await RawPurchase.find({
      status: "Done",                               // ✅ only confirmed purchases
      purchaseDate: { $gte: start, $lte: end }      // ✅ only within selected day
    }).populate("rawMaterial"); // joins with RawMaterial collection

    // ── STEP 4: Calculate total and build the line-item list ──
    let totalExpense = 0;

    // Map each purchase to a clean summary object.
    // We also accumulate the total expense as we go.
    const items = purchases.map(purchase => {
      totalExpense += purchase.totalCost; // add to running total

      return {
        item:      purchase.rawMaterial?.name || "Unknown", // ?. = optional chaining (safe if null)
        quantity:  purchase.quantity,
        rate:      purchase.rate,
        totalCost: purchase.totalCost
      };
    });

    // ── STEP 5: Respond with the full report ──────────────────
    res.json({
      date: start,       // the date this report covers
      totalExpense,      // total money spent that day
      items              // breakdown by each purchased item
    });

  } catch (error) {
    console.error("DAILY EXPENSE ERROR:", error);
    res.status(500).json({ message: "Failed to load expense report" });
  }
};