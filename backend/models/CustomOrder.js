// ============================================================
// CustomOrder.js — CUSTOM ORDER MODEL (Mongoose Schema)
// ============================================================
// PURPOSE:
//   Defines the structure of a "CustomOrder" document in MongoDB.
//   Custom orders are special/made-to-order items described in free text
//   (e.g., "5kg wedding cake with chocolate frosting, flower decoration").
//   Unlike normal orders, they don't reference specific product menu items.
//
// KEY FIELDS EXPLAINED:
//
//   orderNumber   → A human-readable sequential number (starts from 5001).
//                   Separate number series from normal orders (which start at 1001).
//                   Helps the owner quickly identify and reference orders.
//
//   notes         → Free-text description of what the customer wants.
//                   This is what makes custom orders "custom".
//
//   totalPrice    → Agreed price for the entire custom job.
//
//   advancePaid   → Deposit paid upfront by the customer (default 0).
//
//   balanceAmount → Remaining amount due on delivery.
//                   Formula: balanceAmount = totalPrice - advancePaid
//                   Calculated in the controller and stored here.
//
//   deliveryDate  → When the item should be ready and delivered.
//                   Used to filter orders by date and in profit reports.
//
//   status        → Current state of the order.
//                   enum restricts the field to only these exact values —
//                   anything else will throw a ValidationError.
//
//   completedAt   → Timestamp when the order was marked Completed.
//                   Used in profit reports to count revenue by delivery date.
//                   Optional (only set when the order is completed).
//
// STATUS FLOW:
//   "Pending" → "Done" → "Completed"
//       └──────────────► "Cancelled"
// ============================================================

const mongoose = require("mongoose");

const customOrderSchema = new mongoose.Schema(
  {
    // Sequential order number (e.g., 5001, 5002, 5003...)
    // unique: true ensures no two orders share the same number.
    orderNumber: {
      type: Number,
      unique: true,
      required: true
    },

    customerName: {
      type: String,
      required: true
    },

    customerPhone: {
      type: String,
      required: true // Used to look up customer order history
    },

    // Free-text description of what the customer ordered
    // (not required at the schema level, but validated in the controller)
    notes: {
      type: String
    },

    // Total agreed price for the custom item
    totalPrice: {
      type: Number,
      required: true
    },

    // Advance/deposit paid by customer (defaults to 0 if nothing paid upfront)
    advancePaid: {
      type: Number,
      default: 0
    },

    // How much the customer still owes = totalPrice - advancePaid
    // Stored so it can be displayed without recalculating every time
    balanceAmount: {
      type: Number,
      required: true
    },

    // When the custom item should be ready and delivered
    deliveryDate: {
      type: Date,
      required: true
    },

    // Current state of the order
    // enum = only these string values are allowed; others cause a ValidationError
    status: {
      type: String,
      enum: ["Pending", "Done", "Completed", "Cancelled"],
      default: "Pending" // All new orders start as Pending
    },

    // Set when status changes to "Completed" (used in profit reports)
    // Optional field — only exists on completed orders
    completedAt: {
      type: Date
    }

    // Note: cancelledAt is handled in the controller but not defined in the schema.
    // Mongoose will still save it because of schema flexibility, but defining it
    // explicitly here would be better practice.
  },
  { timestamps: true } // auto-adds createdAt and updatedAt
);

// "CustomOrder" → MongoDB collection: "customorders"
module.exports = mongoose.model("CustomOrder", customOrderSchema);