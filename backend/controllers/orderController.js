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

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    
    if (!/^\d{10}$/.test(customerPhone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = item.product;

      if (!productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: "Invalid item data" });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const priceDoc = await ProductPrice.findOne({ productId, toDate: null });
      if (!priceDoc) {
        return res.status(400).json({ message: `Price not set for ${product.name}` });
      }

      const subTotal = priceDoc.price * item.quantity;
      totalAmount += subTotal;

      orderItems.push({
        productId,
        name:        product.name,
        category:    product.category,
        priceAtSale: priceDoc.price,
        quantity:    item.quantity,
        subTotal
      });
    }

    const lastOrder   = await Order.findOne().sort({ orderNumber: -1 });
    const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;

    const order = await Order.create({
      orderNumber,
      customerName,
      customerPhone,
      items:       orderItems,
      totalAmount,
      status: "Pending"
    });

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
//

// ============================================================
exports.getOrders = async (req, res) => {
  try {
    let filter = {};

    if (req.query.date) {
      
      const start = new Date(req.query.date + "T00:00:00.000Z");
      const end   = new Date(req.query.date + "T23:59:59.999Z");

     

      filter.createdAt = { $gte: start, $lte: end };
    }

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
//

// ============================================================
exports.completeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Done") {
      return res.status(400).json({ message: "Order must be Done before completing" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of order.items) {
      const stock = await StockEntry.findOne({
        productId: item.productId,
        date: today
      });

      if (!stock) {
        return res.status(400).json({ message: `Stock entry missing for ${item.name}` });
      }

      
      if (stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${item.name}". Available: ${stock.quantity}, Ordered: ${item.quantity}`
        });
      }

     
      stock.quantity -= item.quantity;
      await stock.save();

      if (stock.quantity <= 0) {
        await Product.findByIdAndUpdate(item.productId, { isActive: false });
      }
    }

    order.status      = "Completed";
    order.completedAt = new Date();
    await order.save();

    res.json({ message: "Order completed & stock updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete order" });
  }
};


// ============================================================
// MARK ORDER AS DONE
// Route: PATCH /api/orders/:id/done
// ============================================================
exports.markOrderDone = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be marked as done" });
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

    if (order.status === "Completed") {
      return res.status(400).json({ message: "Completed order cannot be cancelled" });
    }

    order.status      = "Cancelled";
    order.cancelledAt = new Date();
    await order.save();

    res.json({ message: "Order cancelled" });

  } catch (err) {
    res.status(500).json({ message: "Failed to cancel order" });
  }
};
