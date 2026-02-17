// ============================================================
// RAW PURCHASES PAGE  (RawPurchases.js)
// Shows all ingredient purchase records.
// Owner can:
//   - Filter by date
//   - Select purchases and print a bill
//   - Mark individual purchases as "Done"
// ============================================================

// Note: This file exports RawPurchases — in your project,
// this should be in its own file: RawPurchases.js

import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toLocaleDateString("en-CA"); // "YYYY-MM-DD" format
};

function RawPurchases() {
  const [items,     setItems]     = useState([]); // purchase records
  const [date,      setDate]      = useState(getToday()); // selected date filter
  const [selected,  setSelected]  = useState([]); // array of selected purchase IDs (for printing)
  const [uiMessage, setUiMessage] = useState(""); // validation messages

  const token = localStorage.getItem("token");

  // Fetch purchase records — date can be empty to get all
  const fetchData = useCallback(() => {
    const url = date
      ? `${process.env.REACT_APP_API_URL}/api/raw-purchases?date=${date}`
      : `${process.env.REACT_APP_API_URL}/api/raw-purchases`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res)  => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(()    => setItems([]));
  }, [date, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Calculate total of ALL shown purchases
  const totalAmount = items.reduce((sum, p) => sum + (p.totalCost || 0), 0);

  // Get only selected items (for printing)
  const selectedItems = items.filter((p) => selected.includes(p._id));
  const selectedTotal = selectedItems.reduce((sum, p) => sum + (p.totalCost || 0), 0);

  const allSelected = items.length > 0 && selected.length === items.length;

  // Select or deselect all purchases at once
  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : items.map((p) => p._id));
  };

  // Mark a purchase as "Done" (received/processed)
  const markDone = async (id) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/raw-purchases/${id}/done`, {
      method:  "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData(); // reload to show updated status
  };

  // Open a print window with the selected purchases as a formatted bill
  const printBill = () => {
    if (selectedItems.length === 0) {
      setUiMessage("⚠ Please select at least one purchase to print the bill");
      return;
    }
    setUiMessage("");

    const billHTML = `
      <html>
        <head>
          <title>Raw Purchase Bill</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; }
            th { background: #f2f2f2; }
            .total { text-align: right; font-size: 18px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <h2>RAW MATERIAL PURCHASE BILL</h2>
          <p><strong>Date:</strong> ${date || "All Dates"}</p>
          <table>
            <tr><th>Material</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
            ${selectedItems.map((p) => `
              <tr>
                <td>${p.rawMaterial?.name || "Deleted"}</td>
                <td>${p.quantity}</td>
                <td>₹${p.rate}</td>
                <td>₹${p.totalCost}</td>
              </tr>
            `).join("")}
          </table>
          <p class="total"><strong>NET TOTAL: ₹${selectedTotal}</strong></p>
        </body>
      </html>
    `;

    // Open new window, write HTML, then trigger print dialog
    const win = window.open("", "", "width=800,height=600");
    win.document.write(billHTML);
    win.document.close();
    win.print();
  };

  return (
    <>
      <Header title="" />
      <div className="container">
        <h2 style={{ textAlign: "center", marginBottom: "12px" }}>🧾 Raw Purchases</h2>

        {/* DATE FILTER */}
        <div className="card">
          <label style={{ fontWeight: "600" }}>📅 Select Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button onClick={() => setDate("")}>View All</button>
        </div>

        {/* TOTAL */}
        <div className="card" style={{ textAlign: "center", background: "#f8f9fa", fontSize: "18px", fontWeight: "bold" }}>
          💰 Total Purchase: ₹{totalAmount}
        </div>

        {/* SELECT ALL + PRINT BUTTONS */}
        <div className="card" style={{ display: "flex", gap: "10px" }}>
          <button
            style={{ flex: 1, backgroundColor: allSelected ? "#9E9E9E" : "#3F51B5", fontWeight: "600" }}
            onClick={toggleSelectAll}
          >
            {allSelected ? "❌ Clear Selection" : "✅ Select All"}
          </button>
          <button style={{ flex: 1, backgroundColor: "#4CAF50", fontWeight: "600" }} onClick={printBill}>
            🖨 Print Selected Bill
          </button>
        </div>

        {/* VALIDATION MESSAGE */}
        {uiMessage && (
          <div className="card" style={{ backgroundColor: "#fff3cd", color: "#856404", fontWeight: "600", textAlign: "center" }}>
            {uiMessage}
          </div>
        )}

        {/* PURCHASE CARDS */}
        {items.map((p) => (
          <div key={p._id} className="card" style={{ borderLeft: "5px solid #3F51B5", position: "relative" }}>
            {/* Checkbox — clicking adds/removes from selected array */}
            <input
              type="checkbox"
              checked={selected.includes(p._id)}
              onChange={(e) => {
                setUiMessage("");
                setSelected(e.target.checked
                  ? [...selected, p._id]              // add to selection
                  : selected.filter((id) => id !== p._id) // remove from selection
                );
              }}
              style={{ position: "absolute", top: "12px", right: "12px", transform: "scale(1.3)" }}
            />

            <h3 style={{ marginBottom: "6px" }}>{p.rawMaterial?.name || "Deleted Material"}</h3>
            <p>📦 Quantity: <strong>{p.quantity}</strong></p>
            <p>💵 Rate: ₹{p.rate}</p>
            <p style={{ fontSize: "16px", fontWeight: "bold" }}>Total: ₹{p.totalCost}</p>

            <p>
              Status:{" "}
              <span style={{ fontWeight: "bold", color: p.status === "Done" ? "green" : "#FF9800" }}>
                {p.status}
              </span>
            </p>

            {p.status === "Pending" && (
              <button style={{ marginTop: "6px" }} onClick={() => markDone(p._id)}>
                ✔ Mark as Done
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default RawPurchases;