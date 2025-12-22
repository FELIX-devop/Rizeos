import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { listJobs, getProfile, applyJob, matchScore } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SeekerDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState({ name: '', bio: '', linkedin_url: '', skills: [], wallet_address: '' });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);
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
  }, [token]);

  // Compute fitment scores via AI service; include skills context and refresh when profile changes.
  useEffect(() => {
    const run = async () => {
      if (!userId || !profileLoaded || !jobs.length) return;
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
  }, [candidateSignature, userId, profileLoaded, jobsSignature]);


  const handleApply = async (jobId) => {
    try {
      const updated = await applyJob(token, jobId);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      toast.success('Applied');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Apply failed');
    }
  };

  const isApplied = (job) => {
    if (!userId) return false;
    return (job.candidates || []).some((c) => c === userId);
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Smart matches for {user?.name}</h2>
        <button className="text-sm px-3 py-2 rounded-lg bg-white/10 border border-white/20" onClick={loadJobs} disabled={jobsLoading}>
          {jobsLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
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
              {job.match_scores && userId && job.match_scores[userId] ? (
                <span className="text-xs text-accent">Match {job.match_scores[userId]}%</span>
              ) : (
                <span className="text-xs text-white/60">{loadingScores ? 'Scoring…' : 'No score yet'}</span>
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
        {jobs.length === 0 && !jobsLoading && <p className="text-white/60 text-sm">No jobs yet.</p>}
        {jobsLoading && <p className="text-white/60 text-sm">Loading jobs…</p>}
      </div>

    </div>
  );
}

