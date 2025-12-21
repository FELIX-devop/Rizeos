import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seeker',
    admin_signup_code: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('Account created');
      navigate(`/dashboard/${form.role}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-xl mx-auto glass rounded-2xl p-6">
      <h2 className="text-2xl font-semibold mb-2">Create an account</h2>
      <p className="text-sm text-white/60 mb-4">Choose role: recruiter or job seeker. Admin requires secret code.</p>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-white/70">Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20" required />
        </div>
        <div>
          <label className="text-sm text-white/70">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20" required />
        </div>
        <div>
          <label className="text-sm text-white/70">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20" required />
        </div>
        <div>
          <label className="text-sm text-white/70">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20">
            <option value="seeker">Job Seeker</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin (code required)</option>
          </select>
        </div>
        {form.role === 'admin' && (
          <div>
            <label className="text-sm text-white/70">Admin Sign-up Code</label>
            <input name="admin_signup_code" value={form.admin_signup_code} onChange={handleChange} className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20" />
          </div>
        )}
        <motion.button whileHover={{ scale: 1.01 }} type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating...' : 'Register'}
        </motion.button>
      </form>
      <p className="text-sm text-white/60 mt-3">
        Already have an account? <Link to="/login" className="text-secondary">Login</Link>
      </p>
    </div>
  );
}

