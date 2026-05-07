import { useNavigate } from 'react-router-dom';

const HelloPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1>Bun venit pe CivicHub 🏛️</h1>
      <p>Portalul tău digital pentru serviciile primăriei.</p>
      
      <div className="button-group">
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/signup')}>Sign Up</button>
      </div>
    </div>
  );
};

export default HelloPage;