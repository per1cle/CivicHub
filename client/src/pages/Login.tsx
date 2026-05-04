// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEroare('');

    try {
      // Trimitem cererea către backend-ul nostru de pe portul 3001
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, parola }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salvăm datele în context (care le pune și în localStorage)
        login(data.user, data.token);
        // Îl trimitem pe Dashboard
        navigate('/dashboard');
      } else {
        setEroare(data.error || "A apărut o eroare la autentificare.");
      }
    } catch (err) {
      setEroare("Nu ne putem conecta la server.");
    }
  };

  return (
    <div>
      <h2>Autentificare CivicHub</h2>
      {eroare && <p style={{ color: 'red' }}>{eroare}</p>}
      
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Parolă:</label>
          <input type="password" value={parola} onChange={(e) => setParola(e.target.value)} required />
        </div>
        <button type="submit">Intră în cont</button>
      </form>
    </div>
  );
};

export default Login;