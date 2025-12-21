import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import PaymentButton from '../components/PaymentButton.jsx';
import SeekerProfileCard from '../components/SeekerProfileCard.jsx';
import { createJob, listJobs, listPayments, listUsers, updateProfile, getProfile } from '../services/api.js';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

export default function RecruiterDashboard({ config }) {
  const { token, user, refreshProfile } = useAuth();
  const location = useLocation();
  const [paymentId, setPaymentId] = useState('');
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', skills: '', location: '', budget: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState({ name: '', bio: '', linkedin_url: '', skills: [], wallet_address: '' });
  const [seekerQuery, setSeekerQuery] = useState({ name: '', skills: '' });
  const [seekers, setSeekers] = useState([]);
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(false);

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await listJobs(token);
      if (Array.isArray(res)) setJobs(res);
      else if (Array.isArray(res?.jobs)) setJobs(res.jobs);
      else setJobs([]);
    } catch (err) {
      console.error('Failed to load jobs', err);
      setJobs([]);
      toast.error('Failed to load jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    listPayments(token)
      .then((res) => {
        if (Array.isArray(res)) return setPayments(res);
        if (Array.isArray(res?.payments)) return setPayments(res.payments);
        setPayments([]);
      })
      .catch((err) => {
        console.error('Failed to load payments', err);
        setPayments([]);
      });

    getProfile(token)
      .then((p) => setProfile({
        name: p.name || '',
        bio: p.bio || '',
        linkedin_url: p.linkedin_url || '',
        skills: p.skills || [],
        wallet_address: p.wallet_address || '',
      }))
      .catch(console.error);
  }, [token]);

  // Respect ?tab=profile to open existing profile view without exposing a tab button.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'profile') {
      setActiveTab('profile');
    }
  }, [location.search]);

  const loadSeekers = async () => {
    try {
      const res = await listUsers(token, { role: 'seeker', name: seekerQuery.name, skills: seekerQuery.skills });
      setSeekers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load seekers', err);
      setSeekers([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'seekers') {
      loadSeekers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
      const job = await createJob(token, payload);
      setJobs([job, ...jobs]);
      toast.success('Job created');
      await loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Job creation failed');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: profile.name,
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        skills: Array.isArray(profile.skills) ? profile.skills : (profile.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
        wallet_address: profile.wallet_address,
      };
      await updateProfile(token, payload);
      await refreshProfile();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Profile update failed');
    }
  };

  const seekerSkills = useMemo(() => (selectedSeeker?.skills || []), [selectedSeeker]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button className={`px-4 py-2 rounded-lg border border-white/20 ${activeTab === 'overview' ? 'bg-white/10' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`px-4 py-2 rounded-lg border border-white/20 ${activeTab === 'jobs' ? 'bg-white/10' : ''}`} onClick={() => setActiveTab('jobs')}>Jobs</button>
        <button className={`px-4 py-2 rounded-lg border border-white/20 ${activeTab === 'post' ? 'bg-white/10' : ''}`} onClick={() => setActiveTab('post')}>Post Job</button>
        <button className={`px-4 py-2 rounded-lg border border-white/20 ${activeTab === 'seekers' ? 'bg-white/10' : ''}`} onClick={() => setActiveTab('seekers')}>Job Seekers</button>
        <a href="/" className="ml-auto text-sm text-secondary underline">Back to Home</a>
      </div>

      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Welcome back</h2>
            <p className="text-white/70 text-sm">Manage jobs and candidates from your dashboard.</p>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => setActiveTab('post')}>Add Post</button>
              <button className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10" onClick={() => setActiveTab('jobs')}>View Jobs</button>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold mb-2">Recent Payments</h3>
            <div className="space-y-2 max-h-48 overflow-auto">
              {(payments || []).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm bg-white/5 p-3 rounded-lg">
                  <span className="truncate">{p.tx_hash || p.txHash}</span>
                  <span className="text-accent">{p.amount} MATIC</span>
                </div>
              ))}
              {payments.length === 0 && <p className="text-sm text-white/60">No payments yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'post' && (
        <div className="glass rounded-2xl p-6 space-y-4">
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
      )}

      {activeTab === 'jobs' && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">My Jobs</h3>
            <button className="text-xs px-3 py-1 rounded-lg bg-white/10 border border-white/20" onClick={loadJobs} disabled={jobsLoading}>
              {jobsLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {(jobs || []).map((job) => (
              <div key={job.id} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{job.title}</span>
                  <span className="text-xs text-white/60">{job.location || 'Remote'}</span>
                </div>
                <p className="text-sm text-white/70 line-clamp-2">{job.description}</p>
              </div>
            ))}
            {jobs.length === 0 && !jobsLoading && <p className="text-sm text-white/60">No jobs yet.</p>}
            {jobsLoading && <p className="text-sm text-white/60">Loading jobs…</p>}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          <form className="grid gap-3" onSubmit={handleProfileSave}>
            <input className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <textarea className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Company Description" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            <input className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Company Name / LinkedIn" value={profile.linkedin_url} onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })} />
            <input className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Skills (comma separated)" value={Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} />
            <input className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Wallet Address" value={profile.wallet_address} onChange={(e) => setProfile({ ...profile, wallet_address: e.target.value })} />
            <motion.button whileHover={{ scale: 1.01 }} type="submit" className="btn-primary w-full">Save Profile</motion.button>
          </form>
        </div>
      )}

      {activeTab === 'seekers' && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <input className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Search name" value={seekerQuery.name} onChange={(e) => setSeekerQuery({ ...seekerQuery, name: e.target.value })} />
            <input className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Skills (comma separated)" value={seekerQuery.skills} onChange={(e) => setSeekerQuery({ ...seekerQuery, skills: e.target.value })} />
            <button className="btn-primary px-4 py-2" onClick={loadSeekers}>Search</button>
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="text-left text-white/70">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Skills</th>
                </tr>
              </thead>
              <tbody>
                {seekers.map((s) => (
                  <tr key={s.id || s._id} className="border-t border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => setSelectedSeeker(s)}>
                    <td className="py-2 pr-4">{s.name}</td>
                    <td className="py-2 pr-4 truncate">{s.email}</td>
                    <td className="py-2 pr-4 truncate">{(s.skills || []).join(', ')}</td>
                  </tr>
                ))}
                {seekers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-white/60">No seekers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {selectedSeeker && (
            <SeekerProfileCard seeker={selectedSeeker} currentUserId={user?.id} onClose={() => setSelectedSeeker(null)} />
          )}
        </div>
      )}
    </div>
  );
}

