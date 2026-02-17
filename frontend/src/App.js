// ============================================================
// APP.JS — THE MAIN ROUTER FILE
// This file decides which page to show based on the URL.
// It also handles the login guard — if you're not logged in,
// you can only see Login, Menu, and Checkout pages.
//
// React Router's <Routes> and <Route> work like a switchboard:
//   - When URL is "/products" → show the Products component
//   - When URL is "/orders"   → show the Orders component
//   - ...and so on
// ============================================================

import { Routes, Route } from "react-router-dom";

// Import all our page components
import Login              from "./pages/Login";
import Dashboard          from "./pages/Dashboard";
import Products           from "./pages/Products";
import AddProduct         from "./pages/AddProduct";
import AddRawPurchase     from "./pages/AddRawPurchase";
import AddRawMaterial     from "./pages/AddRawMaterial";
import RawMaterials       from "./pages/RawMaterials";
import RawPurchases       from "./pages/RawPurchases";
import Orders             from "./pages/Orders";
import CustomerMenu       from "./pages/CustomerMenu";
import Checkout           from "./pages/Checkout";
import Reports            from "./pages/Reports";
import DeletedProducts    from "./pages/DeletedProducts";
import OrdersSummary      from "./pages/OrdersSummary";
import AddCustomOrder     from "./pages/AddCustomOrder";
import Customers          from "./pages/Customers";
import CustomerDetails    from "./pages/CustomerDetails";
import DeletedRawMaterials from "./pages/DeletedRawMaterials";

function App() {
  // Check if the user is logged in by looking for a token in browser storage
  // If token exists → owner is logged in
  // If token is null → owner is NOT logged in, show Login screen
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* --- PUBLIC ROUTES (anyone can visit, no login needed) --- */}

      {/* If NOT logged in, show Login page at the root URL "/" */}
      {!token && <Route path="/" element={<Login />} />}

      {/* Customers can always view the menu and checkout */}
      <Route path="/menu"     element={<CustomerMenu />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* --- PROTECTED ROUTES (only visible when logged in) --- */}
      {/* These routes are wrapped in a condition: only render if token exists */}
      {token && (
        <>
          <Route path="/"                    element={<Dashboard />} />
          <Route path="/products"            element={<Products />} />
          <Route path="/add-product"         element={<AddProduct />} />
          <Route path="/add-raw-purchase"    element={<AddRawPurchase />} />
          <Route path="/add-raw-material"    element={<AddRawMaterial />} />
          <Route path="/raw-materials"       element={<RawMaterials />} />
          <Route path="/raw-purchases"       element={<RawPurchases />} />
          <Route path="/orders"              element={<Orders />} />
          <Route path="/reports"             element={<Reports />} />
          <Route path="/deleted-products"    element={<DeletedProducts />} />
          <Route path="/orders-summary"      element={<OrdersSummary />} />
          <Route path="/custom-orders/new"   element={<AddCustomOrder />} />
          <Route path="/customers"           element={<Customers />} />

          {/* Dynamic route — :phone means any phone number e.g. /customers/9876543210 */}
          <Route path="/customers/:phone"    element={<CustomerDetails />} />

          <Route path="/deleted-raw-materials" element={<DeletedRawMaterials />} />
        </>
      )}
    </Routes>
  );
}

export default App;