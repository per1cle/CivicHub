import { Navigate, Route, Routes } from "react-router-dom";

import HelloPage from "../pages/HelloPage";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ReportsMapUser from "../pages/ReportsMapUser";
import ReportsMapAdmin from "../pages/ReportsMapAdmin";
import Appointments from "../pages/Appointments";
import AppointmentsAdmin from "../pages/AppointmentsAdmin";
import Payments from "../pages/Payments";
import AdminPayments from "../pages/AdminPayments";
import Login from "../pages/Login";
import Register from "../pages/Register";
import GhiseuVirtual from "../pages/GhiseuVirtual";
import AdminRequestsPage from "../pages/RequestsAdmin";
import { ProtectedRoute } from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HelloPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <ReportsMapUser />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ghiseu-virtual"
        element={
          <ProtectedRoute>
            <GhiseuVirtual />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/map"
        element={
          <ProtectedRoute>
            <ReportsMapAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute>
            <AdminPayments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute>
            <AdminRequestsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}