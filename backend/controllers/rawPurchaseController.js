// ============================================================
// rawPurchaseController.js — TRACK RAW MATERIAL PURCHASES
// ============================================================
// PURPOSE:
//   Every time the owner buys raw materials (e.g., 10kg of sugar
//   at ₹40/kg), it's recorded here as a RawPurchase document.
//
//   These records are used to:
//     1. Calculate daily expenses (expenseReportController)
//     2. Calculate profit (profitReportController → sales - expenses)
//
// STATUS FLOW:
//   "Pending" → Just recorded, not yet confirmed as received
//   "Done"    → Purchase confirmed; counted in expense reports
//
//   Only "Done" purchases are included in expense reports.
//   This prevents items on order (but not yet paid/received) from
//   distorting the expense figures.
//
// TOTAL COST CALCULATION:
//   totalCost = quantity × rate
//   This is pre-calculated and stored to avoid recalculating in reports.
// ============================================================

const RawPurchase = require("../models/RawPurchase");


// ============================================================
// ADD A RAW PURCHASE RECORD
// Route: POST /api/raw-purchases
// Body: { rawMaterial: <materialId>, quantity: 10, rate: 40 }
// ============================================================
exports.addRawPurchase = async (req, res) => {
  try {

    const { rawMaterial, quantity, rate } = req.body;

    // ── Validate: all three fields are required and positive ──
    // quantity <= 0 or rate <= 0 would be nonsensical (can't buy negative amounts).
    if (!rawMaterial || quantity <= 0 || rate <= 0) {
      return res.status(400).json({
        message: "Raw material, quantity and rate are required"
      });
    }

    // ── Pre-calculate the total cost ─────────────────────────
    // This avoids repeated multiplication in every report query.
    const totalCost = quantity * rate;

    // ── Save the purchase record ──────────────────────────────
    // status defaults to "Pending" (set in the model schema).
    // purchaseDate = now (when the purchase was recorded).
    const purchase = await RawPurchase.create({
      rawMaterial,             // reference to RawMaterial document (ObjectId)
      quantity,
      rate,
      totalCost,
      purchaseDate: new Date() // record the current timestamp
    });

    res.status(201).json(purchase); // 201 = Created

  } catch (error) {
    console.error("ADD RAW PURCHASE ERROR:", error);
    res.status(500).json({ message: "Failed to add raw purchase" });
  }
};


// ============================================================
// MARK A PURCHASE AS DONE (confirmed received & paid)
// Route: PATCH /api/raw-purchases/:id/done
// ============================================================
exports.markPurchaseDone = async (req, res) => {
  try {

    const purchase = await RawPurchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Flip status from "Pending" to "Done".
    // Once "Done", this purchase will be counted in expense reports.
    purchase.status = "Done";
    await purchase.save();

    res.json({ message: "Purchase marked as done" });

  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};


// ============================================================
// GET RAW PURCHASES (optionally filtered by date)
// Route: GET /api/raw-purchases?date=2024-12-25
// ============================================================
exports.getRawPurchases = async (req, res) => {
  try {

    let filter = {};

    // If a date query param is provided, filter by that specific day
    if (req.query.date) {
      const start = new Date(req.query.date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999);

      filter.purchaseDate = { $gte: start, $lte: end };
    }

    // .populate() replaces the rawMaterial ObjectId with the actual document.
    // We only need "name unit isActive" fields from it — not the whole document.
    // .sort({ createdAt: -1 }) → newest purchases first
    const purchases = await RawPurchase.find(filter)
      .populate({
        path:   "rawMaterial",
        select: "name unit isActive" // only include these fields from RawMaterial
      })
      .sort({ createdAt: -1 });

    res.json(purchases);

  } catch (error) {
    console.error("GET RAW PURCHASE ERROR:", error);
    res.status(500).json({ message: "Failed to load raw purchases" });
  }
};