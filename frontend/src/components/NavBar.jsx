import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Sparkles } from 'lucide-react';
import { getDashboardRoute } from '../utils/routes.js';
import { getSeekerUnreadCount } from '../services/api.js';

export default function NavBar() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    // Use replace to prevent back button from accessing dashboard after logout
    navigate('/login', { replace: true });
    setMenuOpen(false);
  };

  const goProfile = () => {
    if (!user) return;
    const baseRoute = getDashboardRoute(user.role);
    // Use dedicated profile route for recruiter, admin, and seeker
    let target = baseRoute;
    if (user.role === 'recruiter') {
      target = `${baseRoute}/profile`;
    } else if (user.role === 'admin') {
      target = `${baseRoute}/profile`;
    } else if (user.role === 'seeker') {
      target = `${baseRoute}/profile`;
    }
    navigate(target);
    setMenuOpen(false);
  };

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Load unread count for job seekers
  useEffect(() => {
    if (user?.role === 'seeker' && token) {
      const loadUnreadCount = async () => {
        try {
          const result = await getSeekerUnreadCount(token);
          setUnreadCount(result.unread_count || 0);
        } catch (err) {
          console.error('Failed to load unread count', err);
        }
      };
      loadUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.role, token]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-slate-900/80 border-b border-white/5' : 'backdrop-blur-lg bg-slate-900/70 border-b border-white/10'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            RizeOS Portal
          </span>
        </Link>
        <div className="flex items-center gap-3 relative" ref={menuRef}>
          {user ? (
            <>
              {/* Inbox icon for job seekers */}
              {user.role === 'seeker' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/dashboard/job-seeker/inbox')}
                  className="relative p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                  title="Inbox"
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
                </motion.button>
              )}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="p-2 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Profile menu"
                  title="Profile"
                >
                  <User size={18} />
                </motion.button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-white/10 rounded-lg shadow-lg overflow-hidden">
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-white/10" onClick={goProfile}>
                      Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-white/10" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg font-medium text-white border-2 border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-purple-500/25"
                >
                  Register
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

