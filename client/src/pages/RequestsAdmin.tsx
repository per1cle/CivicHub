import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api";

type UserInfo = { nume: string; prenume: string; email: string };
type CitizenInfo = { cnpVirtual: string; telefon: string; adresa: string; user: UserInfo };
type RequestData = {
    id: number;
    tip: string;
    dataDepunere: string;
    status: string;
    fisierAtasat: string | null;
    dateCompletate: string | null;
    citizen: CitizenInfo;
};

// Mapare culori CSS pe baza App.css
function statusLabel(status: string) {
    if (status === "In asteptare") return "În așteptare";
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

    // State pentru procesul de respingere
    const [rejectionModalId, setRejectionModalId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchRequests = useCallback(async () => {
        try {
            const data = await apiFetch("/requests/all");
            if (Array.isArray(data)) {
                setRequests(data);
                if (data.length > 0 && selectedRequestId === null) {
                    setSelectedRequestId(data[0].id);
                }
            }
        } catch (err) {
            console.error(err);
            setToast("Eroare la încărcarea datelor din server.");
        } finally {
            setLoading(false);
        }
    }, [selectedRequestId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleUpdateStatus = async (id: number, newStatus: string, reason?: string) => {
        try {
            await apiFetch(`/requests/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus, motivRespingere: reason }),
            });

            setToast(`Dosarul #${id} a fost marcat ca: ${newStatus}`);
            fetchRequests();
            setRejectionModalId(null);
            setRejectionReason("");
            setTimeout(() => setToast(""), 3000);
        } catch (err) {
            console.error(err);
            setToast("Eroare la actualizarea statusului.");
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

    const selectedRequest = requests.find((r) => r.id === selectedRequestId);

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
        const d = new Date(dateString);
        return d.toLocaleDateString("ro-RO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }) + " la " + d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
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

    const parseCompletate = (jsonString: string | null): Record<string, string> => {
        if (!jsonString || jsonString === "null") return {};
        try {
            return JSON.parse(jsonString);
        } catch {
            return {};
        }
    };

    if (loading) return <div className="civic-page" style={{ padding: "40px", textAlign: "center" }}>Se încarcă modulul administrativ...</div>;

    return (
        <main className="civic-page">
            <header className="hero-panel admin-hero">
                <div>
                    <div className="eyebrow" style={{ color: "#93c5fd" }}>CivicHub Management</div>
                    <h1>Gestiune Ghișeu Virtual</h1>
                    <p>Monitorizează, aprobă și gestionează dosarele digitale depuse de cetățeni.</p>
                </div>
            </header>

            <section className="stats-grid">
                <div className="stat-card premium-stat">
                    <span>Dosare Noi</span>
                    <div className="stat-value" style={{ color: "#ef4444", fontSize: "38px", fontWeight: "800", marginTop: "8px" }}>{stats.inAsteptare}</div>
                    <small>Necesită verificare</small>
                </div>
                <div className="stat-card premium-stat">
                    <span>Total Aprobate</span>
                    <div className="stat-value" style={{ color: "#16a34a", fontSize: "38px", fontWeight: "800", marginTop: "8px" }}>{stats.aprobate}</div>
                    <small>Cereri soluționate</small>
                </div>
                <div className="stat-card premium-stat">
                    <span>Respinse</span>
                    <div className="stat-value" style={{ color: "#64748b", fontSize: "38px", fontWeight: "800", marginTop: "8px" }}>{stats.respinse}</div>
                    <small>Documentație incorectă</small>
                </div>
            </section>

            {toast && (
                <div className="appointment-toast" style={{ background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", marginBottom: "24px" }}>
                    {toast}
                </div>
            )}

            <section className="map-layout">
                <div className="map-shell" style={{ display: "flex", flexDirection: "column", background: 'white' }}>
                    <div className="map-toolbar" style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                            <strong style={{ fontSize: '18px' }}>Registru Cereri Cetățeni</strong>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>Listă centralizată a dosarelor active</span>
                        </div>
                    </div>

                    <div className="pro-filters admin-filters" style={{ borderBottom: "1px solid #f1f5f9", background: '#f8fafc', padding: '16px' }}>
                        <input
                            style={{ borderRadius: '12px', border: '1px solid #cbd5e1', padding: '10px 14px' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Caută dosar, cetățean, CNP..."
                        />
                        <select
                            style={{ borderRadius: '12px', border: '1px solid #cbd5e1', padding: '10px 14px' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="toate">Toate statusurile</option>
                            <option value="In asteptare">În așteptare</option>
                            <option value="Aprobat">Aprobate</option>
                            <option value="Respins">Respinse</option>
                        </select>
                        <select
                            style={{ borderRadius: '12px', border: '1px solid #cbd5e1', padding: '10px 14px' }}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="toate">Toate tipurile</option>
                            {uniqueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button onClick={resetFilters} style={{ background: '#0f172a', color: 'white', borderRadius: '12px', border: 'none', padding: '10px 20px', fontWeight: '800', cursor: 'pointer' }}>Reset</button>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto" }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc' }}>
                                <tr>
                                    <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', borderBottom: '1px solid #e2e8f0' }}>ID / Tip</th>
                                    <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', borderBottom: '1px solid #e2e8f0' }}>Cetățean</th>
                                    <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', borderBottom: '1px solid #e2e8f0' }}>Data</th>
                                    <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: "center", padding: "60px", color: '#94a3b8', fontSize: '16px' }}>Nicio cerere găsită.</td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => {
                                        const isSelected = selectedRequestId === req.id;
                                        return (
                                            <tr
                                                key={req.id}
                                                onClick={() => setSelectedRequestId(req.id)}
                                                style={{
                                                    cursor: "pointer",
                                                    background: isSelected ? "#eff6ff" : "transparent",
                                                    transition: '0.2s',
                                                    borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent'
                                                }}
                                                onMouseOver={(e) => !isSelected && (e.currentTarget.style.background = '#f8fafc')}
                                                onMouseOut={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <td style={{ padding: '22px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '16px' }}>#{req.id}</strong>
                                                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{req.tip}</div>
                                                </td>
                                                <td style={{ padding: '22px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '16px' }}>{req.citizen.user.nume} {req.citizen.user.prenume}</strong>
                                                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>CNP: {req.citizen.cnpVirtual}</div>
                                                </td>
                                                <td style={{ padding: '22px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '15px', color: '#0f172a', fontWeight: '600' }}>
                                                    {new Date(req.dataDepunere).toLocaleDateString("ro-RO")}
                                                </td>
                                                <td style={{ padding: '22px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <span className={statusClass(req.status)} style={{ fontSize: '11px', padding: '6px 14px', fontWeight: '800' }}>{statusLabel(req.status)}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <aside className="side-panel" style={{ padding: '32px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
                    <p className="eyebrow">Procesare Dosar</p>
                    <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Detalii și Acțiuni</h2>

                    {selectedRequest ? (
                        <div className="admin-selected-card">
                            <div className="selected-service-preview" style={{ marginBottom: "20px", background: 'white' }}>
                                <div className="service-icon" style={{ background: "#f8fafc", fontSize: "24px" }}>📄</div>
                                <div>
                                    <strong style={{ fontSize: "18px" }}>{selectedRequest.tip}</strong>
                                    <span>Identificator: #{selectedRequest.id}</span>
                                </div>
                            </div>

                            <div className="appointment-summary" style={{ gap: '12px' }}>
                                <div style={{ background: "white", padding: '16px' }}>
                                    <span style={{ fontSize: '10px' }}>Data Depunerii</span>
                                    <strong style={{ fontSize: '14px' }}>{formatDate(selectedRequest.dataDepunere).split(' la ')[0]}</strong>
                                </div>
                                <div style={{ background: "white", padding: '16px' }}>
                                    <span style={{ fontSize: '10px' }}>Ora Depunerii</span>
                                    <strong style={{ fontSize: '14px' }}>{formatDate(selectedRequest.dataDepunere).split(' la ')[1] || "—"}</strong>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '10px' }}>
                                <label>Profil Cetățean</label>
                                <div style={{ padding: "20px", background: "white", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                                    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>👤</div>
                                        <div>
                                            <strong style={{ display: "block", fontSize: "15px" }}>{selectedRequest.citizen.user.nume} {selectedRequest.citizen.user.prenume}</strong>
                                            <span style={{ fontSize: "12px", color: "#64748b" }}>Utilizator Verificat</span>
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gap: "10px", fontSize: "13px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#64748b" }}>CNP Virtual:</span>
                                            <strong style={{ color: "#0f172a" }}>{selectedRequest.citizen.cnpVirtual}</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#64748b" }}>Telefon:</span>
                                            <strong style={{ color: "#0f172a" }}>{selectedRequest.citizen.telefon}</strong>
                                        </div>
                                        <div style={{ borderTop: "1px dashed #e2e8f0", marginTop: "5px", paddingTop: "10px" }}>
                                            <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>Adresă de corespondență:</span>
                                            <strong style={{ color: "#0f172a", fontSize: "12px", lineHeight: "1.5", display: "block" }}>{selectedRequest.citizen.adresa}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Date Formular Cerere</label>
                                <div style={{ padding: "16px", background: "white", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                                    {Object.keys(parseCompletate(selectedRequest.dateCompletate)).length > 0 ? (
                                        <div style={{ display: "grid", gap: "10px" }}>
                                            {Object.entries(parseCompletate(selectedRequest.dateCompletate)).map(([key, value]) => (
                                                <div key={key} style={{ fontSize: "13px" }}>
                                                    <span style={{ color: "#64748b", display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>{key}:</span>
                                                    <strong style={{ color: "#0f172a" }}>{value}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>Nicio informație suplimentară furnizată.</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Bibliotecă Documente</label>
                                {parseFiles(selectedRequest.fisierAtasat).length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {parseFiles(selectedRequest.fisierAtasat).map((f, i) => (
                                            <a
                                                key={i}
                                                href={`http://localhost:3001/uploads/${f}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    textDecoration: "none",
                                                    fontSize: "12px",
                                                    padding: "12px 16px",
                                                    borderRadius: "14px",
                                                    background: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    color: '#0f172a'
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <span style={{ fontSize: "16px" }}>📎</span>
                                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px", whiteSpace: "nowrap", fontWeight: 700 }}>{f}</span>
                                                </div>
                                                <span style={{ color: "#2563eb", fontWeight: "800" }}>VEZI</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="notice-box" style={{ padding: "15px", textAlign: "center", fontSize: "13px" }}>
                                        Niciun document atașat.
                                    </div>
                                )}
                            </div>

                            {selectedRequest.status === "In asteptare" ? (
                                <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
                                    <button className="primary-action" style={{ padding: '16px' }} onClick={() => handleUpdateStatus(selectedRequest.id, "Aprobat")}>
                                        Aprobă Dosarul
                                    </button>
                                    <button
                                        className="logout-btn"
                                        style={{ width: "100%", padding: "14px", background: 'white' }}
                                        onClick={() => setRejectionModalId(selectedRequest.id)}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#ef4444'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        Respinge Dosarul
                                    </button>
                                </div>
                            ) : (
                                <div style={{ marginTop: "24px", textAlign: "center", padding: "20px", borderRadius: '24px', background: selectedRequest.status === "Aprobat" ? "#f0fdf4" : "#fef2f2", border: "1px solid", borderColor: selectedRequest.status === "Aprobat" ? "#bbf7d0" : "#fecaca" }}>
                                    <span style={{ fontSize: "20px", display: "block", marginBottom: "8px" }}>{selectedRequest.status === "Aprobat" ? "✅" : "❌"}</span>
                                    <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>Status Final</span>
                                    <strong style={{ color: selectedRequest.status === "Aprobat" ? "#16a34a" : "#dc2626", fontSize: '18px' }}>{selectedRequest.status.toUpperCase()}</strong>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: "80px 20px", textAlign: 'center', color: '#94a3b8' }}>
                            <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px', opacity: 0.5 }}>📂</span>
                            <p style={{ margin: 0, fontWeight: 700 }}>Selectează un dosar din registru pentru detalii.</p>
                        </div>
                    )}
                </aside>
            </section>

            {rejectionModalId && (
                <div 
                    className="modal-overlay" 
                    onClick={() => setRejectionModalId(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <div 
                        className="receipt-modal" 
                        style={{ 
                            maxWidth: "450px", 
                            width: '90%',
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            overflow: 'hidden',
                            animation: 'modalSlideUp 0.3s ease-out'
                        }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="receipt-header" style={{ padding: '40px 30px 20px' }}>
                            <div className="receipt-logo">❌</div>
                            <h2>Respingere Dosar</h2>
                            <p>Te rugăm să specifici motivul respingerii pentru dosarul <strong>#{rejectionModalId}</strong></p>
                        </div>

                        <div className="receipt-body" style={{ padding: '0 40px 30px' }}>
                            <div className="form-group">
                                <label>Motivul respingerii (va fi trimis cetățeanului)</label>
                                <textarea
                                    placeholder="Ex: Documentul 'Act Casa' este expirat sau ilizibil..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    style={{ minHeight: "150px", borderRadius: '18px', border: '1.5px solid #cbd5e1' }}
                                />
                            </div>
                        </div>

                        <div className="receipt-footer" style={{ padding: '0 40px 40px' }}>
                            <button
                                className="primary-action"
                                style={{ background: "#ef4444", padding: '16px' }}
                                onClick={() => handleUpdateStatus(rejectionModalId, "Respins", rejectionReason)}
                                disabled={!rejectionReason.trim()}
                            >
                                Confirmă Respingerea
                            </button>
                            <button
                                className="secondary-btn"
                                style={{ width: "100%", marginTop: "10px", padding: '14px' }}
                                onClick={() => setRejectionModalId(null)}
                            >
                                Anulează
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
