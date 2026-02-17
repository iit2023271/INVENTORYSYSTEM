// ============================================================
// ADD PRODUCT PAGE
// This form lets the bakery owner add a new product.
// Steps:
//   1. Owner fills in name, category, price, stock, and image
//   2. Image goes through a cropper (square crop tool)
//   3. On save, 3 API calls are made:
//      a) Create the product (with image)
//      b) Set the starting price
//      c) Set today's stock quantity
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import Header                  from "../components/Header";
import ImageCropper            from "../components/ImageCropper"; // our custom crop tool

function AddProduct() {
  // --- FORM FIELD STATES ---
  const [name,     setName]     = useState(""); // product name input
  const [category, setCategory] = useState(""); // category input
  const [price,    setPrice]    = useState(""); // price input
  const [stock,    setStock]    = useState(""); // stock quantity input

  // --- IMAGE STATES ---
  const [image,        setImage]        = useState(null);  // the final cropped image file
  const [imagePreview, setImagePreview] = useState(null);  // base64 string to show thumbnail
  const [showCropper,  setShowCropper]  = useState(false); // controls if cropper modal is open
  const [selectedImageFile, setSelectedImageFile] = useState(null); // raw file before cropping

  // --- UI STATES ---
  const [message,    setMessage]    = useState("");  // success or error text
  const [categories, setCategories] = useState([]); // existing categories from database

  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // our login token

  // --- LOAD EXISTING CATEGORIES ---
  // When the page loads, fetch all products so we can show existing categories
  // in a dropdown (helps owner pick from existing ones instead of retyping)
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Get unique categories using Set (Set removes duplicates automatically)
          const uniqueCategories = [...new Set(data.map((p) => p.category))];
          setCategories(uniqueCategories);
        }
      })
      .catch((err) => console.error("Category load failed", err));
  }, []); // empty [] means: run only once when page first loads

  // --- WHEN USER PICKS AN IMAGE FILE ---
  const handleImageSelect = (e) => {
    const file = e.target.files[0]; // get the selected file
    if (!file) return;

    // Validate: max file size 10MB
    if (file.size > 10 * 1024 * 1024) {
      setMessage("❌ File size should be less than 10MB");
      return;
    }

    // Validate: must be an image
    if (!file.type.match("image.*")) {
      setMessage("❌ Please select an image file");
      return;
    }

    // Store the file and open the crop tool
    setSelectedImageFile(file);
    setShowCropper(true);
    setMessage("");
  };

  // --- WHEN OWNER FINISHES CROPPING ---
  // The cropper calls this with the final cropped image file
  const handleCropComplete = (croppedFile) => {
    setImage(croppedFile); // store file (for upload later)

    // Also create a preview image URL so we can display a thumbnail
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result); // base64 data URL
    };
    reader.readAsDataURL(croppedFile);

    // Close the cropper
    setShowCropper(false);
    setSelectedImageFile(null);
  };

  // --- WHEN OWNER CANCELS CROPPING ---
  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImageFile(null);
  };

  // --- SAVE THE PRODUCT ---
  const handleSave = async () => {
    // Basic validation — all fields required
    if (!name || !category || !price || !stock) {
      setMessage("❌ Please fill all fields");
      return;
    }

    try {
      // STEP 1: Create the product with its image
      // We use FormData because we're sending a file (not plain JSON)
      const formData = new FormData();
      formData.append("name",         name);
      formData.append("category",     category);
      formData.append("lowStockLevel", 5); // default low stock warning at 5
      if (image) {
        formData.append("image", image); // attach the cropped image file
      }

      const productRes = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` }, // NO Content-Type for FormData
        body:    formData,
      });

      if (!productRes.ok) {
        setMessage("❌ Failed to add product");
        return;
      }

      const product   = await productRes.json();
      const productId = product._id; // we need this ID for steps 2 and 3

      // STEP 2: Set the initial price for this product
      await fetch(`${process.env.REACT_APP_API_URL}/api/prices/update`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ productId, price: Number(price) }),
      });

      // STEP 3: Set today's starting stock quantity
      await fetch(`${process.env.REACT_APP_API_URL}/api/stock/update`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ productId, quantity: Number(stock) }),
      });

      setMessage("✅ Product added successfully");
      setTimeout(() => navigate("/products"), 1000); // go to products page after 1 second
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong");
    }
  };

  // --- WHAT SHOWS ON SCREEN ---
  return (
    <>
      <Header title="" />

      {/* IMAGE CROPPER MODAL — only shows when showCropper is true */}
      {showCropper && selectedImageFile && (
        <ImageCropper
          imageFile={selectedImageFile}  // pass raw file to cropper
          onCropComplete={handleCropComplete} // called when owner clicks "Done"
          onCancel={handleCropCancel}         // called when owner clicks "Cancel"
        />
      )}

      <div className="container" style={{ maxWidth: "480px", margin: "0 auto", padding: "16px" }}>
        <div className="card" style={{ padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>➕ Add New Product</h2>

          {/* PRODUCT NAME */}
          <label style={{ fontWeight: "600" }}>Product Name</label>
          <input
            placeholder="e.g. Chocolate Cake"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "12px" }}
          />

          {/* CATEGORY — owner can type a new one or pick from dropdown */}
          <label style={{ fontWeight: "600" }}>Category</label>
          <input
            placeholder="Enter new category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ marginBottom: "8px" }}
          />

          {/* Show existing category dropdown only if there are existing categories */}
          {categories.length > 0 && (
            <select
              value=""
              onChange={(e) => setCategory(e.target.value)} // clicking an option fills the input
              style={{ marginBottom: "12px" }}
            >
              <option value="">Select existing category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {/* PRICE AND STOCK — side by side using flexbox */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: "600" }}>Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 120"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: "600" }}>Stock</label>
              <input
                type="number"
                placeholder="Today's quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <label style={{ fontWeight: "600" }}>Product Image</label>

          {/* If no image yet → show upload area */}
          {!imagePreview ? (
            <div>
              {/* Hidden file input — triggered by clicking the label below */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
                id="image-upload"
              />
              {/* This label acts as a styled button to open the file picker */}
              <label
                htmlFor="image-upload"
                style={{
                  display: "block",
                  padding: "15px",
                  backgroundColor: "#f5f5f5",
                  border: "2px dashed #ddd",
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: "pointer",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>📷</div>
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>Select Product Image</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Tap to choose from gallery</div>
              </label>
            </div>
          ) : (
            /* If image exists → show preview thumbnail + remove button */
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  width: "100%", maxWidth: "220px", height: "220px",
                  margin: "0 auto", borderRadius: "14px", overflow: "hidden",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.15)", marginBottom: "12px",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              {/* Remove image button */}
              <button
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                  document.getElementById("image-upload").value = ""; // clear the file input
                }}
                style={{
                  width: "100%", padding: "10px", backgroundColor: "#f44336",
                  color: "white", border: "none", borderRadius: "4px",
                  cursor: "pointer", fontWeight: "600",
                }}
              >
                🗑️ Remove Image
              </button>
            </div>
          )}

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            style={{
              width: "100%", padding: "12px", fontSize: "16px",
              fontWeight: "600", backgroundColor: "#4CAF50",
              color: "white", border: "none", borderRadius: "8px", cursor: "pointer",
            }}
          >
            💾 Save Product
          </button>

          {/* SUCCESS / ERROR MESSAGE */}
          {message && (
            <p
              style={{
                marginTop: "12px", textAlign: "center", fontWeight: "600",
                color: message.includes("✅") ? "green" : "red",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default AddProduct;