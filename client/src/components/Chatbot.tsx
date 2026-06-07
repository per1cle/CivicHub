import { useState } from "react";

type Message = {
  role: "bot" | "user";
  text: string;
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Salut! Sunt asistentul CivicHub. Te pot ajuta cu programări, plăți, raportări, hartă sau contul tău.",
    },
  ]);

  const getBotReply = (text: string) => {
    const q = text.toLowerCase();

    if (
      q.includes("sesizare") ||
      q.includes("sesizari") ||
      q.includes("sesizări") ||
      q.includes("raportare") ||
      q.includes("raportări") ||
      q.includes("raportez") ||
      q.includes("problema") ||
      q.includes("problemă") ||
      q.includes("harta") ||
      q.includes("hartă")
    ) {
      return "Pentru a face o sesizare, mergi la secțiunea Hartă, apasă pe locația problemei, completează descrierea, alege categoria și prioritatea, apoi apasă pe Trimite sesizarea.";
    }

    if (
      q.includes("programare") ||
      q.includes("programări") ||
      q.includes("programari")
    ) {
      return "Pentru o programare, intră în secțiunea Programări, alege serviciul dorit, selectează data și ora disponibile, apoi confirmă programarea.";
    }

    if (
      q.includes("plata") ||
      q.includes("plată") ||
      q.includes("plati") ||
      q.includes("plăți") ||
      q.includes("taxa") ||
      q.includes("taxe")
    ) {
      return "Pentru plăți, intră în secțiunea Plăți. Acolo poți vedea taxele disponibile, suma, termenul limită și statusul plății.";
    }

    if (
      q.includes("cont") ||
      q.includes("login") ||
      q.includes("autentificare") ||
      q.includes("inregistrare") ||
      q.includes("înregistrare")
    ) {
      return "Pentru cont, folosește pagina de Login sau Înregistrare. După autentificare, vei avea acces la dashboard și funcționalitățile CivicHub.";
    }

    if (
      q.includes("ghiseu") ||
      q.includes("ghișeu") ||
      q.includes("document") ||
      q.includes("cerere")
    ) {
      return "Pentru documente sau cereri, intră în secțiunea Ghișeu Virtual. Acolo poți completa și trimite cereri către primărie.";
    }

    if (
      q.includes("salut") ||
      q.includes("bună") ||
      q.includes("buna") ||
      q.includes("hello")
    ) {
      return "Salut! Te pot ajuta cu sesizări, programări, plăți, ghișeu virtual sau contul tău CivicHub.";
    }

    if (
  q.includes("mulțumesc") ||
  q.includes("multumesc") ||
  q.includes("mersi") ||
  q.includes("ms") ||
  q.includes("thanks")
) {
  return "Cu drag! Sunt aici dacă mai ai nevoie de ajutor în CivicHub.";
}

    return "Încă nu știu să răspund la asta. Mă poți întreba despre sesizări, programări, plăți, ghișeu virtual, hartă sau cont.";
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userText = input.trim();

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");

    setTimeout(() => {
      const botReply = getBotReply(userText);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: botReply,
        },
      ]);
    }, 350);
  };

  return (
    <>
      {!open && (
        <button className="chatbot-toggle" onClick={() => setOpen(true)}>
          💬
        </button>
      )}

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <strong>Chatbot CivicHub</strong>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "22px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`chatbot-message ${message.role}`}>
                {message.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              placeholder="Scrie un mesaj..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button type="button" onClick={sendMessage}>
              Trimite
            </button>
          </div>
        </div>
      )}
    </>
  );
}