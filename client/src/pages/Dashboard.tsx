import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <div className="eyebrow">Dashboard personal</div>
          <h1 className="page-title">Bun venit, {user?.nume ?? "cetățean"}!</h1>
          <p className="page-subtitle">
            Ai acces rapid la sesizări, programări și serviciile digitale CivicHub. Rol curent: <strong>{user?.role}</strong>.
          </p>
        </div>
        <button className="secondary-btn" style={{ maxWidth: 180 }} onClick={handleLogout}>
          Deconectare
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card"><div className="stat-value">3</div><div className="stat-label">Cereri active</div></div>
        <div className="stat-card"><div className="stat-value">1</div><div className="stat-label">Plăți restante</div></div>
        <div className="stat-card"><div className="stat-value">2</div><div className="stat-label">Programări</div></div>
        <div className="stat-card"><div className="stat-value">5</div><div className="stat-label">Notificări</div></div>
      </section>

      <section className="dashboard-actions">
        <Link to="/map" className="dashboard-action">
          <div className="eyebrow">Modul 3</div>
          <h2>Hartă sesizări</h2>
          <p className="meta-line">Raportează probleme pe hartă și urmărește statusul.</p>
        </Link>

        <Link to="/appointments" className="dashboard-action">
          <div className="eyebrow">Modul 4</div>
          <h2>Programări online</h2>
          <p className="meta-line">Rezervă un slot la ghișeu fără telefon și fără cozi.</p>
        </Link>

        <Link to="/admin/map" className="dashboard-action">
          <div className="eyebrow">Modul 5</div>
          <h2>Panou admin</h2>
          <p className="meta-line">Monitorizare sesizări și actualizare status.</p>
        </Link>
      </section>
    </main>
  );
};

export default Dashboard;
