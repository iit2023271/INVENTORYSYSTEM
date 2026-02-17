// ============================================================
// Category.js — CATEGORY MODEL (Mongoose Schema)
// ============================================================
// PURPOSE:
//   Defines the structure (schema) of a "Category" document
//   in MongoDB. Think of this like a table definition in SQL.
//
// WHAT IS A MONGOOSE SCHEMA?
//   A schema is a blueprint that tells MongoDB:
//   - What fields a document should have
//   - What data type each field must be (String, Number, Boolean, etc.)
//   - What rules/constraints apply (required, unique, default, etc.)
//
// WHAT IS A MONGOOSE MODEL?
//   A model is a class built from the schema.
//   It gives us methods to interact with the MongoDB collection:
//     Category.find()       → fetch documents
//     Category.create()     → insert a document
//     Category.findById()   → fetch one by _id
//     Category.findOneAndUpdate() → update one
//
// COLLECTION NAME:
//   Mongoose automatically lowercases and pluralizes the model name.
//   mongoose.model("Category", ...) → MongoDB collection: "categories"
//
// timestamps: true
//   Automatically adds two fields to every document:
//     createdAt → when the document was first created
//     updatedAt → when the document was last modified
//   Very useful for auditing and sorting.
// ============================================================

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    // Category name (e.g., "Sweets", "Snacks", "Drinks")
    name: {
      type: String,
      required: true, // ❌ Will throw a ValidationError if missing
      unique: true,   // ❌ Will throw a duplicate key error if name already exists
      trim: true      // Automatically strips leading/trailing whitespace
                      // e.g., "  Sweets  " → stored as "Sweets"
    },

    // Soft-delete flag: true = visible, false = hidden (archived)
    // default: true means new categories start as active automatically.
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true } // auto-adds createdAt and updatedAt fields
);

// Create the model from the schema and export it.
// "Category" → MongoDB collection will be named "categories"
module.exports = mongoose.model("Category", categorySchema);