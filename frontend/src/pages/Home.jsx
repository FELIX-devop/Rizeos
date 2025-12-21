import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listJobs, listPayments } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home({ config }) {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listJobs(token)
      .then((res) => {
        if (Array.isArray(res)) {
          setJobs(res);
        } else if (Array.isArray(res?.jobs)) {
          setJobs(res.jobs);
        } else {
          setJobs([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load jobs', err);
        setJobs([]);
        setError('Unable to load jobs right now.');
      })
      .finally(() => setLoading(false));

    if (user?.role === 'recruiter') {
      setPaymentsLoading(true);
      listPayments(token)
        .then((res) => {
          if (Array.isArray(res)) setPayments(res);
          else if (Array.isArray(res?.payments)) setPayments(res.payments);
          else setPayments([]);
        })
        .catch((err) => {
          console.error('Failed to load payments', err);
          setPayments([]);
        })
        .finally(() => setPaymentsLoading(false));
    }
  }, [token, user]);

  return (
    <div className="space-y-10">
      <section className="gradient-card rounded-2xl p-8 shadow-2xl">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-4">
          Build your next move with <span className="text-accent">RizeOS</span>
        </motion.h1>
        <p className="text-white/80 max-w-2xl">
          A vibrant job & networking portal with AI skill extraction, smart matching, and on-chain platform fees on Polygon (MetaMask only).
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">AI Matching</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Polygon Mumbai</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">MetaMask</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Role-based Access</span>
        </div>
        {!user && (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary">Login to get started</Link>
            <Link to="/register" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">
              Register
            </Link>
          </div>
        )}
        {user?.role === 'recruiter' && (
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-4 space-y-3">
              <p className="text-sm text-white/70">Quick actions</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/dashboard/post-job" className="btn-primary">Post Job</Link>
                <Link to="/dashboard/jobs" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">Jobs</Link>
                <Link to="/dashboard/job-seekers" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">Job Seekers</Link>
              </div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white/70">Recent Payments</p>
                <Link to="/dashboard" className="text-xs text-secondary hover:underline">Go to dashboard</Link>
              </div>
              <div className="space-y-2 max-h-48 overflow-auto">
                {(payments || []).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm bg-white/5 p-3 rounded-lg">
                    <span className="truncate">{p.tx_hash || p.txHash}</span>
                    <span className="text-accent">{p.amount} MATIC</span>
                  </div>
                ))}
                {paymentsLoading && <p className="text-sm text-white/60">Loading…</p>}
                {!paymentsLoading && payments.length === 0 && <p className="text-sm text-white/60">No payments yet.</p>}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Live Feed</h2>
          <p className="text-sm text-white/60">Platform fee: {config.platform_fee_matic} MATIC → {config.admin_wallet}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {error && <div className="col-span-2 text-sm text-red-300 bg-red-900/30 border border-red-700/40 rounded p-3">{error}</div>}
          {loading &&
            Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-32 skeleton" />)}
          {!loading &&
            jobs.map((job) => (
              <motion.div key={job.id} whileHover={{ scale: 1.01 }} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <span className="text-xs text-white/60">{job.location || 'Remote'}</span>
                </div>
                <p className="text-white/70 text-sm mt-2 line-clamp-3">{job.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills?.map((s) => (
                    <span key={s} className="text-xs px-2 py-1 bg-white/10 rounded-full">{s}</span>
                  ))}
                </div>
                {job.match_scores && Object.values(job.match_scores).length > 0 && (
                  <p className="text-sm text-accent mt-2">Match score: {Object.values(job.match_scores)[0]}%</p>
                )}
              </motion.div>
            ))}
          {!loading && jobs.length === 0 && (
            <div className="col-span-2 glass rounded-xl p-5">
              <p className="font-semibold">No jobs yet.</p>
              <p className="text-sm text-white/70">Recruiters can post after paying the platform fee.</p>
              {!user && (
                <div className="flex gap-2 mt-3">
                  <Link to="/login" className="btn-primary">Login</Link>
                  <Link to="/register" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">Register</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

