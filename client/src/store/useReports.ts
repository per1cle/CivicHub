import { useEffect, useState } from "react";

export type ReportStatus = "nou" | "in lucru" | "rezolvat";
export type ReportPriority = "scazuta" | "medie" | "ridicata";

export type Report = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  status: ReportStatus;
  category: string;
  priority: ReportPriority;
  citizenName: string;
  createdAt: string;
  image?: string;
  resolvedAt?: string | null;
};

const API_URL = "http://localhost:3001/api/reports";

export function useReports(userId?: number) {
  const [reports, setReports] = useState<Report[]>([]);

  async function fetchReports() {
    try {
      const url = userId ? `${API_URL}?userId=${userId}` : API_URL;
      const res = await fetch(url);
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Eroare fetchReports:", err);
    }
  }

  useEffect(() => {
    fetchReports();
  }, [userId]);

  const addReport = async (
    report: Omit<Report, "citizenName" | "createdAt">
  ) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...report, userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message };
      }

      setReports((prev) => [data, ...prev]);
      return { success: true, report: data };
    } catch (err) {
      console.error("Eroare addReport:", err);
      return { success: false, message: "Nu s-a putut trimite sesizarea." };
    }
  };

  const updateStatus = async (id: number, status: ReportStatus) => {
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const updatedReport = await res.json();

      if (!res.ok) return;

      setReports((prev) =>
        prev.map((report) => (report.id === id ? updatedReport : report))
      );
    } catch (err) {
      console.error("Eroare updateStatus:", err);
    }
  };

  return {
    reports,
    addReport,
    updateStatus,
  };
}