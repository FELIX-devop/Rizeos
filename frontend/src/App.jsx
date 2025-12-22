import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import NavBar from './components/NavBar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUserProfile from './pages/AdminUserProfile.jsx';
import AdminJobProfile from './pages/AdminJobProfile.jsx';
import AdminProfilePage from './pages/AdminProfilePage.jsx';
import SeekerDashboard from './pages/SeekerDashboard.jsx';
import SeekerInboxPage from './pages/seeker/SeekerInboxPage.jsx';
import SeekerProfilePage from './pages/seeker/SeekerProfilePage.jsx';
import JobSeekerJobDetail from './pages/seeker/JobSeekerJobDetail.jsx';
import JobSeekerRecruiterProfile from './pages/seeker/JobSeekerRecruiterProfile.jsx';
import RecruiterDashboardLayout from './pages/recruiter/RecruiterDashboardLayout.jsx';
import Overview from './pages/recruiter/Overview.jsx';
import PostJobPage from './pages/recruiter/PostJobPage.jsx';
import JobsPage from './pages/recruiter/JobsPage.jsx';
import JobSeekersPage from './pages/recruiter/JobSeekersPage.jsx';
import PaymentsPage from './pages/recruiter/PaymentsPage.jsx';
import RecruiterMessagesHub from './pages/recruiter/RecruiterMessagesHub.jsx';
import SendMessageToAdminPage from './pages/recruiter/SendMessageToAdminPage.jsx';
import RecruiterInboxPage from './pages/recruiter/RecruiterInboxPage.jsx';
import ProfilePage from './pages/recruiter/ProfilePage.jsx';
import RecruiterAnalyticsPage from './pages/recruiter/RecruiterAnalyticsPage.jsx';
import JobApplicantsPage from './pages/recruiter/JobApplicantsPage.jsx';
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
          {/* Public Routes */}
          <Route path="/" element={<Home config={publicConfig} />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Role-Based Dashboard Routes */}
          <Route
            path="/dashboard/recruiter"
            element={
              <ProtectedRoute roles={['recruiter']}>
                <RecruiterDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="post-job" element={<PostJobPage config={publicConfig} />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="job-seekers" element={<JobSeekersPage />} />
            <Route path="payments" element={<PaymentsPage config={publicConfig} />} />
            <Route path="messages" element={<RecruiterMessagesHub />} />
            <Route path="messages/send" element={<SendMessageToAdminPage />} />
            <Route path="messages/inbox" element={<RecruiterInboxPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="analytics" element={<RecruiterAnalyticsPage />} />
            <Route path="jobs/:jobId/applicants" element={<JobApplicantsPage />} />
          </Route>
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/profile"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/users/:userId"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/jobs/:jobId"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminJobProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/job-seeker"
            element={
              <ProtectedRoute roles={['seeker']}>
                <SeekerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/job-seeker/inbox"
            element={
              <ProtectedRoute roles={['seeker']}>
                <SeekerInboxPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/job-seeker/jobs/:jobId"
            element={
              <ProtectedRoute roles={['seeker']}>
                <JobSeekerJobDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/job-seeker/recruiters/:recruiterId"
            element={
              <ProtectedRoute roles={['seeker']}>
                <JobSeekerRecruiterProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/job-seeker/profile"
            element={
              <ProtectedRoute roles={['seeker']}>
                <SeekerProfilePage />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect old routes to new structure */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/recruiter" replace />} />
          <Route path="/dashboard/seeker" element={<Navigate to="/dashboard/job-seeker" replace />} />
        </Routes>
        {!user && <p className="text-sm text-white/60 mt-6">Tip: register as recruiter to test payments and job posts.</p>}
      </main>
      <Toaster richColors position="top-right" expand={true} closeButton />
    </BrowserRouter>
  );
}

