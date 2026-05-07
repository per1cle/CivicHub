import { Routes, Route } from 'react-router-dom';
import HelloPage from './pages/HelloPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import ReportsMapUser from './pages/ReportsMapUser';
import ReportsMapAdmin from './pages/ReportsMapAdmin';
import Payments from './pages/Payments';
import Appointments from './pages/Appointments';

function App() {
  return (
    <div className="app-container">
      {/* Dacă vrei ca Navbar-ul să apară doar după conectare, îl poți condiționa */}
      {/* sau îl lași vizibil peste tot */}
      <Navbar />
      
      <div className="content">
        <Routes>
          <Route path="/" element={<HelloPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          
          <Route path="/map" element={<ReportsMapUser />} />
          <Route path="/admin/map" element={<ReportsMapAdmin />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/appointments" element={<Appointments />} />
          
          {/* Doar cei logați pot intra aici */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;