import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ReportsMapUser from "../pages/ReportsMapUser";
import ReportsMapAdmin from "../pages/ReportsMapAdmin";
import Appointments from "../pages/Appointments";
import Payments from "../pages/Payments";
import Login from "../pages/Login";
import Register from "../pages/Register";
import HomePage from "../pages/HelloPage";
import { ProtectedRoute } from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Rute pentru Utilizatori (Cetățeni) */}
      <Route path="/map" element={<ProtectedRoute><ReportsMapUser /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />

      {/* Rute pentru Admini */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/map" element={<ProtectedRoute requireAdmin><ReportsMapAdmin /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}