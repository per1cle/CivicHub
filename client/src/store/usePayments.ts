import { useEffect, useState } from "react";

export type PaymentStatus = "neplatit" | "platit";
export type PaymentCategory = "locuinta" | "auto" | "urbanism" | "amenzi";

export type Payment = {
  id: number;
  title: string;
  amount: number;
  status: PaymentStatus;
  category: PaymentCategory;
  dueDate: string;
  date?: string;
  receiptCode?: string;
};

const STORAGE_KEY = "civichub_payments";

const initialPayments: Payment[] = [
  {
    id: 1,
    title: "Impozit locuință",
    amount: 250,
    status: "neplatit",
    category: "locuinta",
    dueDate: "2025-05-30",
  },
  {
    id: 2,
    title: "Taxă auto",
    amount: 120,
    status: "neplatit",
    category: "auto",
    dueDate: "2025-06-15",
  },
  {
    id: 3,
    title: "Taxă certificat urbanism",
    amount: 85,
    status: "platit",
    category: "urbanism",
    dueDate: "2025-04-20",
    date: "2025-04-12, 10:30",
    receiptCode: "CH-2025-0003",
  },
];

function loadPayments() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPayments));
    return initialPayments;
  }

  try {
    return JSON.parse(saved) as Payment[];
  } catch {
    return initialPayments;
  }
}

function savePayments(payments: Payment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  window.dispatchEvent(new Event("payments-updated"));
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>(loadPayments);

  useEffect(() => {
    const syncPayments = () => {
      setPayments(loadPayments());
    };

    window.addEventListener("storage", syncPayments);
    window.addEventListener("payments-updated", syncPayments);

    return () => {
      window.removeEventListener("storage", syncPayments);
      window.removeEventListener("payments-updated", syncPayments);
    };
  }, []);

  const pay = (id: number) => {
    const updatedPayments = loadPayments().map((payment) =>
      payment.id === id
        ? {
            ...payment,
            status: "platit" as const,
            date: new Date().toLocaleString("ro-RO"),
            receiptCode: `CH-${new Date().getFullYear()}-${String(id).padStart(
              4,
              "0"
            )}`,
          }
        : payment
    );

    savePayments(updatedPayments);
    setPayments(updatedPayments);
  };

  return {
    payments,
    pay,
  };
}