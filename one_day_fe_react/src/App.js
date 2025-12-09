import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import DiaryCollection from './DiaryCollection';
import RecordsCollection from './RecordsCollection';
import HealthcareCollection from './HealthcareCollection';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('userId'));

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
          <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
          <Route path="/diary-collection" element={isAuthenticated ? <DiaryCollection /> : <Navigate to="/login" />} />
          <Route path="/records-collection" element={isAuthenticated ? <RecordsCollection /> : <Navigate to="/login" />} />
          <Route path="/healthcare-collection" element={isAuthenticated ? <HealthcareCollection /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;