import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ReportsMapUser from "../pages/ReportsMapUser";
import ReportsMapAdmin from "../pages/ReportsMapAdmin";
import Appointments from "../pages/Appointments";
import AppointmentsAdmin from "../pages/AppointmentsAdmin";
import Payments from "../pages/Payments";
import Login from "../pages/Login";
import Register from "../pages/Register";
import HomePage from "../pages/HelloPage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import GhiseuVirtual from "../pages/GhiseuVirtual";
import AdminRequestsPage from "../pages/RequestsAdmin";
import AdminPayments from "../pages/AdminPayments";

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
      <Route path="/ghiseu" element={<ProtectedRoute><GhiseuVirtual /></ProtectedRoute>} />

      {/* Rute pentru Admini */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/map" element={<ProtectedRoute requireAdmin><ReportsMapAdmin /></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute requireAdmin><AdminRequestsPage /></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute requireAdmin><AppointmentsAdmin /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute requireAdmin><AdminPayments /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}