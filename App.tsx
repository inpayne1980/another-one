
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './views/Dashboard';
import Appearance from './views/Appearance';
import Analytics from './views/Analytics';
import PublicProfile from './views/PublicProfile';
import LandingPage from './views/LandingPage';

const App: React.FC = () => {
  const username = "creative_mind"; 

  return (
    <HashRouter>
      <Routes>
        {/* Marketing / Entry Route */}
        <Route path="/welcome" element={<LandingPage />} />
        
        {/* Dashboard Routes (SaaS App) */}
        <Route path="/" element={
          <DashboardLayout username={username}>
            <Dashboard />
          </DashboardLayout>
        } />
        <Route path="/appearance" element={
          <DashboardLayout username={username}>
            <Appearance />
          </DashboardLayout>
        } />
        <Route path="/analytics" element={
          <DashboardLayout username={username}>
            <Analytics />
          </DashboardLayout>
        } />
        
        {/* Public Profile Route */}
        <Route path="/p/:username" element={<PublicProfile />} />
        
        {/* Navigation Utilities */}
        <Route path="/preview" element={<Navigate to={`/p/${username}`} replace />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
