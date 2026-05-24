import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReports } from "../store/useReports";
import { usePayments } from "../store/usePayments";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { reports } = useReports();
  const { payments } = usePayments();
  
  const [appointmentsCount, setAppointmentsCount] = useState(0);

  useEffect(() => {
    // Fetch doar pentru a afla numarul de programari
    const fetchAppointmentsCount = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/appointments");
        if (res.ok) {
          const data = await res.json();
          setAppointmentsCount(data.length);
        }
      } catch (err) {
        console.error("Nu am putut aduce programarile", err);
      }
    };
    fetchAppointmentsCount();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const cereriActive = reports.filter((r) => r.status !== "rezolvat").length;
  const platiRestante = payments.filter((p) => p.status === "neplatit").length;

  return (
    <main className="civic-page">
      <header className="hero-panel">
        <div>
          <div className="eyebrow">Dashboard personal</div>
          <h1>Bun venit, {user?.prenume || user?.nume || "cetățean"}!</h1>
          <p>
            Ai acces rapid la sesizări, programări și serviciile digitale CivicHub. 
          </p>
        </div>
        <button className="secondary-btn" style={{ maxWidth: 180 }} onClick={handleLogout}>
          Deconectare
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card"><div className="stat-value">{cereriActive}</div><div className="stat-label">Sesizări active</div></div>
        <div className="stat-card"><div className="stat-value">{platiRestante}</div><div className="stat-label">Plăți restante</div></div>
        <div className="stat-card"><div className="stat-value">{appointmentsCount}</div><div className="stat-label">Programări</div></div>
        <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Notificări</div></div>
      </section>

      <section className="dashboard-actions">
        <Link to="/map" className="dashboard-action">
          <h1>Hartă sesizări</h1>
          <p className="meta-line">Raportează probleme pe hartă și urmărește statusul.</p>
        </Link>

        <Link to="/appointments" className="dashboard-action">
          <h1>Programări online</h1>
          <p className="meta-line">Rezervă un slot la ghișeu fără telefon și fără cozi.</p>
        </Link>
        
        <Link to="/payments" className="dashboard-action">
          <h1>Plăți și taxe</h1>
          <p className="meta-line">Achită-ți taxele locale rapid și securizat.</p>
        </Link>
      </section>
    </main>
  );
};

export default Dashboard;


