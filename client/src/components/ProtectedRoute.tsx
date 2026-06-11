import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("ProtectedRoute check:", { 
    path: location.pathname, 
    userRole: user?.role, 
    allowedRoles,
    fullUser: user 
  });

  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    console.warn("Access denied. User role:", user.role, "Required:", allowedRoles);
    
    if (location.pathname.startsWith("/admin")) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}