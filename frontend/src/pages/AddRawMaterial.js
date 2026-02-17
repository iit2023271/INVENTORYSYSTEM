// ============================================================
// ADD RAW MATERIAL PAGE
// Raw materials are ingredients used in the bakery 
// (e.g. Sugar, Flour, Butter).
// This simple form lets the owner add a new ingredient 
// with its name and unit (kg, litre, grams etc.)
// ============================================================

import { useState }    from "react";
import { useNavigate } from "react-router-dom";
import Header          from "../components/Header";

function AddRawMaterial() {
  // --- STATES ---
  const [name,    setName]    = useState(""); // ingredient name e.g. "Sugar"
  const [unit,    setUnit]    = useState(""); // unit e.g. "kg", "litre"
  const [message, setMessage] = useState(""); // success or error text

  const navigate = useNavigate();

  // --- SAVE THE RAW MATERIAL ---
  const handleSave = async () => {
    // Validate — both fields must be filled
    if (!name || !unit) {
      setMessage("Please fill all fields");
      return;
    }

    const token = localStorage.getItem("token"); // get login token

    // Send data to the backend
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/raw-materials`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ name, unit }),
    });

    if (res.ok) {
      setMessage("✅ Raw material added");
      setTimeout(() => navigate("/"), 1000); // go to dashboard after 1 second
    } else {
      setMessage("❌ Failed to add raw material");
    }
  };

  return (
    <>
      <Header title="" />
      <div className="container" style={{ maxWidth: "420px", margin: "0 auto", padding: "16px" }}>
        <div className="card" style={{ padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🧾 Add Raw Material</h2>

          {/* INGREDIENT NAME */}
          <label style={{ fontWeight: "600" }}>Raw Material Name</label>
          <input
            placeholder="e.g. Sugar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "12px" }}
          />

          {/* UNIT — what quantity is measured in */}
          <label style={{ fontWeight: "600" }}>Unit</label>
          <input
            placeholder="kg / litre / grams"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            style={{ marginBottom: "16px" }}
          />

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            style={{ width: "100%", padding: "10px", fontSize: "15px", fontWeight: "600" }}
          >
            Save Raw Material
          </button>

          {/* SUCCESS / ERROR MESSAGE */}
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

export default AddRawMaterial;