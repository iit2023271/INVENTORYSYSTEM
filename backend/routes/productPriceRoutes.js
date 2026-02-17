// ============================================================
// productPriceRoutes.js — PRODUCT PRICE ROUTES
// ============================================================
// PURPOSE:
//   Defines endpoints for setting product prices and fetching
//   the current (active) price for all products.
//
// ACCESS CONTROL:
//   Updating prices = PROTECTED (only the owner should change prices)
//   Viewing prices  = PUBLIC (customers need to see prices when ordering)
//
// WHY A SEPARATE PRICE ROUTE?
//   Prices are managed separately from products because:
//   1. Prices change frequently (seasonal, cost changes, etc.)
//   2. We maintain a HISTORY of prices (not just the current one)
//   3. This separation keeps the product model clean and simple
//
// MOUNTED AT (in server.js):
//   app.use("/api/prices", productPriceRoutes)
//
// FULL URLS:
//   POST /api/prices/update         → Set/update a product's price (owner only)
//   GET  /api/prices/current        → Get current prices for all products (public)
// ============================================================

const express = require("express");
const {
  updatePrice,
  getCurrentPrices
} = require("../controllers/productPriceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/prices/update
// PROTECTED — Owner sets or updates a product's price.
// Internally: closes the old price (sets toDate) and creates a new active price.
router.post("/update", authMiddleware, updatePrice);

// GET /api/prices/current
// PUBLIC — Returns the current active price for every product.
// Used by the ordering interface so customers see up-to-date prices.
router.get("/current", getCurrentPrices);

module.exports = router;