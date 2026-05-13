// ============================================================
// customerRoutes.js — CUSTOMER ROUTES
// ============================================================
// PURPOSE:
//   Defines the endpoint to fetch all customers (derived from order history).
//
// NOTE ON ACCESS CONTROL:
//   This route has no authMiddleware — it's currently public.
//   In a production app you'd likely protect this with authMiddleware
//   since customer data is sensitive. Worth mentioning in an interview
//   as a potential improvement.
//
// MOUNTED AT (in server.js):
//   app.use("/api/customers", customerRoutes)
//
// FULL URLS:
//   GET /api/customers → Get all unique customers with their order history
// ============================================================

const express = require("express");
const router = express.Router();
const { getCustomers } = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/customers
// Returns a list of unique customers grouped by phone number,
// each with their normal orders and custom orders.
router.get("/", authMiddleware, getCustomers);

module.exports = router;