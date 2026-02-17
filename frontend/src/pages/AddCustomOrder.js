// ============================================================
// ADD CUSTOM ORDER PAGE
// Used for special bakery orders (e.g. custom birthday cake).
// The owner fills in customer details, delivery time, order 
// notes, price, and advance payment.
//
// After saving, a WhatsApp receipt link is generated so the
// owner can instantly send order details to the customer.
// ============================================================

import { useState }     from "react";
import { useNavigate }  from "react-router-dom";
import Header           from "../components/Header";

function AddCustomOrder() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  // --- FORM STATE ---
  // All fields stored together in one object for cleaner code
  const [form, setForm] = useState({
    customerName:     "",
    customerPhone:    "",
    notes:            "",    // custom cake details written by owner
    totalPrice:       "",
    advancePaid:      "",
    deliveryDateTime: "",
  });

  // --- OTHER STATES ---
  const [errors,     setErrors]     = useState({});   // validation errors per field
  const [loading,    setLoading]    = useState(false); // true while API call is running
  const [savedOrder, setSavedOrder] = useState(null);  // holds the saved order from backend
  const [success,    setSuccess]    = useState(false); // true after successful save

  // --- VALIDATION ---
  // Checks that all required fields are filled in correctly
  // Returns true if everything is valid, false if there are errors
  const validate = () => {
    const newErrors = {};

    if (!form.customerName.trim())
      newErrors.customerName = "Customer name is required";

    if (!form.customerPhone.trim())
      newErrors.customerPhone = "Phone number is required";

    if (!form.deliveryDateTime)
      newErrors.deliveryDateTime = "Delivery date & time required";

    if (!form.notes.trim())
      newErrors.notes = "Order notes are mandatory";

    if (!form.totalPrice || Number(form.totalPrice) <= 0)
      newErrors.totalPrice = "Enter valid total price";

    // Advance can't be more than the total price
    if (form.advancePaid && Number(form.advancePaid) > Number(form.totalPrice))
      newErrors.advancePaid = "Advance cannot exceed total";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true = no errors
  };

  // --- HANDLE INPUT CHANGE ---
  // This one function handles ALL inputs (name, phone, notes, etc.)
  // e.target.name matches the "name" attribute on each input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value }); // update just the changed field
    setErrors({ ...errors, [e.target.name]: "" });          // clear that field's error
  };

  // --- SUBMIT THE ORDER ---
  const submit = async () => {
    if (!validate()) return; // stop if validation fails

    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/custom-orders`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerName:  form.customerName,
          customerPhone: form.customerPhone,
          notes:         form.notes,
          totalPrice:    Number(form.totalPrice),
          advancePaid:   Number(form.advancePaid || 0), // default 0 if not entered
          deliveryDate:  form.deliveryDateTime,
        }),
      });

      if (res.ok) {
        const order = await res.json();
        setSavedOrder(order); // store the saved order (has orderNumber etc.)
        setSuccess(true);
      } else {
        alert("Failed to save custom order");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false); // always runs, even if there was an error
    }
  };

  // Calculate the balance (total minus advance) — shown live as user types
  const balanceAmount = Number(form.totalPrice || 0) - Number(form.advancePaid || 0);

  // --- SCREEN OUTPUT ---
  return (
    <>
      <Header title="Add Custom Order" />

      <div className="container">
        <h2>📝 Add Custom Order</h2>

        {/* SUCCESS CARD — only shows after order is saved */}
        {success && savedOrder && (
          <div
            style={{
              background: "#e8f5e9", padding: "12px", borderRadius: "6px",
              marginBottom: "12px", border: "1px solid #4CAF50",
            }}
          >
            <p style={{ margin: 0, fontWeight: "600", color: "#2e7d32" }}>
              ✅ Custom order saved successfully
            </p>
            <p style={{ fontSize: "14px", marginTop: "6px" }}>
              Order No: <strong>{savedOrder.orderNumber}</strong>
            </p>

            {/* WHATSAPP BUTTON — opens WhatsApp with pre-filled receipt message */}
            <button
              style={{ marginTop: "8px", backgroundColor: "#25D366", width: "100%" }}
              onClick={() => {
                // Build the message text
                const message = `
🧾 *Custom Order Receipt*

Order No: ${savedOrder.orderNumber}
Customer: ${savedOrder.customerName}
Phone: ${savedOrder.customerPhone}

📝 Order Details:
${savedOrder.notes}

📅 Delivery:
${new Date(savedOrder.deliveryDate).toLocaleString("en-IN")}

💰 Total: ₹${savedOrder.totalPrice}
💵 Advance: ₹${savedOrder.advancePaid}
💳 Balance: ₹${savedOrder.balanceAmount}

🙏 Thank you for ordering with us!
                `;

                // WhatsApp URL format: wa.me/91{phone}?text={encoded message}
                const url = `https://wa.me/91${savedOrder.customerPhone}?text=${encodeURIComponent(message)}`;
                window.open(url, "_blank"); // open in new tab
              }}
            >
              📲 Send Receipt on WhatsApp
            </button>

            <button
              style={{ marginTop: "6px", width: "100%" }}
              onClick={() => navigate("/orders")}
            >
              ← Back to Orders
            </button>
          </div>
        )}

        {/* CUSTOMER NAME */}
        <input
          name="customerName"
          placeholder="Customer Name *"
          value={form.customerName}
          onChange={handleChange}
        />
        {errors.customerName && <p className="error">{errors.customerName}</p>}

        {/* PHONE NUMBER */}
        <input
          name="customerPhone"
          placeholder="Phone Number *"
          value={form.customerPhone}
          onChange={handleChange}
        />
        {errors.customerPhone && <p className="error">{errors.customerPhone}</p>}

        {/* DELIVERY DATE & TIME */}
        <label className="label">Delivery Date & Time *</label>
        <input
          type="datetime-local"
          name="deliveryDateTime"
          value={form.deliveryDateTime}
          onChange={handleChange}
        />
        {errors.deliveryDateTime && <p className="error">{errors.deliveryDateTime}</p>}

        {/* ORDER NOTES — very important for custom cakes */}
        <label className="label">📝 Custom Order Notes (VERY IMPORTANT)</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder={`Example:\n• Cake type & weight\n• Flavour\n• Shape & design\n• Name on cake\n• Colour\n• Special instructions`}
          style={{ minHeight: "160px", border: "2px solid #ff9800", fontSize: "15px" }}
        />
        {errors.notes && <p className="error">{errors.notes}</p>}

        {/* PRICE FIELDS */}
        <input
          name="totalPrice"
          placeholder="Total Price *"
          value={form.totalPrice}
          onChange={handleChange}
        />
        {errors.totalPrice && <p className="error">{errors.totalPrice}</p>}

        <input
          name="advancePaid"
          placeholder="Advance Paid"
          value={form.advancePaid}
          onChange={handleChange}
        />
        {errors.advancePaid && <p className="error">{errors.advancePaid}</p>}

        {/* BALANCE DISPLAY — read-only, calculated automatically */}
        <input
          value={balanceAmount > 0 ? `Balance Amount: ₹${balanceAmount}` : "Balance Amount: ₹0"}
          readOnly
          style={{ background: "#f5f5f5", fontWeight: "600", cursor: "not-allowed" }}
        />

        {/* SAVE BUTTON — disabled after success so owner can't double-submit */}
        <button
          onClick={submit}
          disabled={loading || success}
          style={{
            backgroundColor: "#4CAF50", marginTop: "12px",
            opacity: loading || success ? 0.7 : 1,
            cursor: loading || success ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : success ? "✔ Order Saved" : "💾 Save Custom Order"}
        </button>
      </div>

      {/* SCOPED STYLES for error messages and labels */}
      <style>{`
        .error { color: #f44336; font-size: 13px; margin: 4px 0 8px; }
        .label { font-weight: 600; margin-top: 10px; display: block; }
      `}</style>
    </>
  );
}

export default AddCustomOrder;