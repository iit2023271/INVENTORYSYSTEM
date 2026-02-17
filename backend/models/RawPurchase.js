// ============================================================
// RawPurchase.js — RAW PURCHASE MODEL (Mongoose Schema)
// ============================================================
// PURPOSE:
//   Records every purchase of a raw material by the owner.
//   Each document = one purchase event.
//   e.g., "Bought 10kg of Sugar at ₹40/kg on 25 Dec → totalCost ₹400"
//
// WHY STORE totalCost?
//   totalCost = quantity × rate — it's pre-calculated and stored
//   rather than recalculated every time. This makes report queries
//   (expense reports, profit calculations) faster and simpler,
//   since MongoDB aggregation just needs to $sum totalCost.
//
// REFERENCE FIELD (rawMaterial):
//   rawMaterial stores the ObjectId of the RawMaterial document.
//   ref: "RawMaterial" enables .populate("rawMaterial") which replaces
//   the ObjectId with the full RawMaterial document (name, unit, etc.).
//   This is the "belongs to" relationship — one purchase belongs to one material.
//
// STATUS FIELD:
//   "Pending" → Purchase logged but not yet confirmed (goods not received/paid)
//   "Done"    → Purchase confirmed (goods received, payment made)
//
//   Only "Done" purchases are counted in expense reports.
//   This lets the owner log planned/upcoming purchases without them
//   showing up in today's expenses prematurely.
//
// purchaseDate:
//   Defaults to Date.now (current time when the document is created).
//   Used to filter purchases by day in expense and profit reports.
//   Note: timestamps: true also adds createdAt — purchaseDate is kept
//   separately because it can technically differ from createdAt
//   (e.g., if logging a past purchase).
// ============================================================

const mongoose = require("mongoose");

const rawPurchaseSchema = new mongoose.Schema(
  {
    // Reference to which raw material was purchased
    // ObjectId type links this to a document in the "rawmaterials" collection
    rawMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial", // enables .populate("rawMaterial") for joins
      required: true
    },

    // How many units were purchased (e.g., 10 for "10kg")
    quantity: {
      type: Number,
      required: true
    },

    // Price per unit (e.g., ₹40 per kg)
    rate: {
      type: Number,
      required: true
    },

    // Pre-calculated total cost: quantity × rate (e.g., 10 × 40 = ₹400)
    // Stored for fast aggregation in reports — avoids re-multiplying in queries
    totalCost: {
      type: Number,
      required: true
    },

    // When the purchase occurred (defaults to now)
    // Used to filter by date in expense/profit reports
    purchaseDate: {
      type: Date,
      default: Date.now // function reference — called at document creation time
    },

    // Confirmation status of the purchase
    // enum limits valid values — anything else causes a ValidationError
    status: {
      type: String,
      enum: ["Pending", "Done"],
      default: "Pending" // starts as Pending until owner confirms delivery
    }
  },
  { timestamps: true } // also adds createdAt and updatedAt
);

// "RawPurchase" → MongoDB collection: "rawpurchases"
module.exports = mongoose.model("RawPurchase", rawPurchaseSchema);