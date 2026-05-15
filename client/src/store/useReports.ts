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
};

const STORAGE_KEY = "civichub_reports";

const initialReports: Report[] = [
  {
    id: 1,
    title: "Groapă mare în carosabil lângă trecerea de pietoni",
    lat: 45.7489,
    lng: 21.2087,
    status: "nou",
    category: "Drumuri",
    priority: "ridicata",
    citizenName: "Ion Popescu",
    createdAt: "2025-04-12",
  },
  {
    id: 2,
    title: "Stâlp de iluminat defect pe strada principală",
    lat: 45.752,
    lng: 21.215,
    status: "in lucru",
    category: "Iluminat public",
    priority: "medie",
    citizenName: "Ana Dumitrescu",
    createdAt: "2025-04-14",
  },
  {
    id: 3,
    title: "Gunoi neridicat de câteva zile",
    lat: 45.744,
    lng: 21.204,
    status: "rezolvat",
    category: "Salubritate",
    priority: "scazuta",
    citizenName: "Mihai Stan",
    createdAt: "2025-04-10",
  },
];

function loadReports() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReports));
    return initialReports;
  }

  try {
    return JSON.parse(saved) as Report[];
  } catch {
    return initialReports;
  }
}

function saveReports(reports: Report[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  window.dispatchEvent(new Event("reports-updated"));
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>(loadReports);

  useEffect(() => {
    const syncReports = () => {
      setReports(loadReports());
    };

    window.addEventListener("storage", syncReports);
    window.addEventListener("reports-updated", syncReports);

    return () => {
      window.removeEventListener("storage", syncReports);
      window.removeEventListener("reports-updated", syncReports);
    };
  }, []);

  const addReport = (report: Omit<Report, "citizenName" | "createdAt">) => {
    const currentReports = loadReports();

    const newReport: Report = {
      ...report,
      citizenName: "Cetățean autentificat",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updatedReports = [newReport, ...currentReports];

    saveReports(updatedReports);
    setReports(updatedReports);
  };

  const updateStatus = (id: number, status: ReportStatus) => {
    const updatedReports = loadReports().map((r) =>
      r.id === id ? { ...r, status } : r
    );

    saveReports(updatedReports);
    setReports(updatedReports);
  };

  return {
    reports,
    addReport,
    updateStatus,
  };
}