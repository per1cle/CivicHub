import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const CONFIG_CERERI = [
    {
        id: "buletin",
        name: "Carte de Identitate",
        icon: "🪪",
        description: "Eliberare, reînnoire, schimbare domiciliu",
        textFields: [
            { id: "motiv", label: "Motivul solicitării (ex: Expirare, Pierdere)" },
            { id: "adresa", label: "Adresa completă de domiciliu" },
        ],
        fileFields: [
            { id: "cert_nastere", label: "Certificat de Naștere (PDF/Poză)" },
            { id: "act_casa", label: "Dovada spațiului (Contract V/C, chirie)" },
        ],
    },
    {
        id: "urbanism",
        name: "Certificat Urbanism",
        icon: "🏗️",
        description: "Pentru construire, informare, dezmembrare",
        textFields: [
            { id: "scop", label: "Scopul cererii (ex: Construire Casă)" },
            { id: "nr_cadastral", label: "Număr Cadastral / Topografic" },
        ],
        fileFields: [
            { id: "extras_cf", label: "Extras de Carte Funciară (max 30 zile)" },
            { id: "plan_situatie", label: "Plan de situație (Anexa 1)" },
        ],
    },
    {
        id: "auto",
        name: "Înmatriculare Auto",
        icon: "🚗",
        description: "Luare în evidență fiscală vehicul nou/sh",
        textFields: [
            { id: "marca", label: "Marca și Modelul Autovehiculului" },
            { id: "vin", label: "Serie Șasiu (VIN)" },
        ],
        fileFields: [
            { id: "factura", label: "Factură achiziție / Contract V/C" },
            { id: "civ", label: "Cartea de Identitate a Vehiculului (CIV)" },
        ],
    },
];

