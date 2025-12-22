import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getDashboardRoute } from '../utils/routes.js';

/**
 * PublicRoute Component
 * 
 * Protects public routes (Login/Register) from authenticated users.
 * 
 * Behavior:
 * - If user is authenticated → redirect to their dashboard (using replace to prevent back navigation)
 * - If user is not authenticated → allow access to public route
 */
export default function PublicRoute({ children }) {
  const { user, initializing } = useAuth();
  
  // Show nothing while checking authentication status
  if (initializing) {
    return null;
  }
  
  // If user is authenticated, redirect to their dashboard using replace
  // This prevents back button from showing login page
  if (user) {
    const userDashboard = getDashboardRoute(user.role);
    return <Navigate to={userDashboard} replace />;
  }
  
  // User is not authenticated, allow access to public route
  return children;
}

