// ============================================================
// stockController.js — DAILY STOCK MANAGEMENT
// ============================================================
// PURPOSE:
//   Tracks how many units of each product are available on a
//   given day. Stock is entered fresh each morning by the owner.
//
// KEY DESIGN DECISION — Daily Stock Entries:
//   Instead of a single running total per product, we create a
//   separate StockEntry document for each (product + date) pair.
//   This gives us a historical record of stock levels day by day.
//
//   Structure of StockEntry:
//     { productId, quantity, date }
//     (one document per product per day)
//
// AUTO-DISABLE LOGIC:
//   If a product's stock hits 0 (or goes below 0 after an order),
//   the product is automatically set to isActive: false.
//   This prevents customers from ordering something unavailable.
//
//   Auto-enable does NOT happen automatically — the owner must
//   manually enable the product after restocking.
//
// HOW getTodayStock WORKS:
//   When the owner views stock, we also run a check:
//   any product with no stock entry today OR quantity = 0
//   is automatically disabled. This keeps product availability
//   in sync with actual stock at the start of each day.
// ============================================================

const StockEntry = require("../models/StockEntry");
const Product    = require("../models/Product");


// ============================================================
// UPDATE (or create) STOCK FOR A PRODUCT TODAY
// Route: POST /api/stock
// Body: { productId: "abc123", quantity: 50 }
// ============================================================
exports.updateStock = async (req, res) => {
  try {

    const { productId, quantity } = req.body;

    // ── Validate required fields ──────────────────────────────
    // quantity can be 0 (owner is saying no stock today), so we check
    // for undefined specifically rather than falsy.
    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: "Product and quantity required" });
    }

    // ── Get today's date at midnight (no time component) ─────
    // We strip the time so all stock entries for today share the same date.
    // This is how we look up "today's stock" — by matching the date field exactly.
    const today = new Date();
    today.setHours(0, 0, 0, 0); // e.g., 2024-12-25 00:00:00.000

    // ── Check if a stock entry already exists for today ───────
    // One entry per product per day. If one exists → update it.
    const existingStock = await StockEntry.findOne({
      productId,
      date: today
    });

    if (existingStock) {
      // Update existing entry (owner corrected or restocked during the day)
      existingStock.quantity = quantity;
      await existingStock.save();

      // Auto-disable if stock is now 0 or negative
      if (quantity <= 0) {
        await Product.findByIdAndUpdate(productId, { isActive: false });
      }

      return res.json(existingStock);
    }

    // ── No entry yet today → create a new one ────────────────
    const stock = await StockEntry.create({
      productId,
      quantity,
      date: today
    });

    // Auto-disable if initial stock is 0
    if (quantity <= 0) {
      await Product.findByIdAndUpdate(productId, { isActive: false });
    }

    res.status(201).json(stock); // 201 = Created

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ============================================================
// GET TODAY'S STOCK (for owner dashboard)
// Route: GET /api/stock/today
// Returns: [{ productId, quantity }, ...]
// Side effect: auto-disables products with no/zero stock today
// ============================================================
exports.getTodayStock = async (req, res) => {
  try {

    // ── STEP 1: Get today's date at midnight ──────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ── STEP 2: Fetch all stock entries for today ─────────────
    const todayStocks = await StockEntry.find({ date: today });

    // ── STEP 3: Build a productId → quantity lookup map ───────
    // This lets us check a product's stock in O(1) time
    // instead of scanning the array for each product.
    // e.g., { "abc123": 50, "def456": 0 }
    const stockMap = {};
    todayStocks.forEach(s => {
      stockMap[s.productId.toString()] = s.quantity;
    });

    // ── STEP 4: Auto-disable products with no/zero stock ──────
    // Fetch ALL products (including currently active ones)
    const products = await Product.find();

    for (const product of products) {
      const todayQty = stockMap[product._id.toString()];

      // If there's no stock entry for today OR the quantity is 0 or less:
      if (!todayQty || todayQty <= 0) {
        // If the product is still marked as active → disable it.
        // The owner hasn't stocked it today, so customers can't order it.
        if (product.isActive) {
          await Product.findByIdAndUpdate(product._id, { isActive: false });
        }
      }
      // Note: we don't auto-enable products here — that's a manual action.
      // The owner enables a product only after they confirm stock is ready.
    }

    // ── STEP 5: Return today's stock list ─────────────────────
    res.json(
      todayStocks.map(s => ({
        productId: s.productId,
        quantity:  s.quantity
      }))
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load stock" });
  }
};