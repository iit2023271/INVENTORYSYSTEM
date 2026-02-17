import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  const token    = localStorage.getItem("token"); // auth token saved after login
  const navigate = useNavigate();

  // Runs once on page load — fetches all customers from the backend
  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setCustomers([]);
        setLoading(false);
      });
  }, [token]);

  // Returns how many "Completed" normal + custom orders a customer has
  const getCounts = (c) => {
    const normal = c.normalOrders?.filter((o) => o.status === "Completed").length || 0;
    const custom = c.customOrders?.filter((o) => o.status === "Completed").length || 0;
    return { normal, custom, total: normal + custom };
  };

  // Filter by name or phone, then sort by most completed orders first
  const list = [...customers]
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    )
    .sort((a, b) => getCounts(b).total - getCounts(a).total);

  return (
    <>
      <Header title="" />
      <div className="container" style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>

        {/* Title */}
        <h2 style={{ textAlign: "center", marginBottom: 4 }}>👥 Customers</h2>
        <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginBottom: 20 }}>
          Showing completed orders only
        </p>

        {/* Search box */}
        <input
          type="text"
          placeholder="🔍  Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8,
            border: "1px solid #ddd", fontSize: 15, marginBottom: 16,
            boxSizing: "border-box",
          }}
        />

        {/* States: loading / empty */}
        {loading && <p style={{ textAlign: "center", color: "#aaa" }}>Loading...</p>}
        {!loading && list.length === 0 && (
          <p style={{ textAlign: "center", color: "#aaa", marginTop: 40 }}>
            {search ? `No results for "${search}"` : "No customers yet."}
          </p>
        )}

        {/* One card per customer */}
        {list.map((customer) => {
          const counts = getCounts(customer);
          return (
            <div
              key={customer.phone}
              // Pass the full customer object to CustomerDetails via navigation state
              onClick={() => navigate(`/customers/${customer.phone}`, { state: { customer } })}
              style={{
                background: "#fff", border: "1px solid #eee", borderRadius: 10,
                padding: "14px 16px", marginBottom: 10, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14,
              }}
            >
              {/* Avatar: first letter of the customer's name */}
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "#e8f5e9", color: "#2e7d32",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "bold", fontSize: 18, flexShrink: 0,
              }}>
                {customer.name.charAt(0).toUpperCase()}
              </div>

              {/* Name & phone */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{customer.name}</div>
                <div style={{ color: "#888", fontSize: 13 }}>📱 {customer.phone}</div>
              </div>

              {/* Completed order counts */}
              <div style={{ textAlign: "right", fontSize: 13, lineHeight: 1.6 }}>
                <div style={{ color: "#555" }}>🛒 {counts.normal} &nbsp; 📝 {counts.custom}</div>
                <div style={{ fontWeight: 700, color: "#2e7d32" }}>✅ {counts.total} done</div>
              </div>
            </div>
          );
        })}

      </div>
    </>
  );
}

export default Customers;