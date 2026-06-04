import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

type UserInfo = { nume: string; prenume: string; email: string };
type CitizenInfo = { cnpVirtual: string; telefon: string; adresa: string; user: UserInfo };
type RequestData = {
    id: number;
    tip: string;
    dataDepunere: string;
    status: string;
    fisierAtasat: string | null;
    citizen: CitizenInfo;
};

// Mapare culori CSS pe baza App.css
function statusLabel(status: string) {
    return status;
}

function statusClass(status: string) {
    if (status === "Aprobat") return "status-badge badge-rezolvat";
    if (status === "Respins") return "status-badge badge-nou";
    return "status-badge badge-in-lucru";
}

export default function AdminRequestsPage() {
    const { user } = useAuth();

    const [requests, setRequests] = useState<RequestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");

    const [statusFilter, setStatusFilter] = useState("toate");
    const [typeFilter, setTypeFilter] = useState("toate");
    const [search, setSearch] = useState("");
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

    const fetchRequests = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/requests/all");
            if (!res.ok) throw new Error("Eroare la preluarea cererilor");
            const data = await res.json();
            setRequests(data);
            if (data.length > 0 && selectedRequestId === null) {
                setSelectedRequestId(data[0].id);
            }
        } catch (err) {
            console.error(err);
            setToast("Eroare la încărcarea datelor din server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`http://localhost:3001/api/requests/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setToast(`Dosarul #${id} a fost marcat ca: ${newStatus}`);
                fetchRequests();
                setTimeout(() => setToast(""), 3000);
            } else {
                setToast("Eroare la actualizarea statusului.");
            }
        } catch (err) {
            console.error(err);
            setToast("Eroare de conexiune cu serverul.");
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const matchesStatus = statusFilter === "toate" || req.status === statusFilter;
            const matchesType = typeFilter === "toate" || req.tip === typeFilter;

            const query = search.toLowerCase().trim();
            const matchesSearch =
                !query ||
                req.id.toString().includes(query) ||
                req.tip.toLowerCase().includes(query) ||
                req.citizen.user.nume.toLowerCase().includes(query) ||
                req.citizen.user.prenume.toLowerCase().includes(query) ||
                req.citizen.cnpVirtual.toLowerCase().includes(query);

            return matchesStatus && matchesType && matchesSearch;
        });
    }, [requests, statusFilter, typeFilter, search]);

    const selectedRequest = requests.find((r) => r.id === selectedRequestId) || filteredRequests[0];

    const uniqueTypes = useMemo(() => {
        return Array.from(new Set(requests.map((r) => r.tip)));
    }, [requests]);

    const stats = useMemo(
        () => ({
            total: requests.length,
            inAsteptare: requests.filter((r) => r.status === "In asteptare").length,
            aprobate: requests.filter((r) => r.status === "Aprobat").length,
            respinse: requests.filter((r) => r.status === "Respins").length,
        }),
        [requests]
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ro-RO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const resetFilters = () => {
        setStatusFilter("toate");
        setTypeFilter("toate");
        setSearch("");
    };

    const parseFiles = (jsonString: string | null): string[] => {
        if (!jsonString || jsonString === "null" || jsonString === "[]") return [];
        try {
            return JSON.parse(jsonString);
        } catch {
            return [jsonString];
        }
    };

    if (loading) return <div className="civic-page" style={{ padding: "40px", textAlign: "center" }}>Se încarcă modulul administrativ...</div>;

    return (
        <main className="civic-page">
            {/* 1. HERO PANEL */}
            <section className="hero-panel admin-hero">
                <div>
                    <p className="eyebrow">CivicHub Admin</p>
                    <h1>Gestiune Ghișeu Virtual</h1>
                    <p>
                        Monitorizare dosare, verificare documente atașate, filtrare rapidă și
                        actualizare status în timp real pentru cetățeni.
                    </p>
                </div>

                <div className="admin-profile" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div>
                        <strong style={{ display: "block", fontSize: "18px" }}>{user?.nume} {user?.prenume}</strong>
                        <span style={{ fontSize: "14px", color: "#cbd5e1" }}>Funcționar public · Ghișeu digital</span>
                    </div>
                </div>
            </section>

            {/* 2. STATS GRID */}
            <section className="stats-grid">
                <article className="stat-card premium-stat">
                    <span>Total dosare</span>
                    <strong>{stats.total}</strong>
                    <small>în sistem</small>
                </article>

                <article className="stat-card premium-stat">
                    <span>În așteptare</span>
                    <strong style={{ color: "#d97706" }}>{stats.inAsteptare}</strong>
                    <small>necesită verificare</small>
                </article>

                <article className="stat-card premium-stat">
                    <span>Aprobate</span>
                    <strong style={{ color: "#16a34a" }}>{stats.aprobate}</strong>
                    <small>documente eliberate</small>
                </article>

                <article className="stat-card premium-stat">
                    <span>Respinse</span>
                    <strong style={{ color: "#dc2626" }}>{stats.respinse}</strong>
                    <small>dosare incomplete</small>
                </article>
            </section>

            {/* 3. COMMAND GRID */}
            <section className="admin-command-grid">
                <article className="admin-command-card">
                    <span className="command-icon danger">!</span>
                    <div>
                        <strong>{stats.inAsteptare} dosare în așteptare</strong>
                        <p>Prioritate normală, verifică atașamentele cetățenilor.</p>
                    </div>
                </article>

                <article className="admin-command-card">
                    <span className="command-icon blue">↻</span>
                    <div>
                        <strong>{filteredRequests.length} afișate după filtre</strong>
                        <p>Rezultatele se actualizează instant în listă.</p>
                    </div>
                </article>

                <article className="admin-command-card">
                    <span className="command-icon green">✓</span>
                    <div>
                        <strong>Sincronizat cu cetățenii</strong>
                        <p>Schimbarea statusului se vede automat în contul cetățeanului.</p>
                    </div>
                </article>
            </section>

            {toast && <div className="appointment-toast">{toast}</div>}

            {/* 4. LAYOUT PRINCIPAL */}
            <section className="admin-panel-layout">

                {/* PARTEA STÂNGĂ: LISTĂ + FILTRE */}
                <section className="admin-map-card" style={{ display: "flex", flexDirection: "column" }}>
                    <div className="map-toolbar">
                        <div>
                            <strong>Registru Dosare Online</strong>
                            <span>Selectează o cerere pentru a o procesa</span>
                        </div>
                        <div className="map-legend">
                            <span><i className="dot red"></i> Respins</span>
                            <span><i className="dot amber"></i> În așteptare</span>
                            <span><i className="dot green"></i> Aprobat</span>
                        </div>
                    </div>

                    <div className="map-filters pro-filters admin-filters">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Caută dosar, cetățean sau CNP..."
                        />

                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="toate">Toate statusurile</option>
                            <option value="In asteptare">În așteptare</option>
                            <option value="Aprobat">Aprobate</option>
                            <option value="Respins">Respinse</option>
                        </select>

                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="toate">Toate cererile</option>
                            {uniqueTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <button onClick={resetFilters}>Reset</button>
                    </div>

                    <div className="admin-table-list" style={{ flex: 1, overflowY: "auto", padding: "20px", borderTop: "1px solid #e2e8f0" }}>
                        {filteredRequests.length === 0 ? (
                            <div className="empty-state">Nu există cereri care respectă filtrele curente.</div>
                        ) : (
                            filteredRequests.map((req) => (
                                <article
                                    key={req.id}
                                    className={selectedRequestId === req.id ? "admin-table-row active" : "admin-table-row"}
                                    onClick={() => setSelectedRequestId(req.id)}
                                >
                                    <div>
                                        <span>Dosar</span>
                                        <strong>#{req.id}</strong>
                                    </div>

                                    <div className="admin-table-main">
                                        <span>Tip Cerere</span>
                                        <strong>{req.tip}</strong>
                                        <small>{new Date(req.dataDepunere).toLocaleDateString("ro-RO")}</small>
                                    </div>

                                    <div>
                                        <span>Cetățean</span>
                                        <strong>{req.citizen.user.nume} {req.citizen.user.prenume}</strong>
                                    </div>

                                    {/* Div gol pentru a pastra designul coloanelor din App.css */}
                                    <div></div>

                                    <div>
                                        <span>Status</span>
                                        <strong className={statusClass(req.status)}>
                                            {statusLabel(req.status)}
                                        </strong>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                {/* PARTEA DREAPTĂ: DETALII */}
                <aside className="admin-details-panel">
                    <p className="eyebrow">Control operațional</p>
                    <h2>Detalii Dosar</h2>

                    {selectedRequest ? (
                        <div className="admin-selected-card">
                            <div className="admin-selected-top">
                                <div>
                                    <strong>#{selectedRequest.id}</strong>
                                    <h3>{selectedRequest.tip}</h3>
                                </div>
                                <span className={statusClass(selectedRequest.status)}>
                                    {statusLabel(selectedRequest.status)}
                                </span>
                            </div>

                            <div className="admin-coordinates" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                <div>
                                    <span>Cetățean</span>
                                    <strong>{selectedRequest.citizen.user.nume} {selectedRequest.citizen.user.prenume}</strong>
                                </div>

                                <div>
                                    <span>CNP Virtual</span>
                                    <strong>{selectedRequest.citizen.cnpVirtual}</strong>
                                </div>

                                <div>
                                    <span>Dată Depunere</span>
                                    <strong>{formatDate(selectedRequest.dataDepunere)}</strong>
                                </div>

                                <div>
                                    <span>Contact</span>
                                    <strong>{selectedRequest.citizen.telefon}</strong>
                                </div>
                            </div>

                            <div className="admin-coordinates">
                                <span>Adresă de domiciliu</span>
                                <strong>{selectedRequest.citizen.adresa}</strong>
                                <span style={{ marginTop: "6px" }}>Email: {selectedRequest.citizen.user.email}</span>
                            </div>

                            <div className="admin-coordinates">
                                <span>Documente Atașate</span>
                                {parseFiles(selectedRequest.fisierAtasat).length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                                        {parseFiles(selectedRequest.fisierAtasat).map((fisier, index) => (
                                            <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "white", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                                                <span style={{ fontSize: "14px", fontWeight: "700", color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                                                    {fisier}
                                                </span>
                                                <a
                                                    href={`http://localhost:3001/uploads/${fisier}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="secondary-btn"
                                                    style={{ padding: "6px 12px", fontSize: "13px" }}
                                                >
                                                    Deschide act
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <strong style={{ marginTop: "6px", color: "#64748b" }}>Niciun document atașat.</strong>
                                )}
                            </div>

                            {selectedRequest.status === "In asteptare" && (
                                <div className="admin-status-actions" style={{ marginTop: "10px" }}>
                                    <button
                                        className="status-action solved"
                                        onClick={() => handleUpdateStatus(selectedRequest.id, "Aprobat")}
                                    >
                                        Aprobă Dosarul
                                    </button>

                                    <button
                                        className="status-action new"
                                        onClick={() => handleUpdateStatus(selectedRequest.id, "Respins")}
                                    >
                                        Respinge Dosarul
                                    </button>
                                </div>
                            )}

                            {selectedRequest.status !== "In asteptare" && (
                                <div className="empty-state" style={{ marginTop: "10px" }}>
                                    Dosar soluționat ({selectedRequest.status.toLowerCase()}). Nu mai necesită acțiuni.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-state">
                            Nu există dosare pentru filtrele selectate.
                        </div>
                    )}
                </aside>
            </section>
        </main>
    );
}