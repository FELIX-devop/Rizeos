import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getDashboardRoute } from '../utils/routes.js';

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication and specific roles.
 * 
 * @param {Array<string>} roles - Array of allowed roles (e.g., ['admin', 'recruiter'])
 * @param {React.ReactNode} children - Child components to render if access is granted
 * 
 * Behavior:
 * - If user is not authenticated → redirect to /login
 * - If user's role is not in allowed roles → redirect to their own dashboard
 * - If user is authenticated and has correct role → render children
 */
export default function ProtectedRoute({ roles, children }) {
  const { user, initializing } = useAuth();
  
  // Show nothing while checking authentication status
  if (initializing) {
    return null;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified and user's role is not allowed
  if (roles && !roles.includes(user.role)) {
    // Redirect to user's own dashboard instead of login
    // This provides better UX - user sees their dashboard, not an error
    const userDashboard = getDashboardRoute(user.role);
    return <Navigate to={userDashboard} replace />;
  }
  
  // User is authenticated and has correct role
  return children;
}

