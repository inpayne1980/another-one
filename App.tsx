
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './views/Dashboard';
import Appearance from './views/Appearance';
import Analytics from './views/Analytics';
import Settings from './views/Settings';
import VideoEngine from './views/VideoEngine';
import PublicProfile from './views/PublicProfile';
import LandingPage from './views/LandingPage';

const App: React.FC = () => {
  const username = "creative_mind"; 

  return (
    <HashRouter>
      <Routes>
        <Route path="/welcome" element={<LandingPage />} />
        
        <Route path="/" element={
          <DashboardLayout username={username}>
            <Dashboard />
          </DashboardLayout>
        } />
        <Route path="/video-engine" element={
          <DashboardLayout username={username}>
            <VideoEngine />
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
        <Route path="/settings" element={
          <DashboardLayout username={username}>
            <Settings />
          </DashboardLayout>
        } />
        
        <Route path="/p/:username" element={<PublicProfile />} />
        <Route path="/preview" element={<Navigate to={`/p/${username}`} replace />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
