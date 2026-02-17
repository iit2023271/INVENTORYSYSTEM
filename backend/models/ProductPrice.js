// ============================================================
// ProductPrice.js — PRODUCT PRICE MODEL (Mongoose Schema)
// ============================================================
// PURPOSE:
//   Stores the pricing history for each product.
//   Instead of just storing a single price on the Product model
//   (which would overwrite history on every update), we create a
//   NEW price document each time the price changes.
//
// TEMPORAL DATA PATTERN (Price History):
//   Every price has a "validity window":
//     fromDate → when this price became active
//     toDate   → when this price was replaced (null = still active)
//
//   Example for "Gulab Jamun":
//   ┌─────────────────────────────────────────────────────┐
//   │ price: ₹20,  fromDate: Jan 1,  toDate: Mar 1  (old)│
//   │ price: ₹25,  fromDate: Mar 1,  toDate: null   (now)│
//   └─────────────────────────────────────────────────────┘
//
//   To find the CURRENT price:
//     ProductPrice.findOne({ productId: X, toDate: null })
//
//   When updating a price:
//     1. Set toDate = now on the old active price (close it)
//     2. Create a new document with toDate = null (make it active)
//
// WHY STORE PRICE SEPARATELY FROM PRODUCT?
//   • Prices change frequently (seasonal discounts, cost hikes, etc.)
//   • Orders store priceAtSale — this history lets us audit/verify that
//   • Keeps the Product model clean and simple
//   • Enables future features like price trend charts
//
// REF AND POPULATE:
//   productId uses ref: "Product" which means:
//   When we call .populate("productId"), Mongoose replaces the ObjectId
//   with the actual Product document (name, category, etc.).
//   This is similar to a SQL JOIN.
// ============================================================

const mongoose = require("mongoose");

const productPriceSchema = new mongoose.Schema(
  {
    // Which product this price belongs to
    // ObjectId = MongoDB's built-in unique ID type (like a foreign key)
    // ref: "Product" enables .populate() to fetch the full Product document
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    // The price value in local currency (e.g., ₹25 per unit)
    price: {
      type: Number,
      required: true
    },

    // When this price became effective
    // Date.now is a function reference (no parentheses!) — Mongoose calls it
    // automatically when creating a new document to get the current timestamp.
    fromDate: {
      type: Date,
      default: Date.now // ← function reference, NOT Date.now() (which would be fixed)
    },

    // When this price was replaced by a newer price
    // null = this is the CURRENTLY ACTIVE price
    // A Date value = this price has been superseded
    toDate: {
      type: Date,
      default: null // all new prices start as the active price
    }
  },
  { timestamps: true } // also adds createdAt and updatedAt
);

// "ProductPrice" → MongoDB collection: "productprices"
module.exports = mongoose.model("ProductPrice", productPriceSchema);