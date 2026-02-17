// ============================================================
// orderController.js — MANAGE CUSTOMER ORDERS
// ============================================================
// PURPOSE:
//   Handles the full lifecycle of a normal (menu-based) order:
//
//   PLACE → PENDING → DONE → COMPLETED
//                 └──► CANCELLED (any time before Completed)
//
// KEY CONCEPTS:
//
//   ORDER STATUS FLOW:
//     "Pending"   → Order placed, waiting for owner to prepare
//     "Done"      → Item is ready for pickup/delivery
//     "Completed" → Owner confirmed delivery, stock is deducted
//     "Cancelled" → Order was cancelled (stock NOT deducted)
//
//   STOCK DEDUCTION:
//     Stock is only reduced when an order reaches "Completed".
//     This is intentional — we don't want stock to drop just
//     because someone placed an order (they might cancel).
//
//   PRICE AT SALE:
//     We store the product price AT THE TIME of the order (priceAtSale).
//     This is important because prices can change in the future.
//     Storing it protects historical accuracy.
// ============================================================

const Order        = require("../models/Order");
const Product      = require("../models/Product");
const ProductPrice = require("../models/ProductPrice");
const StockEntry   = require("../models/StockEntry");


// ============================================================
// PLACE AN ORDER
// Route: POST /api/orders
// Body: { customerName, customerPhone, items: [{ product, quantity }] }
// ============================================================
exports.placeOrder = async (req, res) => {
  try {

    const { customerName, customerPhone, items } = req.body;

    // ── STEP 1: Basic validation ──────────────────────────────
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // These will be built up as we process each item
    let totalAmount = 0;
    const orderItems = [];

    // ── STEP 2: Process each ordered item ─────────────────────
    for (const item of items) {
      const productId = item.product; // ID of the product being ordered

      if (!productId || !item.quantity) {
        return res.status(400).json({ message: "Invalid item data" });
      }

      // Fetch the product from the DB to confirm it exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Find the CURRENT price for this product.
      // { toDate: null } means the price hasn't been replaced yet — it's active.
      // When a price is updated, we set toDate on the old one and create a new one.
      const priceDoc = await ProductPrice.findOne({
        productId,
        toDate: null  // active price = no end date
      });

      if (!priceDoc) {
        return res
          .status(400)
          .json({ message: `Price not set for ${product.name}` });
      }

      // Calculate subtotal for this line item
      const subTotal = priceDoc.price * item.quantity;
      totalAmount += subTotal; // add to the running order total

      // Build the order item object (stored inside the Order document)
      orderItems.push({
        productId,
        name:        product.name,
        category:    product.category,
        priceAtSale: priceDoc.price,   // snapshot of price at time of ordering
        quantity:    item.quantity,
        subTotal
      });
    }

    // ── STEP 3: Generate a unique order number ─────────────────
    // Find the last order and increment its number by 1.
    // If no orders exist yet, start from 1001.
    const lastOrder   = await Order.findOne().sort({ orderNumber: -1 });
    const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;

    // ── STEP 4: Save the order to the database ─────────────────
    const order = await Order.create({
      orderNumber,
      customerName,
      customerPhone,
      items:       orderItems,
      totalAmount,
      status: "Pending"  // always starts as Pending — owner decides when to complete
    });

    // ── STEP 5: Respond with order summary ────────────────────
    res.status(201).json({
      orderNumber:  order.orderNumber,
      customerName: order.customerName,
      items:        order.items,
      totalAmount:  order.totalAmount,
      createdAt:    order.createdAt
    });

  } catch (err) {
    console.error("PLACE ORDER ERROR:", err);
    res.status(500).json({ message: "Order failed" });
  }
};


// ============================================================
// GET ALL ORDERS (optionally filtered by date)
// Route: GET /api/orders?date=2024-12-25
// ============================================================
exports.getOrders = async (req, res) => {
  try {

    let filter = {};

    // If a date is provided, filter to only orders created on that day
    if (req.query.date) {
      const start = new Date(req.query.date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    }

    // Sort newest orders first (-1 = descending)
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


// ============================================================
// COMPLETE AN ORDER (deduct stock, mark as delivered)
// Route: PATCH /api/orders/:id/complete
// ============================================================
exports.completeOrder = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Guard: only "Done" orders can be completed.
    // This enforces the workflow: Pending → Done → Completed.
    if (order.status !== "Done") {
      return res
        .status(400)
        .json({ message: "Order must be Done before completing" });
    }

    // Get today's date at midnight (for stock lookup)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ── STEP: Deduct stock for each item in the order ─────────
    for (const item of order.items) {

      // Find today's stock entry for this product.
      // Stock is tracked per product per day (one entry per day per product).
      const stock = await StockEntry.findOne({
        productId: item.productId,
        date: today
      });

      if (!stock) {
        return res
          .status(400)
          .json({ message: "Stock entry missing" });
      }

      // Subtract the ordered quantity from the available stock
      stock.quantity -= item.quantity;
      await stock.save();

      // If stock hits 0 or below → automatically disable the product
      // so customers can't order something that's out of stock.
      if (stock.quantity <= 0) {
        await Product.findByIdAndUpdate(item.productId, { isActive: false });
      }
    }

    // ── Mark the order as completed and record the timestamp ──
    order.status      = "Completed";
    order.completedAt = new Date(); // used in profit reports
    await order.save();

    res.json({ message: "Order completed & stock updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete order" });
  }
};


// ============================================================
// MARK ORDER AS DONE (item is prepared, awaiting pickup)
// Route: PATCH /api/orders/:id/done
// ============================================================
exports.markOrderDone = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only Pending orders can move to Done.
    if (order.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be marked as done" });
    }

    order.status = "Done";
    await order.save();

    res.json({ message: "Order marked as done" });

  } catch (error) {
    console.error("MARK DONE ERROR:", error);
    res.status(500).json({ message: "Failed to mark order as done" });
  }
};


// ============================================================
// CANCEL AN ORDER
// Route: PATCH /api/orders/:id/cancel
// ============================================================
exports.cancelOrder = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Once completed (delivered + stock deducted), an order cannot be undone.
    // Cancelling a completed order would require restoring stock — complex & risky.
    if (order.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Completed order cannot be cancelled" });
    }

    order.status      = "Cancelled";
    order.cancelledAt = new Date(); // audit trail: when was it cancelled?
    await order.save();

    res.json({ message: "Order cancelled" });

  } catch (err) {
    res.status(500).json({ message: "Failed to cancel order" });
  }
};