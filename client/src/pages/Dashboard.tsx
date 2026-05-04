// src/pages/Dashboard.tsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Îl trimitem înapoi pe pagina de Hello
  };

  return (
    <div>
      <h1>Dashboard CivicHub</h1>
      <p>Bun venit, <strong>{user?.nume}</strong>!</p>
      <p>Rolul tău în sistem este: {user?.role}</p>

      <div style={{ marginTop: '20px' }}>
        <h3>Serviciile mele:</h3>
        <ul>
          <li>Depune o cerere nouă</li>
          <li>Raportează o problemă (Harta sesizărilor)</li>
          <li>Programează-te la ghișeu</li>
        </ul>
      </div>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Deconectare
      </button>
    </div>
  );
};

export default Dashboard;