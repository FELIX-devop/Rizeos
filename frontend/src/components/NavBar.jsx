import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon, User } from 'lucide-react';
import { getDashboardRoute } from '../utils/routes.js';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const goProfile = () => {
    if (!user) return;
    const baseRoute = getDashboardRoute(user.role);
    // Use dedicated profile route for recruiter, fallback to base route for others
    const target = user.role === 'recruiter'
      ? `${baseRoute}/profile`
      : baseRoute;
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

