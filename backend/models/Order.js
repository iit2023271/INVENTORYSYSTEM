// ============================================================
// Order.js — NORMAL ORDER MODEL (Mongoose Schema)
// ============================================================
// PURPOSE:
//   Defines the structure of a regular (menu-based) order document.
//   Unlike CustomOrder, normal orders reference specific products
//   from the menu and store a snapshot of each item's details.
//
// KEY DESIGN DECISION — EMBEDDED ITEMS ARRAY:
//   The "items" field is an array of sub-documents (nested objects).
//   Each item in the array contains product details AT THE TIME OF ORDER.
//   This is called "denormalization" — we copy the data instead of
//   just storing a reference (ObjectId).
//
//   WHY NOT JUST STORE productId?
//   Because product names, categories, and prices can CHANGE after an order.
//   By copying name, category, priceAtSale, etc. into the order document,
//   we preserve an accurate historical record. Even if a product is renamed
//   or its price changes next week, this order shows exactly what was ordered
//   and at what price.
//
// REFERENCE vs. EMBEDDED:
//   productId: { ref: "Product" }  → a REFERENCE (like a foreign key in SQL)
//     - Links to the Product collection so we can .populate() it
//     - But we also store name/price/category directly for historical accuracy
//
//   items: [{ ... }]  → EMBEDDED sub-documents
//     - Stored directly inside the Order document (no separate collection)
//     - Fast to read (no join needed), but no separate ID for each item
//
// STATUS FLOW:
//   "Pending" → "Done" → "Completed" (stock deducted here)
//       └──────────────► "Cancelled"
//
// TIMESTAMP FIELDS:
//   completedAt → set when order is Completed (used in daily profit reports)
//   cancelledAt → set when order is Cancelled (audit trail)
//   deliveredAt → reserved for future use (currently always null)
// ============================================================

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Human-readable sequential order number (starts at 1001)
    orderNumber: {
      type: Number,
      required: true,
      unique: true // Ensures no two orders share the same number
    },

    customerName: {
      type: String,
      required: true
    },

    // Phone is used to group all orders from the same customer
    customerPhone: {
      type: String,
      required: true
    },

    // ── EMBEDDED ITEMS ARRAY ──────────────────────────────────
    // Each element is a sub-document representing one line item.
    // Sub-documents are validated just like top-level fields.
    items: [
      {
        // Reference to the Product document (for lookups/joins with .populate())
        productId: {
          type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId type
          ref: "Product",                        // links to the Product collection
          required: true
        },

        // Snapshot of the product name AT TIME OF ORDER
        // (in case the product is renamed later)
        name: {
          type: String,
          required: true
        },

        // Snapshot of the product category AT TIME OF ORDER
        category: {
          type: String,
          required: true
        },

        // Price the product was sold at WHEN this order was placed.
        // Critical: if prices change later, this order remains historically accurate.
        priceAtSale: {
          type: Number,
          required: true
        },

        quantity: {
          type: Number,
          required: true
        },

        // Pre-calculated: priceAtSale × quantity
        // Stored to avoid recalculating in every report query
        subTotal: {
          type: Number,
          required: true
        }
      }
    ],

    // Sum of all item subTotals
    totalAmount: {
      type: Number,
      required: true
    },

    // Current state of the order
    // enum restricts values — any other string causes a ValidationError
    status: {
      type: String,
      enum: ["Pending", "Done", "Completed", "Cancelled"],
      default: "Pending"
    },

    // Set when order reaches "Completed" status
    // Used in profit reports to count revenue by completion date
    completedAt: {
      type: Date
      // No default — only set when the order is actually completed
    },

    // Set when order is "Cancelled" (audit trail)
    cancelledAt: {
      type: Date
    },

    // Reserved for future use (e.g., delivery confirmation feature)
    // Currently always null
    deliveredAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true } // auto-adds createdAt and updatedAt
);

// "Order" → MongoDB collection: "orders"
module.exports = mongoose.model("Order", orderSchema);