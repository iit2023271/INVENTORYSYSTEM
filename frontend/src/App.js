// ============================================================
// App.js — FIXED (B4: real token validation, not just existence check)
//
// BUG FIXED: localStorage.getItem("token") only checks IF a token
// exists — any string (even "fake") unlocks all owner routes.
// Now we decode the JWT locally and check expiry before rendering
// protected routes. The backend is still the authoritative guard,
// but this prevents trivial bypass at the frontend routing level.
//
// HOW JWT EXPIRY CHECK WORKS (without a library):
//   A JWT has 3 parts: header.payload.signature
//   The payload is base64url-encoded JSON. We decode it and read "exp"
//   (Unix timestamp in seconds). If exp < now → token is expired.
// ============================================================

import { Routes, Route, Navigate } from "react-router-dom";

import Login               from "./pages/Login";
import Dashboard           from "./pages/Dashboard";
import Products            from "./pages/Products";
import AddProduct          from "./pages/AddProduct";
import AddRawPurchase      from "./pages/AddRawPurchase";
import AddRawMaterial      from "./pages/AddRawMaterial";
import RawMaterials        from "./pages/RawMaterials";
import RawPurchases        from "./pages/RawPurchases";
import Orders              from "./pages/Orders";
import CustomerMenu        from "./pages/CustomerMenu";
import Checkout            from "./pages/Checkout";
import Reports             from "./pages/Reports";
import DeletedProducts     from "./pages/DeletedProducts";
import OrdersSummary       from "./pages/OrdersSummary";
import AddCustomOrder      from "./pages/AddCustomOrder";
import Customers           from "./pages/Customers";
import CustomerDetails     from "./pages/CustomerDetails";
import DeletedRawMaterials from "./pages/DeletedRawMaterials";



function isTokenValid() {
  const token = localStorage.getItem("token");

  // No token at all → definitely not valid
  if (!token) return false;

  try {
    // JWT structure: "<header>.<payload>.<signature>"
    const parts = token.split(".");
    if (parts.length !== 3) return false; // not a valid JWT shape

    // Decode the base64url-encoded payload
    // btoa/atob work with base64; JWT uses base64url (replace - and _)
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    // Check expiry: payload.exp is seconds since epoch
    if (!payload.exp) return false; // no expiry claim → treat as invalid
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp < nowInSeconds) {
      // Token is expired — clean it up from storage
      localStorage.removeItem("token");
      return false;
    }

    return true; // token exists, has correct shape, and is not expired

  } catch {
    // If decoding/parsing fails → the token is malformed or tampered
    localStorage.removeItem("token");
    return false;
  }
}


// ============================================================
// ProtectedRoute — renders children only if token is valid.
// Otherwise redirects to "/" (Login page).
// ============================================================
function ProtectedRoute({ children }) {
  if (!isTokenValid()) {
    return <Navigate to="/" replace />;
  }
  return children;
}


function App() {
  const loggedIn = isTokenValid();

  return (
    <Routes>
      {/* PUBLIC ROUTES — available to everyone */}

      {/* Login page — only shown when NOT logged in */}
      {!loggedIn && <Route path="/" element={<Login />} />}

      {/* Customer-facing pages — always public */}
      <Route path="/menu"     element={<CustomerMenu />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* PROTECTED ROUTES — wrapped in ProtectedRoute */}
      
      <Route path="/"                      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products"              element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/add-product"           element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
      <Route path="/add-raw-purchase"      element={<ProtectedRoute><AddRawPurchase /></ProtectedRoute>} />
      <Route path="/add-raw-material"      element={<ProtectedRoute><AddRawMaterial /></ProtectedRoute>} />
      <Route path="/raw-materials"         element={<ProtectedRoute><RawMaterials /></ProtectedRoute>} />
      <Route path="/raw-purchases"         element={<ProtectedRoute><RawPurchases /></ProtectedRoute>} />
      <Route path="/orders"                element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/reports"               element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/deleted-products"      element={<ProtectedRoute><DeletedProducts /></ProtectedRoute>} />
      <Route path="/orders-summary"        element={<ProtectedRoute><OrdersSummary /></ProtectedRoute>} />
      <Route path="/custom-orders/new"     element={<ProtectedRoute><AddCustomOrder /></ProtectedRoute>} />
      <Route path="/customers"             element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/customers/:phone"      element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
      <Route path="/deleted-raw-materials" element={<ProtectedRoute><DeletedRawMaterials /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
