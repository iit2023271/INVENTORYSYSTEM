// ============================================================
// rawPurchaseRoutes.js — RAW PURCHASE ROUTES
// ============================================================
// PURPOSE:
//   Defines endpoints for recording and managing raw material purchases
//   (e.g., "Bought 10kg Sugar at ₹40/kg today").
//
// ACCESS CONTROL:
//   All routes are PROTECTED — only the owner records purchases
//   and marks them as done.
//
// STATUS FLOW REFLECTED IN ROUTES:
//   POST /          → Record a new purchase (status = "Pending")
//   PUT /:id/done   → Confirm purchase received & paid (status = "Done")
//   GET /           → View purchase records (filterable by date)
//
//   Only "Done" purchases are counted in the expense report.
//   This allows the owner to log upcoming/pending purchases early
//   without them distorting today's expense figures.
//
// MOUNTED AT (in server.js):
//   app.use("/api/raw-purchases", rawPurchaseRoutes)
//
// FULL URLS:
//   POST /api/raw-purchases               → Record a purchase (owner only)
//   GET  /api/raw-purchases?date=...      → View purchases for a date (owner only)
//   PUT  /api/raw-purchases/:id/done      → Mark purchase as confirmed (owner only)
// ============================================================

const express = require("express");
const {
  addRawPurchase,
  getRawPurchases,
  markPurchaseDone
} = require("../controllers/rawPurchaseController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/raw-purchases
// PROTECTED — Record a new raw material purchase.
// Body: { rawMaterial: <id>, quantity: 10, rate: 40 }
// totalCost is calculated automatically in the controller.
router.post("/", authMiddleware, addRawPurchase);

// GET /api/raw-purchases?date=2024-12-25
// PROTECTED — Fetch all purchases, optionally filtered by date.
// If no date query param → returns all purchases (no date filter).
router.get("/", authMiddleware, getRawPurchases);

// PUT /api/raw-purchases/:id/done
// PROTECTED — Mark a purchase as "Done" (goods received, payment made).
// Once Done, this purchase is included in expense reports.
router.put("/:id/done", authMiddleware, markPurchaseDone);

module.exports = router;