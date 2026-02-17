// ============================================================
// customOrderController.js — MANAGE CUSTOM / SPECIAL ORDERS
// ============================================================
// PURPOSE:
//   Custom orders are made-to-order items (e.g., a 5kg wedding cake
//   with specific decoration). Unlike normal orders that pick from
//   a product menu, custom orders are described via free-text notes.
//
// STATUS FLOW:
//   Pending ──► Done ──► Completed
//      │
//      └──► Cancelled (can cancel from Pending or Done, not Completed)
//
// ORDER NUMBER:
//   Custom orders have their own separate number series starting from 5001.
//   We find the highest existing orderNumber and add 1 to it.
//   We filter by type "number" to avoid bugs with old/corrupted data.
// ============================================================

const CustomOrder = require("../models/CustomOrder");


// ============================================================
// CREATE A CUSTOM ORDER
// Route: POST /api/custom-orders
// Body: { customerName, customerPhone, notes, totalPrice,
//         advancePaid, deliveryDate }
// ============================================================
exports.createCustomOrder = async (req, res) => {
  try {

    // ── STEP 1: Destructure fields from request body ──────────
    // advancePaid defaults to 0 if the customer hasn't paid anything yet.
    const {
      customerName,
      customerPhone,
      notes,
      totalPrice,
      advancePaid = 0,
      deliveryDate
    } = req.body;

    // ── STEP 2: Validate required fields ─────────────────────
    if (!customerName || !customerPhone || !notes || !deliveryDate || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ── STEP 3: Generate a unique order number ────────────────
    // Find the latest order that has a valid number (type: "number").
    // This guard prevents crashes if old data has string/null orderNumbers.
    const lastOrder = await CustomOrder.findOne({
      orderNumber: { $type: "number" } // only consider documents where orderNumber is a number
    }).sort({ orderNumber: -1 }); // sort descending → highest number first

    // If no orders exist yet → start from 5001 (5000 + 1).
    // Otherwise → increment the last order number by 1.
    const lastNumber =
      lastOrder && Number.isFinite(lastOrder.orderNumber)
        ? lastOrder.orderNumber
        : 5000;

    const orderNumber = lastNumber + 1;

    // ── STEP 4: Calculate balance due ─────────────────────────
    // balanceAmount = what the customer still owes after their advance payment.
    const balanceAmount = Number(totalPrice) - Number(advancePaid);

    // ── STEP 5: Save the order to the database ────────────────
    const order = await CustomOrder.create({
      orderNumber,
      customerName,
      customerPhone,
      notes,
      totalPrice:    Number(totalPrice),
      advancePaid:   Number(advancePaid),
      balanceAmount,
      deliveryDate:  new Date(deliveryDate), // convert string to JS Date object
      status: "Pending"                      // all orders start as Pending
    });

    res.status(201).json(order); // 201 = Created

  } catch (error) {
    console.error("CREATE CUSTOM ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to create custom order" });
  }
};


// ============================================================
// GET CUSTOM ORDERS (optionally filtered by delivery date)
// Route: GET /api/custom-orders?date=2024-12-25
// ============================================================
exports.getCustomOrders = async (req, res) => {
  try {

    // ── Build a filter based on the optional date query param ─
    let filter = {};

    if (req.query.date) {
      // Set the start of the day (midnight) and end of the day (11:59:59 PM)
      // so we capture ALL orders with a deliveryDate on that calendar day.
      const start = new Date(req.query.date);
      start.setHours(0, 0, 0, 0);    // 00:00:00.000

      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999); // 23:59:59.999

      // MongoDB range query: deliveryDate >= start AND deliveryDate <= end
      filter.deliveryDate = { $gte: start, $lte: end };
    }

    // Sort by newest delivery date first (-1 = descending)
    const orders = await CustomOrder.find(filter).sort({ deliveryDate: -1 });
    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch custom orders" });
  }
};


// ============================================================
// COMPLETE A CUSTOM ORDER (owner collects final payment)
// Route: PATCH /api/custom-orders/:id/complete
// ============================================================
exports.completeCustomOrder = async (req, res) => {
  try {

    // Find the custom order by its MongoDB _id (passed in URL params)
    const order = await CustomOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Custom order not found" });
      // 404 = Not Found
    }

    // Update the status and record the exact timestamp of completion.
    // completedAt is used later in profit reports to count sales by date.
    order.status      = "Completed";
    order.completedAt = new Date();

    await order.save(); // persist changes to MongoDB

    res.json({ message: "Custom order completed" });

  } catch (err) {
    res.status(500).json({ message: "Failed to complete custom order" });
  }
};


// ============================================================
// MARK CUSTOM ORDER AS "DONE" (item is ready, not yet collected)
// Route: PATCH /api/custom-orders/:id/done
// ============================================================
exports.markCustomOrderDone = async (req, res) => {
  try {

    const order = await CustomOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Custom order not found" });
    }

    // Only Pending orders can be moved to Done.
    // This prevents skipping steps in the workflow.
    if (order.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending custom orders can be marked done" });
    }

    order.status = "Done";
    await order.save();

    res.json({ message: "Custom order marked as done" });

  } catch (err) {
    res.status(500).json({ message: "Failed to mark custom order done" });
  }
};


// ============================================================
// CANCEL A CUSTOM ORDER
// Route: PATCH /api/custom-orders/:id/cancel
// ============================================================
exports.cancelCustomOrder = async (req, res) => {
  try {

    const order = await CustomOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Custom order not found" });
    }

    // Once an order is Completed (customer picked it up + paid),
    // it cannot be cancelled. All other statuses can be cancelled.
    if (order.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Completed custom order cannot be cancelled" });
    }

    // Record when it was cancelled (useful for audit/analytics)
    order.status      = "Cancelled";
    order.cancelledAt = new Date();
    await order.save();

    res.json({ message: "Custom order cancelled" });

  } catch (err) {
    res.status(500).json({ message: "Failed to cancel custom order" });
  }
};