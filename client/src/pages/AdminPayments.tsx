import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

type PaymentStatus = "neplatit" | "platit";
type PaymentCategory = "locuinta" | "auto" | "urbanism" | "amenzi";

type AdminPayment = {
    id: number;
    title: string;
    amount: number;
    dueDate: string;
    status: PaymentStatus;
    category: PaymentCategory;
    receiptCode?: string | null;
    citizen: {
        cnpVirtual: string;
        user: {
            nume: string;
            prenume: string;
            email: string;
        };
    };
};

const categoryLabels: Record<PaymentCategory, string> = {
    locuinta: "Locuință",
    auto: "Auto",
    urbanism: "Urbanism",
    amenzi: "Amenzi",
};

function statusLabel(status: PaymentStatus) {
    return status === "platit" ? "Plătit" : "Neplătit";
}

function statusClass(status: PaymentStatus) {
    return status === "platit" ? "status-badge badge-rezolvat" : "status-badge badge-nou";
}

function formatRon(amount: number) {
    return new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(amount);
}

export default function AdminPaymentsPage() {
    const { user } = useAuth();

    const [payments, setPayments] = useState<AdminPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");

    const [statusFilter, setStatusFilter] = useState<"toate" | PaymentStatus>("toate");
    const [categoryFilter, setCategoryFilter] = useState<"toate" | PaymentCategory>("toate");
    const [search, setSearch] = useState("");
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

    const [isIssuing, setIsIssuing] = useState(false);
    const [newTaxData, setNewTaxData] = useState({
        nume: "",
        prenume: "",
        cnpVirtual: "",
        title: "",
        amount: "",
        category: "amenzi" as PaymentCategory,
        dueDate: "",
    });

    const [reminderSent, setReminderSent] = useState(false);

    // Aducem datele REALE din backend
    const fetchPayments = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/payments");
            if (!res.ok) throw new Error("Eroare la preluarea plăților");

            const data = await res.json();
            setPayments(data);

            if (data.length > 0 && selectedPaymentId === null) {
                setSelectedPaymentId(data[0].id);
            }
        } catch (err) {
            console.error(err);
            setToast("Eroare la preluarea plăților din baza de date.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filteredPayments = useMemo(() => {
        return payments.filter((p) => {
            const matchesStatus = statusFilter === "toate" || p.status === statusFilter;
            const matchesCategory = categoryFilter === "toate" || p.category === categoryFilter;

            const query = search.toLowerCase().trim();

            // Asigurare că user și citizen există (pentru a evita erori dacă o plată are date incomplete)
            const nume = p.citizen?.user?.nume || "";
            const prenume = p.citizen?.user?.prenume || "";
            const cnpVirtual = p.citizen?.cnpVirtual || "";

            const numeComplet = `${nume} ${prenume}`.toLowerCase();

            const matchesSearch = !query ||
                p.title.toLowerCase().includes(query) ||
                numeComplet.includes(query) ||
                cnpVirtual.toLowerCase().includes(query);

            return matchesStatus && matchesCategory && matchesSearch;
        });
    }, [payments, statusFilter, categoryFilter, search]);

    const selectedPayment = payments.find((p) => p.id === selectedPaymentId) || filteredPayments[0];

    const stats = useMemo(() => {
        const unpaid = payments.filter((p) => p.status === "neplatit");
        const paid = payments.filter((p) => p.status === "platit");
        return {
            total: payments.length,
            unpaidCount: unpaid.length,
            unpaidSum: unpaid.reduce((sum, p) => sum + p.amount, 0),
            paidSum: paid.reduce((sum, p) => sum + p.amount, 0),
        };
    }, [payments]);

    // Trimitem POST-ul către backend pentru a emite taxa în baza de date
    const handleIssueTax = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3001/api/payments/issue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTaxData),
            });

            if (res.ok) {
                setToast(`Taxa "${newTaxData.title}" a fost emisă cu succes!`);
                setIsIssuing(false);
                setNewTaxData({ nume: "", prenume: "", cnpVirtual: "", title: "", amount: "", category: "amenzi", dueDate: "" });
                fetchPayments();
                setTimeout(() => setToast(""), 4000);
            } else {
                const errorData = await res.json();
                setToast(errorData.error || "Eroare la emiterea taxei.");
            }
        } catch (err) {
            console.error(err);
            setToast("Eroare de conexiune cu serverul.");
        }
    };

    const handleSendReminder = async () => {
        if (!selectedPayment) return;

        try {
            const res = await fetch(`http://localhost:3001/api/payments/${selectedPayment.id}/reminder`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                setToast(`Memento trimis cu succes către ${selectedPayment.citizen.user.email}`);
                setReminderSent(true);
                setTimeout(() => {
                    setToast("");
                    setReminderSent(false);
                }, 4000);
            } else {
                const errorData = await res.json();
                setToast(errorData.error || "Eroare la trimiterea mementoului.");
            }
        } catch (err) {
            console.error(err);
            setToast("Eroare de conexiune cu serverul.");
        }
    };

    if (loading) return <div className="civic-page" style={{ padding: "40px", textAlign: "center" }}>Se încarcă evidența financiară...</div>;

    return (
        <main className="civic-page">
            <section className="hero-panel admin-hero">
                <div>
                    <p className="eyebrow">CivicHub Admin</p>
                    <h1>Evidență Financiară & Taxe</h1>
                    <p>
                        Gestionează registrul de plăți, monitorizează restanțierii și emite noi obligații
                        fiscale sau amenzi direct în conturile cetățenilor.
                    </p>
                </div>


            </section>

            <section className="stats-grid">
                <article className="stat-card premium-stat">
                    <span>De încasat (Restanțe)</span>
                    <strong style={{ color: "#dc2626" }}>{formatRon(stats.unpaidSum)}</strong>
                    <small>{stats.unpaidCount} taxe neachitate</small>
                </article>

                <article className="stat-card premium-stat">
                    <span>Total Încasat</span>
                    <strong style={{ color: "#16a34a" }}>{formatRon(stats.paidSum)}</strong>
                    <small>venituri buget local</small>
                </article>

                <article className="stat-card premium-stat" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button
                        className="primary-action"
                        onClick={() => { setIsIssuing(true); setSelectedPaymentId(null); }}
                    >
                        + Emite Taxă Nouă
                    </button>
                </article>
            </section>

            {toast && <div className="appointment-toast">{toast}</div>}

            <section className="admin-panel-layout">
                <section className="admin-map-card" style={{ display: "flex", flexDirection: "column", height: "800px" }}>
                    <div className="map-toolbar">
                        <div>
                            <strong>Registru Global de Plăți</strong>
                        </div>
                    </div>

                    <div className="map-filters pro-filters admin-filters" style={{ gridTemplateColumns: "1fr 0.8fr 0.8fr auto" }}>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Caută cetățean, CNP sau taxă..."
                        />

                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                            <option value="toate">Toate statusurile</option>
                            <option value="neplatit">Neplătite (Restanțe)</option>
                            <option value="platit">Plătite (Încasate)</option>
                        </select>

                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)}>
                            <option value="toate">Toate categoriile</option>
                            <option value="locuinta">Locuință</option>
                            <option value="auto">Auto</option>
                            <option value="urbanism">Urbanism</option>
                            <option value="amenzi">Amenzi</option>
                        </select>

                        <button onClick={() => { setStatusFilter("toate"); setCategoryFilter("toate"); setSearch(""); }}>Reset</button>
                    </div>

                    <div className="admin-table-list" style={{ flex: 1, overflowY: "auto", padding: "20px", borderTop: "1px solid #e2e8f0" }}>
                        {filteredPayments.length === 0 ? (
                            <div className="empty-state">Nicio înregistrare găsită.</div>
                        ) : (
                            filteredPayments.map((p) => (
                                <article
                                    key={p.id}
                                    className={selectedPaymentId === p.id && !isIssuing ? "admin-table-row active" : "admin-table-row"}
                                    onClick={() => { setSelectedPaymentId(p.id); setIsIssuing(false); }}
                                    style={{ gridTemplateColumns: "0.5fr 2fr 1fr 1fr auto" }}
                                >
                                    <div>
                                        <span>ID</span>
                                        <strong>#{p.id}</strong>
                                    </div>

                                    <div className="admin-table-main">
                                        <span>Obligație Fiscală</span>
                                        <strong>{p.title}</strong>
                                        <small>{categoryLabels[p.category]} • Scadență: {new Date(p.dueDate).toLocaleDateString('ro-RO')}</small>
                                    </div>

                                    <div>
                                        <span>Cetățean</span>
                                        <strong>{p.citizen?.user?.nume} {p.citizen?.user?.prenume}</strong>
                                    </div>

                                    <div>
                                        <span>Sumă</span>
                                        <strong style={{ fontSize: "16px" }}>{formatRon(p.amount)}</strong>
                                    </div>

                                    <div>
                                        <span>Status</span>
                                        <strong className={statusClass(p.status)}>
                                            {statusLabel(p.status)}
                                        </strong>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                <aside className="admin-details-panel">
                    {isIssuing ? (
                        <>
                            <p className="eyebrow" style={{ color: "#ef4444" }}>Acțiune Administrativă</p>
                            <h2>Emitere Taxă / Amendă</h2>

                            <div className="admin-coordinates" style={{ marginBottom: "20px", background: "#fef2f2", borderColor: "#fecaca" }}>
                                <span style={{ color: "#991b1b" }}>Atenție</span>
                                <strong style={{ color: "#7f1d1d" }}>Taxa emisă va apărea instant în contul cetățeanului ca obligație de plată.</strong>
                            </div>

                            <form onSubmit={handleIssueTax} style={{ display: "grid", gap: "16px" }}>
                                <div className="form-group">
                                    <label>Nume </label>
                                    <input required type="text" value={newTaxData.nume} onChange={e => setNewTaxData({ ...newTaxData, nume: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label>Prenume </label>
                                    <input required type="text" value={newTaxData.prenume} onChange={e => setNewTaxData({ ...newTaxData, prenume: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label>CNP Virtual Cetățean</label>
                                    <input required type="text" value={newTaxData.cnpVirtual} onChange={e => setNewTaxData({ ...newTaxData, cnpVirtual: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label>Titlu Obligație / Amendă</label>
                                    <input required type="text" placeholder="Ex: Amendă depășire viteză" value={newTaxData.title} onChange={e => setNewTaxData({ ...newTaxData, title: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label>Sumă (RON)</label>
                                    <input required type="number" placeholder="Ex: 250" value={newTaxData.amount} onChange={e => setNewTaxData({ ...newTaxData, amount: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label>Categorie</label>
                                    <select value={newTaxData.category} onChange={e => setNewTaxData({ ...newTaxData, category: e.target.value as PaymentCategory })}>
                                        <option value="amenzi">Amenzi</option>
                                        <option value="auto">Auto</option>
                                        <option value="locuinta">Locuință</option>
                                        <option value="urbanism">Urbanism</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Data Scadenței</label>
                                    <input required type="date" value={newTaxData.dueDate} onChange={e => setNewTaxData({ ...newTaxData, dueDate: e.target.value })} />
                                </div>

                                <div className="admin-status-actions" style={{ marginTop: "10px" }}>
                                    <button type="submit" className="status-action new" style={{ background: "#dc2626" }}>
                                        Confirmă și Emite
                                    </button>
                                    <button type="button" className="secondary-btn" onClick={() => setIsIssuing(false)}>
                                        Anulează
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : selectedPayment ? (
                        <div className="admin-selected-card">
                            <p className="eyebrow">Fișă de rol</p>
                            <h2>Detalii Obligație</h2>

                            <div className="admin-selected-top" style={{ marginTop: "20px" }}>
                                <div>
                                    <strong>Taxă #{selectedPayment.id}</strong>
                                    <h3>{selectedPayment.title}</h3>
                                </div>
                                <span className={statusClass(selectedPayment.status)}>
                                    {statusLabel(selectedPayment.status)}
                                </span>
                            </div>

                            <div className="report-meta-grid" style={{ marginTop: "20px" }}>
                                <div>
                                    <span>Cetățean: </span>
                                    <strong>{selectedPayment.citizen?.user?.nume} {selectedPayment.citizen?.user?.prenume}</strong>
                                </div>
                                <div>
                                    <span>CNP Virtual: </span>
                                    <strong>{selectedPayment.citizen?.cnpVirtual}</strong>
                                </div>
                                <div>
                                    <span>Categorie: </span>
                                    <strong>{categoryLabels[selectedPayment.category]}</strong>
                                </div>
                                <div>
                                    <span>Sumă Totală: </span>
                                    <strong style={{ fontSize: "18px" }}>{formatRon(selectedPayment.amount)}</strong>
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <span>Data Scadenței: </span>
                                    <strong style={selectedPayment.status === "neplatit" && new Date(selectedPayment.dueDate) < new Date() ? { color: "#dc2626" } : {}}>
                                        {new Date(selectedPayment.dueDate).toLocaleDateString("ro-RO")}
                                        {selectedPayment.status === "neplatit" && new Date(selectedPayment.dueDate) < new Date() && " (Depășită)"}
                                    </strong>
                                </div>
                            </div>

                            {selectedPayment.status === "platit" && (
                                <div className="admin-coordinates" style={{ marginTop: "20px", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                                    <span style={{ color: "#166534" }}>Chitanță Electronică Generată</span>
                                    <strong style={{ color: "#15803d", fontSize: "18px", marginTop: "8px" }}>{selectedPayment.receiptCode}</strong>
                                    <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#166534" }}>Plata a fost procesată și înregistrată automat în sistem.</p>
                                </div>
                            )}

                            {selectedPayment.status === "neplatit" && (
                                <div className="admin-status-actions" style={{ marginTop: "30px" }}>
                                    <button
                                        className="status-action progress"
                                        onClick={handleSendReminder}
                                        disabled={reminderSent}
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: reminderSent ? 0.7 : 1 }}
                                    >
                                        {reminderSent ? "✓ Memento Trimis" : "✉️ Trimite Memento Plată"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-state">
                            Selectează o plată din registru sau emite una nouă.
                        </div>
                    )}
                </aside>
            </section>
        </main>
    );
}