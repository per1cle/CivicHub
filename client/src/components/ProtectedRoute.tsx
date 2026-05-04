import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { JSX } from 'react/jsx-dev-runtime';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  // Dacă nu este logat, îl trimitem înapoi la pagina de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Dacă este logat, îl lăsăm să vadă pagina 
  return children;
};