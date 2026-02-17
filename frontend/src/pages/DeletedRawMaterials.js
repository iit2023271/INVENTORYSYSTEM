// ============================================================
// DELETED RAW MATERIALS PAGE  (DeletedRawMaterials.js)
// Same concept as DeletedProducts but for raw materials/ingredients.
// ============================================================

// Note: In your project this is in its own file DeletedRawMaterials.js

import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";

function DeletedRawMaterials() {
  const [materials, setMaterials] = useState([]);
  const token = localStorage.getItem("token");

  const loadData = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/raw-materials/deleted`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res)  => res.json())
      .then((data) => setMaterials(Array.isArray(data) ? data : []));
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const restoreMaterial = async (id) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/raw-materials/${id}/restore`, {
      method:  "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData(); // reload after restore
  };

  return (
    <>
      <Header title="" />
      <div className="container">
        <h2 style={{ textAlign: "center" }}>♻ Deleted Raw Materials</h2>

        {materials.length === 0 && (
          <p style={{ textAlign: "center" }}>No deleted materials</p>
        )}

        {materials.map((m) => (
          <div className="card" key={m._id}>
            <h3>{m.name}</h3>
            <p>Unit: {m.unit}</p>
            <button
              style={{ backgroundColor: "#4CAF50", width: "100%", marginTop: "8px" }}
              onClick={() => restoreMaterial(m._id)}
            >
              🔄 Restore
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default DeletedRawMaterials;
