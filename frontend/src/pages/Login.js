// ============================================================
// LOGIN PAGE
// This is the first screen the bakery owner sees.
// They enter their email and password to log in.
// If login is successful, a "token" (like a digital key) is 
// saved so they stay logged in across pages.
// ============================================================

import { useState } from "react"; // useState lets us store values that can change

function Login() {
  // --- STATE VARIABLES ---
  // These are like "boxes" that hold data and update the screen when changed
  const [email, setEmail] = useState("");       // stores what user types in email box
  const [password, setPassword] = useState(""); // stores what user types in password box
  const [message, setMessage] = useState("");   // stores error messages to show user

  // --- HANDLE LOGIN ---
  // This function runs when the user clicks the Login button
  const handleLogin = async () => {
    // Send email + password to the backend API
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      method: "POST",                                    // POST = sending data to server
      headers: { "Content-Type": "application/json" },  // telling server we're sending JSON
      body: JSON.stringify({ email, password }),         // convert JS object to JSON string
    });

    const data = await res.json(); // convert server's response to JS object

    if (data.token) {
      // Login successful — save the token in localStorage (browser storage)
      // This token is used to prove identity on every other page
      localStorage.setItem("token", data.token);
      window.location.reload(); // refresh the app so it shows the dashboard
    } else {
      // Login failed — show error message
      setMessage("Wrong email or password");
    }
  };

  // --- WHAT GETS SHOWN ON SCREEN ---
  return (
    <div
      className="container"
      style={{
        minHeight: "100vh",       // fills full screen height
        display: "flex",
        alignItems: "center",     // centers vertically
        justifyContent: "center", // centers horizontally
        padding: "16px",
      }}
    >
      {/* The white card/box in the center */}
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

        {/* EMAIL INPUT */}
        <label style={{ fontWeight: "600" }}>Email</label>
        <input
          type="email"
          placeholder="Enter owner email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // update email state as user types
          style={{ marginBottom: "12px" }}
        />

        {/* PASSWORD INPUT */}
        <label style={{ fontWeight: "600" }}>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // update password state as user types
          style={{ marginBottom: "16px" }}
        />

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin} // calls our handleLogin function above
          style={{ width: "100%", padding: "10px", fontSize: "15px", fontWeight: "600" }}
        >
          Login
        </button>

        {/* ERROR MESSAGE — only shows if message is not empty */}
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