// ============================================================
// CHECKOUT PAGE
// This is where CUSTOMERS (not the owner) complete their order.
// They arrive here after adding items in the Menu page.
//
// Flow:
//   1. Cart is read from localStorage (saved by Menu page)
//   2. Customer fills their name and phone
//   3. Order is sent to backend API
//   4. A token number is shown (like a queue number at the counter)
//
// Special note: if cart is empty AND no order exists yet,
// we redirect back to the menu using <Navigate>
// ============================================================

import { useState } from "react";
import { Navigate } from "react-router-dom"; // used to redirect

function Checkout() {
  // Read cart from localStorage — this was saved by CustomerMenu.js
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // --- STATES ---
  const [name, setName] = useState(""); // customer's name
  const [phone, setPhone] = useState(""); // customer's phone
  const [loading, setLoading] = useState(false); // true while placing order
  const [message, setMessage] = useState(""); // error messages
  const [orderDetails, setOrderDetails] = useState(null); // filled after successful order

  // --- REDIRECT GUARD ---
  // If cart is empty and no order has been placed yet, send customer back to menu
  if (cart.length === 0 && !orderDetails) {
    return <Navigate to="/menu" replace />;
  }

  // Calculate total price from all cart items (price × quantity for each)
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- PLACE ORDER ---
  const placeOrder = async () => {
    if (!name || !phone) {
      setMessage("Please enter name and phone number");
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setMessage("Enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setMessage("");

    // Format cart items for the API (only need product ID and quantity)
    const items = cart.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // no token — customers don't log in
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Order failed");
        setLoading(false);
        return;
      }

      // Order placed! Save the order details to show receipt
      setOrderDetails(data);
      localStorage.removeItem("cart"); // clear the cart from browser storage
    } catch {
      setMessage("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  // --- SCREEN OUTPUT ---
  return (
    <>
      <div
        className="container"
        style={{ maxWidth: "480px", margin: "0 auto", padding: "16px" }}
      >
        <div
          className="card"
          style={{
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
            🧾 Checkout
          </h2>

          {/* Show receipt if order was placed, otherwise show the form */}
          {orderDetails ? (
            <>
              {/* SUCCESS SCREEN */}
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <h3 style={{ color: "green" }}>✅ Order Placed Successfully</h3>
                {/* Token number — customer shows this at the counter */}
                <h2 style={{ marginTop: "8px" }}>
                  Token No: {orderDetails.orderNumber}
                </h2>
                <p style={{ fontSize: "13px", color: "#555" }}>
                  Please show this number at the counter
                </p>
              </div>

              <hr />

              {/* BILL DETAILS */}
              <h3 style={{ marginTop: "16px" }}>🧾 Bill Details</h3>
              <div style={{ marginBottom: "10px" }}>
                {orderDetails.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                      marginBottom: "6px",
                    }}
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.subTotal}</span>
                  </div>
                ))}
              </div>

              <hr />

              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                Total: ₹{orderDetails.totalAmount}
              </p>

              {/* ACTION BUTTONS */}
              <button
                onClick={() => window.print()}
                style={{ width: "100%", marginTop: "12px" }}
              >
                🖨 Print Receipt
              </button>

              {/* Reload the page = reset everything for a fresh new order */}
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  backgroundColor: "#2196F3",
                }}
              >
                ➕ New Order
              </button>
            </>
          ) : (
            <>
              {/* ORDER FORM — shown before placing order */}

              {/* ORDER SUMMARY (items in cart) */}
              <h3 style={{ marginBottom: "10px" }}>🛒 Order Summary</h3>
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "6px",
                  marginBottom: "12px",
                }}
              >
                {cart.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontWeight: "bold",
                  textAlign: "right",
                  marginBottom: "14px",
                }}
              >
                Total: ₹{total}
              </p>

              {/* CUSTOMER DETAILS */}
              <label style={{ fontWeight: "600" }}>Customer Name</label>
              <input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginBottom: "10px" }}
              />

              <label style={{ fontWeight: "600" }}>Phone Number</label>
              <input
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => {
                  // Allow only digits, max 10 characters
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(val);
                }}
                inputMode="numeric" // shows numeric keyboard on mobile
                style={{ marginBottom: "12px" }}
              />

              {message && (
                <p
                  style={{
                    color: "red",
                    fontSize: "14px",
                    marginBottom: "10px",
                  }}
                >
                  {message}
                </p>
              )}

              {/* PLACE ORDER BUTTON */}
              <button
                onClick={placeOrder}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Checkout;
