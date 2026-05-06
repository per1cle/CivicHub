import { useState } from "react";

export type Payment = {
  id: number;
  title: string;
  amount: number;
  status: "neplatit" | "platit";
  date?: string;
};

let globalPayments: Payment[] = [
  {
    id: 1,
    title: "Impozit locuință",
    amount: 250,
    status: "neplatit",
  },
  {
    id: 2,
    title: "Taxă auto",
    amount: 120,
    status: "neplatit",
  },
];

export function usePayments() {
  const [payments, setPayments] = useState(globalPayments);

  const pay = (id: number) => {
    globalPayments = globalPayments.map((p) =>
      p.id === id
        ? {
            ...p,
            status: "platit",
            date: new Date().toLocaleString(),
          }
        : p
    );

    setPayments(globalPayments);
  };

  return { payments, pay };
}