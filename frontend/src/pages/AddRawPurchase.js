// ============================================================
// ADD RAW PURCHASE PAGE
// The owner uses this to record when they buy ingredients.
// e.g. "Bought 10kg of Sugar at ₹50/kg = ₹500 total"
//
// The form:
//   1. Fetches existing raw materials to show in a dropdown
//   2. Owner picks material, enters quantity and rate
//   3. Total cost is auto-calculated (qty × rate)
//   4. After saving, the form resets so owner can add more
// ============================================================

import { useEffect, useState } from "react";
import Header                  from "../components/Header";

function AddRawPurchase() {
  // --- STATES ---
  const [materials,    setMaterials]    = useState([]); // list of raw materials from database
  const [rawMaterial,  setRawMaterial]  = useState(""); // selected material ID
  const [quantity,     setQuantity]     = useState(""); // how many kg/litres bought
  const [rate,         setRate]         = useState(""); // price per unit (e.g. ₹50/kg)
  const [message,      setMessage]      = useState(""); // success or error text

  const token = localStorage.getItem("token");

  // --- LOAD RAW MATERIALS FROM DATABASE ---
  // Runs once when page loads, fills the dropdown with existing materials
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/raw-materials`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res)  => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMaterials(data);
        } else {
          console.error("Raw materials API returned non-array:", data);
          setMaterials([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load raw materials", err);
        setMaterials([]);
      });
  }, [token]); // re-run if token changes (shouldn't happen normally)

  // Auto-calculate total cost whenever quantity or rate changes
  const totalCost = quantity && rate ? Number(quantity) * Number(rate) : 0;

  // --- SAVE THE PURCHASE ---
  const handleSave = async () => {
    if (!rawMaterial || !quantity || !rate) {
      setMessage("❌ Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/raw-purchases`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          rawMaterial,           // the ID of the selected material
          quantity: Number(quantity),
          rate:     Number(rate),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      // Success — show message and reset form
      setMessage("✅ Purchase added. Add another one 👇");
      setRawMaterial("");
      setQuantity("");
      setRate("");

    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add purchase");
    }
  };

  return (
    <>
      <Header title="" />
      <div className="container" style={{ maxWidth: "460px", margin: "0 auto", padding: "16px" }}>
        <div className="card" style={{ padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🧺 Add Raw Material Purchase</h2>

          {/* MATERIAL DROPDOWN — populated from database */}
          <label style={{ fontWeight: "600" }}>Raw Material</label>
          <select
            value={rawMaterial}
            onChange={(e) => setRawMaterial(e.target.value)}
            style={{ width: "100%", padding: "10px", fontSize: "15px", marginBottom: "12px", borderRadius: "6px" }}
          >
            <option value="">Select Raw Material</option>
            {/* Map over each material to create an <option> for each */}
            {Array.isArray(materials) && materials.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.unit})
              </option>
            ))}
          </select>

          {/* QUANTITY */}
          <label style={{ fontWeight: "600" }}>Quantity</label>
          <input
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ marginBottom: "12px" }}
          />

          {/* RATE PER UNIT */}
          <label style={{ fontWeight: "600" }}>Rate per unit (₹)</label>
          <input
            type="number"
            placeholder="e.g. 50"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            style={{ marginBottom: "12px" }}
          />

          {/* TOTAL COST — read-only, auto-calculated */}
          <div
            style={{
              background: "#f5f5f5", padding: "10px", borderRadius: "6px",
              fontSize: "16px", marginBottom: "16px", textAlign: "center",
            }}
          >
            Total Cost: <strong>₹{totalCost}</strong>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            style={{ width: "100%", padding: "10px", fontSize: "15px", fontWeight: "600" }}
          >
            Save Purchase
          </button>

          {/* MESSAGE */}
          {message && (
            <p style={{ marginTop: "12px", textAlign: "center", fontWeight: "600" }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default AddRawPurchase;