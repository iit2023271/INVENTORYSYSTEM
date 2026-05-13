// ============================================================
// ORDERS SUMMARY PAGE  (OrdersSummary.js)
// Shows a visual summary of orders for a selected date:
//   - Total orders, items sold, and revenue
//   - Category-wise sales bar chart
//   - Product-wise sales bar chart
//   - Custom order notes for that day
//
// The bar charts are pure CSS — bar width = (qty / maxQty) × 100%
// ============================================================

import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";

const getToday = () => new Date().toLocaleDateString("en-CA");

function OrdersSummary() {
  const [orders, setOrders] = useState([]); // normal orders
  const [customOrders, setCustomOrders] = useState([]); // custom (cake) orders
  const [date, setDate] = useState(getToday()); // selected date

  const token = localStorage.getItem("token");

  // Fetch normal orders for the selected date
  const fetchOrders = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/orders?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []));
  }, [date, token]);

  // Fetch custom orders for the selected date
  const fetchCustomOrders = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/custom-orders?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCustomOrders(Array.isArray(data) ? data : []));
  }, [date, token]);

  // Re-fetch whenever date changes
  useEffect(() => {
    fetchOrders();
    fetchCustomOrders();
  }, [fetchOrders, fetchCustomOrders]);

  // --- CALCULATE SUMMARY VALUES ---
  // Only count completed orders for accurate reporting
  const totalOrders = orders.filter((o) => o.status === "Completed").length;
  let totalItemsSold = 0;
  let totalRevenue = 0;
  const productSummary = {}; // { productName: qty }
  const categorySummary = {}; // { categoryName: qty }

  // grab completed custom orders early so we can tally their revenue below
  const completedCustomOrders = customOrders.filter(
    (o) => o.status === "Completed",
  );

  orders.forEach((order) => {
    if (order.status !== "Completed") return; // skip non-completed

    totalRevenue += order.totalAmount;

    order.items.forEach((item) => {
      totalItemsSold += item.quantity;

      // Accumulate by product name
      productSummary[item.name] =
        (productSummary[item.name] || 0) + item.quantity;
      // Accumulate by category
      categorySummary[item.category] =
        (categorySummary[item.category] || 0) + item.quantity;
    });
  });

  // include revenue from custom orders as well
  completedCustomOrders.forEach((order) => {
    totalRevenue += order.totalPrice;
  });

  // Max values used to scale bar widths to 100%
  const maxCategoryQty = Math.max(1, ...Object.values(categorySummary));
  const maxProductQty = Math.max(1, ...Object.values(productSummary));

  return (
    <>
      <Header title="" />
      <div className="container">
        <h2 style={{ textAlign: "center" }}>📊 Orders Summary</h2>

        {/* DATE PICKER */}
        <div className="card">
          <label style={{ fontWeight: "600" }}>Select Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* KEY NUMBERS */}
        <div className="card">
          <h3>📌 Overview</h3>
          <p>
            🧾 Orders Completed: <strong>{totalOrders}</strong>
          </p>
          <p>
            📦 Items Sold: <strong>{totalItemsSold}</strong>
          </p>
          <p>
            💰 Revenue: <strong>₹{totalRevenue}</strong>
          </p>
        </div>

        {/* CATEGORY BAR CHART */}
        <div className="card">
          <h3>📦 Category-wise Sales</h3>
          {Object.keys(categorySummary).length === 0 && (
            <p>No completed orders.</p>
          )}
          {Object.entries(categorySummary).map(([cat, qty]) => (
            <div key={cat} className="bar-row">
              <div className="bar-label">
                <span>{cat}</span>
                <strong>{qty}</strong>
              </div>
              {/* Bar width is proportional to the max quantity */}
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{ width: `${(qty / maxCategoryQty) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* PRODUCT BAR CHART */}
        <div className="card">
          <h3>🧁 Product-wise Sales</h3>
          {Object.keys(productSummary).length === 0 && (
            <p>No completed orders.</p>
          )}
          {Object.entries(productSummary).map(([name, qty]) => (
            <div key={name} className="bar-row">
              <div className="bar-label">
                <span>{name}</span>
                <strong>{qty}</strong>
              </div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{ width: `${(qty / maxProductQty) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* CUSTOM ORDER NOTES */}
        <div className="card">
          <h3>📝 Custom Order Notes</h3>
          {completedCustomOrders.length === 0 && (
            <p>No completed custom order notes for this date.</p>
          )}
          {completedCustomOrders.map((order, index) => (
            <div
              key={order._id}
              style={{
                background: "#fff3e0",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "10px",
                borderLeft: "5px solid #ff9800",
              }}
            >
              <p style={{ fontWeight: "600", marginBottom: "6px" }}>
                📝 Custom Order #{index + 1}
              </p>
              {/* pre-wrap preserves newlines in the notes text */}
              <p style={{ whiteSpace: "pre-wrap" }}>{order.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default OrdersSummary;
