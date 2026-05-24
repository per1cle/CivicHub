import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="nav-brand">
        <span className="brand-icon">🏛️</span>
        <span>CivicHub</span>
      </NavLink>

      <div className="nav-links">
        <NavLink to="/map">Hartă sesizări</NavLink>
        <NavLink to="/appointments">Programări</NavLink>
        <NavLink to="/payments">Plăți</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
        <NavLink to="/admin/map" className="nav-admin">
          Panou admin
      </NavLink>
    </div>
    </nav>
  );
}