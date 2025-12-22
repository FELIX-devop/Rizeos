import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getDashboardRoute } from '../utils/routes.js';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, Briefcase, Search, Shield, Check } from 'lucide-react';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'seeker',
    admin_signup_code: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleSelect = (role) => {
    setForm({ ...form, role, admin_signup_code: role !== 'admin' ? '' : form.admin_signup_code });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate password match
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      // Exclude confirmPassword from API call
      const { confirmPassword, ...registerData } = form;
      const data = await register(registerData);
      toast.success('Account created');
      const role = data?.user?.role || form.role;
      const dashboardRoute = getDashboardRoute(role);
      // Use replace to prevent back button from showing register page
      navigate(dashboardRoute, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Register Card */}
        <div className="w-full max-w-[460px] mx-auto lg:mx-0">
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
              <h2 className="text-3xl font-bold text-white mb-2">Create your account 🚀</h2>
              <p className="text-sm text-white/60">Join the AI-powered job & hiring platform</p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Section 1: Basic Details */}
              <div className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Security */}
              <div className="space-y-5">
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
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

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Role Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/80 mb-3">Select Your Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Job Seeker Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('seeker')}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      form.role === 'seeker'
                        ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        form.role === 'seeker' ? 'bg-purple-500/20' : 'bg-white/10'
                      }`}>
                        <Search className={`w-5 h-5 ${form.role === 'seeker' ? 'text-purple-400' : 'text-white/60'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white mb-1">Job Seeker</p>
                        <p className="text-xs text-white/60">Find jobs with AI matching</p>
                      </div>
                      {form.role === 'seeker' && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Recruiter Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('recruiter')}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      form.role === 'recruiter'
                        ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        form.role === 'recruiter' ? 'bg-purple-500/20' : 'bg-white/10'
                      }`}>
                        <Briefcase className={`w-5 h-5 ${form.role === 'recruiter' ? 'text-purple-400' : 'text-white/60'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white mb-1">Recruiter</p>
                        <p className="text-xs text-white/60">Post jobs & hire faster</p>
                      </div>
                      {form.role === 'recruiter' && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Admin Option (Hidden by default, shown when needed) */}
                {form.role === 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-3 border-t border-white/10"
                  >
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                      <Shield className="w-5 h-5 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Admin Access</p>
                        <p className="text-xs text-white/60">Requires sign-up code</p>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="admin_signup_code" className="block text-sm font-medium text-white/80 mb-2">
                        Admin Sign-up Code
                      </label>
                      <input
                        id="admin_signup_code"
                        name="admin_signup_code"
                        type="text"
                        value={form.admin_signup_code}
                        onChange={handleChange}
                        placeholder="Enter admin code"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('seeker')}
                      className="text-xs text-white/60 hover:text-white transition-colors"
                    >
                      ← Back to role selection
                    </button>
                  </motion.div>
                )}

                {/* Admin Toggle (Small link) */}
                {form.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className="text-xs text-white/50 hover:text-white/70 transition-colors"
                  >
                    Admin? Enter code →
                  </button>
                )}
              </div>

              {/* Primary Register Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/80 text-white/40">Already have an account?</span>
                </div>
              </div>

              {/* Login CTA */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-block px-6 py-2.5 rounded-xl font-medium text-white border-2 border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  Sign in
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
            className="space-y-8 max-w-md"
          >
            {/* Abstract Shapes */}
            <div className="relative w-72 h-72 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-2xl rotate-12"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl -rotate-12"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-20 h-20 text-purple-400" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-white">Smarter hiring starts here</h3>
              <div className="space-y-3 text-left">
                {[
                  { icon: Sparkles, text: 'AI Resume Parsing' },
                  { icon: Briefcase, text: 'Premium Match Scores' },
                  { icon: Shield, text: 'On-chain Payments' },
                  { icon: User, text: 'Role-based Dashboards' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-white/80">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

