// ============================================================
// orderRoutes.js — NORMAL ORDER ROUTES
// ============================================================
// PURPOSE:
//   Defines endpoints for placing and managing menu-based orders.
//
// TWO TYPES OF USERS, DIFFERENT PERMISSIONS:
//
//   CUSTOMERS (no token required):
//     • Can place an order (POST /)
//     That's it — customers don't need to log in to order.
//
//   OWNER (token required via authMiddleware):
//     • View all orders (GET /)
//     • Mark order as Done (PUT /:id/done)
//     • Complete an order (PUT /:id/complete)
//     • Cancel an order  (PUT /:id/cancel)
//
// WHY IS placeOrder PUBLIC?
//   Customers are not registered users in this system. They just
//   provide their name and phone number when ordering. Requiring
//   a login would create friction and reduce orders.
//
// ORDER STATUS FLOW (reflected in routes):
//   POST /           → Creates order (status = "Pending")
//   PUT /:id/done    → "Pending" → "Done"      (item is ready)
//   PUT /:id/complete → "Done"  → "Completed"  (delivered + stock deducted)
//   PUT /:id/cancel  → "Pending"/"Done" → "Cancelled"
//
// :id IN THE URL:
//   The /:id part is a dynamic URL parameter.
//   Express captures it and makes it available as req.params.id.
//   e.g., PUT /api/orders/64abc123/done → req.params.id = "64abc123"
//   This is the MongoDB _id of the order document.
//
// MOUNTED AT (in server.js):
//   app.use("/api/orders", orderRoutes)
// ============================================================

const express = require("express");
const {
  placeOrder,
  getOrders,
  completeOrder,
  markOrderDone,
  cancelOrder
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ── CUSTOMER ROUTE (Public) ───────────────────────────────────────

// POST /api/orders
// Any customer can place an order. No login required.
router.post("/", placeOrder);

// ── OWNER ROUTES (Protected) ──────────────────────────────────────

// GET /api/orders?date=2024-12-25
// Owner views all orders, optionally filtered by date.
router.get("/", authMiddleware, getOrders);

// PUT /api/orders/:id/done
// Owner marks a Pending order as Done (item is prepared).
router.put("/:id/done", authMiddleware, markOrderDone);

// PUT /api/orders/:id/complete
// Owner marks a Done order as Completed (delivered + stock deducted).
router.put("/:id/complete", authMiddleware, completeOrder);

// PUT /api/orders/:id/cancel
// Owner cancels an order (only works if not already Completed).
router.put("/:id/cancel", authMiddleware, cancelOrder);

module.exports = router;