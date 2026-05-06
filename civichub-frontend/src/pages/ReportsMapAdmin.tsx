import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { useReports } from "../store/useReports";

const icons = {
  nou: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41],
  }),
  "in lucru": new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    iconSize: [25, 41],
  }),
  rezolvat: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconSize: [25, 41],
  }),
};

export default function ReportsMapAdmin() {
  const { reports, updateStatus } = useReports();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "70%" }}>
        <MapContainer
          center={[45.7489, 21.2087]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {reports.map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={icons[r.status]}
            >
              <Popup>
                <strong>{r.title}</strong>
                <p>Categorie: {r.category}</p>
                <p>Status: {r.status}</p>
                {r.image && <img src={r.image} width="120" />}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ width: "30%", padding: "15px" }}>
        <h2>Admin 🧑‍💼</h2>

        {reports.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #eee",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <strong>{r.title}</strong>

            <p>Categorie: {r.category}</p>
            <p>Status: {r.status}</p>

            <select
              value={r.status}
              onChange={(e) =>
                updateStatus(r.id, e.target.value as any)
              }
            >
              <option value="nou">Nou</option>
              <option value="in lucru">În lucru</option>
              <option value="rezolvat">Rezolvat</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}