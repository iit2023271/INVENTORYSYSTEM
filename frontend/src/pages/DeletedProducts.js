// ============================================================
// DELETED PRODUCTS PAGE  (DeletedProducts.js)
// Shows products that have been "soft deleted" (not permanently
// removed from the database — just hidden from normal view).
// Owner can restore any product back to active status.
// ============================================================

import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";

function DeletedProducts() {
  const [products, setProducts] = useState([]); // list of soft-deleted products
  const token = localStorage.getItem("token");

  // Fetch deleted products
  const loadDeletedProducts = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products/deleted`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res)  => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(()    => setProducts([]));
  }, [token]);

  useEffect(() => { loadDeletedProducts(); }, [loadDeletedProducts]);

  // Call restore API — the backend sets isDeleted = false
  const restoreProduct = (id) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products/${id}/restore`, {
      method:  "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => loadDeletedProducts()); // reload list after restore
  };

  return (
    <>
      <Header title="" />
      <div className="container" style={{ maxWidth: "520px", margin: "0 auto", padding: "16px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🗑 Deleted Products</h2>

        {products.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            <p>No deleted products available.</p>
          </div>
        )}

        {products.map((p) => (
          <div className="card" key={p._id} style={{ marginBottom: "14px" }}>
            <h3 style={{ marginBottom: "6px" }}>{p.name}</h3>

            {/* Show product image with reduced opacity to signal it's inactive */}
            {p.image && (
              <img
                src={p.image}
                alt={p.name}
                style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px", opacity: 0.6 }}
              />
            )}

            <p style={{ fontSize: "14px", marginBottom: "12px", color: "#555" }}>
              <strong>Category:</strong> {p.category}
            </p>

            <button
              style={{ backgroundColor: "#4CAF50", width: "100%", fontWeight: "600" }}
              onClick={() => restoreProduct(p._id)}
            >
              ♻ Restore Product
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default DeletedProducts;