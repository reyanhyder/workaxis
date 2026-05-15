import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import LandingV2 from './pages/LandingV2';
import WelcomeHero from './pages/WelcomeHero';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div style={{ background: '#1a1a1a', height: '100vh' }} />;

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/welcome" /> : <LandingV2 />} />
        <Route path="/welcome" element={user ? <WelcomeHero /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
