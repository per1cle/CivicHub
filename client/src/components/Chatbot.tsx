import { useState } from "react";

type Message = {
  from: "user" | "bot";
  text: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Salut! Sunt asistentul CivicHub. Te pot ajuta cu programări, plăți, raportări sau contul tău.",
    },
  ]);

  function getBotReply(message: string) {
    const msg = message.toLowerCase();

    if (msg.includes("salut") || msg.includes("bună") || msg.includes("buna")) {
      return "Salut! Spune-mi cu ce ai nevoie de ajutor în CivicHub.";
    }

    if (msg.includes("programare") || msg.includes("programari") || msg.includes("appointment")) {
      return "Pentru programări, intră în pagina „Programări”. Acolo poți vedea sau crea o programare.";
    }

    if (msg.includes("plata") || msg.includes("plăți") || msg.includes("taxa") || msg.includes("taxe")) {
      return "Pentru plăți, mergi în pagina „Plăți”. Acolo poți verifica taxele și plățile disponibile.";
    }

    if (
      msg.includes("raportare") ||
      msg.includes("raportez") ||
      msg.includes("problemă") ||
      msg.includes("problema") ||
      msg.includes("hartă") ||
      msg.includes("harta")
    ) {
      return "Pentru raportarea unei probleme, intră în pagina „Hartă” și adaugă locația problemei.";
    }

    if (
      msg.includes("cont") ||
      msg.includes("login") ||
      msg.includes("register") ||
      msg.includes("înregistrare") ||
      msg.includes("inregistrare")
    ) {
      return "Pentru cont, poți folosi paginile Login sau Register. Dacă nu ai cont, trebuie să te înregistrezi.";
    }

    if (msg.includes("mulțumesc") || msg.includes("multumesc") || msg.includes("mersi")) {
      return "Cu drag! Mai ai nevoie de altceva?";
    }

    return "Încă nu știu să răspund la asta. Mă poți întreba despre programări, plăți, raportări, hartă sau cont.";
  }

  function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { from: "user", text: input };
    const botMessage: Message = {
      from: "bot",
      text: getBotReply(input),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "none",
            background: "#2563eb",
            color: "white",
            fontSize: "26px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            zIndex: 9999,
          }}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "340px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            padding: "12px",
            zIndex: 9999,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ marginTop: 0 }}>Chatbot CivicHub</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div
            style={{
              height: "260px",
              overflowY: "auto",
              marginBottom: "10px",
              border: "1px solid #eee",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            {messages.map((m, index) => (
              <div
                key={index}
                style={{
                  textAlign: m.from === "user" ? "right" : "left",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px",
                    borderRadius: "8px",
                    maxWidth: "85%",
                    background: m.from === "user" ? "#2563eb" : "#f1f5f9",
                    color: m.from === "user" ? "white" : "black",
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Scrie un mesaj..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <button onClick={sendMessage}>Trimite</button>
          </div>
        </div>
      )}
    </>
  );
}