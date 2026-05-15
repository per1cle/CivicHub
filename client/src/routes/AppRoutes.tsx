import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import ReportsMapUser from "../pages/ReportsMapUser";
import ReportsMapAdmin from "../pages/ReportsMapAdmin";
import Appointments from "../pages/Appointments";
import Payments from "../pages/Payments";
import Login from "../pages/Login";
import Register from "../pages/Register";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/map" replace />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/map" element={<ReportsMapUser />} />
      <Route path="/admin/map" element={<ReportsMapAdmin />} />

      <Route path="/appointments" element={<Appointments />} />
      <Route path="/payments" element={<Payments />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="*" element={<Navigate to="/map" replace />} />
    </Routes>
  );
}