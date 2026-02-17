// ============================================================
// productPriceController.js — MANAGE PRODUCT PRICES
// ============================================================
// PURPOSE:
//   Handles setting and retrieving prices for products.
//
// DESIGN PATTERN — Price History (Temporal Data):
//   Instead of having a single price field on the Product model
//   that gets overwritten, we keep a HISTORY of all prices using
//   a separate ProductPrice collection.
//
//   Each price document has:
//     productId   → which product this price belongs to
//     price       → the price value
//     fromDate    → when this price became active (auto-set on creation)
//     toDate      → when this price was replaced (null = currently active)
//
//   When a price is updated:
//     1. Old price: set toDate = now  (marks it as "no longer active")
//     2. New price: create with toDate = null  (marks it as "active")
//
//   This way we always know what a product cost at any point in time.
//   This is why orders store priceAtSale — even if the price changes later,
//   the historical order data is accurate.
//
// ACTIVE PRICE QUERY:
//   { productId: X, toDate: null }  → find the CURRENT active price
// ============================================================

const ProductPrice = require("../models/ProductPrice");
const Product      = require("../models/Product");


// ============================================================
// SET OR UPDATE A PRODUCT'S PRICE
// Route: POST /api/prices
// Body: { productId: "abc123", price: 150 }
// ============================================================
exports.updatePrice = async (req, res) => {
  try {

    const { productId, price } = req.body;

    // ── Validate required fields ──────────────────────────────
    if (!productId || !price) {
      return res.status(400).json({ message: "Product and price required" });
    }

    // ── STEP 1: Close (expire) the current active price ───────
    // Find the document where toDate is null (currently active) and set
    // toDate = now. This means: "this price was valid UNTIL now."
    await ProductPrice.findOneAndUpdate(
      { productId, toDate: null }, // filter: find the active price
      { toDate: new Date() }       // update: mark it as expired
    );
    // Note: if no active price exists yet, this does nothing (that's fine).

    // ── STEP 2: Create the new active price ───────────────────
    // toDate is not set → defaults to null → this is now the active price.
    const newPrice = await ProductPrice.create({
      productId,
      price
      // fromDate is auto-set by the model (createdAt or a default field)
      // toDate defaults to null → this is the active/current price
    });

    res.status(201).json(newPrice); // 201 = Created

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ============================================================
// GET CURRENT PRICES FOR ALL PRODUCTS
// Route: GET /api/prices/current
// Returns: [{ productId, name, price }, ...]
// ============================================================
exports.getCurrentPrices = async (req, res) => {
  try {

    // Find all price documents where toDate is null → these are the active prices.
    // .populate("productId", "name") → replace the productId ObjectId with
    // the actual Product document, but only include its "name" field.
    // This is a JOIN equivalent in SQL.
    const prices = await ProductPrice.find({ toDate: null })
      .populate("productId", "name");

    // Shape the response to be clean and frontend-friendly.
    // Instead of a nested object, flatten it to { productId, name, price }.
    const result = prices.map(p => ({
      productId: p.productId._id,
      name:      p.productId.name,
      price:     p.price
    }));

    res.json(result);

  } catch (error) {
    console.error("GET CURRENT PRICES ERROR:", error);
    res.status(500).json({ message: "Failed to load prices" });
  }
};