import { usePayments } from "../store/usePayments";

export default function PaymentsUser() {
  const { payments, pay } = usePayments();

  return (
    <div style={{ padding: "20px" }}>
      <h2>💳 Plăți Online</h2>

      {payments.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #eee",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px",
          }}
        >
          <h3>{p.title}</h3>
          <p>Sumă: {p.amount} RON</p>

          <p>
            Status:{" "}
            <strong style={{
              color: p.status === "platit" ? "green" : "red"
            }}>
              {p.status}
            </strong>
          </p>

          {p.status === "neplatit" && (
            <button onClick={() => pay(p.id)}>
              Plătește
            </button>
          )}

          {p.status === "platit" && (
            <div>
              <p>📅 {p.date}</p>
              <button
                onClick={() =>
                  alert(
                    `Chitanță\n\n${p.title}\n${p.amount} RON\n${p.date}`
                  )
                }
              >
                Vezi chitanță
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}