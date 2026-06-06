import { useMemo, useState } from "react";
import { usePayments } from "../store/usePayments";
import { useAuth } from "../context/AuthContext";
import type { PaymentStatus, PaymentCategory, Payment } from "../store/usePayments";

const categoryLabels: Record<PaymentCategory, string> = {
  locuinta: "Locuință",
  auto: "Auto",
  urbanism: "Urbanism",
  amenzi: "Amenzi",
};

const categoryIcons: Record<PaymentCategory, string> = {
  locuinta: "🏠",
  auto: "🚗",
  urbanism: "🏗️",
  amenzi: "⚖️",
};

function statusLabel(status: PaymentStatus) {
  return status === "platit" ? "Plătit" : "Neplătit";
}

function statusClass(status: PaymentStatus) {
  return status === "platit" ? "status-badge badge-rezolvat" : "status-badge badge-nou";
}

function formatRon(amount: number) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
  }).format(amount);
}

// 1. MODALUL DE PLATĂ (SIMULARE CARD) CU DESIGN PREMIUM
function PaymentModal({
  payment,
  onClose,
  onConfirm,
}: {
  payment: Payment;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  };

  return (
    <div className="receipt-backdrop" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header">
          <div>
            <p className="eyebrow">Plată Securizată</p>
            <h2>Finalizare Tranzacție</h2>
          </div>
          <button onClick={onClose} disabled={loading}>×</button>
        </div>

        <form onSubmit={handlePay} className="receipt-box" style={{ display: "grid", gap: "16px" }}>
          <div className="admin-coordinates" style={{ textAlign: "center", background: "#f8fafc", padding: "20px" }}>
            <span>Sumă de plată pentru {payment.title}</span>
            <strong style={{ fontSize: "32px", color: "#0f172a", marginTop: "8px" }}>
              {formatRon(payment.amount)}
            </strong>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Nume pe card</label>
            <input type="text" required placeholder="EX: POPESCU ION" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Număr Card (Simulare)</label>
            <input type="text" required placeholder="0000 0000 0000 0000" maxLength={19} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Expirare</label>
              <input type="text" required placeholder="MM/YY" maxLength={5} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>CVV</label>
              <input type="password" required placeholder="***" maxLength={3} />
            </div>
          </div>

          <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
            <button type="submit" className="primary-action" disabled={loading}>
              {loading ? "Se procesează..." : `Plătește ${formatRon(payment.amount)}`}
            </button>
            <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>
              Anulează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. MODALUL DE CHITANȚĂ
function ReceiptModal({
  payment,
  onClose,
}: {
  payment: Payment;
  onClose: () => void;
}) {
  return (
    <div className="receipt-backdrop" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header">
          <div>
            <p className="eyebrow">Chitanță digitală</p>
            <h2>CivicHub Payments</h2>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        <div className="receipt-box">
          <div className="receipt-row">
            <span>Cod chitanță</span>
            <strong>{payment.receiptCode}</strong>
          </div>

          <div className="receipt-row">
            <span>Taxă</span>
            <strong>{payment.title}</strong>
          </div>

          <div className="receipt-row">
            <span>Categorie</span>
            <strong>{categoryLabels[payment.category]}</strong>
          </div>

          <div className="receipt-row">
            <span>Sumă achitată</span>
            <strong>{formatRon(payment.amount)}</strong>
          </div>

          <div className="receipt-row">
            <span>Data plății</span>
            <strong>{payment.date}</strong>
          </div>

          <div className="receipt-success">
            ✓ Plata a fost procesată cu succes
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. PAGINA PRINCIPALĂ
export default function PaymentsUser() {
  const { user } = useAuth();

  // Tragem plățile din context folosind ID-ul utilizatorului
  const { payments, pay } = usePayments(user?.id);

  const [statusFilter, setStatusFilter] = useState<"toate" | PaymentStatus>("toate");
  const [categoryFilter, setCategoryFilter] = useState<"toate" | PaymentCategory>("toate");
  const [search, setSearch] = useState("");

  // Stări pentru modale și notificări
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [paymentToProcess, setPaymentToProcess] = useState<Payment | null>(null);
  const [toast, setToast] = useState("");

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus = statusFilter === "toate" || payment.status === statusFilter;
      const matchesCategory = categoryFilter === "toate" || payment.category === categoryFilter;

      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        payment.title.toLowerCase().includes(query) ||
        categoryLabels[payment.category].toLowerCase().includes(query);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [payments, statusFilter, categoryFilter, search]);

  const stats = useMemo(() => {
    const unpaid = payments.filter((payment) => payment.status === "neplatit");
    const paid = payments.filter((payment) => payment.status === "platit");

    return {
      totalDue: unpaid.reduce((sum, payment) => sum + payment.amount, 0),
      paidTotal: paid.reduce((sum, payment) => sum + payment.amount, 0),
      unpaidCount: unpaid.length,
      paidCount: paid.length,
    };
  }, [payments]);

  // Funcția apelată după ce formularul de card este "trimis"
  const handleConfirmPayment = async () => {
    if (!paymentToProcess) return;
    try {
      await pay(paymentToProcess.id);
      setToast(`Plata pentru "${paymentToProcess.title}" a fost finalizată cu succes. Chitanța este disponibilă.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setToast(""), 5000);
    } catch (err) {
      console.error(err);
      setToast("A apărut o eroare la procesarea plății.");
    }
  };

  const resetFilters = () => {
    setStatusFilter("toate");
    setCategoryFilter("toate");
    setSearch("");
  };

  return (
    <main className="civic-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">CivicHub Payments</p>
          <h1>Plăți online taxe și impozite</h1>
          <p>
            Vizualizează taxele restante, achită online și descarcă chitanța
            digitală direct din contul tău.
          </p>
        </div>

        <div className="hero-actions">
          <span className="live-pill">
            <span></span>
            Plăți securizate
          </span>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card premium-stat">
          <span>Total de plată</span>
          <strong>{formatRon(stats.totalDue)}</strong>
          <small>taxe neachitate</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Plăți restante</span>
          <strong>{stats.unpaidCount}</strong>
          <small>necesită achitare</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Total achitat</span>
          <strong>{formatRon(stats.paidTotal)}</strong>
          <small>înregistrat în sistem</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Chitanțe</span>
          <strong>{stats.paidCount}</strong>
          <small>disponibile digital</small>
        </article>
      </section>

      {toast && <div className="appointment-toast">{toast}</div>}

      <section className="payments-layout">
        <section className="payments-main-card">
          <div className="payment-toolbar">
            <div>
              <p className="eyebrow">Taxe disponibile</p>
              <h2>Obligații de plată</h2>
            </div>
          </div>

          <div className="map-filters pro-filters payment-filters">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută taxă sau categorie..."
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "toate" | PaymentStatus)}
            >
              <option value="toate">Toate statusurile</option>
              <option value="neplatit">Neplătit</option>
              <option value="platit">Plătit</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as "toate" | PaymentCategory)}
            >
              <option value="toate">Toate categoriile</option>
              <option value="locuinta">Locuință</option>
              <option value="auto">Auto</option>
              <option value="urbanism">Urbanism</option>
              <option value="amenzi">Amenzi</option>
            </select>

            <button onClick={resetFilters}>Reset</button>
          </div>

          <div className="payments-list">
            {filteredPayments.length === 0 && (
              <div className="empty-state">
                Nu există plăți pentru filtrele selectate.
              </div>
            )}

            {filteredPayments.map((payment) => (
              <article key={payment.id} className="payment-card">
                <div className="payment-icon">
                  {categoryIcons[payment.category]}
                </div>

                <div className="payment-info">
                  <div className="payment-title-row">
                    <div>
                      <h3>{payment.title}</h3>
                      <p>
                        {categoryLabels[payment.category]} · Scadență:{" "}
                        {payment.dueDate}
                      </p>
                    </div>

                    <span className={statusClass(payment.status)}>
                      {statusLabel(payment.status)}
                    </span>
                  </div>

                  <div className="payment-meta-row">
                    <div>
                      <span>Sumă</span>
                      <strong>{formatRon(payment.amount)}</strong>
                    </div>

                    <div>
                      <span>Status</span>
                      <strong>{statusLabel(payment.status)}</strong>
                    </div>

                    <div>
                      <span>Chitanță</span>
                      <strong>{payment.receiptCode ?? "Nedisponibilă"}</strong>
                    </div>
                  </div>
                </div>

                <div className="payment-actions">
                  {payment.status === "neplatit" ? (
                    <button
                      className="payment-pay-btn"
                      onClick={() => {
                        setToast("");
                        setPaymentToProcess(payment);
                      }}
                    >
                      Plătește acum
                    </button>
                  ) : (
                    <button
                      className="payment-receipt-btn"
                      onClick={() => setSelectedReceipt(payment)}
                    >
                      Vezi chitanță
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="side-panel payment-side-panel">
          <p className="eyebrow">Sumar financiar</p>
          <h2>Contul tău</h2>

          <div className="payment-summary-card">
            <span>De plată acum</span>
            <strong>{formatRon(stats.totalDue)}</strong>
            <p>
              Achită taxele restante pentru a evita penalizări sau blocarea
              procesării cererilor.
            </p>
          </div>

          <div className="payment-benefits">
            <h3>Beneficii plăți online</h3>
            <div><span>✓</span> Plata se confirmă instant în cont.</div>
            <div><span>✓</span> Chitanța digitală este generată automat.</div>
            <div><span>✓</span> Istoricul rămâne disponibil permanent.</div>
            <div><span>✓</span> Fără cozi, fără drumuri la ghișeu.</div>
          </div>

          <div className="payment-security-box">
            <strong>🔒 Simulare plată securizată</strong>
            <p>
              Pentru proiect, plata este simulată local. Într-o aplicație reală,
              aici ar fi integrat un procesator de plăți.
            </p>
          </div>
        </aside>
      </section>

      {/* Randerăm modalul de plată dacă există o plată de procesat */}
      {paymentToProcess && (
        <PaymentModal
          payment={paymentToProcess}
          onClose={() => setPaymentToProcess(null)}
          onConfirm={handleConfirmPayment}
        />
      )}

      {/* Randerăm modalul de chitanță dacă este selectată una */}
      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </main>
  );
}