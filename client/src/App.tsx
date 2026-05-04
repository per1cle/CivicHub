import { Routes, Route } from 'react-router-dom';
import HelloPage from './pages/HelloPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import {ProtectedRoute} from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HelloPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      
      {/* Doar cei logați pot intra aici */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;