// src/pages/Register.tsx
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from "../api";

const Register = () => {
  // Stările pentru toate câmpurile necesare
  const [nume, setNume] = useState('');
  const [prenume, setPrenume] = useState('');
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [adresa, setAdresa] = useState('');
  const [telefon, setTelefon] = useState('');
  
  const [eroare, setEroare] = useState('');
  
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    if (user.role === 'FUNCTIONAR') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setEroare('');

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nume,
          prenume,
          email,
          parola,
          adresa,
          telefon
        }),
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
        setEroare(data.error || "A apărut o eroare la crearea contului.");
      }
    } catch (err) {
      setEroare("Nu ne putem conecta la server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-large">
        <h2>Creare Cont</h2>
        <p className="subtitle">Alătură-te comunității CivicHub</p>

        {eroare && <div className="auth-error">{eroare}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="auth-form-grid">
            <div className="form-group text-left">
              <label>Nume</label>
              <input type="text" value={nume} onChange={(e) => setNume(e.target.value)} placeholder="Popescu" required />
            </div>
            
            <div className="form-group text-left">
              <label>Prenume</label>
              <input type="text" value={prenume} onChange={(e) => setPrenume(e.target.value)} placeholder="Ion" required />
            </div>
          </div>

          <div className="form-group text-left">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ion.popescu@exemplu.ro" required />
          </div>

          <div className="form-group text-left">
            <label>Parolă</label>
            <input type="password" value={parola} onChange={(e) => setParola(e.target.value)} placeholder="••••••••" required />
          </div>

          <div className="form-group text-left">
            <label>Adresă completă</label>
            <input type="text" value={adresa} onChange={(e) => setAdresa(e.target.value)} placeholder="Str. Primăverii nr. 10, București" required />
          </div>

          <div className="form-group text-left">
            <label>Telefon</label>
            <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="07XX XXX XXX" required />
          </div>

          <button type="submit" className="auth-btn">Creează contul</button>
        </form>
        
        <p className="auth-link">
          Ai deja cont? <button onClick={() => navigate('/login')}>Mergi la Login</button>
        </p>
      </div>
    </div>
  );
};

export default Register;