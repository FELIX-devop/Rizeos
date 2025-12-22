import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import PaymentButton from '../../components/PaymentButton.jsx';
import { createJob } from '../../services/api.js';
import { toast } from 'sonner';

/**
 * PostJobPage
 * 
 * Dedicated page for creating job postings.
 * This is the ONLY place where createJob API is called.
 */
export default function PostJobPage({ config }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [paymentId, setPaymentId] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    skills: '',
    location: '',
    budget: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!paymentId) {
      toast.error('Complete MetaMask payment first');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        location: form.location,
        budget: Number(form.budget || 0),
        payment_id: paymentId,
      };
      await createJob(token, payload);
      toast.success('Job created successfully!');
      
      // Reset form
      setForm({ title: '', description: '', skills: '', location: '', budget: '' });
      setPaymentId('');
      
      // Redirect to jobs page to see the new job
      navigate('/dashboard/recruiter/jobs');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Job creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/recruiter')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Overview
        </button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Post a Job</h2>
        <p className="text-sm text-white/70">Complete payment to post your job listing</p>

        <PaymentButton
          adminWallet={config.admin_wallet}
          platformFee={config.platform_fee_matic || 0.1}
          onVerified={(id) => {
            setPaymentId(id);
            toast.success('Payment verified');
          }}
        />

        <form className="space-y-4" onSubmit={handleCreateJob}>
          <div>
            <label className="text-sm text-white/70 mb-1 block">Job Title</label>
            <input
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors"
              placeholder="e.g., Senior Frontend Developer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70 mb-1 block">Description</label>
            <textarea
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Describe the role, requirements, and benefits..."
              rows={6}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70 mb-1 block">Required Skills (comma separated)</label>
            <input
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors"
              placeholder="React, TypeScript, Node.js"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Location</label>
              <input
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors"
                placeholder="Remote / City"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">Budget (ETH)</label>
              <input
                type="number"
                step="0.001"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors"
                placeholder="0.1"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={!paymentId || submitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Job'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}


