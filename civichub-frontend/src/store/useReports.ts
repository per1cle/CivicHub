import { useState } from "react";

export type Report = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  status: "nou" | "in lucru" | "rezolvat";
  category: string;     // ✅ NOU
  image?: string;       // ✅ NOU
};

let globalReports: Report[] = [
  {
    id: 1,
    title: "Groapă în drum",
    lat: 45.7489,
    lng: 21.2087,
    status: "nou",
    category: "groapa",   // ✅ NOU
    image: undefined,
  },
];

export function useReports() {
  const [reports, setReports] = useState(globalReports);

  const addReport = (report: Report) => {
    globalReports = [...globalReports, report];
    setReports(globalReports);
  };

  const updateStatus = (id: number, status: Report["status"]) => {
    globalReports = globalReports.map((r) =>
      r.id === id ? { ...r, status } : r
    );
    setReports(globalReports);
  };

  return { reports, addReport, updateStatus };
}