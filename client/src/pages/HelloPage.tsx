import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HelloPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-container">
      <h1>Bun venit pe CivicHub 🏛️</h1>
      <p>Portalul tău digital pentru serviciile primăriei.</p>
      
      <div className="button-group">
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/register')}>Sign Up</button>
      </div>
    </div>
  );
};

export default HelloPage;