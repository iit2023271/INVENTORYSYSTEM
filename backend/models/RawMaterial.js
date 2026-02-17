// ============================================================
// RawMaterial.js — RAW MATERIAL MODEL (Mongoose Schema)
// ============================================================
// PURPOSE:
//   Defines the structure of a "RawMaterial" document in MongoDB.
//   Raw materials are the ingredients/supplies the owner buys
//   to make products (e.g., Sugar, Milk, Ghee, Flour, Cardamom).
//
// KEY FIELDS:
//
//   name    → The material's name. unique: true means no two materials
//             can share the same name (enforced at the database level).
//
//   unit    → The measurement unit for this material.
//             e.g., "kg" for sugar, "litre" for milk, "packet" for cardamom.
//             Stored so purchase quantities are recorded with the correct unit.
//
//   isActive → Soft-delete flag.
//              true  = material is in use (shows up in dropdowns)
//              false = material has been archived (hidden from views)
//
// UNIQUE CONSTRAINT:
//   unique: true on the "name" field creates a unique index in MongoDB.
//   This enforces uniqueness at the DATABASE level, not just application level.
//   Even if two requests arrive simultaneously trying to create "Sugar",
//   MongoDB will only allow one through and reject the other with a duplicate
//   key error (error code 11000).
//
// SOFT DELETE:
//   We soft-delete raw materials (isActive=false) instead of removing them
//   because RawPurchase documents reference them. Hard-deleting a material
//   would leave orphaned purchase records with broken references.
//
// SMART RESTORE:
//   In the controller, if the owner tries to ADD a material that was previously
//   soft-deleted, we RESTORE it instead of throwing "already exists".
//   This prevents duplicate documents while handling the re-use case gracefully.
// ============================================================

const mongoose = require("mongoose");

const rawMaterialSchema = new mongoose.Schema(
  {
    // Name of the ingredient/supply (e.g., "Sugar", "Milk", "Ghee")
    name: {
      type: String,
      required: true,
      unique: true // DB-level uniqueness — no two materials can have the same name
    },

    // Unit of measurement: "kg", "litre", "packet", "gram", etc.
    unit: {
      type: String,
      required: true // Must be provided — no unit = ambiguous purchase records
    },

    // Soft-delete flag (true = active, false = archived)
    isActive: {
      type: Boolean,
      default: true // new materials start as active
    }
  },
  { timestamps: true } // auto-adds createdAt and updatedAt
);

// "RawMaterial" → MongoDB collection: "rawmaterials"
module.exports = mongoose.model("RawMaterial", rawMaterialSchema);