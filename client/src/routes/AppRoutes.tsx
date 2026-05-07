import { Routes, Route } from "react-router-dom";

import ReportsMapUser from "../pages/ReportsMapUser";
import ReportsMapAdmin from "../pages/ReportsMapAdmin";
import Payments from "../pages/Payments";
import Appointments from "../pages/Appointments";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ReportsMapUser />} />

      <Route path="/map" element={<ReportsMapUser />} />
      <Route path="/admin/map" element={<ReportsMapAdmin />} />

      <Route path="/payments" element={<Payments />} />
      <Route path="/appointments" element={<Appointments />} />
    </Routes>
  );
}