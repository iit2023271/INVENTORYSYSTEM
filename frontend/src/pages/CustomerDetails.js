import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useState } from "react";

function CustomerDetails() {
  const { state } = useLocation(); // customer data passed from Customers.js via navigate()
  const navigate = useNavigate();
  const [tab, setTab] = useState("normal"); // active tab: "normal" or "custom"

  // If someone lands here directly with no data, show an error
  if (!state?.customer) {
    return (
      <>
        <Header title="" />
        <div style={{ textAlign: "center", padding: 60 }}>
          <p style={{ fontSize: 40 }}>😕</p>
          <p>No customer data found.</p>
          <button onClick={() => navigate("/customers")} style={btn("#4CAF50")}>
            ← Back
          </button>
        </div>
      </>
    );
  }

  const { customer } = state;

  // Keep only completed orders — filter out pending/cancelled
  const normalOrders = customer.normalOrders.filter(
    (o) => o.status === "Completed",
  );
  const customOrders = customer.customOrders.filter(
    (o) => o.status === "Completed",
  );

  return (
    <>
      <Header title="" />
      <div
        className="container"
        style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/customers")}
          style={btn("#f0f0f0", "#333")}
        >
          ← Back
        </button>

        {/* Customer profile */}
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          {/* Avatar circle with first letter */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#e3f2fd",
              color: "#1976d2",
              fontSize: 26,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ margin: "0 0 4px" }}>{customer.name}</h2>
          <p style={{ color: "#888", margin: 0 }}>📱 {customer.phone}</p>
        </div>

        {/* Summary stats: Total / Normal / Custom */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            {
              label: "Total",
              value: normalOrders.length + customOrders.length,
              color: "#2e7d32",
              bg: "#e8f5e9",
            },
            {
              label: "🛒 Normal",
              value: normalOrders.length,
              color: "#1565c0",
              bg: "#e3f2fd",
            },
            {
              label: "📝 Custom",
              value: customOrders.length,
              color: "#e65100",
              bg: "#fff3e0",
            },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: bg,
                borderRadius: 8,
                padding: "10px 6px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color, marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 24, fontWeight: "bold", color }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Tab buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["normal", "custom"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                background: tab === t ? "#4CAF50" : "#f0f0f0",
                color: tab === t ? "#fff" : "#555",
              }}
            >
              {t === "normal"
                ? `🛒 Normal (${normalOrders.length})`
                : `📝 Custom (${customOrders.length})`}
            </button>
          ))}
        </div>

        {/* ── NORMAL ORDERS TAB ── */}
        {tab === "normal" &&
          (normalOrders.length === 0 ? (
            <EmptyState text="No completed normal orders yet." />
          ) : (
            normalOrders.map((order) => (
              <div key={order._id} style={card("#4CAF50")}>
                {/* Order header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <strong>Order #{order.orderNumber}</strong>
                  <span style={badge("#4CAF50")}>Completed</span>
                </div>

                {/* When it was placed */}
                <p style={meta}>
                  🕒 Placed:{" "}
                  {new Date(order.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>

                {/* When it was delivered (only shown if field exists) */}
                {order.completedAt && (
                  <p style={meta}>
                    🚚 Delivered:{" "}
                    {new Date(order.completedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                )}

                {/* Items list */}
                <div
                  style={{
                    background: "#f9f9f9",
                    borderRadius: 6,
                    padding: "10px 12px",
                    margin: "10px 0",
                  }}
                >
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 0",
                        fontSize: 14,
                      }}
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                        ₹{item.subTotal}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grand total */}
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: 16,
                    color: "#2e7d32",
                  }}
                >
                  Total: ₹{order.totalAmount}
                </div>
              </div>
            ))
          ))}

        {/* ── CUSTOM ORDERS TAB ── */}
        {tab === "custom" &&
          (customOrders.length === 0 ? (
            <EmptyState text="No completed custom orders yet." />
          ) : (
            customOrders.map((order) => (
              <div key={order._id} style={card("#FF9800")}>
                {/* Order header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <strong>Custom #{order.orderNumber || "N/A"}</strong>
                  <span style={badge("#4CAF50")}>Completed</span>
                </div>

                {/* Scheduled delivery date */}
                <p style={meta}>
                  📅 Scheduled:{" "}
                  {new Date(order.deliveryDate).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>

                {/* When it was actually delivered */}
                {order.completedAt && (
                  <p style={meta}>
                    🚚 Delivered:{" "}
                    {new Date(order.completedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                )}

                {/* Price breakdown: Total / Advance / Balance */}
                <div style={{ display: "flex", gap: 8, margin: "10px 0" }}>
                  {[
                    {
                      label: "Total",
                      value: order.totalPrice,
                      color: "#2e7d32",
                    },
                    {
                      label: "Advance",
                      value: order.advancePaid,
                      color: "#1565c0",
                    },
                    {
                      label: "Balance",
                      value: order.balanceAmount,
                      color: "#e65100",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        background: "#fafafa",
                        borderRadius: 6,
                        padding: 8,
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
                      <div style={{ fontWeight: "bold", color }}>₹{value}</div>
                    </div>
                  ))}
                </div>

                {/* Notes (only shown if present) */}
                {order.notes && (
                  <div
                    style={{
                      background: "#fff8e1",
                      borderRadius: 6,
                      padding: 10,
                      fontSize: 13,
                      color: "#555",
                    }}
                  >
                    📋 {order.notes}
                  </div>
                )}
              </div>
            ))
          ))}
      </div>
    </>
  );
}

// ── Small reusable pieces ──────────────────────────────────

// Empty state message
function EmptyState({ text }) {
  return (
    <p style={{ textAlign: "center", color: "#aaa", padding: 40 }}>{text}</p>
  );
}

// Order card with a coloured left border
const card = (borderColor) => ({
  background: "#fff",
  borderRadius: 10,
  padding: 16,
  marginBottom: 12,
  border: "1px solid #eee",
  borderLeft: `5px solid ${borderColor}`,
});

// Small status badge
const badge = (bg) => ({
  background: bg,
  color: "#fff",
  padding: "3px 10px",
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 600,
});

// Muted timestamp text
const meta = { fontSize: 13, color: "#888", margin: "2px 0" };

// Generic button style (pass background + optional text colour)
const btn = (bg, color = "#fff") => ({
  padding: "8px 18px",
  borderRadius: 8,
  border: "none",
  background: bg,
  color,
  cursor: "pointer",
  fontWeight: 600,
  marginBottom: 8,
});

export default CustomerDetails;
