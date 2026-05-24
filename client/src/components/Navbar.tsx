import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null; 
  }

  return (
    <nav className="navbar">
      <NavLink to={user.role === 'FUNCTIONAR' ? "/admin/dashboard" : "/dashboard"} className="nav-brand">
        <span className="brand-icon">🏛️</span>
        <span>CivicHub</span>
      </NavLink>

      <div className="nav-links">
        {user.role === 'FUNCTIONAR' ? (
          <>
            <NavLink to="/admin/dashboard">Dashboard Admin</NavLink>
            <NavLink to="/admin/map" className="nav-admin">
              Management Sesizări
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/map">Hartă sesizări</NavLink>
            <NavLink to="/appointments">Programări</NavLink>
            <NavLink to="/payments">Plăți</NavLink>
          </>
        )}
        
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}