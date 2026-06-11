import { useEffect, useState } from "react";
import { apiFetch } from "../api";

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

export function useReports(userId?: number) {
  const [reports, setReports] = useState<Report[]>([]);

  async function fetchReports() {
    try {
      const path = userId ? `/reports?userId=${userId}` : "/reports";
      const data = await apiFetch(path);
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        console.error("Format date sesizări invalid:", data);
      }
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
      const data = await apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({ ...report, userId }),
      });

      if (data.message && !data.id) {
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
      const data = await apiFetch(`/reports/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setReports((prev) =>
        prev.map((report) => (report.id === id ? data : report))
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