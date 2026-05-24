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

const API_URL = "http://localhost:3001/api/payments";

function mapPaymentFromBackend(item: any): Payment {
  return {
    id: item.id,
    title: item.title,
    amount: item.amount,
    status: item.status,
    category: item.category,
    dueDate: item.dueDate?.split("T")[0],
    date: item.paidDate
      ? new Date(item.paidDate).toLocaleString("ro-RO")
      : undefined,
    receiptCode: item.receiptCode || undefined,
  };
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);

  async function fetchPayments() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      setPayments(data.map(mapPaymentFromBackend));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, []);

  const pay = async (id: number) => {
    try {
      await fetch(`${API_URL}/${id}/pay`, {
        method: "PATCH",
      });

      await fetchPayments();
    } catch (err) {
      console.error(err);
    }
  };

  return {
    payments,
    pay,
  };
}