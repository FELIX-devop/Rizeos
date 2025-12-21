import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import NavBar from './components/NavBar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import SeekerDashboard from './pages/SeekerDashboard.jsx';
import DashboardLayout from './pages/recruiter/DashboardLayout.jsx';
import DashboardOverview from './pages/recruiter/DashboardOverview.jsx';
import DashboardJobs from './pages/recruiter/DashboardJobs.jsx';
import DashboardPostJob from './pages/recruiter/DashboardPostJob.jsx';
import DashboardJobSeekers from './pages/recruiter/DashboardJobSeekers.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { fetchConfig } from './services/api.js';

export default function App() {
  const { user } = useAuth();
  const [publicConfig, setPublicConfig] = useState({ admin_wallet: '', platform_fee_matic: 0.1 });

  useEffect(() => {
    fetchConfig().then(setPublicConfig).catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <NavBar />
      <main className="pt-20 min-h-screen max-w-6xl mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home config={publicConfig} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['recruiter']}>
                <DashboardLayout config={publicConfig} />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="jobs" element={<DashboardJobs />} />
            <Route path="post-job" element={<DashboardPostJob />} />
            <Route path="job-seekers" element={<DashboardJobSeekers />} />
          </Route>
          {/* Backward compatibility for legacy recruiter path */}
          <Route path="/dashboard/recruiter" element={<Navigate to="/dashboard/post-job" replace />} />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/seeker"
            element={
              <ProtectedRoute roles={['seeker']}>
                <SeekerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        {!user && <p className="text-sm text-white/60 mt-6">Tip: register as recruiter to test payments and job posts.</p>}
      </main>
      <Toaster richColors />
    </BrowserRouter>
  );
}

