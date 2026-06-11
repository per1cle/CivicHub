import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api";

type UserInfo = { nume: string; prenume: string; email: string };
type CitizenInfo = { cnpVirtual: string; telefon: string; user: UserInfo };

type AppointmentData = {
    id: number;
    dataOra: string;
    serviciuAles: string;
    observatii: string | null;
    status: string;
    citizen: CitizenInfo;
};

export default function AppointmentsAdmin() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");

    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("toate");

    const fetchAppointments = async () => {
        try {
            const data = await apiFetch("/appointments");
            if (Array.isArray(data)) {
                setAppointments(data);
            }
        } catch (err) {
            console.error(err);
            setToast("Eroare la încărcarea datelor din server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = async (id: number) => {
        if (!window.confirm("Ești sigur că vrei să anulezi această programare?")) return;

        try {
            await apiFetch(`/appointments/${id}`, {
                method: "DELETE",
            });

            setToast(`Programarea #${id} a fost anulată.`);
            fetchAppointments();
            setTimeout(() => setToast(""), 3000);
        } catch (err) {
            console.error(err);
            setToast("Eroare la anularea programării.");
        }
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter((app) => {
            const matchesService = serviceFilter === "toate" || app.serviciuAles === serviceFilter;

            const query = search.toLowerCase().trim();
            const matchesSearch =
                !query ||
                app.id.toString().includes(query) ||
                app.serviciuAles.toLowerCase().includes(query) ||
                (app.citizen?.user?.nume || "").toLowerCase().includes(query) ||
                (app.citizen?.user?.prenume || "").toLowerCase().includes(query) ||
                (app.citizen?.cnpVirtual || "").toLowerCase().includes(query);

            return matchesService && matchesSearch;
        });
    }, [appointments, serviceFilter, search]);

    const uniqueServices = useMemo(() => {
        return Array.from(new Set(appointments.map((a) => a.serviciuAles)));
    }, [appointments]);

    const formatDateTime = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleDateString("ro-RO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <main className="civic-page">
                <div style={{ padding: "40px", textAlign: "center" }}>Se încarcă evidența programărilor...</div>
            </main>
        );
    }

    return (
        <main className="civic-page">
            <section className="hero-panel admin-hero">
                <div>
                    <p className="eyebrow" style={{ color: "#d8b4fe" }}>CivicHub Admin</p>
                    <h1>Management Programări</h1>
                    <p>
                        Vizualizează, filtrează și gestionează programările cetățenilor. Controlează fluxul la ghișeele fizice direct din platformă.
                    </p>
                </div>

            </section>


            <section className="stats-grid">
                <article className="stat-card premium-stat">
                    <span>Total programări</span>
                    <strong>{appointments.length}</strong>
                    <small>în sistem</small>
                </article>

                <article className="stat-card premium-stat">
                    <span>Programări viitoare</span>
                    <strong style={{ color: "#0ea5e9" }}>{appointments.filter(a => new Date(a.dataOra) >= new Date() && a.status !== "anulata").length}</strong>
                    <small>urmează</small>
                </article>

                <article className="stat-card premium-stat">
                    <span>Anulate</span>
                    <strong style={{ color: "#dc2626" }}>{appointments.filter(a => a.status === "anulata").length}</strong>
                    <small>total anulate</small>
                </article>
            </section>

            {toast && <div className="appointment-toast">{toast}</div>}

            {/* LAYOUT PRINCIPAL */}
            <section className="admin-panel-layout" style={{ marginTop: "2rem", gridTemplateColumns: "1fr" }}>
                {/* LISTA + FILTRE */}
                <section className="admin-map-card" style={{ display: "flex", flexDirection: "column" }}>
                    <div className="map-toolbar">
                        <div>
                            <strong>Registru Programări</strong>
                            <span>Vizualizează și caută prin programările confirmate</span>
                        </div>
                    </div>

                    <div className="map-filters pro-filters admin-filters">
                        <input
                            type="text"
                            placeholder="Caută după nume, CNP, serviciu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                        >
                            <option value="toate">Toate departamentele</option>
                            {uniqueServices.map((srv) => (
                                <option key={srv} value={srv}>{srv}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                        <ul className="admin-issue-list" style={{ margin: 0, padding: 0 }}>
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((app) => (
                                    <li
                                        className="admin-issue-item"
                                        key={app.id}
                                        style={{
                                            padding: "16px",
                                            borderBottom: "1px solid #e2e8f0",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <div style={{ flex: 1, paddingRight: "16px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <strong style={{ fontSize: "16px", color: "#1e293b" }}>#{app.id} - {app.serviciuAles}</strong>
                                            </div>

                                            <p style={{ margin: "4px 0", color: "#475569" }}>
                                                <strong>Cetățean:</strong> {app.citizen?.user?.nume} {app.citizen?.user?.prenume} <span style={{ color: "#cbd5e1", margin: "0 8px" }}>|</span>
                                                <small style={{ color: "#64748b" }}>CNP: {app.citizen?.cnpVirtual}</small>
                                            </p>

                                            <p style={{ margin: "4px 0", color: "#475569" }}>
                                                <strong>Data:</strong> {formatDateTime(app.dataOra)}
                                            </p>

                                            {app.observatii && (
                                                <p style={{ margin: "8px 0 0 0", color: "#64748b", fontStyle: "italic", fontSize: "14px" }}>
                                                    " {app.observatii} "
                                                </p>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end", minWidth: "120px" }}>
                                            <div className={`status-badge ${app.status === "anulata" ? "badge-nou" : "badge-rezolvat"}`} style={{ textAlign: "center", display: "inline-block" }}>
                                                {app.status === "anulata" ? "Anulată" : "Confirmată"}
                                            </div>
                                            {app.status !== "anulata" && (
                                                <button
                                                    className="secondary-btn"
                                                    onClick={() => handleCancel(app.id)}
                                                    style={{
                                                        padding: "6px 12px",
                                                        fontSize: "0.875rem",
                                                        color: "#ef4444",
                                                        borderColor: "#fecaca",
                                                        background: "white"
                                                    }}
                                                >
                                                    Anulează
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                                    Nu a fost găsită nicio programare conform filtrelor.
                                </li>
                            )}
                        </ul>
                    </div>
                </section>
            </section>
        </main>
    );
}
