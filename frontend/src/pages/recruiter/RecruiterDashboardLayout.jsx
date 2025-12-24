import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRecruiterUnreadCount, getRecruiterAnnouncements } from '../../services/api.js';
import RecruiterAnnouncementModal from '../../components/RecruiterAnnouncementModal.jsx';

/**
 * RecruiterDashboardLayout
 * 
 * Layout wrapper for nested recruiter dashboard routes.
 * Provides consistent header and navigation.
 */
export default function RecruiterDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const isOverview = location.pathname === '/dashboard/recruiter' || location.pathname === '/dashboard/recruiter/';
  
  // Only show announcements for recruiters (not admin, not job seeker)
  const isRecruiter = user?.role === 'recruiter';

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const result = await getRecruiterUnreadCount(token);
        setUnreadCount(result.unread_count || 0);
      } catch (err) {
        console.error('Failed to load unread count', err);
      }
    };
    loadUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Load announcements for recruiters ONLY (not admin, not job seeker)
  const loadAnnouncements = async () => {
    // Only load announcements if user is a recruiter
    if (!isRecruiter || !token) {
      setAnnouncements([]);
      return;
    }

    setLoadingAnnouncements(true);
    try {
      const data = await getRecruiterAnnouncements(token);
      // Handle response format: backend returns {data: [...]} or array directly
      let annList = [];
      if (Array.isArray(data)) {
        annList = data;
      } else if (data?.data) {
        // If data.data is an array, use it; if it's a single object, wrap it in array
        annList = Array.isArray(data.data) ? data.data : [data.data];
      } else if (data && typeof data === 'object') {
        // Single announcement object (shouldn't happen but handle it)
        annList = [data];
      }
      setAnnouncements(annList);
    } catch (err) {
      console.error('Failed to load announcements', err);
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    // Refresh announcements every 5 minutes
    const interval = setInterval(loadAnnouncements, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, isRecruiter]);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Announcements Banner - Only visible for recruiters (not admin, not job seeker) */}
      {isRecruiter && !loadingAnnouncements && announcements.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-white">Announcements</h3>
            </div>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-accent hover:bg-accent/80 text-white font-medium transition-colors"
              title="Create announcement"
            >
              + New
            </button>
          </div>
          <div className="space-y-2">
            {announcements.map((announcement) => {
              const isAdmin = announcement.from_role === 'admin';
              const isRecruiter = announcement.from_role === 'recruiter';
              return (
                <div
                  key={announcement.id || announcement._id}
                  className={`bg-white/5 rounded-lg p-3 border ${
                    isAdmin ? 'border-blue-500/30' : isRecruiter ? 'border-purple-500/30' : 'border-white/10'
                  }`}
                >
                  <p className="text-white/90 mb-1">{announcement.message}</p>
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span className="flex items-center gap-2">
                      <span>From:</span>
                      <span className={`px-2 py-0.5 rounded ${
                        isAdmin ? 'bg-blue-500/20 text-blue-300' : isRecruiter ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10'
                      }`}>
                        {isAdmin ? 'Admin' : isRecruiter ? 'Recruiter' : announcement.from_role || 'Admin'}
                      </span>
                    </span>
                    {announcement.created_at && (
                      <span>{formatDate(announcement.created_at)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
          {isOverview && (
            <p className="text-sm text-white/70 mt-1">Navigate to manage jobs, candidates, and payments</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/recruiter/messages/inbox')}
            className="relative p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
            title="Messages"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <Link to="/" className="text-sm text-secondary underline hover:text-secondary/80">
            Back to Home
          </Link>
        </div>
      </div>

      {/* Nested Routes */}
      <Outlet />

      {/* Recruiter Announcement Modal */}
      <RecruiterAnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        onAnnouncementCreated={loadAnnouncements}
      />
    </div>
  );
}

