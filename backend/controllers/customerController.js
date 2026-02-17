// ============================================================
// customerController.js — BUILD CUSTOMER PROFILES
// ============================================================
// PURPOSE:
//   We don't have a separate "Customer" model. Instead, we derive
//   customer information from the orders they've placed.
//
//   This controller:
//   1. Fetches ALL normal orders and ALL custom orders from the DB.
//   2. Groups them by customer phone number.
//   3. Returns a list of unique customers, each with their full order history.
//
// KEY CONCEPT — Building a Map:
//   A "map" (plain JS object used as a dictionary) lets us group data.
//   Key   = customer's phone number (unique identifier)
//   Value = customer's info + their orders
//
// WHY PHONE AS KEY?
//   Phone numbers are unique per customer and always collected at order time.
//   This avoids needing a separate customers table.
// ============================================================

const Order       = require("../models/Order");
const CustomOrder = require("../models/CustomOrder");

// ============================================================
// GET ALL CUSTOMERS (with their order history)
// Route: GET /api/customers
// Returns: Array of unique customers with normalOrders & customOrders
// ============================================================
exports.getCustomers = async (req, res) => {
  try {

    // ── STEP 1: Fetch all orders from the database ────────────
    // We get both normal orders (products from the menu) and
    // custom orders (made-to-order items with special notes).
    const orders       = await Order.find({});
    const customOrders = await CustomOrder.find({});

    // ── STEP 2: Create an empty map to hold customer data ─────
    // Structure:
    // {
    //   "9876543210": {
    //     name: "Rahul",
    //     phone: "9876543210",
    //     normalOrders: [...],
    //     customOrders: [...]
    //   },
    //   ...
    // }
    const customerMap = {};

    // ── STEP 3: Loop through normal orders ────────────────────
    orders.forEach(order => {
      const phone = order.customerPhone; // use phone as the unique key

      // If this phone number hasn't been seen yet → create a new entry
      if (!customerMap[phone]) {
        customerMap[phone] = {
          name: order.customerName,
          phone,
          normalOrders: [],  // will hold regular orders
          customOrders: []   // will hold custom/special orders
        };
      }

      // Push this order into the customer's normalOrders list
      customerMap[phone].normalOrders.push(order);
    });

    // ── STEP 4: Loop through custom orders ────────────────────
    // Same logic — if customer exists in map, just add to their customOrders.
    // If not, create a new entry for them.
    customOrders.forEach(order => {
      const phone = order.customerPhone;

      if (!customerMap[phone]) {
        customerMap[phone] = {
          name: order.customerName,
          phone,
          normalOrders: [],
          customOrders: []
        };
      }

      customerMap[phone].customOrders.push(order);
    });

    // ── STEP 5: Convert the map to an array and respond ───────
    // Object.values(customerMap) extracts just the values (customer objects).
    // Result: [ { name, phone, normalOrders, customOrders }, ... ]
    res.json(Object.values(customerMap));

  } catch (err) {
    console.error("GET CUSTOMERS ERROR:", err);
    res.status(500).json({ message: "Failed to load customers" });
  }
};