export default function GhiseuVirtual() {
    const { user } = useAuth();

    const [selectedRequestId, setSelectedRequestId] = useState<string>("");
    const [textData, setTextData] = useState<Record<string, string>>({});
    const [fileData, setFileData] = useState<Record<string, File | null>>({});

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [requests, setRequests] = useState<any[]>([]);

    const fetchRequests = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`http://localhost:3001/api/requests/history?userId=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (err) {
            console.error("Eroare la preluarea istoricului cererilor:", err);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const activeConfig = CONFIG_CERERI.find((c) => c.id === selectedRequestId);

    const handleSelectType = (id: string) => {
        setSelectedRequestId(id);
        setTextData({});
        setFileData({});
        setMessage("");
        setError("");
    };

    const handleTextChange = (id: string, value: string) => {
        setTextData((prev) => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (id: string, file: File | null) => {
        if (file) {
            setFileData((prev) => ({ ...prev, [id]: file }));
        } else {
            const newFileData = { ...fileData };
            delete newFileData[id];
            setFileData(newFileData);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeConfig) return;

        const missingFiles = activeConfig.fileFields.filter(f => !fileData[f.id]);
        if (missingFiles.length > 0) {
            setError(`Te rugăm să atașezi toate documentele necesare. Lipsește: ${missingFiles[0].label}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        const formData = new FormData();
        formData.append("tip", activeConfig.name);
        formData.append("emailCetatean", user?.email || "test@test.ro");

        // Trimitem obiectul cu label-uri pentru a fi mai ușor de citit de admin
        const detailedTextData: Record<string, string> = {};
        activeConfig.textFields.forEach(field => {
            detailedTextData[field.label] = textData[field.id] || "";
        });

        formData.append("dateCompletate", JSON.stringify(detailedTextData));

        Object.values(fileData).forEach((file) => {
            if (file) {
                formData.append("documente", file);
            }
        });

        try {
            const res = await fetch("http://localhost:3001/api/requests/create", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.mesaj || "Dosarul a fost depus cu succes!");
                setTextData({});
                setFileData({});
                setSelectedRequestId("");
                fetchRequests();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setError(data.error || "A apărut o eroare la depunerea cererii.");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error(err);
            setError("Eroare de conexiune cu serverul primăriei.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="civic-page">
            <section className="hero-panel">
                <div>
                    <p className="eyebrow">CivicHub Ghișeu Virtual</p>
                    <h1>Depunere Documente Online</h1>
                    <p>
                        Selectează tipul cererii, completează datele necesare și încarcă documentele
                        fără să te deplasezi fizic la primărie.
                    </p>
                </div>
                <div className="hero-actions">
                    <span className="live-pill">
                        <span></span>
                        Sistem activ
                    </span>
                </div>
            </section>

            {message && <div className="appointment-toast" style={{ background: "#10b981", color: "#fff" }}>{message}</div>}
            {error && <div className="appointment-toast" style={{ background: "#ef4444", color: "#fff" }}>{error}</div>}

            <section className="appointments-layout">
                {/* Partea stângă: Selecția și Formularul */}
                <section className="appointment-main-card">
                    <div className="appointment-toolbar">
                        <div>
                            <p className="eyebrow">Pasul 1</p>
                            <h2>Selectează tipul cererii</h2>
                        </div>
                    </div>

                    <div className="appointment-service-grid" style={{ marginBottom: "40px" }}>
                        {CONFIG_CERERI.map((cerere) => (
                            <button
                                key={cerere.id}
                                type="button"
                                className={selectedRequestId === cerere.id ? "appointment-service-card active" : "appointment-service-card"}
                                onClick={() => handleSelectType(cerere.id)}
                            >
                                <span>{cerere.icon}</span>
                                <strong>{cerere.name}</strong>
                                <small>{cerere.description}</small>
                            </button>
                        ))}
                    </div>

                    {activeConfig && (
                        <div className="form-section fade-in">
                            <div className="appointment-toolbar">
                                <div>
                                    <p className="eyebrow">Pasul 2</p>
                                    <h2>Completează dosarul</h2>
                                </div>
                            </div>

                            <form id="ghiseu-form" onSubmit={handleSubmit}>
                                <div style={{ display: "grid", gap: "20px", marginBottom: "30px" }}>
                                    {activeConfig.textFields.map((field) => (
                                        <div className="form-group" key={field.id}>
                                            <label>{field.label}</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder={`Introduceți ${field.label.toLowerCase()}`}
                                                value={textData[field.id] || ""}
                                                onChange={(e) => handleTextChange(field.id, e.target.value)}
                                                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="appointment-toolbar" style={{ marginTop: "30px" }}>
                                    <div>
                                        <p className="eyebrow">Pasul 3</p>
                                        <h2>Atașează documentele cerute</h2>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gap: "20px" }}>
                                    {activeConfig.fileFields.map((fileField) => (
                                        <div className="form-group" key={fileField.id}>
                                            <label>
                                                {fileField.label} {fileData[fileField.id] ? "✅ Încărcat" : "❌ Obligatoriu"}
                                            </label>
                                            <div style={{
                                                border: "2px dashed #cbd5e1",
                                                padding: "20px",
                                                borderRadius: "8px",
                                                backgroundColor: fileData[fileField.id] ? "#f0fdf4" : "#f8fafc",
                                                textAlign: "center",
                                                cursor: "pointer",
                                                position: "relative"
                                            }}>
                                                <input
                                                    type="file"
                                                    required={!fileData[fileField.id]}
                                                    onChange={(e) => handleFileChange(fileField.id, e.target.files?.[0] || null)}
                                                    style={{
                                                        position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer"
                                                    }}
                                                />
                                                <div style={{ pointerEvents: "none" }}>
                                                    {fileData[fileField.id] ? (
                                                        <strong style={{ color: "#15803d" }}>Fișier: {fileData[fileField.id]?.name}</strong>
                                                    ) : (
                                                        <span style={{ color: "#64748b" }}>Click aici sau Drag & Drop pentru a încărca fișierul</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </form>
                        </div>
                    )}
                </section>

                <aside className="side-panel appointment-side-panel">
                    <p className="eyebrow">Sumar</p>
                    <h2>Dosarul tău</h2>

                    {!activeConfig ? (
                        <div className="empty-state" style={{ marginTop: "20px", fontSize: "14px", color: "#64748b" }}>
                            Selectează un serviciu din stânga pentru a vedea detaliile dosarului.
                        </div>
                    ) : (
                        <>
                            <div className="selected-service-preview" style={{ marginTop: "20px", marginBottom: "30px" }}>
                                <div className="service-icon">{activeConfig.icon}</div>
                                <div>
                                    <strong>{activeConfig.name}</strong>
                                    <span>Ghișeu virtual</span>
                                </div>
                            </div>

                            <div className="appointment-summary" style={{ marginBottom: "20px" }}>
                                <div>
                                    <span>Status Completare</span>
                                    <strong style={{ color: Object.keys(textData).length === activeConfig.textFields.length ? "#10b981" : "#ef4444" }}>
                                        {Object.keys(textData).length} / {activeConfig.textFields.length} câmpuri
                                    </strong>
                                </div>

                                <div>
                                    <span>Documente Atașate</span>
                                    <strong style={{ color: Object.keys(fileData).length === activeConfig.fileFields.length ? "#10b981" : "#ef4444" }}>
                                        {Object.keys(fileData).length} / {activeConfig.fileFields.length} fișiere
                                    </strong>
                                </div>
                            </div>

                            <div className="payment-benefits" style={{ marginBottom: "30px" }}>
                                <h3 style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", marginBottom: "15px" }}>Important</h3>
                                <div style={{ fontSize: "14px" }}><span>✓</span> Cererea va fi procesată în 3 zile lucrătoare.</div>
                                <div style={{ fontSize: "14px" }}><span>✓</span> Vei fi notificat prin email la soluționare.</div>
                                <div style={{ fontSize: "14px" }}><span>✓</span> Datele tale sunt prelucrate conform GDPR.</div>
                            </div>

                            <button
                                form="ghiseu-form"
                                type="submit"
                                className="primary-action"
                                disabled={loading}
                                style={{ opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? "Se procesează..." : "Trimite Dosarul"}
                            </button>
                        </>
                    )}
                </aside>
            </section>

            {/* Secțiunea de Istoric Cereri - Adăugată cu noul design compatibil */}
            <section className="appointments-history-card" style={{ marginTop: "40px" }}>
                <div className="appointment-toolbar">
                    <div>
                        <p className="eyebrow">Urmărire Status</p>
                        <h2>Cererile mele depuse</h2>
                    </div>
                </div>

                {requests.length === 0 ? (
                    <div className="empty-state">Nu ai depus încă nicio cerere prin ghișeul virtual.</div>
                ) : (
                    <div className="appointments-list">
                        {requests.map((req) => (
                            <article key={req.id} className="appointment-item">
                                <div className="appointment-item-main">
                                    <div className="appointment-date-badge">
                                        <strong>{new Date(req.dataDepunere).getDate()}</strong>
                                        <span>{new Date(req.dataDepunere).toLocaleDateString('ro-RO', { month: 'short' })}</span>
                                    </div>

                                    <div>
                                        <h3>{req.tip}</h3>
                                        <p>Depusă pe: {new Date(req.dataDepunere).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        <small>ID Cerere: #{req.id}</small>
                                    </div>
                                </div>

                                <div className="appointment-actions">
                                    <span className={`status-badge badge-${req.status === 'aprobat' ? 'rezolvat' : (req.status === 'respins' ? 'nou' : 'in-lucru')}`}>
                                        {req.status === 'In asteptare' ? 'În așteptare' : req.status}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}