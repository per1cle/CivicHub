// src/pages/Register.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  // Stările pentru toate câmpurile necesare
  const [nume, setNume] = useState('');
  const [prenume, setPrenume] = useState('');
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [adresa, setAdresa] = useState('');
  const [telefon, setTelefon] = useState('');
  
  const [eroare, setEroare] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setEroare('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/signup', {
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
        // Dacă înregistrarea are succes, backend-ul ne trimite direct token-ul
        // Așa că îl logăm automat pe utilizator și îl trimitem pe Dashboard
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setEroare(data.error || "A apărut o eroare la crearea contului.");
      }
    } catch (err) {
      setEroare("Nu ne putem conecta la server.");
    }
  };

  return (
    <div>
      <h2>Creare Cont CivicHub</h2>
      {eroare && <p style={{ color: 'red' }}>{eroare}</p>}
      
      <form onSubmit={handleRegister}>
        <div>
          <label>Nume:</label>
          <input type="text" value={nume} onChange={(e) => setNume(e.target.value)} required />
        </div>
        
        <div>
          <label>Prenume:</label>
          <input type="text" value={prenume} onChange={(e) => setPrenume(e.target.value)} required />
        </div>

        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label>Parolă:</label>
          <input type="password" value={parola} onChange={(e) => setParola(e.target.value)} required />
        </div>

        <div>
          <label>Adresă completă:</label>
          <input type="text" value={adresa} onChange={(e) => setAdresa(e.target.value)} required />
        </div>

        <div>
          <label>Telefon:</label>
          <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} required />
        </div>

        <button type="submit" style={{ marginTop: '15px' }}>Creează contul</button>
      </form>
      
      <p style={{ marginTop: '20px' }}>
        Ai deja cont? <button onClick={() => navigate('/login')}>Mergi la Login</button>
      </p>
    </div>
  );
};

export default Register;