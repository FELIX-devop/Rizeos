import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon, User } from 'lucide-react';
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
    navigate('/login');
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

  const { theme, toggleTheme } = useTheme();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-slate-900/70 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">RizeOS Portal</span>
        </Link>
        <div className="flex items-center gap-3 relative" ref={menuRef}>
          <motion.button whileTap={{ scale: 0.95 }} className="p-2 rounded-lg hover:bg-white/10" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
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
            <div className="flex gap-2 text-sm">
              <Link to="/login" className="btn-primary">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

