import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { createJob } from '../../services/api.js';
import { toast } from 'sonner';
import PaymentButton from '../../components/PaymentButton.jsx';

export default function DashboardPostJob() {
  const { token, config, loadJobs } = useOutletContext();
  const [paymentId, setPaymentId] = useState('');
  const [form, setForm] = useState({ title: '', description: '', skills: '', location: '', budget: '' });

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!paymentId) {
      toast.error('Complete MetaMask payment first');
      return;
    }
    try {
      const payload = {
        title: form.title,
        description: form.description,
        skills: form.skills.split(',').map((s) => s.trim()),
        location: form.location,
        budget: Number(form.budget || 0),
        payment_id: paymentId,
      };
      await createJob(token, payload);
      toast.success('Job created');
      await loadJobs();
      setForm({ title: '', description: '', skills: '', location: '', budget: '' });
      setPaymentId('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Job creation failed');
    }
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-4 min-h-[70vh]">
      <h2 className="text-xl font-semibold">Post a job</h2>
      <PaymentButton adminWallet={config.admin_wallet} platformFee={config.platform_fee_matic || 0.1} onVerified={(id) => { setPaymentId(id); toast.success('Payment verified'); }} />
      <form className="space-y-3" onSubmit={handleCreateJob}>
        <input className="w-full p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="w-full p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input className="w-full p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} required />
        <div className="flex gap-3">
          <input className="w-full p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input className="w-full p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
        </div>
        <motion.button whileHover={{ scale: 1.01 }} type="submit" className="btn-primary w-full">Create Job</motion.button>
      </form>
    </div>
  );
}

