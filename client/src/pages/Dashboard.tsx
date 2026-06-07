import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReports } from "../store/useReports";
import { usePayments } from "../store/usePayments";
import { useNotifications } from "../hooks/useNotifications";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { reports } = useReports(user?.id);
  const { payments } = usePayments(user?.id);
  const { unreadCount } = useNotifications();

  const [appointmentsCount, setAppointmentsCount] = useState(0);

  useEffect(() => {
    const fetchAppointmentsCount = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(
          `http://localhost:3001/api/appointments?userId=${user.id}`
        );

        if (res.ok) {
          const data = await res.json();
          const activeAppointments = data.filter(
            (a: any) => a.status === "confirmata"
          );
          setAppointmentsCount(activeAppointments.length);
        }
      } catch (err) {
        console.error("Nu am putut aduce programările", err);
      }
    };

    fetchAppointmentsCount();
  }, [user?.id]);

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

{(user as any)?.cnpVirtual && (
  <p
    style={{
      marginTop: "12px",
      fontWeight: 600,
      color: "#2563eb",
    }}
  >
    CNP Virtual: {(user as any).cnpVirtual}
  </p>
)}
        </div>

        <button
          className="secondary-btn"
          style={{ maxWidth: 180 }}
          onClick={handleLogout}
        >
          Deconectare
        </button>
      </header>

      <section className="stats-grid">
        <Link to="/map" className="stat-card premium-stat dashboard-stat-link">
          <span>Sesizări active</span>
          <div
            className="stat-value"
            style={{
              color: "#ef4444",
              fontSize: "38px",
              fontWeight: "800",
              marginTop: "8px",
            }}
          >
            {cereriActive}
          </div>
          <small>Vezi sesizările tale</small>
        </Link>

        <Link
          to="/payments"
          className="stat-card premium-stat dashboard-stat-link"
        >
          <span>Plăți restante</span>
          <div
            className="stat-value"
            style={{
              color: "#f59e0b",
              fontSize: "38px",
              fontWeight: "800",
              marginTop: "8px",
            }}
          >
            {platiRestante}
          </div>
          <small>Rezolvă plățile restante</small>
        </Link>

        <Link
          to="/appointments"
          className="stat-card premium-stat dashboard-stat-link"
        >
          <span>Programări active</span>
          <div
            className="stat-value"
            style={{
              color: "#2563eb",
              fontSize: "38px",
              fontWeight: "800",
              marginTop: "8px",
            }}
          >
            {appointmentsCount}
          </div>
          <small>Vezi programările</small>
        </Link>

        <Link
          to="/notifications"
          className="stat-card premium-stat dashboard-stat-link"
        >
          <span>Notificări noi</span>
          <div
            className="stat-value"
            style={{
              color: unreadCount > 0 ? "#ef4444" : "#64748b",
              fontSize: "38px",
              fontWeight: "800",
              marginTop: "8px",
            }}
          >
            {unreadCount}
          </div>
          <small>Verifică notificările</small>
        </Link>
      </section>

      <section className="dashboard-actions">
        <Link to="/ghiseu" className="dashboard-action">
          <div className="eyebrow" style={{ color: "#2563eb" }}>
            Documente
          </div>
          <h2>Ghișeu virtual</h2>
          <p className="meta-line">Depune cereri și obține acte online.</p>
        </Link>

        <Link to="/map" className="dashboard-action">
          <div className="eyebrow" style={{ color: "#ef4444" }}>
            Sesizări
          </div>
          <h2>Hartă sesizări</h2>
          <p className="meta-line">Raportează și urmărește problemele din oraș.</p>
        </Link>

        <Link to="/appointments" className="dashboard-action">
          <div className="eyebrow" style={{ color: "#f59e0b" }}>
            Programări
          </div>
          <h2>Programări online</h2>
          <p className="meta-line">Rezervă un loc la ghișeu.</p>
        </Link>

        <Link to="/payments" className="dashboard-action">
          <div className="eyebrow" style={{ color: "#16a34a" }}>
            Finanțe
          </div>
          <h2>Plăți și taxe</h2>
          <p className="meta-line">Achită-ți taxele locale rapid.</p>
        </Link>
      </section>
    </main>
  );
};

export default Dashboard;