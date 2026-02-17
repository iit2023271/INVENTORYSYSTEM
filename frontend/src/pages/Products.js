// ============================================================
// PRODUCTS PAGE
// The owner can view, edit, and manage all bakery products.
// For each product, the owner can:
//   - Edit name, category, price, stock, image
//   - Enable/disable product (appears on customer menu)
//   - Delete the product (soft delete — goes to deleted list)
//
// Three separate API calls load: products, prices, stocks
// because these are stored in separate database collections.
// ============================================================

import { useEffect, useState, useCallback } from "react";
import Header       from "../components/Header";
import ImageCropper from "../components/ImageCropper";

function Products() {
  // --- STATES ---
  const [products,  setProducts]  = useState([]); // list of all products
  const [prices,    setPrices]    = useState({}); // { productId: price }
  const [stocks,    setStocks]    = useState({}); // { productId: quantity }
  const [message,   setMessage]   = useState(""); // feedback message for image upload

  // Editing states — track which product is being edited
  // null = nothing being edited, productId = that product is open for editing
  const [editingPriceId,    setEditingPriceId]    = useState(null);
  const [newPrice,          setNewPrice]           = useState("");
  const [editingStockId,    setEditingStockId]     = useState(null);
  const [newStock,          setNewStock]           = useState("");
  const [editingNameId,     setEditingNameId]      = useState(null);
  const [newName,           setNewName]            = useState("");
  const [editingCategoryId, setEditingCategoryId]  = useState(null);
  const [newCategory,       setNewCategory]        = useState("");
  const [deleteId,          setDeleteId]           = useState(null); // shows confirm dialog

  // Image cropper states
  const [showCropper,       setShowCropper]       = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [cropperProductId,  setCropperProductId]  = useState(null); // which product's image
  const [editingImageId,    setEditingImageId]    = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm,        setSearchTerm]       = useState("");

  const allCategories = [...new Set(products.map((p) => p.category))];
  const token = localStorage.getItem("token");

  // --- LOAD DATA ---
  // useCallback prevents these functions from being recreated every render
  // which would cause useEffect to re-run infinitely

  const loadProducts = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products`)
      .then((res)  => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(()    => {});
  }, []);

  const loadPrices = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/prices/current`)
      .then((res)  => res.json())
      .then((data) => {
        // Convert array to a map: [{ productId, price }] → { productId: price }
        const map = {};
        if (Array.isArray(data)) data.forEach((p) => { map[p.productId] = p.price; });
        setPrices(map);
      })
      .catch(() => {});
  }, []);

  const loadStocks = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/stock/today`)
      .then((res)  => res.json())
      .then((data) => {
        const map = {};
        if (Array.isArray(data)) data.forEach((s) => { map[s.productId] = s.quantity; });
        setStocks(map);
      })
      .catch(() => {});
  }, []);

  // Run all three loads when page first opens
  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { loadPrices();   }, [loadPrices]);
  useEffect(() => { loadStocks();   }, [loadStocks]);

  // --- IMAGE HANDLING ---

  // When owner selects a file to replace a product's image
  const handleImageSelect = (e, productId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage("File size should be less than 10MB");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!file.type.match("image.*")) {
      setMessage("Please select an image file");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Store the file and open the crop modal
    setSelectedImageFile(file);
    setCropperProductId(productId);
    setShowCropper(true);
  };

  // After cropping is done — upload the new image to the API
  const handleCropComplete = async (croppedFile) => {
    if (!cropperProductId) return;
    setMessage("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("image", croppedFile);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/products/${cropperProductId}/image`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );

      if (!response.ok) throw new Error("Upload failed");

      // Reset all cropper-related states
      setShowCropper(false);
      setSelectedImageFile(null);
      setCropperProductId(null);
      setEditingImageId(null);
      setMessage("✅ Image updated successfully");

      await loadProducts(); // reload to show new image
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Failed to upload image");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImageFile(null);
    setCropperProductId(null);
    setEditingImageId(null);
  };

  // --- DELETE PRODUCT ---
  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteId(null);
      loadProducts(); // refresh list
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // --- SCREEN OUTPUT ---
  return (
    <>
      <Header title="" />

      {/* Image cropper modal — only renders when needed */}
      {showCropper && selectedImageFile && (
        <ImageCropper
          imageFile={selectedImageFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <div className="container">
        <h2>📦 Bakery Products</h2>

        {/* Link to see soft-deleted products */}
        <button
          style={{ marginBottom: "15px", backgroundColor: "#f44336", width: "100%", padding: "10px", borderRadius: "8px", border: "none", color: "white", fontWeight: "bold", cursor: "pointer" }}
          onClick={() => (window.location.href = "/deleted-products")}
        >
          🗑 View Deleted Products
        </button>

        {/* FILTERS */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          <div className="card" style={{ flex: 1 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="card" style={{ flex: 2 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Search Product:</label>
            <input
              type="text"
              placeholder="Type product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
            />
          </div>
        </div>

        {/* FEEDBACK MESSAGE */}
        {message && (
          <div
            className="card"
            style={{
              backgroundColor: message.includes("success") ? "#d4edda" : message.includes("Failed") ? "#f8d7da" : "#fff3cd",
              color: message.includes("success") ? "#155724" : message.includes("Failed") ? "#721c24" : "#856404",
              marginBottom: "15px",
            }}
          >
            {message}
          </div>
        )}

        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {products
              // Apply category and search filters
              .filter(
                (p) =>
                  (selectedCategory === "all" || p.category === selectedCategory) &&
                  p.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((product) => {
                const currentPrice = prices[product._id] ?? 0;
                const currentStock = stocks[product._id] ?? 0;

                return (
                  <div className="card" key={product._id} style={{ position: "relative" }}>
                    <h3>{product.name}</h3>

                    {/* PRODUCT IMAGE */}
                    {product.image && (
                      <div style={{ width: "220px", height: "220px", borderRadius: "14px", overflow: "hidden", background: "#f5f5f5", boxShadow: "0 6px 18px rgba(0,0,0,0.15)", margin: "0 auto 12px" }}>
                        <img
                          src={product.image || "https://via.placeholder.com/220x220?text=No+Image"}
                          alt={product.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/220x220?text=No+Image"; }}
                        />
                      </div>
                    )}

                    {/* EDIT NAME */}
                    {editingNameId === product._id ? (
                      <div style={{ marginBottom: "10px" }}>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="New product name"
                          style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
                          autoFocus
                        />
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            onClick={() => {
                              if (!newName.trim()) return;
                              fetch(`${process.env.REACT_APP_API_URL}/api/products/${product._id}/name`, {
                                method:  "PUT",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body:    JSON.stringify({ name: newName.trim() }),
                              }).then(() => { setEditingNameId(null); setNewName(""); loadProducts(); });
                            }}
                            disabled={!newName.trim()}
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingNameId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingNameId(product._id); setNewName(product.name); }} style={{ marginBottom: "10px", width: "100%" }}>
                        ✏ Edit Name
                      </button>
                    )}

                    {/* CHANGE IMAGE */}
                    {editingImageId === product._id ? (
                      <div style={{ marginBottom: "15px" }}>
                        <input
                          type="file" accept="image/*"
                          onChange={(e) => handleImageSelect(e, product._id)}
                          style={{ display: "none" }}
                          id={`image-input-${product._id}`}
                        />
                        <label
                          htmlFor={`image-input-${product._id}`}
                          style={{ display: "block", padding: "15px", backgroundColor: "#f5f5f5", border: "2px dashed #4CAF50", borderRadius: "8px", textAlign: "center", cursor: "pointer", marginBottom: "12px" }}
                        >
                          <div style={{ fontSize: "40px", marginBottom: "8px" }}>📷</div>
                          <div style={{ fontWeight: "600" }}>Select New Image</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>📱 Tap to crop & zoom</div>
                        </label>
                        <button onClick={() => setEditingImageId(null)} style={{ width: "100%", padding: "10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>
                          ❌ Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingImageId(product._id)} style={{ marginBottom: "10px", width: "100%" }}>
                        🖼 Change Image
                      </button>
                    )}

                    {/* EDIT CATEGORY */}
                    <p style={{ marginBottom: "5px" }}><strong>Category:</strong> {product.category}</p>
                    {editingCategoryId === product._id ? (
                      <div style={{ marginBottom: "10px" }}>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
                        >
                          <option value="">-- Select Category --</option>
                          {allCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <input
                          type="text"
                          placeholder="Or type new category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
                        />
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            onClick={() => {
                              if (!newCategory.trim()) return;
                              fetch(`${process.env.REACT_APP_API_URL}/api/products/${product._id}/category`, {
                                method:  "PUT",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body:    JSON.stringify({ category: newCategory.trim() }),
                              }).then(() => { setEditingCategoryId(null); setNewCategory(""); loadProducts(); });
                            }}
                            disabled={!newCategory.trim()}
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingCategoryId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingCategoryId(product._id); setNewCategory(product.category); }} style={{ marginBottom: "10px", width: "100%" }}>
                        ✏ Edit Category
                      </button>
                    )}

                    {/* EDIT PRICE */}
                    <p style={{ marginBottom: "5px" }}><strong>Price:</strong> ₹{currentPrice}</p>
                    {editingPriceId === product._id ? (
                      <div style={{ marginBottom: "10px" }}>
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="New price"
                          style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
                          autoFocus
                        />
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            onClick={() => {
                              if (!newPrice || newPrice <= 0) return;
                              fetch(`${process.env.REACT_APP_API_URL}/api/prices/update`, {
                                method:  "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body:    JSON.stringify({ productId: product._id, price: Number(newPrice) }),
                              }).then(() => { setEditingPriceId(null); setNewPrice(""); loadPrices(); });
                            }}
                            disabled={!newPrice || newPrice <= 0}
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingPriceId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingPriceId(product._id); setNewPrice(currentPrice); }} style={{ marginBottom: "10px", width: "100%" }}>
                        ✏ Edit Price
                      </button>
                    )}

                    {/* EDIT STOCK */}
                    <p style={{ marginBottom: "5px", color: currentStock <= product.lowStockLevel ? "red" : "green" }}>
                      <strong>Stock:</strong> {currentStock}
                    </p>
                    {editingStockId === product._id ? (
                      <div style={{ marginBottom: "10px" }}>
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          placeholder="Today's stock"
                          style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
                          autoFocus
                        />
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            onClick={() => {
                              if (newStock === "" || newStock < 0) return;
                              fetch(`${process.env.REACT_APP_API_URL}/api/stock/update`, {
                                method:  "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body:    JSON.stringify({ productId: product._id, quantity: Number(newStock) }),
                              }).then(() => { setEditingStockId(null); setNewStock(""); loadStocks(); });
                            }}
                            disabled={newStock === "" || newStock < 0}
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingStockId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingStockId(product._id); setNewStock(""); }} style={{ marginBottom: "10px", width: "100%" }}>
                        📦 Edit Stock
                      </button>
                    )}

                    {/* LOW STOCK WARNING */}
                    {currentStock <= product.lowStockLevel && (
                      <p style={{ color: "red", fontWeight: "bold", marginBottom: "10px" }}>⚠ Low Stock</p>
                    )}

                    {/* ENABLE / DISABLE PRODUCT */}
                    {/* Disabled products don't appear on the customer menu */}
                    <button
                      onClick={() => {
                        if (!product.isActive && currentStock === 0) return; // can't enable with 0 stock
                        fetch(`${process.env.REACT_APP_API_URL}/api/products/${product._id}/${product.isActive ? "disable" : "enable"}`, {
                          method:  "PUT",
                          headers: { Authorization: `Bearer ${token}` },
                        }).then(() => loadProducts());
                      }}
                      disabled={!product.isActive && currentStock === 0}
                      style={{
                        backgroundColor: product.isActive ? "#FF9800" : currentStock === 0 ? "#ccc" : "#4CAF50",
                        width: "100%", padding: "10px", marginBottom: "10px",
                        borderRadius: "4px", border: "none", color: "white",
                        fontWeight: "bold", cursor: !product.isActive && currentStock === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      {currentStock === 0 ? "❌ Out of Stock" : product.isActive ? "🚫 Disable Product" : "✅ Enable Product"}
                    </button>

                    {/* DELETE — shows a confirm dialog before actually deleting */}
                    {deleteId === product._id ? (
                      <div>
                        <p style={{ color: "red", fontWeight: "bold", marginBottom: "10px" }}>Are you sure you want to delete this product?</p>
                        <button onClick={() => deleteProduct(product._id)} style={{ backgroundColor: "#f44336", width: "100%", padding: "10px", marginBottom: "5px", borderRadius: "4px", border: "none", color: "white", fontWeight: "bold", cursor: "pointer" }}>
                          ✅ Yes, Delete
                        </button>
                        <button onClick={() => setDeleteId(null)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", backgroundColor: "#f5f5f5", cursor: "pointer" }}>
                          ❌ Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(product._id)} style={{ backgroundColor: "#f44336", width: "100%", padding: "10px", borderRadius: "4px", border: "none", color: "white", fontWeight: "bold", cursor: "pointer" }}>
                        🗑 Delete Product
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </>
  );
}

export default Products;