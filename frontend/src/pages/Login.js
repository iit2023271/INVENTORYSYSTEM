// ============================================================
// LOGIN PAGE
// This is the first screen the bakery owner sees.
// They enter their email and password to log in.
// If login is successful, a "token" (like a digital key) is 
// saved so they stay logged in across pages.
// ============================================================

import { useState } from "react";

function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false); // bonus: disable button while logging in

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please enter both email and password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      } else {
        setMessage("Wrong email or password");
      }
    } catch {
      setMessage("Network error. Please try again.");
    }

    setLoading(false);
  };

  // ✅ FIX B15: Submit on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      className="container"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "360px",
          padding: "24px",
          borderRadius: "10px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          🍰 Bakery Owner Login
        </h2>

        <label style={{ fontWeight: "600" }}>Email</label>
        <input
          type="email"
          placeholder="Enter owner email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage(""); // ✅ FIX B16: clear error on every keystroke
          }}
          onKeyDown={handleKeyDown} // ✅ FIX B15: Enter submits
          style={{ marginBottom: "12px" }}
          autoComplete="email"
        />

        <label style={{ fontWeight: "600" }}>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setMessage(""); // ✅ FIX B16: clear error on every keystroke
          }}
          onKeyDown={handleKeyDown} // ✅ FIX B15: Enter submits
          style={{ marginBottom: "16px" }}
          autoComplete="current-password"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", padding: "10px", fontSize: "15px", fontWeight: "600" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && (
          <p style={{ marginTop: "12px", textAlign: "center", color: "red", fontSize: "14px" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
