import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { listJobs, listPayments } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Sparkles, Target, Shield, Users, BarChart3, Wallet, Zap, TrendingUp, Star, X } from 'lucide-react';
import { getScoreProps } from '../utils/scoreColor.js';

export default function Home({ config }) {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const popupRef = useRef(null);

  // Feature descriptions map
  const featureDescriptions = {
    'AI Skill Matching': 'Automatically matches job seekers to jobs using AI by comparing skills, experience, and job requirements.',
    'Resume Parsing': 'Extracts skills, education, and experience from resumes to build structured candidate profiles instantly.',
    'Premium Fitment Scores': 'Shows AI-generated job fitment scores to highlight how well a candidate matches each role.',
    'Polygon / MetaMask Payments': 'Handles secure on-chain payments using Polygon network and MetaMask for jobs and premium access.',
    'Role-Based Dashboards': 'Provides separate dashboards for Admins, Recruiters, and Job Seekers with tailored features.',
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setSelectedFeature(null);
      }
    };

    if (selectedFeature) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedFeature]);

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
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="pt-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Build your next career move with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                AI-powered hiring
              </span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed max-w-xl">
              A modern job & hiring platform with AI skill extraction, smart matching, and secure on-chain payments.
            </p>

            {/* Feature Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['AI Skill Matching', 'Resume Parsing', 'Premium Fitment Scores', 'Polygon / MetaMask Payments', 'Role-Based Dashboards'].map((feature) => (
                <motion.button
                  key={feature}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFeature(feature)}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                >
                  {feature}
                </motion.button>
              ))}
            </div>

            {/* CTA Buttons */}
            {!user && (
              <div className="flex flex-wrap gap-4 pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                  >
                    Get Started →
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-white border-2 border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all duration-200"
                  >
                    View Jobs
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Recruiter Quick Actions */}
            {user?.role === 'recruiter' && (
              <div className="pt-4">
                <Link
                  to="/dashboard/recruiter"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-purple-500/25"
                >
                  Go to Dashboard →
                </Link>
              </div>
            )}
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center relative"
          >
            <div className="relative w-full h-96">
              {/* Abstract Gradient Blobs */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-2xl"
                  ></motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-4 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl"
                  ></motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust / Value Strip */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="glass rounded-2xl p-8 border border-white/10"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            { icon: Target, label: 'Smart Matching', desc: 'AI-powered' },
            { icon: Shield, label: 'On-chain Transparency', desc: 'Secure' },
            { icon: Star, label: 'Premium Candidates', desc: 'Verified' },
            { icon: BarChart3, label: 'Recruiter Analytics', desc: 'Data-driven' },
            { icon: Wallet, label: 'Secure Payments', desc: 'MetaMask' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-2">
                <item.icon className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-xs text-white/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Live Job Feed Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl lg:text-4xl font-bold">Live Job Opportunities</h2>
          <p className="text-white/60">Explore roles posted by verified recruiters</p>
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-900/30 border border-red-700/40 rounded-xl p-4 text-center">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-48 glass rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && jobs && jobs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-purple-500/10"
                onClick={() => {
                  if (user?.role === 'seeker') {
                    navigate(`/dashboard/job-seeker/jobs/${job.id || job._id}`);
                  } else if (user?.role === 'recruiter') {
                    navigate(`/dashboard/recruiter/jobs`);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-white flex-1 pr-2">{job.title}</h3>
                  <span className="text-xs font-medium text-white/60 bg-white/10 px-2 py-1 rounded-full whitespace-nowrap">
                    {job.location || 'Remote'}
                  </span>
                </div>
                <p className="text-white/70 text-sm mb-4 line-clamp-3 leading-relaxed">{job.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills?.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 bg-white/10 rounded-full text-white/80 border border-white/5"
                    >
                      {s}
                    </span>
                  ))}
                  {job.skills?.length > 4 && (
                    <span className="text-xs px-2.5 py-1 text-white/50">+{job.skills.length - 4}</span>
                  )}
                </div>
                {job.match_scores && Object.values(job.match_scores).length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <p {...getScoreProps(Object.values(job.match_scores)[0], { className: 'text-sm' })}>
                      Match: {Object.values(job.match_scores)[0].toFixed(1)}%
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {!loading && (!jobs || jobs.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl p-12 text-center border border-white/10"
          >
            <p className="text-xl font-semibold mb-2">No jobs yet.</p>
            <p className="text-sm text-white/70 mb-6">Recruiters can post after paying the platform fee.</p>
            {!user && (
              <div className="flex justify-center gap-3">
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl font-semibold text-white border-2 border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* Premium Value Section */}
      {!user && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="glass rounded-2xl p-12 border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-blue-900/20"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Why Premium?</h2>
            <p className="text-white/60">Unlock advanced features for job seekers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: Zap,
                title: 'See AI Match Scores',
                desc: 'Know how well you match with each job before applying',
              },
              {
                icon: TrendingUp,
                title: 'Rank Higher for Recruiters',
                desc: 'Premium candidates appear first in recruiter searches',
              },
              {
                icon: BarChart3,
                title: 'Unlock Smart Insights',
                desc: 'Get detailed analytics on your job application performance',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glass rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              Upgrade to Premium →
            </Link>
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 pt-12 mt-20">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                RizeOS Portal
              </span>
            </div>
            <p className="text-sm text-white/60 max-w-md">
              A modern job & hiring platform powered by AI and blockchain technology.
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-white/80">Platform</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-sm text-white/60 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="block text-sm text-white/60 hover:text-white transition-colors">
                  Register
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-white/80">Legal</h4>
              <div className="space-y-2">
                <Link to="#" className="block text-sm text-white/60 hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>
                  Terms
                </Link>
                <Link to="#" className="block text-sm text-white/60 hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <p className="text-xs text-white/40 text-center">
            Platform fee: {config.platform_fee_matic} MATIC → {config.admin_wallet || 'Admin Wallet'}
          </p>
        </div>
      </footer>

      {/* Feature Description Popup */}
      <AnimatePresence>
        {selectedFeature && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelectedFeature(null)}
            />
            {/* Popup */}
            <motion.div
              ref={popupRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl bg-slate-900/95 backdrop-blur-xl">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedFeature}</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedFeature(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                <p className="text-white/80 leading-relaxed">
                  {featureDescriptions[selectedFeature]}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

