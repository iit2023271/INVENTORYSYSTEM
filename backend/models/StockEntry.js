// ============================================================
// StockEntry.js — STOCK ENTRY MODEL (Mongoose Schema)
// ============================================================
// PURPOSE:
//   Tracks how many units of each product are available on a
//   specific day. Each document = one product's stock for one day.
//
// DAILY STOCK DESIGN:
//   Instead of a single running total per product, stock is recorded
//   fresh each day. The owner enters quantities every morning.
//   This gives us a daily history of stock levels.
//
//   Structure (one document per product per day):
//   ┌────────────────────────────────────────────────┐
//   │ productId: "abc123"   quantity: 50   date: Mon │
//   │ productId: "abc123"   quantity: 40   date: Tue │
//   │ productId: "xyz789"   quantity: 30   date: Mon │
//   └────────────────────────────────────────────────┘
//
// COMPOUND UNIQUE INDEX:
//   stockEntrySchema.index({ productId: 1, date: 1 }, { unique: true })
//
//   This creates a COMPOUND INDEX — a unique constraint across TWO fields.
//   It means: the combination of (productId + date) must be unique.
//
//   ✅ Same product, different days → allowed
//   ✅ Different products, same day  → allowed
//   ❌ Same product, same day (duplicate) → rejected by MongoDB
//
//   Why a compound index and not just unique fields individually?
//   Because each product CAN have one entry per day — the uniqueness
//   is for the PAIR, not for each field alone.
//
//   { productId: 1, date: 1 } → 1 means ascending index (standard)
//
//   The controller uses this to do an upsert pattern:
//   findOne({ productId, date }) → update if exists, create if not.
//
// ref: "Product":
//   Allows .populate("productId") to fetch the full product info
//   (name, category, isActive, etc.) when needed.
// ============================================================

const mongoose = require("mongoose");

const stockEntrySchema = new mongoose.Schema(
  {
    // Which product this stock entry is for
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // enables .populate("productId") for joins
      required: true
    },

    // How many units are available today
    // Can be 0 (owner explicitly marking as out of stock)
    quantity: {
      type: Number,
      required: true
    },

    // The calendar date for this stock entry (stored at midnight: 00:00:00.000)
    // The controller always normalizes the date to midnight before querying:
    //   today.setHours(0, 0, 0, 0)
    // This ensures consistent lookups regardless of what time stock was entered.
    date: {
      type: Date,
      required: true
    }
  },
  { timestamps: true } // auto-adds createdAt and updatedAt
);

// ── COMPOUND UNIQUE INDEX ─────────────────────────────────────────
// Enforces: each product can have at most ONE stock entry per day.
// The combination of (productId + date) must be unique across the collection.
//
// MongoDB uses this index to:
//   1. Reject duplicate entries fast (before even looking at the document)
//   2. Speed up queries like: findOne({ productId: X, date: today })
//
// { unique: true } = uniqueness constraint (not just for query performance)
stockEntrySchema.index({ productId: 1, date: 1 }, { unique: true });

// "StockEntry" → MongoDB collection: "stockentries"
module.exports = mongoose.model("StockEntry", stockEntrySchema);