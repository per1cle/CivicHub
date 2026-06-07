import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HelloPage() {
  const { user } = useAuth();

  return (
    <main className="civic-page" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

      {/* 1. HERO SECTION SCENIC */}
      <section className="hero-panel" style={{ textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="live-pill" style={{ marginBottom: "20px" }}>
          <span></span>
          Sistem e-Government Activ
        </div>

        <h1 style={{ fontSize: "clamp(40px, 5vw, 64px)", maxWidth: "900px", margin: "0 auto 20px" }}>
          Orașul tău, digitalizat.<br />
          <span style={{ color: "#2563eb" }}>Simplu. Rapid. Transparent.</span>
        </h1>

        <p style={{ fontSize: "18px", maxWidth: "700px", margin: "0 auto 40px", color: "#475569" }}>
          Platforma CivicHub aduce serviciile primăriei direct la tine acasă.
          Fără stat la cozi, fără hârtii inutile. Raportează probleme, plătește taxe și obține documente, 100% online.
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {user ? (
            <Link to={user.role === "FUNCTIONAR" ? "/admin/dashboard" : "/dashboard"} style={{ textDecoration: "none" }}>
              <button className="primary-action" style={{ width: "auto", padding: "16px 32px", fontSize: "18px" }}>
                Mergi la Dashboard ➔
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button className="primary-action" style={{ width: "auto", padding: "16px 32px", fontSize: "18px" }}>
                  Intră în cont
                </button>
              </Link>
              <Link to="/register" style={{ textDecoration: "none" }}>
                <button className="secondary-btn" style={{ padding: "16px 32px", fontSize: "18px" }}>
                  Creează cont nou
                </button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 2. PREZENTAREA MODULELOR (GRID) */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p className="eyebrow">Funcționalități Cheie</p>
          <h2 style={{ fontSize: "32px", margin: "10px 0" }}>Tot ce ai nevoie, într-un singur loc</h2>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>

          <article className="stat-card premium-stat" style={{ padding: "30px" }}>
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>🗺️</div>
            <strong style={{ fontSize: "20px", marginBottom: "10px", display: "block" }}>Harta Sesizărilor</strong>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14.5px", lineHeight: 1.6 }}>
              Vezi o groapă sau un stâlp stricat? Pune un pin pe hartă și primăria va interveni. Urmărește statusul în timp real.
            </p>
          </article>

          <article className="stat-card premium-stat" style={{ padding: "30px" }}>
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>🪪</div>
            <strong style={{ fontSize: "20px", marginBottom: "10px", display: "block" }}>Ghișeul Virtual</strong>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14.5px", lineHeight: 1.6 }}>
              Depune cereri pentru buletin, certificate de urbanism sau alte acte. Încarcă documentele și primește aprobarea online.
            </p>
          </article>

          <article className="stat-card premium-stat" style={{ padding: "30px" }}>
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>📅</div>
            <strong style={{ fontSize: "20px", marginBottom: "10px", display: "block" }}>Programări Online</strong>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14.5px", lineHeight: 1.6 }}>
              Ai nevoie să vii fizic la primărie? Rezervă un slot disponibil în calendar și uită de statul la rând pe holuri.
            </p>
          </article>

          <article className="stat-card premium-stat" style={{ padding: "30px" }}>
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>💳</div>
            <strong style={{ fontSize: "20px", marginBottom: "10px", display: "block" }}>Plăți și Taxe</strong>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14.5px", lineHeight: 1.6 }}>
              Verifică-ți restanțele și achită impozitele, taxele auto sau amenzile rapid și securizat. Descarcă chitanța instant.
            </p>
          </article>

        </div>
      </section>

      {/* 3. FOOTER SIMPLU */}
      <footer style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", borderTop: "1px solid #e2e8f0", marginTop: "20px" }}>
        <strong>CivicHub</strong> &copy; {new Date().getFullYear()} — Proiect de digitalizare a administrației publice.
      </footer>

    </main>
  );
}