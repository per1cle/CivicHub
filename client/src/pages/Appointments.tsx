import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api";

type AppointmentStatus = "confirmata" | "anulata";

type Appointment = {
  id: number;
  date: string;
  time: string;
  service: string;
  notes?: string;
  status: AppointmentStatus;
};

const services = [
  {
    name: "Acte de identitate",
    icon: "🪪",
    description: "CI, reînnoire, schimbare domiciliu",
  },
  {
    name: "Urbanism",
    icon: "🏗️",
    description: "Certificate, autorizații, avize",
  },
  {
    name: "Taxe locale",
    icon: "💳",
    description: "Impozite, taxe, clarificări plată",
  },
  {
    name: "Servicii sociale",
    icon: "🤝",
    description: "Ajutoare, dosare, beneficii sociale",
  },
];

const allSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00"
];

const monthNames = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

const weekDays = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatHumanDate(dateKey: string) {
  return new Date(dateKey).toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isSameDay(a: Date, b: Date) {
  return formatDateKey(a) === formatDateKey(b);
}

function buildCalendarDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstWeekDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();

  const calendarDays: (Date | null)[] = [];

  for (let i = 0; i < firstWeekDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  return calendarDays;
}

function mapAppointmentFromBackend(item: any): Appointment {
  const dateObj = new Date(item.dataOra);

  return {
    id: item.id,
    date: formatDateKey(dateObj),
    time: dateObj.toTimeString().slice(0, 5),
    service: item.serviciuAles,
    notes: item.observatii || "",
    status: item.status || "confirmata",
  };
}

export default function Appointments() {
  const { user } = useAuth();
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState(services[0].name);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await apiFetch(`/appointments?userId=${user.id}`);

      if (Array.isArray(data)) {
        setAppointments(data.map(mapAppointmentFromBackend));
      } else {
        console.error("Format date programări invalid:", data);
        setMessage("Nu s-au putut încărca programările.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Nu s-au putut încărca programările.");
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const selectedDateKey = formatDateKey(selectedDate);

  const bookedSlots = useMemo(() => {
    return appointments
      .filter(
        (appointment) =>
          appointment.date === selectedDateKey &&
          appointment.service === selectedService &&
          appointment.status === "confirmata"
      )
      .map((appointment) => appointment.time);
  }, [appointments, selectedDateKey, selectedService]);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const activeAppointments = appointments.filter((a) => a.status === "confirmata");

  const stats = {
    total: activeAppointments.length,
    today: activeAppointments.filter((a) => a.date === formatDateKey(today)).length,
    available: allSlots.length - bookedSlots.length,
    services: services.length,
  };

  const availableSlots = useMemo(() => {
    return allSlots.filter((slot) => {
      const isBooked = bookedSlots.includes(slot);
      if (isBooked) return false;

      const isToday = isSameDay(selectedDate, today);
      if (isToday) {
        const [hour, minute] = slot.split(":").map(Number);
        const slotTime = new Date();
        slotTime.setHours(hour, minute, 0, 0);
        return slotTime > new Date();
      }
      return true;
    });

  }, [bookedSlots, selectedDate, today]);

  const selectedServiceData = services.find((s) => s.name === selectedService);

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleBook = async () => {
    if (!selectedTime) {
      setMessage("⚠️ Alege o oră disponibilă pentru programare.");
      return;
    }

    if (bookedSlots.includes(selectedTime)) {
      setMessage("⚠️ Acest slot este deja ocupat. Alege altă oră.");
      return;
    }

    try {
      const data = await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          date: selectedDateKey,
          time: selectedTime,
          service: selectedService,
          notes: notes.trim(),
          userId: user?.id,
        }),
      });

      if (data.message && !data.id) {
        setMessage("❌ " + data.message);
        return;
      }

      await fetchAppointments();

      setSelectedTime("");
      setNotes("");
      setMessage(`✅ Programare confirmată pentru ${selectedService}, pe data de ${formatHumanDate(selectedDateKey)}, la ora ${selectedTime}. Vei primi un email de confirmare.`);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Eroare frontend:", err);
      setMessage("❌ Programarea nu a putut fi salvată.");
    }
  };

  const cancelAppointment = async (id: number) => {
    try {
      await apiFetch(`/appointments/${id}`, {
        method: "DELETE",
      });

      await fetchAppointments();
      setMessage("✅ Programarea a fost anulată cu succes.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setMessage("❌ Programarea nu a putut fi anulată.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const rescheduleAppointment = async (id: number) => {
    if (!selectedTime) {
      setMessage("⚠️ Pentru reprogramare, te rugăm să alegi mai întâi o NOUĂ DATĂ și o ORĂ din calendarul de mai sus, apoi apasă din nou pe 'Reprogramează'.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      await apiFetch(`/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          date: selectedDateKey,
          time: selectedTime,
          service: selectedService,
          notes,
        }),
      });

      await fetchAppointments();

      setSelectedTime("");
      setMessage(`✅ Programarea a fost mutată cu succes pe data de ${formatHumanDate(selectedDateKey)}, la ora ${selectedTime}.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setMessage("❌ Programarea nu a putut fi reprogramată.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="civic-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">CivicHub Appointments</p>
          <h1>Sistem de programări online</h1>
          <p>
            Alege serviciul, data și ora disponibilă. Programarea este confirmată
            instant și poate fi anulată sau reprogramată ușor.
          </p>
        </div>

        <div className="hero-actions">
          <span className="live-pill">
            <span></span>
            Rezervări active
          </span>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card premium-stat">
          <span>Programări active</span>
          <strong>{stats.total}</strong>
          <small>în contul tău</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Programări azi</span>
          <strong>{stats.today}</strong>
          <small>pentru ziua curentă</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Ore disponibile</span>
          <strong>{stats.available}</strong>
          <small>pentru data aleasă</small>
        </article>

        <article className="stat-card premium-stat">
          <span>Servicii disponibile</span>
          <strong>{stats.services}</strong>
          <small>ghișee digitale</small>
        </article>
      </section>

      {message && (
        <div className="appointment-toast" style={{
          background: message.startsWith('✅') ? "#dcfce7" : "#fee2e2",
          color: message.startsWith('✅') ? "#166534" : "#991b1b",
          border: message.startsWith('✅') ? "1px solid #bbf7d0" : "1px solid #fecaca",
          marginBottom: "24px"
        }}>
          {message}
        </div>
      )}

      <section className="appointments-layout">
        <section className="appointment-main-card">
          <div className="appointment-toolbar">
            <div>
              <p className="eyebrow">Calendar</p>
              <h2>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
            </div>

            <div className="calendar-actions">
              <button onClick={goToPreviousMonth}>←</button>
              <button onClick={goToNextMonth}>→</button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="premium-calendar">
            {calendarDays.map((day, index) => {
              const isPast = day ? day < new Date(today.toDateString()) : false;
              const isWeekend = day ? (day.getDay() === 0 || day.getDay() === 6) : false;
              const dayKey = day ? formatDateKey(day) : "";
              const hasAppointment = activeAppointments.some((a) => a.date === dayKey);
              const isSelected = day ? isSameDay(day, selectedDate) : false;

              const isDisabled = !day || isPast || isWeekend;

              return (
                <button
                  key={index}
                  disabled={isDisabled}
                  className={[
                    "calendar-day",
                    isSelected ? "selected" : "",
                    hasAppointment ? "has-appointment" : "",
                    isDisabled ? "disabled" : "",
                    isWeekend ? "weekend" : "",
                  ].join(" ")}
                  onClick={() => {
                    if (!day || isWeekend) return;
                    setSelectedDate(day);
                    setSelectedTime("");
                  }}
                >
                  {day && (
                    <>
                      <strong>{day.getDate()}</strong>
                      {hasAppointment && <small>ocupat</small>}
                      {isWeekend && <small style={{ opacity: 0.5 }}>închis</small>}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="appointment-slots-section">
            <div>
              <p className="eyebrow">Ore disponibile</p>
              <h3>{formatHumanDate(selectedDateKey)}</h3>
            </div>

            <div className="slot-grid premium-slot-grid">
              {availableSlots.map((slot) => {
                const selected = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={["slot-btn", selected ? "selected" : ""].join(
                      " "
                    )}
                  >
                    <strong>{slot}</strong>
                    <small>{selected ? "selectat" : "liber"}</small>
                  </button>
                );
              })}

              {availableSlots.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "2rem",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px dashed #e2e8f0",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    🗓️
                  </div>
                  <strong>Ne pare rău!</strong>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    Nu mai sunt locuri disponibile pentru această zi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="side-panel appointment-side-panel">
          <p className="eyebrow">Detalii programare</p>
          <h2>Rezervă un slot</h2>

          <div className="selected-service-preview">
            <div className="service-icon">{selectedServiceData?.icon}</div>
            <div>
              <strong>{selectedService}</strong>
              <span>{selectedServiceData?.description}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Serviciu dorit</label>
            <div className="appointment-service-grid">
              {services.map((service) => (
                <button
                  key={service.name}
                  type="button"
                  className={
                    selectedService === service.name
                      ? "appointment-service-card active"
                      : "appointment-service-card"
                  }
                  onClick={() => {
                    setSelectedService(service.name);
                    setSelectedTime("");
                  }}
                >
                  <span>{service.icon}</span>
                  <strong>{service.name}</strong>
                  <small>{service.description}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="appointment-summary">
            <div>
              <span>Data selectată</span>
              <strong>{formatHumanDate(selectedDateKey)}</strong>
            </div>

            <div>
              <span>Ora selectată</span>
              <strong>{selectedTime || "Alege o oră"}</strong>
            </div>
          </div>

          <div className="form-group">
            <label>Observații opționale</label>
            <textarea
              placeholder="Ex: vin pentru depunere documente / ridicare act..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button className="primary-action" onClick={handleBook}>
            Confirmă programarea
          </button>
        </aside>
      </section>

      <section className="appointments-history-card">
        <div className="appointment-toolbar">
          <div>
            <p className="eyebrow">Istoric</p>
            <h2>Programările tale</h2>
          </div>
        </div>

        {appointments.length === 0 && (
          <div className="empty-state">Nu ai încă nicio programare.</div>
        )}

        <div className="appointments-list">
          {appointments.map((appointment) => (
            <article
              key={appointment.id}
              className={
                appointment.status === "anulata"
                  ? "appointment-item appointment-cancelled"
                  : "appointment-item"
              }
            >
              <div className="appointment-item-main">
                <div className="appointment-date-badge">
                  <strong>{appointment.date.slice(-2)}</strong>
                  <span>{appointment.time}</span>
                </div>

                <div>
                  <h3>{appointment.service}</h3>
                  <p>{formatHumanDate(appointment.date)}</p>
                  {appointment.notes && <small>{appointment.notes}</small>}
                </div>
              </div>

              <div className="appointment-actions">
                <span
                  className={
                    appointment.status === "confirmata"
                      ? "status-badge badge-rezolvat"
                      : "status-badge badge-nou"
                  }
                >
                  {appointment.status === "confirmata" ? "Confirmată" : "Anulată"}
                </span>

                {appointment.status === "confirmata" && (
                  <>
                    <button
                      className="appointment-secondary-btn"
                      onClick={() => rescheduleAppointment(appointment.id)}
                    >
                      Reprogramează
                    </button>

                    <button
                      className="appointment-danger-btn"
                      onClick={() => cancelAppointment(appointment.id)}
                    >
                      Anulează
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}