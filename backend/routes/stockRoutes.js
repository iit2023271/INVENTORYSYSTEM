// ============================================================
// stockRoutes.js — STOCK MANAGEMENT ROUTES
// ============================================================
// PURPOSE:
//   Defines endpoints for setting daily stock quantities and
//   retrieving today's stock levels.
//
// ACCESS CONTROL — MIXED:
//   POST /update  → PROTECTED (only owner sets stock each morning)
//   GET  /today   → PUBLIC (customers need to see what's available)
//
//   Why is GET /today public?
//   When customers open the ordering app, it needs to know which
//   products are in stock. This check happens on the client side,
//   and customers don't need to be logged in to browse products.
//
// HOW DAILY STOCK WORKS:
//   Each morning, the owner sets the quantity for each product.
//   This creates (or updates) a StockEntry document for today.
//   When an order is completed, stock is deducted from that entry.
//   If stock hits 0 → the product is automatically disabled.
//
// MOUNTED AT (in server.js):
//   app.use("/api/stock", stockRoutes)
//
// FULL URLS:
//   POST /api/stock/update    → Set/update stock for a product (owner only)
//   GET  /api/stock/today     → Get today's stock levels (public)
// ============================================================

const express = require("express");
const {
  updateStock,
  getTodayStock
} = require("../controllers/stockController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/stock/update
// PROTECTED — Owner sets (or corrects) stock quantity for a product today.
// Body: { productId: "abc123", quantity: 50 }
// If a stock entry already exists for this product today → it's updated.
// If not → a new StockEntry document is created.
router.post("/update", authMiddleware, updateStock);

// GET /api/stock/today
// PUBLIC — Returns stock quantities for all products today.
// Side effect: auto-disables any product with 0 or missing stock for today.
router.get("/today", getTodayStock);

module.exports = router;