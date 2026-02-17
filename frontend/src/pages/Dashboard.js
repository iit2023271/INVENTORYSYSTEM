// ============================================================
// DASHBOARD PAGE
// This is the main "home screen" for the bakery owner.
// It shows buttons to navigate to every section of the app.
// useNavigate() is a React Router hook that lets us move 
// between pages without reloading the browser.
// ============================================================

import { useNavigate } from "react-router-dom"; // lets us go to other pages

function Dashboard() {
  // useNavigate gives us a function to change pages
  const navigate = useNavigate();

  return (
    <div
      className="container"
      style={{ maxWidth: "520px", margin: "0 auto", padding: "16px" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        🧁 Bakery Dashboard
      </h2>

      {/* NAVIGATION BUTTONS — each button takes owner to a different page */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>

        {/* navigate("/products") = go to the /products page */}
        <div className="card">
          <button onClick={() => navigate("/products")}>📦 View Products</button>
        </div>

        <div className="card">
          <button onClick={() => navigate("/add-product")}>➕ Add Product</button>
        </div>

        <div className="card">
          <button onClick={() => navigate("/add-raw-purchase")}>🧺 Add Raw Purchase</button>
        </div>

        <div className="card">
          <button onClick={() => navigate("/raw-materials")}>🧾 View Raw Materials</button>
        </div>

        <div className="card">
          <button onClick={() => navigate("/raw-purchases")}>📋 View Raw Purchases</button>
        </div>

        <div className="card">
          <button onClick={() => navigate("/orders")}>🛒 View Orders</button>
        </div>

        <div className="card">
          <button onClick={() => navigate("/reports")}>📊 Reports</button>
        </div>
      </div>

      <div className="card">
        <button onClick={() => navigate("/customers")}>👥 View Customers</button>
      </div>

      {/* LOGOUT BUTTON — removes the token and reloads, which sends user back to Login */}
      <div className="card" style={{ marginTop: "20px", background: "#fff3f3" }}>
        <button
          onClick={() => {
            localStorage.removeItem("token"); // delete the login token
            window.location.reload();         // refresh page — Login screen will appear
          }}
          style={{ backgroundColor: "#f44336", color: "#fff" }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;