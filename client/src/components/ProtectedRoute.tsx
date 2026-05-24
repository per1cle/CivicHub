import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { JSX } from 'react/jsx-dev-runtime';

export const ProtectedRoute = ({ 
  children,
  requireAdmin = false
}: { 
  children: JSX.Element;
  requireAdmin?: boolean;
}) => {
  const { user } = useAuth();

  // Dacă nu este logat, îl trimitem înapoi la pagina de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Dacă ruta necesită admin și utilizatorul nu e admin, trimite la dashboard-ul normal
  if (requireAdmin && user.role !== 'FUNCTIONAR') {
    return <Navigate to="/dashboard" replace />;
  }

  // Dacă este logat și are permisiunile necesare, randează componenta
  return children;
};