import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useReports } from "../store/useReports";

function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ReportsMapUser() {
  const { reports, addReport } = useReports();

  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<string | undefined>();

  const handleAdd = () => {
    if (!title || !selected || !category) {
      alert("Completează toate câmpurile!");
      return;
    }

    addReport({
      id: Date.now(),
      title,
      lat: selected.lat,
      lng: selected.lng,
      status: "nou",
      category,
      image,
    });

    setTitle("");
    setSelected(null);
    setCategory("");
    setImage(undefined);

    alert("Sesizare trimisă!");
  };

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

          <ClickHandler onClick={(lat, lng) => setSelected({ lat, lng })} />

          {reports.map((r) => (
            <Marker key={r.id} position={[r.lat, r.lng]}>
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
        <h2>Sesizare 👤</h2>

        <input
          placeholder="Descriere problemă"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br /><br />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Alege categorie</option>
          <option value="groapa">Groapă stradă</option>
          <option value="iluminat">Iluminat defect</option>
          <option value="gunoi">Gunoi neridicat</option>
          <option value="copaci">Copaci tăiați</option>
        </select>

        <br /><br />

        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onloadend = () => {
              setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
          }}
        />

        <br /><br />

        <p>
          📍 {selected?.lat?.toFixed(4)} , {selected?.lng?.toFixed(4)}
        </p>

        <button onClick={handleAdd}>
          Trimite sesizare
        </button>
      </div>
    </div>
  );
}