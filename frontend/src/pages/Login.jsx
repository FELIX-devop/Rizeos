import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getDashboardRoute } from '../utils/routes.js';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Login() {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      toast.success('Logged in');
      const role = data?.user?.role || user?.role;
      const dashboardRoute = getDashboardRoute(role);
      // Use replace to prevent back button from showing login page
      navigate(dashboardRoute, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Login Card */}
        <div className="w-full max-w-[420px] mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl bg-slate-900/80"
          >
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  RizeOS Portal
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back 👋</h2>
              <p className="text-sm text-white/60">Sign in to continue to your dashboard</p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="#"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Primary Login Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/80 text-white/40">or</span>
                </div>
              </div>

              {/* Register CTA */}
              <div className="text-center">
                <p className="text-sm text-white/60 mb-3">New here?</p>
                <Link
                  to="/register"
                  className="inline-block px-6 py-2.5 rounded-xl font-medium text-white border-2 border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  Create an account
                </Link>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right: Visual Panel (Desktop Only) */}
        <div className="hidden lg:flex flex-col items-center justify-center p-12 text-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6 max-w-md"
          >
            {/* Abstract Shapes */}
            <div className="relative w-64 h-64 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-2xl rotate-12"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl -rotate-12"></div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white">
              Find jobs smarter with AI-powered matching
            </h3>
            <p className="text-white/60 text-lg">
              Connect with opportunities that match your skills and career goals
            </p>

            {/* Feature Icons */}
            <div className="flex justify-center gap-6 mt-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-xs text-white/60">AI Matching</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs text-white/60">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-xs text-white/60">Direct Connect</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

