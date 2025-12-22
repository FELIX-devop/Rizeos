import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getDashboardRoute } from '../utils/routes.js';

export default function Login() {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    <div className="max-w-md mx-auto glass rounded-2xl p-6">
      <h2 className="text-2xl font-semibold mb-4">Welcome back</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-white/70">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20" required />
        </div>
        <div>
          <label className="text-sm text-white/70">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20" required />
        </div>
        <motion.button whileHover={{ scale: 1.01 }} type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Loading...' : 'Login'}
        </motion.button>
      </form>
      <p className="text-sm text-white/60 mt-3">
        New here? <Link to="/register" className="text-secondary">Create account</Link>
      </p>
    </div>
  );
}

