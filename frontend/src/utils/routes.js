/**
 * Role-based routing utilities
 * Maps user roles to their respective dashboard routes
 */

/**
 * Get the dashboard route for a given role
 * @param {string} role - User role (admin, recruiter, seeker)
 * @returns {string} Dashboard route path
 */
export function getDashboardRoute(role) {
  const routeMap = {
    admin: '/dashboard/admin',
    recruiter: '/dashboard/recruiter',
    seeker: '/dashboard/job-seeker',
  };
  
  return routeMap[role?.toLowerCase()] || '/';
}

/**
 * Check if a route requires authentication
 * @param {string} pathname - Current pathname
 * @returns {boolean}
 */
export function isProtectedRoute(pathname) {
  return pathname.startsWith('/dashboard');
}

/**
 * Check if a route is public (no auth required)
 * @param {string} pathname - Current pathname
 * @returns {boolean}
 */
export function isPublicRoute(pathname) {
  return ['/', '/login', '/register'].includes(pathname);
}

