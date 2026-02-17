// ============================================================
// ORDERS PAGE
// The owner uses this to view and manage all customer orders.
// Both "normal" orders (from the menu) and "custom" orders
// (special cakes etc.) are shown together, sorted by time.
//
// Key concepts used here:
//   - useCallback: wraps a function so it doesn't get 
//     re-created on every render (helps with useEffect)
//   - async/await: makes API calls in a clean, readable way
//   - filtering: multiple filters applied to same data
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { useNavigate }                       from "react-router-dom";
import Header                                from "../components/Header";

// Helper to get today's date in YYYY-MM-DD format (used by date filter)
const getToday = () => new Date().toLocaleDateString("en-CA");

function Orders() {
  // --- STATES ---
  const [orders,         setOrders]         = useState([]);       // all orders (normal + custom mixed)
  const [selectedDate,   setSelectedDate]   = useState(getToday()); // date filter
  const [statusFilter,   setStatusFilter]   = useState("All");    // Pending / Done / Completed etc.
  const [categoryFilter, setCategoryFilter] = useState("All");    // filter by product category
  const [searchTerm,     setSearchTerm]     = useState("");       // search by order number
  const [loading,        setLoading]        = useState(false);    // true while fetching

  // Stats shown at the top of the page
  const [stats, setStats] = useState({ total: 0, pending: 0, done: 0, completed: 0, cancelled: 0 });

  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  // --- FORMAT DATE & TIME ---
  // Converts a date string like "2024-01-15T10:30:00" 
  // into separate readable date and time strings
  const formatDateTime = (dateStr) => {
    const d    = new Date(dateStr);
    const date = d.toLocaleDateString("en-IN",  { day: "2-digit", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("en-IN",  { hour: "2-digit", minute: "2-digit", hour12: true });
    return { date, time };
  };

  // --- CALCULATE STATS ---
  // Counts orders by status and saves to state for the stats panel
  const calculateStats = (ordersList) => {
    setStats({
      total:     ordersList.length,
      pending:   ordersList.filter((o) => o.status === "Pending").length,
      done:      ordersList.filter((o) => o.status === "Done").length,
      completed: ordersList.filter((o) => o.status === "Completed").length,
      cancelled: ordersList.filter((o) => o.status === "Cancelled").length,
    });
  };

  // --- FETCH ORDERS ---
  // useCallback wraps this function so useEffect doesn't re-run infinitely
  const fetchOrders = useCallback(async (date = "") => {
    setLoading(true);
    try {
      // Fetch normal orders (from customer menu)
      const orderRes   = await fetch(`${process.env.REACT_APP_API_URL}/api/orders?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalOrders = await orderRes.json();

      // Add type="normal" so we know how to render each card later
      const safeNormal = Array.isArray(normalOrders)
        ? normalOrders.map((o) => ({ ...o, type: "normal", sortTime: new Date(o.createdAt) }))
        : [];

      // Fetch custom orders (special cake orders)
      const customRes   = await fetch(`${process.env.REACT_APP_API_URL}/api/custom-orders?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customOrders = await customRes.json();

      const safeCustom = Array.isArray(customOrders)
        ? customOrders.map((o) => ({ ...o, type: "custom", sortTime: new Date(o.createdAt) }))
        : [];

      // Merge both lists and sort newest first
      const merged = [...safeNormal, ...safeCustom].sort((a, b) => b.sortTime - a.sortTime);

      setOrders(merged);
      calculateStats(merged);
    } catch (err) {
      console.error("FETCH ORDERS ERROR", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Re-fetch whenever date changes
  useEffect(() => {
    fetchOrders(selectedDate);
  }, [fetchOrders, selectedDate]);

  // --- COMPLETE A NORMAL ORDER ---
  const completeOrder = async (orderId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/complete`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(selectedDate); // refresh the list
    } catch (err) {
      console.error("COMPLETE ORDER ERROR:", err);
    }
  };

  // --- FILTER ORDERS ---
  // Apply all active filters to the orders array
  const filteredOrders = orders.filter((order) => {
    // Search by order number
    if (searchTerm) {
      if (!order.orderNumber) return false;
      if (!String(order.orderNumber).includes(searchTerm.trim())) return false;
    }

    // Status filter
    if (statusFilter !== "All" && order.status !== statusFilter) return false;

    // Category filter (only works for normal orders that have items)
    if (categoryFilter !== "All" && order.items && !order.items.some((item) => item.category === categoryFilter))
      return false;

    return true;
  });

  // Get unique categories from all orders (for the category dropdown)
  const categories = ["All", ...new Set(orders.flatMap((o) => o.items ? o.items.map((i) => i.category) : []))];

  // --- PREPARATION SUMMARY ---
  // When filtering by "Pending", show how many of each product need to be made
  const categorySummary = {};
  filteredOrders.forEach((order) => {
    if (!order.items) return; // skip custom orders (no items list)
    order.items.forEach((item) => {
      if (categoryFilter !== "All" && item.category !== categoryFilter) return;
      if (!categorySummary[item.category]) categorySummary[item.category] = {};
      if (!categorySummary[item.category][item.name]) categorySummary[item.category][item.name] = 0;
      categorySummary[item.category][item.name] += item.quantity;
    });
  });

  // Clear all filters at once
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedDate(getToday());
    setStatusFilter("All");
    setCategoryFilter("All");
  };

  // --- SCREEN OUTPUT ---
  return (
    <>
      <Header title="" />
      <div className="container">
        {/* PAGE TITLE */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ margin: "0 0 8px 0", color: "#2C3E50", fontSize: "28px" }}>🛒 Customer Orders</h1>
          <p style={{ margin: "0", color: "#7F8C8D", fontSize: "14px" }}>Manage and track all customer orders</p>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={() => navigate("/orders-summary")}
            style={{ padding: "14px", backgroundColor: "#3F51B5", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
          >
            📊 Orders Summary
          </button>
          <button
            onClick={() => navigate("/custom-orders/new")}
            style={{ padding: "14px", backgroundColor: "#009688", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
          >
            ➕ Custom Order
          </button>
        </div>

        {/* STATS PANEL */}
        {!loading && orders.length > 0 && (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#2C3E50" }}>📈 Order Statistics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
              {[
                { label: "Total",     value: stats.total,     color: "#2C3E50" },
                { label: "Pending",   value: stats.pending,   color: "#FF9800" },
                { label: "Done",      value: stats.done,      color: "#FF9800" },
                { label: "Completed", value: stats.completed, color: "#4CAF50" },
                { label: "Cancelled", value: stats.cancelled, color: "#f44336" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>{label}</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#2C3E50" }}>🔍 Filters</h3>
            {/* Only show Clear button when at least one filter is active */}
            {(searchTerm || statusFilter !== "All" || categoryFilter !== "All") && (
              <button
                onClick={clearAllFilters}
                style={{ padding: "6px 12px", backgroundColor: "#f5f5f5", border: "1px solid #ddd", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {/* SEARCH */}
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#2C3E50" }}>Search Order Number:</label>
              <input
                type="text"
                placeholder="Enter order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }}
              />
            </div>

            {/* DATE — disabled when searching by order number */}
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#2C3E50" }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                disabled={!!searchTerm}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }}
              />
            </div>

            {/* STATUS */}
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#2C3E50" }}>Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }}
              >
                <option value="All">All Status</option>
                <option value="Pending">🟡 Pending</option>
                <option value="Done">🟠 Done</option>
                <option value="Completed">🟢 Completed</option>
                <option value="Cancelled">🔴 Cancelled</option>
              </select>
            </div>

            {/* CATEGORY */}
            {!searchTerm && orders.some((o) => o.items) && (
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#2C3E50" }}>Filter by Category:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* LOADING SPINNER */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 20px", backgroundColor: "white", borderRadius: "12px", marginBottom: "20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <h3 style={{ margin: "0 0 8px 0" }}>Loading orders...</h3>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredOrders.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", backgroundColor: "white", borderRadius: "12px", marginBottom: "20px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.5 }}>📦</div>
            <h3 style={{ margin: "0 0 8px 0" }}>No orders found</h3>
            <p style={{ color: "#7F8C8D", margin: "0 0 24px 0" }}>
              {searchTerm ? `No orders found for "${searchTerm}"` : "No orders for selected filters"}
            </p>
            {(searchTerm || statusFilter !== "All" || categoryFilter !== "All") && (
              <button
                onClick={clearAllFilters}
                style={{ padding: "12px 24px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* RESULTS COUNT */}
        {!loading && filteredOrders.length > 0 && (
          <div style={{ backgroundColor: "#e3f2fd", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: "bold" }}>
              📋 Showing <span style={{ color: "#1976d2" }}>{filteredOrders.length}</span> order{filteredOrders.length !== 1 ? "s" : ""}
            </span>
            <span style={{ fontSize: "14px", color: "#666" }}>
              {searchTerm ? "Search Mode" : selectedDate}
            </span>
          </div>
        )}

        {/* PREPARATION SUMMARY — shown when filtering pending orders */}
        {!searchTerm && statusFilter === "Pending" && Object.keys(categorySummary).length > 0 && (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderLeft: "6px solid #FF9800" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#2C3E50" }}>👨‍🍳 Preparation Summary</h3>
            {Object.entries(categorySummary).map(([category, products]) => (
              <div key={category} style={{ marginBottom: "16px", backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#2C3E50" }}>📦 {category}</h4>
                {Object.entries(products).map(([name, qty]) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                    <span>{name}</span>
                    <strong style={{ backgroundColor: "#4CAF50", color: "white", padding: "2px 12px", borderRadius: "12px", fontSize: "14px" }}>{qty}</strong>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ORDER CARDS */}
        {!loading && filteredOrders.map((order) => {
          const { date, time } = formatDateTime(order.createdAt);

          // Helper for status badge colour
          const statusColor =
            order.status === "Completed" ? "#4CAF50" :
            order.status === "Cancelled" ? "#f44336" : "#FF9800";

          // ---- CUSTOM ORDER CARD ----
          if (order.type === "custom") {
            return (
              <div key={order._id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderLeft: "6px solid #009688", position: "relative" }}>
                {/* Custom Order badge */}
                <div style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "#009688", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                  Custom Order
                </div>

                <div style={{ marginRight: "100px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#2C3E50" }}>📝 {order.orderNumber}</h3>
                  <p style={{ fontSize: "14px", color: "#7F8C8D", margin: "0 0 16px 0" }}>📅 {date} | ⏰ {time}</p>
                </div>

                {/* Customer info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Customer</div>
                    <div style={{ fontSize: "16px", fontWeight: "500" }}>{order.customerName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Phone</div>
                    <div style={{ fontSize: "16px", fontWeight: "500" }}>{order.customerPhone}</div>
                  </div>
                </div>

                {/* Delivery date */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#666" }}>Delivery</div>
                  <div style={{ fontSize: "16px", fontWeight: "500" }}>
                    {new Date(order.deliveryDate).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div style={{ backgroundColor: "#fff3e0", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px", fontWeight: "500" }}>📝 Order Notes</div>
                    <p style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "14px", color: "#555" }}>{order.notes}</p>
                  </div>
                )}

                {/* Financial */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "20px" }}>
                  {[
                    { label: "Total",   value: order.totalPrice,   color: "#2E7D32" },
                    { label: "Advance", value: order.advancePaid,  color: "#1976d2" },
                    { label: "Balance", value: order.balanceAmount, color: "#EF6C00" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "#666" }}>{label}</div>
                      <div style={{ fontSize: "18px", fontWeight: "bold", color }}>₹{value}</div>
                    </div>
                  ))}
                </div>

                {/* Delivered time — shown only when custom order is completed */}
{order.status === "Completed" && order.completedAt && (
  <div style={{
    backgroundColor: "#e8f5e9",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    color: "#2e7d32"
  }}>
    🚚 Delivered at: <strong>{formatDateTime(order.completedAt).date} {formatDateTime(order.completedAt).time}</strong>
  </div>
)}

                {/* Status + action buttons */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#666" }}>Status</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: statusColor }}>{order.status}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {order.status === "Pending" && (
                    <button
                      onClick={() =>
                        fetch(`${process.env.REACT_APP_API_URL}/api/custom-orders/${order._id}/done`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } })
                          .then(() => fetchOrders(selectedDate))
                      }
                      style={{ backgroundColor: "#FF9800", color: "white", padding: "12px", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      👨‍🍳 Mark as Done
                    </button>
                  )}

                  <button
                    disabled={order.status !== "Done"}
                    onClick={() =>
                      fetch(`${process.env.REACT_APP_API_URL}/api/custom-orders/${order._id}/complete`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } })
                        .then(() => fetchOrders(selectedDate))
                    }
                    style={{
                      backgroundColor: order.status === "Done" ? "#4CAF50" : "#ccc",
                      color: "white", padding: "12px", border: "none", borderRadius: "8px",
                      fontSize: "16px", fontWeight: "bold", cursor: order.status === "Done" ? "pointer" : "not-allowed",
                    }}
                  >
                    🚚 {order.status === "Completed" ? "Delivered" : "Complete Order"}
                  </button>

                  {order.status !== "Completed" && order.status !== "Cancelled" && (
                    <button
                      onClick={() =>
                        fetch(`${process.env.REACT_APP_API_URL}/api/custom-orders/${order._id}/cancel`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } })
                          .then(() => fetchOrders(selectedDate))
                      }
                      style={{ backgroundColor: "#f44336", color: "white", padding: "12px", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      ❌ Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // ---- NORMAL ORDER CARD ----
          return (
            <div key={order._id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderLeft: "6px solid #3F51B5" }}>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#2C3E50" }}>#{order.orderNumber}</h3>
                  <p style={{ fontSize: "14px", color: "#7F8C8D", margin: 0 }}>📅 {date} | ⏰ {time}</p>
                </div>
                {/* Coloured status badge */}
                <div style={{ backgroundColor: statusColor, color: "white", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                  {order.status}
                </div>
              </div>

              {/* Customer info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Customer</div>
                  <div style={{ fontSize: "16px", fontWeight: "500" }}>{order.customerName}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Phone</div>
                  <div style={{ fontSize: "16px", fontWeight: "500" }}>{order.customerPhone}</div>
                </div>
              </div>

              {/* Items */}
              <div style={{ backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#2C3E50" }}>🛒 Items</h4>
                {order.items.map((item, index) => (
                  <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                    <div>
                      <div style={{ fontWeight: "500" }}>{item.name}</div>
                      <div style={{ fontSize: "13px", color: "#7F8C8D" }}>{item.quantity} × ₹{item.price}</div>
                    </div>
                    <div style={{ fontWeight: "bold", color: "#2E7D32" }}>₹{item.subTotal}</div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "14px", color: "#7F8C8D" }}>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2E7D32" }}>₹{order.totalAmount}</div>
              </div>

              {/* Delivered time — shown only when order is completed */}
{order.status === "Completed" && order.completedAt && (
  <div style={{
    backgroundColor: "#e8f5e9",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    color: "#2e7d32"
  }}>
    🚚 Delivered at: <strong>{formatDateTime(order.completedAt).date} {formatDateTime(order.completedAt).time}</strong>
  </div>
)}

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Mark as Done — only for Pending orders */}
                {order.status !== "Completed" && (
                  <button
                    disabled={order.status !== "Pending"}
                    onClick={() =>
                      fetch(`${process.env.REACT_APP_API_URL}/api/orders/${order._id}/done`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } })
                        .then(() => fetchOrders(selectedDate))
                    }
                    style={{
                      backgroundColor: order.status === "Pending" ? "#FF9800" : "#ccc",
                      color: "white", padding: "12px", border: "none", borderRadius: "8px",
                      fontSize: "16px", fontWeight: "bold", cursor: order.status === "Pending" ? "pointer" : "not-allowed",
                    }}
                  >
                    👨‍🍳 Mark as Done
                  </button>
                )}

                {/* Complete Order — only for Done orders */}
                <button
                  onClick={() => completeOrder(order._id)}
                  disabled={order.status !== "Done"}
                  style={{
                    backgroundColor: order.status === "Done" ? "#4CAF50" : "#ccc",
                    color: "white", padding: "12px", border: "none", borderRadius: "8px",
                    fontSize: "16px", fontWeight: "bold", cursor: order.status === "Done" ? "pointer" : "not-allowed",
                  }}
                >
                  🚚 Complete Order
                </button>

                {/* Cancel — not shown if already completed or cancelled */}
                {order.status !== "Completed" && order.status !== "Cancelled" && (
                  <button
                    onClick={() =>
                      fetch(`${process.env.REACT_APP_API_URL}/api/orders/${order._id}/cancel`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } })
                        .then(() => fetchOrders(selectedDate))
                    }
                    style={{ backgroundColor: "#f44336", color: "white", padding: "12px", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    ❌ Cancel Order
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div style={{ height: "20px" }} />
      </div>
    </>
  );
}

export default Orders;