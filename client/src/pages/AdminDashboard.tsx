import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReports } from "../store/useReports";
import { useNotifications } from "../hooks/useNotifications";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { reports } = useReports();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/appointments");
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (err) {
        console.error("Eroare fetch appointments admin", err);
      }
    };
    fetchAppointments();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const sesizariNoi = reports.filter(r => r.status === 'nou').length;
  const sesizariRezolvate = reports.filter(r => r.status === 'rezolvat').length;
  const programariAzi = appointments.filter(a => {
    const date = new Date(a.dataOra).toISOString().slice(0, 10);
    return date === todayStr && a.status !== 'anulata';
  }).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'CERERE': return { char: '📄', bg: '#dbeafe', color: '#1e40af' };
      case 'SESIZARE': return { char: '📍', bg: '#fee2e2', color: '#991b1b' };
      case 'PLATA': return { char: '💰', bg: '#dcfce7', color: '#166534' };
      case 'PROGRAMARE': return { char: '📅', bg: '#fef3c7', color: '#92400e' };
      default: return { char: '🔔', bg: '#f1f5f9', color: '#475569' };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Acum';
    if (diffMins < 60) return `Acum ${diffMins}m`;
    if (diffHours < 24) return `Acum ${diffHours}h`;
    return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  };

  return (
    <main className="civic-page">
      <header className="hero-panel admin-hero">
        <div>
          <div className="eyebrow" style={{ color: '#93c5fd' }}>Dashboard Administrator</div>
          <h1>Salut, {user?.prenume || user?.nume || "Admin"}!</h1>
          <p>
            Gestionează operațiunile platformei CivicHub. Ai <strong>{unreadCount}</strong> activități noi care necesită atenție.
          </p>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '10px 24px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = 'white';
          }}
        >
          Deconectare
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card premium-stat">
          <span>Sesizări Noi</span>
          <div className="stat-value" style={{ color: "#ef4444", fontSize: "38px", fontWeight: "800", marginTop: "8px" }}>{sesizariNoi}</div>
          <small>În așteptare</small>
        </div>
        <div className="stat-card premium-stat">
          <span>Programări Azi</span>
          <div className="stat-value" style={{ color: "#2563eb", fontSize: "38px", fontWeight: "800", marginTop: "8px" }}>{programariAzi}</div>
          <small>Confirmate</small>
        </div>
        <div className="stat-card premium-stat">
          <span>Sesizări Rezolvate</span>
          <div className="stat-value" style={{ color: "#16a34a", fontSize: "38px", fontWeight: "800", marginTop: "8px" }}>{sesizariRezolvate}</div>
          <small>Total istoric</small>
        </div>
      </section>

      <section className="map-layout">
        <div className="map-shell" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          <div className="map-toolbar">
            <div>
              <strong style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>Panou de Comandă</strong>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Acces rapid la modulele administrative</span>
            </div>
          </div>

          <div className="dashboard-actions" style={{ gridTemplateColumns: 'repeat(2, 1fr)', padding: '24px', gap: '20px', marginTop: 0 }}>
            <Link to="/admin/map" className="dashboard-action" style={{ padding: '24px', background: "white" }}>
              <div className="eyebrow" style={{ color: "#ef4444", fontSize: '11px' }}>Management</div>
              <h2 style={{ fontSize: '22px', margin: '12px 0' }}>Harta Sesizărilor</h2>
              <p className="meta-line">Actualizează statusul sesizărilor de la cetățeni.</p>
            </Link>

            <Link to="/admin/requests" className="dashboard-action" style={{ padding: '24px' }}>
              <div className="eyebrow" style={{ color: "#0ea5e9", fontSize: '11px' }}>Ghișeu Virtual</div>
              <h2 style={{ fontSize: '22px', margin: '12px 0' }}>Registru Cereri</h2>
              <p className="meta-line">Aprobă și gestionează documentele digitale.</p>
            </Link>

            <Link to="/admin/appointments" className="dashboard-action" style={{ padding: '24px' }}>
              <div className="eyebrow" style={{ color: "#8b5cf6", fontSize: '11px' }}>Ghișeu Virtual</div>
              <h2 style={{ fontSize: '22px', margin: '12px 0' }}>Programări</h2>
              <p className="meta-line">Vizualizează și anulează rezervările online.</p>
            </Link>

            <Link to="/admin/payments" className="dashboard-action" style={{ padding: '24px' }}>
              <div className="eyebrow" style={{ color: "#16a34a", fontSize: '11px' }}>Finanțe</div>
              <h2 style={{ fontSize: '22px', margin: '12px 0' }}>Gestiune Plăți</h2>
              <p className="meta-line">Evidența centralizată a taxelor și impozitelor.</p>
            </Link>
          </div>
        </div>

        <aside className="side-panel" style={{ padding: 0 }}>
          <div className="map-toolbar" style={{ borderBottom: '1px solid #f1f5f9', padding: '24px 20px' }}>
            <div>
              <strong style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>Flux Activitate</strong>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Ultimele acțiuni ale cetățenilor</span>
            </div>
            {unreadCount > 0 && (
              <span style={{ 
                fontSize: '11px', 
                background: '#fee2e2', 
                color: '#b91c1c', 
                padding: '6px 12px', 
                borderRadius: '999px',
                fontWeight: 900
              }}>
                {unreadCount} NOI
              </span>
            )}
          </div>

          <div style={{ maxHeight: '560px', overflowY: 'auto', background: 'transparent' }}>
            {notifications.length > 0 ? (
              notifications.map(n => {
                const icon = getIcon(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                    style={{
                      padding: '18px 20px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      transition: 'all 0.2s',
                      background: !n.isRead ? '#f0f7ff' : 'transparent',
                      borderLeft: !n.isRead ? '4px solid #2563eb' : '4px solid transparent'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = !n.isRead ? '#e0f2fe' : '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = !n.isRead ? '#f0f7ff' : 'transparent'}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                      background: icon.bg,
                      color: icon.color,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                    }}>
                      {icon.char}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#0f172a' }}>
                        {n.title}
                      </strong>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                        {n.message}
                      </p>
                      <span style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    {!n.isRead && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#2563eb',
                        borderRadius: '50%',
                        marginTop: '6px'
                      }}></div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <span style={{ display: 'block', fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}>📂</span>
                <p style={{ margin: 0, fontWeight: 700 }}>Nicio activitate recentă.</p>
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
};

export default AdminDashboard;
