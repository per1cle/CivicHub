import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Appointment = {
  id: number;
  date: string;
  time: string;
};

const allSlots = ["09:00", "10:00", "11:00", "13:00", "14:00"];

export default function Appointments() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState("");

  // formatare dată
  const formatDate = (d: Date) => {
    return d.toISOString().split("T")[0];
  };

  const selectedDate = date ? formatDate(date) : null;

  // ➕ BOOK
  const handleBook = (time: string) => {
    if (!selectedDate) return;

    setAppointments((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: selectedDate,
        time,
      },
    ]);

    setMessage("✅ Programare realizată!");
  };

  // ❌ DELETE
  const cancelAppointment = (id: number) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setMessage("❌ Programare anulată");
  };

  // 🔁 RESCHEDULE
  const reschedule = (id: number) => {
    if (!selectedDate) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, date: selectedDate } : a
      )
    );

    setMessage("🔁 Reprogramat pe noua dată");
  };

  // 🔍 ocupate
  const getBookedSlots = (date: string) => {
    return appointments
      .filter((a) => a.date === date)
      .map((a) => a.time);
  };

 return (
  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
    }}
  >
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "30px",
        width: "100%",
        maxWidth: "1000px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>
        Programări Online 📅
      </h1>

      {/* NOTIFICARE */}
      {message && (
        <div
          style={{
            background: "#e0f2fe",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          {message}
        </div>
      )}

      <div style={{ display: "flex", gap: "30px" }}>
        {/* CALENDAR */}
        <div>
          <h3>Selectează data</h3>
          <Calendar
          onChange={(value) => {
            if (value instanceof Date) {
              setDate(value);
            }
          }}
            value={date}
          />
        </div>

        {/* SLOTURI */}
        <div>
          <h3>Sloturi pentru {selectedDate}</h3>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {allSlots.map((slot) => {
              const booked = selectedDate
                ? getBookedSlots(selectedDate).includes(slot)
                : false;

              return (
                <button
                  key={slot}
                  disabled={booked}
                  onClick={() => handleBook(slot)}
                  style={{
                    padding: "10px 15px",
                    borderRadius: "10px",
                    border: "none",
                    background: booked ? "#9ca3af" : "#22c55e",
                    color: "white",
                    cursor: booked ? "not-allowed" : "pointer",
                  }}
                >
                  {slot} {booked ? "(ocupat)" : ""}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* LISTĂ */}
      <h3 style={{ marginTop: "30px" }}>Programările tale</h3>

      {appointments.length === 0 && <p>Nu ai programări.</p>}

      {appointments.map((a) => (
        <div
          key={a.id}
          style={{
            background: "#f9fafb",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "10px",
            border: "1px solid #eee",
          }}
        >
          <strong>
            📅 {a.date} — 🕒 {a.time}
          </strong>

          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => cancelAppointment(a.id)}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "6px",
              }}
            >
              Anulează
            </button>

            <button
              onClick={() => reschedule(a.id)}
              style={{
                background: "#f59e0b",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "6px",
              }}
            >
              Reprogramează
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}