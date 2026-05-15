import { useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
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

const priorities: { label: string; value: ReportPriority }[] = [
  { label: "Scăzută", value: "scazuta" },
  { label: "Medie", value: "medie" },
  { label: "Ridicată", value: "ridicata" },
];

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
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

export default function ReportsMapUser() {
  const { reports, addReport } = useReports();

  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState<ReportPriority>("medie");
  const [image, setImage] = useState<string | undefined>();
  const [message, setMessage] = useState("");

  const [statusFilter, setStatusFilter] = useState<"toate" | ReportStatus>("toate");
  const [categoryFilter, setCategoryFilter] = useState("toate");
  const [search, setSearch] = useState("");
  const [darkMap, setDarkMap] = useState(false);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus = statusFilter === "toate" || report.status === statusFilter;
      const matchesCategory = categoryFilter === "toate" || report.category === categoryFilter;

      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        report.title.toLowerCase().includes(query) ||
        report.category.toLowerCase().includes(query) ||
        report.citizenName.toLowerCase().includes(query);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [reports, statusFilter, categoryFilter, search]);

  const stats = useMemo(
    () => ({
      total: reports.length,
      active: reports.filter((r) => r.status !== "rezolvat").length,
      solved: reports.filter((r) => r.status === "rezolvat").length,
      visible: filteredReports.length,
    }),
    [reports, filteredReports.length]
  );

  const handleAdd = () => {
    if (!selected || !title.trim()) {
      setMessage("Alege o locație pe hartă și completează descrierea.");
      return;
    }

    addReport({
      id: Date.now(),
      title: title.trim(),
      lat: selected.lat,
      lng: selected.lng,
      status: "nou",
      category,
      priority,
      image,
    });

    setTitle("");
    setCategory(categories[0]);
    setPriority("medie");
    setImage(undefined);
    setSelected(null);
    setMessage("Sesizarea a fost trimisă cu succes către primărie.");
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
          <p className="eyebrow">CivicHub Map</p>
          <h1>Hartă interactivă sesizări</h1>
          <p>
            Raportează probleme urbane direct pe hartă. Alegi locația, adaugi
            detalii, iar sesizarea ajunge instant în panoul funcționarului.
          </p>
        </div>

        <div className="hero-actions">
          <button className="map-mode-btn" onClick={() => setDarkMap(!darkMap)}>
            {darkMap ? "Hartă light" : "Hartă dark"}
          </button>

          <span className="live-pill">
            <span></span>
            Sistem activ
          </span>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card premium-stat">
          <span>Total sesizări</span>
          <strong>{stats.total}</strong>
          <small>înregistrate în platformă</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Sesizări active</span>
          <strong>{stats.active}</strong>
          <small>necesită verificare</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Rezolvate</span>
          <strong>{stats.solved}</strong>
          <small>finalizate de primărie</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Afișate pe hartă</span>
          <strong>{stats.visible}</strong>
          <small>după filtrele curente</small>
        </article>
      </section>

      <section className="map-layout">
        <div className="map-shell">
          <div className="map-toolbar">
            <div>
              <strong>CivicHub Live Map</strong>
              <span>Click pe hartă pentru o sesizare nouă</span>
            </div>

            <div className="map-legend">
              <span><i className="dot red"></i> Nou</span>
              <span><i className="dot amber"></i> În lucru</span>
              <span><i className="dot green"></i> Rezolvat</span>
            </div>
          </div>

          <div className="map-filters pro-filters">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută după descriere, categorie sau cetățean..."
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "toate" | ReportStatus)}
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
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <button onClick={resetFilters}>Reset</button>
          </div>

          <MapContainer
            center={[45.7489, 21.2087]}
            zoom={13}
            className="premium-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url={
                darkMap
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            />

            <ClickHandler onClick={(lat, lng) => setSelected({ lat, lng })} />

            {selected && (
              <Marker position={[selected.lat, selected.lng]} icon={createMarkerIcon("nou")}>
                <Popup>
                  <div className="popup-card">
                    <strong>Locație selectată</strong>
                    <p>Aceasta va fi locația noii sesizări.</p>
                    <span className="status-badge badge-nou">Nou</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {filteredReports.map((r) => (
              <Marker key={r.id} position={[r.lat, r.lng]} icon={createMarkerIcon(r.status)}>
                <Popup>
                  <div className="popup-card">
                    <div className="popup-header">
                      <span className={statusClass(r.status)}>{statusLabel(r.status)}</span>
                      <span className={priorityClass(r.priority)}>{priorityLabel(r.priority)}</span>
                    </div>

                    <strong>{r.title}</strong>
                    <p>{r.category}</p>

                    <div className="popup-meta">
                      <span>Cetățean</span>
                      <strong>{r.citizenName}</strong>
                    </div>

                    <div className="popup-meta">
                      <span>Data</span>
                      <strong>{r.createdAt}</strong>
                    </div>

                    {r.image && <img src={r.image} alt="Sesizare" className="popup-img" />}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <aside className="side-panel">
          <p className="eyebrow">Sesizare nouă</p>
          <h2>Raportează o problemă</h2>

          {message && <div className="notice-box">{message}</div>}

          <div className="form-group">
            <label>Descriere problemă</label>
            <textarea
              placeholder="Ex: Groapă mare în carosabil, lângă trecerea de pietoni..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Categorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Prioritate</label>
            <div className="priority-grid">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={priority === p.value ? "priority-choice active" : "priority-choice"}
                  onClick={() => setPriority(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Fotografie opțională</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onloadend = () => setImage(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </div>

          {image && <img src={image} alt="Preview" className="image-preview" />}

          <div className="location-box">
            {selected ? (
              <>
                <strong>Locație selectată</strong>
                <span>{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</span>
              </>
            ) : (
              <>
                <strong>Nu ai ales locația</strong>
                <span>Click pe hartă pentru a plasa markerul.</span>
              </>
            )}
          </div>

          <button className="primary-action" onClick={handleAdd}>
            Trimite sesizarea
          </button>

          <div className="recent-list">
            <h3>Sesizări afișate</h3>

            {filteredReports.length === 0 && (
              <div className="empty-state">
                Nu există sesizări pentru filtrele selectate.
              </div>
            )}

            {filteredReports.slice(0, 5).map((r) => (
              <article key={r.id} className="recent-item pro-recent-item">
                <div>
                  <strong>{r.title}</strong>
                  <span>{r.category} · {r.createdAt}</span>
                </div>

                <div className="badge-column">
                  <span className={statusClass(r.status)}>{statusLabel(r.status)}</span>
                  <span className={priorityClass(r.priority)}>{priorityLabel(r.priority)}</span>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}