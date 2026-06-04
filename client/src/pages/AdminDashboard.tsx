import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <main className="civic-page">
      <header className="hero-panel admin-hero">
        <div>
          <div className="eyebrow">Dashboard Administrator</div>
          <h1>Salut, {user?.prenume || user?.nume || "Admin"}!</h1>
          <p>
            Gestionează operațiunile platformei CivicHub. Rol curent: <strong>{user?.role}</strong>.
          </p>
        </div>
        <button className="secondary-btn" style={{ maxWidth: 180 }} onClick={handleLogout}>
          Deconectare
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card premium-stat">
          <div className="stat-value" style={{ color: "#ef4444" }}>12</div>
          <div className="stat-label">Sesizări Noi</div>
          <small>Din ultimele 24h</small>
        </div>
        <div className="stat-card">
          <div className="stat-value">5</div>
          <div className="stat-label">Programări Azi</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">48</div>
          <div className="stat-label">Sesizări Rezolvate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">3</div>
          <div className="stat-label">Notificări de Sistem</div>
        </div>
      </section>

      <section className="dashboard-actions">
        <Link to="/admin/map" className="dashboard-action" style={{ background: "linear-gradient(135deg, #f8fafc, #ef444410)", borderColor: "#ef444440" }}>
          <div className="eyebrow" style={{ color: "#ef4444" }}>Management</div>
          <h2>Harta Sesizărilor</h2>
          <p className="meta-line">Gestionează și actualizează statusul sesizărilor de la cetățeni.</p>
        </Link>

        {/* Vom putea adăuga ulterior rute pentru a gestiona programările și plățile din partea adminului */}
        <Link to="/admin/requests" className="dashboard-action">
          <div className="eyebrow" style={{ color: "#0ea5e9" }}>Ghișeu Virtual</div>
          <h2>Registru Cereri</h2>
          <p className="meta-line">Aprobă, respinge și descarcă documentele depuse de cetățeni.</p>
        </Link>

        <div className="dashboard-action" style={{ opacity: 0.6, cursor: "not-allowed" }}>
          <div className="eyebrow">În curând</div>
          <h2>Evidență Plăți</h2>
          <p className="meta-line">Situația centralizată a plăților de taxe și impozite.</p>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
