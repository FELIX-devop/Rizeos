import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRecruiterUnreadCount } from '../../services/api.js';

/**
 * RecruiterDashboardLayout
 * 
 * Layout wrapper for nested recruiter dashboard routes.
 * Provides consistent header and navigation.
 */
export default function RecruiterDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const isOverview = location.pathname === '/dashboard/recruiter' || location.pathname === '/dashboard/recruiter/';

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

  return (
    <div className="space-y-4">
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
    </div>
  );
}

