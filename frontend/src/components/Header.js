import React from "react";
import { useNavigate } from "react-router-dom";

function Header({ title }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#ffffff",
        borderBottom: "1px solid #eee",
        display: "flex",
        justifyContent: "center"   // 🔑 centers mobile width on desktop
      }}
    >
      {/* MOBILE WIDTH WRAPPER */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",       // 🔑 mobile width
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 10px"
        }}
      >
        {/* HOME BUTTON */}
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "6px 10px",
            fontSize: "13px",
            fontWeight: "600",
            borderRadius: "6px",
            whiteSpace: "nowrap",
            cursor: "pointer"
          }}
        >
          🏠 Home
        </button>

        {/* TITLE */}
        <h3
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: "600",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {title}
        </h3>
      </div>
    </div>
  );
}

export default Header;
