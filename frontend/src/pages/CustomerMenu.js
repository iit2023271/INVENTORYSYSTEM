// ============================================================
// CUSTOMER MENU PAGE
// This is the public-facing menu that customers see.
// Customers can:
//   - Browse all products with images and prices
//   - Search by name, filter by category
//   - Add/remove items from their cart
//   - Proceed to checkout
//
// No login required — this is for customers, not the owner.
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";

function CustomerMenu() {
  // --- STATES ---
  const [products, setProducts] = useState([]); // all products from backend
  const [prices,   setPrices]   = useState({}); // { productId: price } lookup map
  const [cart,     setCart]     = useState([]); // items customer added to cart

  // Search and filter states
  const [search,   setSearch]   = useState("");   // text typed in search box
  const [category, setCategory] = useState("All"); // currently selected category

  const navigate = useNavigate();

  // --- LOAD PRODUCTS ---
  // Runs once when page loads
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products`)
      .then((res)  => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(()    => setProducts([]));
  }, []);

  // --- LOAD PRICES ---
  // Prices are stored separately in the database
  // We convert the array to a { productId: price } map for fast lookup
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/prices/current`)
      .then((res)  => res.json())
      .then((data) => {
        const map = {};
        if (Array.isArray(data)) {
          data.forEach((p) => { map[p.productId] = p.price; });
        }
        setPrices(map);
      });
  }, []);

  // --- ADD TO CART ---
  const addToCart = (product) => {
    const price    = prices[product._id] || 0;
    const existing = cart.find((i) => i._id === product._id); // check if already in cart

    if (existing) {
      // Product already in cart — just increase its quantity
      setCart(cart.map((i) =>
        i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      // New product — add it to cart with quantity 1
      setCart([...cart, { _id: product._id, name: product.name, price, quantity: 1 }]);
    }
  };

  // --- REMOVE FROM CART ---
  const removeFromCart = (id) => {
    const item = cart.find((i) => i._id === id);
    if (!item) return;

    if (item.quantity === 1) {
      // Last one — remove the product from cart entirely
      setCart(cart.filter((i) => i._id !== id));
    } else {
      // More than one — just decrease quantity by 1
      setCart(cart.map((i) => i._id === id ? { ...i, quantity: i.quantity - 1 } : i));
    }
  };

  // Calculate cart total
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Build category list (All + unique categories from products)
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Filter products based on search text AND selected category
  const filteredProducts = products.filter((p) => {
    const matchesSearch   = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  // --- SCREEN OUTPUT ---
  return (
    <div className="container" style={{ maxWidth: "520px", margin: "0 auto", padding: "16px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "16px" }}>🧁 Bakery Menu</h2>

      {/* SEARCH + CATEGORY FILTER */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          type="text"
          placeholder="🔍 Search product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* PRODUCT CARDS */}
      {filteredProducts.map((p) => {
        const price    = prices[p._id] || 0;
        const cartItem = cart.find((i) => i._id === p._id); // check if in cart

        return (
          <div
            key={p._id}
            className="card"
            style={{ borderRadius: "18px", padding: "14px", background: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
          >
            {/* PRODUCT NAME */}
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "4px" }}>{p.name}</h3>

            {/* PRICE */}
            <p style={{ fontSize: "16px", fontWeight: "700", color: "#2e7d32", marginBottom: "8px" }}>
              ₹{price}
            </p>

            {/* PRODUCT IMAGE (square aspect ratio) */}
            <div
              style={{
                position: "relative", width: "100%", aspectRatio: "1 / 1",
                borderRadius: "16px", overflow: "hidden", background: "#f5f5f5",
                boxShadow: "0 8px 22px rgba(0,0,0,0.12)", marginBottom: "10px",
              }}
            >
              <img
                src={p.image || "https://via.placeholder.com/220x220?text=No+Image"}
                alt={p.name}
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  transform: "scale(1.08)",
                  // Greyed out if sold out, colourful if active
                  filter: p.isActive ? "contrast(1.1) saturate(1.2)" : "grayscale(100%) brightness(0.6)",
                  transition: "all 0.3s ease",
                }}
              />

              {/* SOLD OUT OVERLAY — shows on top of image if inactive */}
              {!p.isActive && (
                <div
                  style={{
                    position: "absolute", inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "22px", fontWeight: "800", letterSpacing: "2px",
                  }}
                >
                  SOLD OUT
                </div>
              )}
            </div>

            {/* CATEGORY */}
            <p style={{ fontSize: "14px", marginBottom: "4px" }}>
              <strong>Category:</strong> {p.category}
            </p>

            {/* CART CONTROLS */}
            {!cartItem ? (
              /* Not in cart yet — show Add button */
              <button
                onClick={() => addToCart(p)}
                disabled={!p.isActive}
                style={{
                  width: "100%",
                  backgroundColor: p.isActive ? "#4CAF50" : "#ccc",
                  cursor:          p.isActive ? "pointer" : "not-allowed",
                }}
              >
                {p.isActive ? "➕ Add to Cart" : "🚫 Sold Out"}
              </button>
            ) : (
              /* Already in cart — show quantity controls */
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                <button onClick={() => removeFromCart(p._id)}>➖</button>
                <span style={{ fontWeight: "bold" }}>{cartItem.quantity}</span>
                <button
                  onClick={() => addToCart(p)}
                  disabled={!p.isActive}
                  style={{ backgroundColor: p.isActive ? "#4CAF50" : "#ccc" }}
                >
                  ➕
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* CART SUMMARY — sticky at bottom, only shows when cart has items */}
      {cart.length > 0 && (
        <div className="card" style={{ marginTop: "20px", position: "sticky", bottom: "10px" }}>
          <h3 style={{ marginBottom: "10px" }}>🛒 Your Cart</h3>

          {/* List each cart item */}
          {cart.map((item) => (
            <div key={item._id} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <hr />

          <p style={{ fontWeight: "bold", textAlign: "right", marginBottom: "10px" }}>
            Total: ₹{total}
          </p>

          {/* Save cart to localStorage, then go to checkout */}
          <button
            style={{ width: "100%" }}
            onClick={() => {
              localStorage.setItem("cart", JSON.stringify(cart)); // save cart for Checkout page
              navigate("/checkout");
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default CustomerMenu;