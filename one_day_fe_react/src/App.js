import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import DiaryCollection from './DiaryCollection';
import StopwatchCollection from './StopwatchCollection';
import HealthcareCollection from './HealthcareCollection';
import MainLayout from './MainLayout';
import Profile from './Profile';
import Diary from './Diary'; // Import Diary component
import DiaryView from './DiaryView'; // Import DiaryView component
import { useProfile } from './ProfileContext'; // Import useProfile

import { DataProvider } from './DataContext'; // Import DataProvider

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem('userId');
      setIsAuthenticated(!!userId);
    };

    checkAuth(); // Check on initial load

    window.addEventListener('storage', checkAuth); // Check on storage change

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const DiaryWrapper = () => {
    const { date } = useParams();
    const { profile } = useProfile();
    const selectedDate = date || new Date().toISOString().split('T')[0];
    return <Diary selectedDate={selectedDate} userId={profile.userId} />;
  };

  const DiaryViewWrapper = () => {
    const { id } = useParams();
    return <DiaryView id={id} />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
          
          <Route element={isAuthenticated ? <DataProvider><MainLayout /></DataProvider> : <Navigate to="/login" />} >
            <Route path="/home" element={<Home />} />
            <Route path="/diary-collection" element={<DiaryCollection />} />
            <Route path="/diary" element={<DiaryWrapper />} />
            <Route path="/diary/:date" element={<DiaryWrapper />} />
            <Route path="/diary-view/id/:id" element={<DiaryViewWrapper />} />
            <Route path="/stopwatch-collection" element={<StopwatchCollection />} />
            <Route path="/healthcare-collection" element={<HealthcareCollection />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;