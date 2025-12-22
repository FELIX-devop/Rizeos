import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { listJobs, getProfile, applyToJob, matchScore, getPremiumStatus, fetchConfig } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PremiumPaymentButton from '../components/PremiumPaymentButton.jsx';
import { getScoreProps } from '../utils/scoreColor.js';

export default function SeekerDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState({ name: '', bio: '', linkedin_url: '', skills: [], wallet_address: '' });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [config, setConfig] = useState({ admin_wallet: '', platform_fee_matic: 0.1 });
  const userId = user?.id || user?._id;

  const parseSkills = (raw) => (Array.isArray(raw) ? raw : (raw || '').split(',').map((s) => s.trim()).filter(Boolean));
  const candidateSkills = useMemo(() => parseSkills(profile.skills), [profile.skills]);
  const candidateSignature = useMemo(
    () => `${profile.bio || ''}|${candidateSkills.slice().sort().join(',')}`,
    [profile.bio, candidateSkills]
  );
  const jobsSignature = useMemo(
    () => JSON.stringify((jobs || []).map((j) => j.id || j._id || '')),
    [jobs]
  );


  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const data = await listJobs(token);
      setJobs(data || []);
    } catch (err) {
      console.error('jobs load error', err);
      toast.error('Failed to load jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    getProfile(token)
      .then((p) => {
        setProfile({
          name: p.name || '',
          bio: p.bio || '',
          linkedin_url: p.linkedin_url || '',
          skills: parseSkills(p.skills),
          wallet_address: p.wallet_address || '',
        });
        setProfileLoaded(true);
      })
      .catch(console.error);
    
    // Check premium status
    getPremiumStatus(token)
      .then((status) => {
        setIsPremium(status.is_premium || false);
        setCheckingPremium(false);
      })
      .catch((err) => {
        console.error('Failed to check premium status', err);
        setIsPremium(false);
        setCheckingPremium(false);
      });
    
    // Load config for payment
    fetchConfig()
      .then(setConfig)
      .catch(console.error);
  }, [token]);

  // Compute fitment scores via AI service; include skills context and refresh when profile changes.
  // Only compute scores if user is premium
  useEffect(() => {
    const run = async () => {
      if (!userId || !profileLoaded || !jobs || !jobs.length || !isPremium) return;
      const candidateText = `${profile.bio || ''}\nSkills: ${candidateSkills.join(', ')}`;
      setLoadingScores(true);
      try {
        const scoredJobs = await Promise.all(
          jobs.map(async (job) => {
            try {
              const score = await matchScore(job.description || '', candidateText, job.skills || [], candidateSkills);
              const match_scores = { ...(job.match_scores || {}) };
              match_scores[userId] = score;
              return { ...job, match_scores };
            } catch (err) {
              console.error('match score error', err);
              return job;
            }
          })
        );
        setJobs(scoredJobs);
      } finally {
        setLoadingScores(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateSignature, userId, profileLoaded, jobsSignature, isPremium]);


  const handleApply = async (jobId) => {
    try {
      await applyToJob(token, jobId);
      // Update local state to show "Applied" status
      setJobs((prev) => prev.map((j) => {
        if ((j.id || j._id) === jobId) {
          const candidates = j.candidates || [];
          if (!candidates.includes(userId)) {
            return { ...j, candidates: [...candidates, userId] };
          }
        }
        return j;
      }));
      toast.success('Applied successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Apply failed';
      if (errorMsg.includes('already applied')) {
        toast.info('You have already applied to this job');
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const isApplied = (job) => {
    if (!userId) return false;
    return (job.candidates || []).some((c) => c === userId);
  };


  const handlePremiumVerified = () => {
    // Refresh premium status after payment
    getPremiumStatus(token)
      .then((status) => {
        setIsPremium(status.is_premium || false);
        toast.success('Premium access activated! You can now see AI match scores.');
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Smart matches for {user?.name}</h2>
        <button className="text-sm px-3 py-2 rounded-lg bg-white/10 border border-white/20" onClick={loadJobs} disabled={jobsLoading}>
          {jobsLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      
      {/* Premium CTA - Compact */}
      {!checkingPremium && !isPremium && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <p className="text-sm text-white/80 font-medium">Unlock AI Job Match Score</p>
          <PremiumPaymentButton
            adminWallet={config.admin_wallet}
            platformFee={config.platform_fee_matic}
            onVerified={handlePremiumVerified}
          />
        </motion.div>
      )}
      
      {isPremium && (
        <div className="px-4 py-2 rounded-lg bg-accent/20 border border-accent/30 text-sm">
          ✓ Premium Active - AI Match Scores enabled
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <motion.div
            key={job.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/dashboard/job-seeker/jobs/${job.id || job._id}`)}
            title="Click to view job details"
            className="glass rounded-xl p-4 space-y-2 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{job.title}</h3>
              {isPremium ? (
                job.match_scores && userId && job.match_scores[userId] ? (
                  <span {...getScoreProps(job.match_scores[userId], { className: 'text-xs' })}>
                    Match {job.match_scores[userId].toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-xs text-white/60">{loadingScores ? 'Scoring…' : 'No score yet'}</span>
                )
              ) : (
                <span 
                  className="text-xs text-white/60 flex items-center gap-1 cursor-help" 
                  title="Upgrade to Premium to view match score"
                >
                  🔒 Locked
                </span>
              )}
            </div>
            <p className="text-sm text-white/70 line-clamp-3">{job.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {job.skills?.map((s, idx) => (
                <span key={`${s}-${idx}`} className="text-xs px-2 py-1 bg-white/10 rounded-full">{s}</span>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-white/60">{job.location || 'Remote'}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isApplied(job)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply(job.id);
                }}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm disabled:opacity-60"
              >
                {isApplied(job) ? 'Applied' : 'Apply'}
              </motion.button>
            </div>
          </motion.div>
        ))}
        {(!jobs || jobs.length === 0) && !jobsLoading && <p className="text-white/60 text-sm">No jobs yet.</p>}
        {jobsLoading && <p className="text-white/60 text-sm">Loading jobs…</p>}
      </div>

    </div>
  );
}

