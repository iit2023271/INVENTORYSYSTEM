// ============================================================
// RAW MATERIALS PAGE  (RawMaterials.js)
// Lists all raw material ingredients in the bakery.
// Owner can delete materials (soft delete — restorable).
// useCallback is used so the fetch function can be safely 
// called both inside useEffect AND from button handlers.
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { useNavigate }                       from "react-router-dom";
import Header                                from "../components/Header";

function RawMaterials() {
  const [materials, setMaterials] = useState([]); // list of ingredients
  const [deleteId,  setDeleteId]  = useState(null); // ID of material being confirmed for deletion

  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  // Fetch all raw materials from the API
  // useCallback so we can call this function from button handlers too
  const loadRawMaterials = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/raw-materials`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res)  => res.json())
      .then((data) => setMaterials(Array.isArray(data) ? data : []));
  }, [token]);

  // Load when page opens
  useEffect(() => { loadRawMaterials(); }, [loadRawMaterials]);

  return (
    <>
      <Header title="" />
      <div className="container">
        <h2>🧾 Raw Materials</h2>
        <p style={{ textAlign: "center", fontSize: "14px", color: "#777" }}>
          Manage ingredients used in your bakery
        </p>

        <button
          style={{ marginBottom: "12px", backgroundColor: "#f44336", width: "100%" }}
          onClick={() => navigate("/deleted-raw-materials")}
        >
          🗑 View Deleted Raw Materials
        </button>

        {materials.length === 0 && (
          <p style={{ textAlign: "center" }}>No raw materials available.</p>
        )}

        {/* Show each material as a card */}
        {materials.map((mat) => (
          <div className="card" key={mat._id}>
            <h3>{mat.name}</h3>
            <p><strong>Unit:</strong> {mat.unit}</p>

            {/* CONFIRM DELETE DIALOG — shows inline (no popup) */}
            {deleteId === mat._id ? (
              <>
                <p style={{ color: "red", fontWeight: "bold" }}>⚠ Are you sure you want to delete?</p>

                {/* Confirm: call DELETE API then reload */}
                <button
                  style={{ backgroundColor: "#f44336", marginBottom: "8px" }}
                  onClick={() => {
                    fetch(`${process.env.REACT_APP_API_URL}/api/raw-materials/${mat._id}`, {
                      method:  "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    }).then(() => { setDeleteId(null); loadRawMaterials(); });
                  }}
                >
                  ✅ Yes, Delete
                </button>

                <button onClick={() => setDeleteId(null)}>❌ Cancel</button>
              </>
            ) : (
              /* Show delete button — clicking it sets deleteId to show confirm dialog */
              <button
                style={{ backgroundColor: "#f44336", marginTop: "10px" }}
                onClick={() => setDeleteId(mat._id)}
              >
                🗑 Delete Raw Material
              </button>
            )}
          </div>
        ))}

        {/* Link to add new material */}
        <div className="card">
          <button onClick={() => navigate("/add-raw-material")}>➕ Add New Raw Material</button>
        </div>
      </div>
    </>
  );
}

export default RawMaterials;