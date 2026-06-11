import { useEffect, useState } from "react";
import { apiFetch } from "../api";

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

export function usePayments(userId?: number) {
  const [payments, setPayments] = useState<Payment[]>([]);

  async function fetchPayments() {
    try {
      const path = userId ? `/payments?userId=${userId}` : "/payments";
      const data = await apiFetch(path);

      if (Array.isArray(data)) {
        setPayments(data.map(mapPaymentFromBackend));
      } else {
        console.error("Format date plăți invalid:", data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const pay = async (id: number) => {
    try {
      await apiFetch(`/payments/${id}/pay`, {
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