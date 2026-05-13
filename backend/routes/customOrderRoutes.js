// ============================================================
// customOrderRoutes.js — CUSTOM ORDER ROUTES
// ============================================================
// PURPOSE:
//   Defines endpoints for managing custom (made-to-order) orders.
//
// HTTP METHODS USED AND WHAT THEY MEAN:
//   POST   → Create a new resource         (create a new order)
//   GET    → Read/fetch data               (get existing orders)
//   PUT    → Update an existing resource   (change order status)
//
// WHY PUT FOR STATUS CHANGES?
//   We use PUT on /:id/done, /:id/complete, /:id/cancel because
//   we're updating a specific order document (identified by :id).
//   :id is a URL parameter — Express captures it as req.params.id.
//   e.g., PUT /api/custom-orders/64abc123/done
//          → req.params.id = "64abc123"
//
// STATUS FLOW REFLECTED IN ROUTES:
//   POST /          → create (status = Pending)
//   PUT /:id/done   → Pending → Done
//   PUT /:id/complete → Done → Completed
//   PUT /:id/cancel → Pending/Done → Cancelled
//
// NOTE: No authMiddleware here — all routes are currently public.
//   In production you'd protect POST/PUT routes so only the owner
//   can manage orders.
//
// MOUNTED AT (in server.js):
//   app.use("/api/custom-orders", customOrderRoutes)
// ============================================================

const express = require("express");
const router = express.Router();
const controller = require("../controllers/customOrderController");
const authMiddleware = require("../middleware/authMiddleware");
// POST /api/custom-orders
// Create a new custom order (customer submits order details + delivery date)
router.post("/",authMiddleware, controller.createCustomOrder);

// GET /api/custom-orders?date=2024-12-25
// Fetch custom orders, optionally filtered by delivery date
router.get("/",authMiddleware, controller.getCustomOrders);

// PUT /api/custom-orders/:id/done
// Mark a Pending order as Done (item is prepared, awaiting collection)
router.put("/:id/done",     authMiddleware, controller.markCustomOrderDone);

// PUT /api/custom-orders/:id/complete
// Mark a Done order as Completed (customer collected + full payment received)
router.put("/:id/complete", authMiddleware, controller.completeCustomOrder);

// PUT /api/custom-orders/:id/cancel
// Cancel a Pending or Done order (Completed orders cannot be cancelled)
router.put("/:id/cancel",   authMiddleware, controller.cancelCustomOrder);

module.exports = router;