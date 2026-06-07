// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState('');
  
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    if (user.role === 'FUNCTIONAR') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEroare('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, parola }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        if (data.user.role === 'FUNCTIONAR') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setEroare(data.error || "A apărut o eroare la autentificare.");
      }
    } catch (err) {
      setEroare("Nu ne putem conecta la server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Autentificare</h2>
        <p className="subtitle">Accesează contul tău CivicHub</p>

        {eroare && <div className="auth-error">{eroare}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group text-left">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="nume@exemplu.ro"
              required 
            />
          </div>
          
          <div className="form-group text-left">
            <label>Parolă</label>
            <input 
              type="password" 
              value={parola} 
              onChange={(e) => setParola(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" className="auth-btn">Intră în cont</button>
        </form>

        <p className="auth-link">
          Nu ai cont? <button onClick={() => navigate('/register')}>Creează unul acum</button>
        </p>
      </div>
    </div>
  );
};

export default Login;