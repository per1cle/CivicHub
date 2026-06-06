import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationCenter from "./NotificationCenter";

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
      <NavLink to="/" className="nav-brand">
        <div className="brand-icon-wrapper">
          <span className="brand-icon">🏛️</span>
        </div>
        <span className="brand-text">
          Civic<span className="brand-highlight">Hub</span>
        </span>
      </NavLink>

      <div className="nav-links">
        {user.role === 'FUNCTIONAR' ? (
          <>
            <NavLink to="/admin/dashboard">Dashboard Admin</NavLink>
            <NavLink to="/admin/map"> Sesizări</NavLink>
            <NavLink to="/admin/requests"> Cereri</NavLink>
            <NavLink to="/admin/appointments"> Programări</NavLink>
            <NavLink to="/admin/payments"> Plăți</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/ghiseu">Ghișeu virtual</NavLink>
            <NavLink to="/map">Hartă sesizări</NavLink>
            <NavLink to="/appointments">Programări</NavLink>
            <NavLink to="/payments">Plăți</NavLink>
          </>
        )}

        <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user.role === 'CETATEAN' && <NotificationCenter />}

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '8px 20px',
              borderRadius: '999px',
              fontWeight: '800',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.35)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>Logout</span>
            <span style={{ fontSize: '14px' }}>⏻</span>
          </button>
        </div>
      </div>
    </nav>
  );
}