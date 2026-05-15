import { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useReports } from "../store/useReports";
import type { ReportStatus, ReportPriority } from "../store/useReports";

const categories = [
  "Drumuri",
  "Iluminat public",
  "Salubritate",
  "Spații verzi",
  "Transport public",
  "Altele",
];

function createMarkerIcon(status: ReportStatus) {
  const colors: Record<ReportStatus, string> = {
    nou: "#ef4444",
    "in lucru": "#f59e0b",
    rezolvat: "#22c55e",
  };

  return L.divIcon({
    className: "",
    html: `
      <div class="custom-marker" style="--marker-color:${colors[status]}">
        <div class="custom-marker-core"></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function statusLabel(status: ReportStatus) {
  if (status === "nou") return "Nou";
  if (status === "in lucru") return "În lucru";
  return "Rezolvat";
}

function priorityLabel(priority: ReportPriority) {
  if (priority === "scazuta") return "Scăzută";
  if (priority === "medie") return "Medie";
  return "Ridicată";
}

function statusClass(status: ReportStatus) {
  return `status-badge badge-${status.replaceAll(" ", "-")}`;
}

function priorityClass(priority: ReportPriority) {
  return `priority-badge priority-${priority}`;
}

export default function ReportsMapAdmin() {
  const { reports, updateStatus } = useReports();

  const [statusFilter, setStatusFilter] = useState<"toate" | ReportStatus>(
    "toate"
  );
  const [categoryFilter, setCategoryFilter] = useState("toate");
  const [search, setSearch] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "toate" || report.status === statusFilter;

      const matchesCategory =
        categoryFilter === "toate" || report.category === categoryFilter;

      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        report.title.toLowerCase().includes(query) ||
        report.category.toLowerCase().includes(query) ||
        report.citizenName.toLowerCase().includes(query);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [reports, statusFilter, categoryFilter, search]);

  const selectedReport =
    reports.find((report) => report.id === selectedReportId) ??
    filteredReports[0];

  const stats = useMemo(
    () => ({
      total: reports.length,
      newReports: reports.filter((r) => r.status === "nou").length,
      inProgress: reports.filter((r) => r.status === "in lucru").length,
      solved: reports.filter((r) => r.status === "rezolvat").length,
      urgent: reports.filter((r) => r.priority === "ridicata").length,
    }),
    [reports]
  );

  const handleStatusChange = (id: number, status: ReportStatus) => {
    updateStatus(id, status);
    setToast(`Status actualizat: ${statusLabel(status)}.`);
  };

  const resetFilters = () => {
    setStatusFilter("toate");
    setCategoryFilter("toate");
    setSearch("");
  };

  return (
    <main className="civic-page">
      <section className="hero-panel admin-hero">
        <div>
          <p className="eyebrow">CivicHub Admin</p>
          <h1>Panou funcționar / Admin</h1>
          <p>
            Monitorizare sesizări, prioritizare intervenții, filtrare rapidă și
            actualizare status în timp real pentru cetățeni.
          </p>
        </div>

        <div className="admin-profile">
          <div className="avatar">M</div>
          <div>
            <strong>Maria Ionescu</strong>
            <span>Funcționar public · Ghișeu digital</span>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card premium-stat">
          <span>Total sesizări</span>
          <strong>{stats.total}</strong>
          <small>în sistem</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Noi</span>
          <strong>{stats.newReports}</strong>
          <small>necesită verificare</small>
        </article>

        <article className="stat-card premium-stat">
          <span>În lucru</span>
          <strong>{stats.inProgress}</strong>
          <small>intervenții active</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Rezolvate</span>
          <strong>{stats.solved}</strong>
          <small>finalizate</small>
        </article>
      </section>

      <section className="admin-command-grid">
        <article className="admin-command-card">
          <span className="command-icon danger">!</span>
          <div>
            <strong>{stats.urgent} sesizări urgente</strong>
            <p>Prioritate ridicată, necesită intervenție rapidă.</p>
          </div>
        </article>

        <article className="admin-command-card">
          <span className="command-icon blue">↻</span>
          <div>
            <strong>{filteredReports.length} afișate după filtre</strong>
            <p>Rezultatele se actualizează instant în hartă și listă.</p>
          </div>
        </article>

        <article className="admin-command-card">
          <span className="command-icon green">✓</span>
          <div>
            <strong>Sincronizat cu cetățenii</strong>
            <p>Schimbarea statusului se vede automat în modulul de hartă.</p>
          </div>
        </article>
      </section>

      {toast && <div className="appointment-toast">{toast}</div>}

      <section className="admin-panel-layout">
        <section className="admin-map-card">
          <div className="map-toolbar">
            <div>
              <strong>Hartă operațională</strong>
              <span>Monitorizare vizuală a sesizărilor din oraș</span>
            </div>

            <div className="map-legend">
              <span>
                <i className="dot red"></i> Nou
              </span>
              <span>
                <i className="dot amber"></i> În lucru
              </span>
              <span>
                <i className="dot green"></i> Rezolvat
              </span>
            </div>
          </div>

          <div className="map-filters pro-filters admin-filters">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută sesizare, cetățean sau categorie..."
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "toate" | ReportStatus)
              }
            >
              <option value="toate">Toate statusurile</option>
              <option value="nou">Nou</option>
              <option value="in lucru">În lucru</option>
              <option value="rezolvat">Rezolvat</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="toate">Toate categoriile</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <button onClick={resetFilters}>Reset</button>
          </div>

          <MapContainer
            center={[45.7489, 21.2087]}
            zoom={13}
            className="admin-premium-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.lat, report.lng]}
                icon={createMarkerIcon(report.status)}
                eventHandlers={{
                  click: () => setSelectedReportId(report.id),
                }}
              >
                <Popup>
                  <div className="popup-card">
                    <div className="popup-header">
                      <span className={statusClass(report.status)}>
                        {statusLabel(report.status)}
                      </span>

                      <span className={priorityClass(report.priority)}>
                        {priorityLabel(report.priority)}
                      </span>
                    </div>

                    <strong>{report.title}</strong>
                    <p>{report.category}</p>

                    <div className="popup-meta">
                      <span>Cetățean</span>
                      <strong>{report.citizenName}</strong>
                    </div>

                    <div className="popup-meta">
                      <span>Data</span>
                      <strong>{report.createdAt}</strong>
                    </div>

                    {report.image && (
                      <img
                        src={report.image}
                        alt="Sesizare"
                        className="popup-img"
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>

        <aside className="admin-details-panel">
          <p className="eyebrow">Control operațional</p>
          <h2>Detalii sesizare</h2>

          {selectedReport ? (
            <div className="admin-selected-card">
              <div className="admin-selected-top">
                <div>
                  <strong>#{selectedReport.id}</strong>
                  <h3>{selectedReport.title}</h3>
                </div>

                <span className={statusClass(selectedReport.status)}>
                  {statusLabel(selectedReport.status)}
                </span>
              </div>

              <div className="report-meta-grid">
                <div>
                  <span>Cetățean</span>
                  <strong>{selectedReport.citizenName}</strong>
                </div>

                <div>
                  <span>Categorie</span>
                  <strong>{selectedReport.category}</strong>
                </div>

                <div>
                  <span>Dată</span>
                  <strong>{selectedReport.createdAt}</strong>
                </div>

                <div>
                  <span>Prioritate</span>
                  <strong className={priorityClass(selectedReport.priority)}>
                    {priorityLabel(selectedReport.priority)}
                  </strong>
                </div>
              </div>

              <div className="admin-coordinates">
                <span>Coordonate GPS</span>
                <strong>
                  {selectedReport.lat.toFixed(5)},{" "}
                  {selectedReport.lng.toFixed(5)}
                </strong>
              </div>

              {selectedReport.image && (
                <img
                  src={selectedReport.image}
                  alt="Sesizare"
                  className="admin-report-image"
                />
              )}

              <div className="admin-status-actions">
                <button
                  className="status-action new"
                  onClick={() => handleStatusChange(selectedReport.id, "nou")}
                >
                  Marchează Nou
                </button>

                <button
                  className="status-action progress"
                  onClick={() =>
                    handleStatusChange(selectedReport.id, "in lucru")
                  }
                >
                  În lucru
                </button>

                <button
                  className="status-action solved"
                  onClick={() =>
                    handleStatusChange(selectedReport.id, "rezolvat")
                  }
                >
                  Rezolvat
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Nu există sesizări pentru filtrele selectate.
            </div>
          )}
        </aside>
      </section>

      <section className="admin-table-card">
        <div className="appointment-toolbar">
          <div>
            <p className="eyebrow">Registru sesizări</p>
            <h2>Sesizări primite</h2>
          </div>
        </div>

        {filteredReports.length === 0 && (
          <div className="empty-state">
            Nu există sesizări care respectă filtrele curente.
          </div>
        )}

        <div className="admin-table-list">
          {filteredReports.map((report) => (
            <article
              key={report.id}
              className={
                selectedReportId === report.id
                  ? "admin-table-row active"
                  : "admin-table-row"
              }
              onClick={() => setSelectedReportId(report.id)}
            >
              <div>
                <span>ID</span>
                <strong>#{report.id}</strong>
              </div>

              <div className="admin-table-main">
                <span>Sesizare</span>
                <strong>{report.title}</strong>
                <small>{report.category}</small>
              </div>

              <div>
                <span>Cetățean</span>
                <strong>{report.citizenName}</strong>
              </div>

              <div>
                <span>Prioritate</span>
                <strong className={priorityClass(report.priority)}>
                  {priorityLabel(report.priority)}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong className={statusClass(report.status)}>
                  {statusLabel(report.status)}
                </strong>
              </div>

              <div className="admin-row-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(report.id, "in lucru");
                  }}
                >
                  Preia
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(report.id, "rezolvat");
                  }}
                >
                  Rezolvă
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}