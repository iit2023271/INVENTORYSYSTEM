// ============================================================
// Product.js — PRODUCT MODEL (Mongoose Schema)
// ============================================================
// PURPOSE:
//   Defines the structure of a "Product" document in MongoDB.
//   Products are the items available for customers to order
//   (e.g., "Gulab Jamun", "Rasgulla", "Kaju Katli").
//
// KEY FIELDS EXPLAINED:
//
//   name / category   → Basic product info. trim: true auto-strips whitespace.
//
//   image             → Cloudinary URL of the product image.
//                       Stored as a string (the URL). Default is "" (no image).
//
//   cloudinaryId      → The Cloudinary "public_id" of the image.
//                       This is NOT the image URL — it's the unique identifier
//                       Cloudinary assigns to every uploaded image.
//                       We need it to DELETE the image from Cloudinary later.
//                       Example: "sweets-shop/products/abc123xyz"
//
//   lowStockLevel     → Alert threshold. If stock drops to/below this number,
//                       the owner knows to restock. Default is 5 units.
//
//   isActive          → Controls customer visibility.
//                       true  = customers can order this product
//                       false = product is temporarily unavailable
//                       Auto-set to false when stock hits 0.
//
//   isDeleted         → Soft-delete flag.
//                       false = product exists normally
//                       true  = product is archived (hidden from all views)
//                       We never hard-delete products because orders reference them.
//
// TWO-FLAG SYSTEM (isActive vs isDeleted):
//   isActive = daily availability (can flip back and forth with stock)
//   isDeleted = permanent archival (product is discontinued)
//
//   A product can be:
//   isActive:true,  isDeleted:false → normal, orderable product ✅
//   isActive:false, isDeleted:false → temporarily out of stock ⏸️
//   isActive:false, isDeleted:true  → archived/discontinued ❌
// ============================================================

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Product display name (e.g., "Gulab Jamun")
    name: {
      type: String,
      required: true,
      trim: true // auto-remove extra whitespace
    },

    // Category this product belongs to (e.g., "Sweets")
    // Stored as a String, not an ObjectId reference, for simplicity
    category: {
      type: String,
      required: true,
      trim: true
    },

    // Cloudinary image URL (the actual URL to display the image)
    // e.g., "https://res.cloudinary.com/myshop/image/upload/v1234/sweets-shop/products/abc.jpg"
    image: {
      type: String,
      default: "" // empty string = no image uploaded yet
    },

    // Cloudinary public_id — needed to DELETE the image later
    // e.g., "sweets-shop/products/abc"
    // Different from the URL — this is the internal Cloudinary identifier
    cloudinaryId: {
      type: String,
      default: ""
    },

    // Owner gets a low-stock alert when quantity falls to this number or below
    lowStockLevel: {
      type: Number,
      default: 5
    },

    // Is this product currently available for ordering?
    // Set to false automatically when stock hits 0
    isActive: {
      type: Boolean,
      default: true // new products start as active
    },

    // Has this product been soft-deleted (archived)?
    // true = permanently hidden, false = normal
    isDeleted: {
      type: Boolean,
      default: false // new products are not deleted
    }
  },
  {
    timestamps: true // auto-adds createdAt and updatedAt
  }
);

// "Product" → MongoDB collection: "products"
module.exports = mongoose.model("Product", productSchema);