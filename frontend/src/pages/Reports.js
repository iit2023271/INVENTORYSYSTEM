// ============================================================
// REPORTS PAGE  (Reports.js)
// Shows profit and expense data in three views:
//   1. Daily — pick a date, see that day's numbers
//   2. Monthly — pick a month, see totals
//   3. Custom date range — pick From and To dates
//
// A simple horizontal bar is drawn for each value using a 
// <div> with a dynamic width percentage — no chart library needed.
// ============================================================

import { useEffect, useState } from "react";
import Header from "../components/Header";

// Convert "YYYY-MM" month string to full ISO date range
const getMonthRange = (month) => {
  const [year, m] = month.split("-");
  const start = new Date(Number(year), Number(m) - 1, 1, 0, 0, 0);
  const end   = new Date(Number(year), Number(m), 0, 23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
};

// Calculate bar width as a percentage of the max value
const getPercent = (value, max) => max === 0 ? "0%" : `${(value / max) * 100}%`;

function Reports() {
  const token = localStorage.getItem("token");
  const [rangeError, setRangeError] = useState("");

  // Daily states
  const [profitDate,   setProfitDate]   = useState(new Date().toISOString().split("T")[0]);
  const [expenseDate,  setExpenseDate]  = useState(new Date().toISOString().split("T")[0]);
  const [dailyProfit,  setDailyProfit]  = useState(null);
  const [dailyExpense, setDailyExpense] = useState(null);

  // Monthly states
  const [month,         setMonth]         = useState(new Date().toISOString().slice(0, 7));
  const [monthlyReport, setMonthlyReport] = useState(null);

  // Range states
  const [fromDate,    setFromDate]    = useState("");
  const [toDate,      setToDate]      = useState("");
  const [rangeReport, setRangeReport] = useState(null);

  // Fetch daily profit whenever the date changes
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/profit-reports/daily-profit?date=${profitDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setDailyProfit);
  }, [profitDate, token]);

  // Fetch daily expense
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/expense-reports/daily-expense?date=${expenseDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setDailyExpense);
  }, [expenseDate, token]);

  // Fetch monthly report
  useEffect(() => {
    const { from, to } = getMonthRange(month);
    fetch(`${process.env.REACT_APP_API_URL}/api/profit-reports/range-profit?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setMonthlyReport);
  }, [month, token]);

  // Fetch custom range report (only when owner clicks the button)
  const fetchRangeReport = () => {
    if (!fromDate || !toDate) {
      setRangeError("⚠ Please select both From and To dates");
      return;
    }
    setRangeError("");
    fetch(`${process.env.REACT_APP_API_URL}/api/profit-reports/range-profit?from=${fromDate}&to=${toDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setRangeReport);
  };

  // Show loading until all initial data is ready
  if (!dailyProfit || !dailyExpense || !monthlyReport) {
    return <p style={{ textAlign: "center" }}>Loading reports...</p>;
  }

  const dailyMax   = Math.max(dailyProfit.totalSales, dailyProfit.totalExpense, 1);
  const monthlyMax = Math.max(monthlyReport.totalSales, monthlyReport.totalExpense, 1);
  const rangeMax   = rangeReport ? Math.max(rangeReport.totalSales, rangeReport.totalExpense, 1) : 1;

  return (
    <>
      <Header title="" />
      <div className="container">
        <h2>📊 Bakery Reports</h2>
        <p style={{ textAlign: "center", fontSize: "14px", color: "#777" }}>
          Track daily performance and long-term growth
        </p>

        {/* DAILY PROFIT & EXPENSE */}
        <div className="card">
          <h3>📈 Daily Profit & Expense</h3>
          <label>Date</label>
          <input
            type="date"
            value={profitDate}
            onChange={(e) => {
              setProfitDate(e.target.value);
              setExpenseDate(e.target.value); // sync both dates together
            }}
          />

          {/* Sales bar */}
          <p>Sales: ₹{dailyProfit.totalSales}</p>
          <div style={{ background: "#eee", borderRadius: "6px" }}>
            <div style={{ width: getPercent(dailyProfit.totalSales, dailyMax), height: "8px", background: "#4CAF50", borderRadius: "6px" }} />
          </div>

          {/* Expense bar */}
          <p>Expense: ₹{dailyProfit.totalExpense}</p>
          <div style={{ background: "#eee", borderRadius: "6px" }}>
            <div style={{ width: getPercent(dailyProfit.totalExpense, dailyMax), height: "8px", background: "#f44336", borderRadius: "6px" }} />
          </div>

          <p style={{ fontWeight: "bold", marginTop: "10px", color: dailyProfit.profit >= 0 ? "green" : "red" }}>
            Profit: ₹{dailyProfit.profit}
          </p>
        </div>

        {/* MONTHLY SUMMARY */}
        <div className="card">
          <h3>📆 Monthly Summary</h3>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />

          <p>Sales: ₹{monthlyReport.totalSales}</p>
          <div style={{ background: "#eee", borderRadius: "6px" }}>
            <div style={{ width: getPercent(monthlyReport.totalSales, monthlyMax), height: "8px", background: "#4CAF50", borderRadius: "6px" }} />
          </div>

          <p>Expense: ₹{monthlyReport.totalExpense}</p>
          <div style={{ background: "#eee", borderRadius: "6px" }}>
            <div style={{ width: getPercent(monthlyReport.totalExpense, monthlyMax), height: "8px", background: "#f44336", borderRadius: "6px" }} />
          </div>

          <p style={{ fontWeight: "bold", marginTop: "10px", color: monthlyReport.profit >= 0 ? "green" : "red" }}>
            Profit: ₹{monthlyReport.profit}
          </p>
        </div>

        {/* CUSTOM DATE RANGE */}
        <div className="card">
          <h3>📅 Custom Date Summary</h3>
          <label>From</label>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setRangeError(""); }} />
          <input type="date" value={toDate}   onChange={(e) => { setToDate(e.target.value);   setRangeError(""); }} />
          <button onClick={fetchRangeReport}>View Report</button>

          {rangeError && <p style={{ color: "red", fontSize: "14px", marginTop: "8px" }}>{rangeError}</p>}

          {rangeReport && (
            <>
              <p>Sales: ₹{rangeReport.totalSales}</p>
              <div style={{ background: "#eee", borderRadius: "6px" }}>
                <div style={{ width: getPercent(rangeReport.totalSales, rangeMax), height: "8px", background: "#4CAF50", borderRadius: "6px" }} />
              </div>
              <p>Expense: ₹{rangeReport.totalExpense}</p>
              <div style={{ background: "#eee", borderRadius: "6px" }}>
                <div style={{ width: getPercent(rangeReport.totalExpense, rangeMax), height: "8px", background: "#f44336", borderRadius: "6px" }} />
              </div>
              <p style={{ fontWeight: "bold", marginTop: "10px", color: rangeReport.profit >= 0 ? "green" : "red" }}>
                Profit: ₹{rangeReport.profit}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Reports;