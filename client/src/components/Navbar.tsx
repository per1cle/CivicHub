import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 20px",
        background: "#0f172a",
        color: "white",
      }}
    >
      <div style={{ fontWeight: "bold" }}>
        CivicHub 🏛️
      </div>

      <div style={{ display: "flex", gap: "15px" }}>
        <Link to="/map" style={{ color: "white" }}>
          Map
        </Link>

        <Link to="/admin/map" style={{ color: "#fbbf24" }}>
          🧑‍💼 Admin
        </Link>

        <Link to="/payments" style={{ color: "white" }}>
          💳 Plăți
        </Link>

        <Link to="/appointments" style={{ color: "white" }}>
          📅 Programări
        </Link>
      </div>
    </nav>
  );
}