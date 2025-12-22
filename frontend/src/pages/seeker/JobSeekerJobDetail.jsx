import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getJobProfilePublic, applyJob } from '../../services/api.js';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

/**
 * JobSeekerJobDetail
 * 
 * Job detail page for job seekers - matches AdminJobProfile structure exactly.
 */
export default function JobSeekerJobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const userId = user?.id || user?._id;

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getJobProfilePublic(token, jobId);
        setJob(data);
      } catch (err) {
        console.error('Failed to load job profile', err);
        if (err.response?.status === 404) {
          setError('Job not found');
        } else {
          setError(err.response?.data?.error || 'Failed to load job profile');
        }
        toast.error('Failed to load job profile');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      loadJob();
    }
  }, [jobId, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'closed':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyJob(token, jobId);
      setJob((prev) => ({ ...prev, candidates: [...(prev.candidates || []), userId] }));
      toast.success('Applied successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const isApplied = () => {
    if (!userId || !job) return false;
    return (job.candidates || []).some((c) => c === userId || (typeof c === 'object' && (c.id === userId || c._id === userId)));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/job-seeker')}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-white/60">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/job-seeker')}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-red-400 mb-4">{error || 'Job not found'}</p>
          <button
            onClick={() => navigate('/dashboard/job-seeker')}
            className="btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/60">
        <button
          onClick={() => navigate('/dashboard/job-seeker')}
          className="hover:text-white transition-colors"
        >
          Job Seeker
        </button>
        <span>/</span>
        <button
          onClick={() => navigate('/dashboard/job-seeker')}
          className="hover:text-white transition-colors"
        >
          Jobs
        </button>
        <span>/</span>
        <span className="text-white">{job.title || 'Job Details'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Job Details</h2>
          <p className="text-sm text-white/70">View job information and apply</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/job-seeker')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Job Basic Info */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-semibold mb-4">Job Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Job Title</label>
            <p className="text-white font-medium text-lg">{job.title || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Status</label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(job.status)}`}>
              {job.status || 'ACTIVE'}
            </span>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Location</label>
            <p className="text-white/80">{job.location || 'Remote / Not specified'}</p>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Budget</label>
            <p className="text-white font-semibold">{job.budget ? `${job.budget} ETH` : 'Not specified'}</p>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Created Date</label>
            <p className="text-white/80 text-sm">{formatDate(job.created_at)}</p>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Last Updated</label>
            <p className="text-white/80 text-sm">{formatDate(job.updated_at)}</p>
          </div>
        </div>

        {job.description && (
          <div>
            <label className="text-xs text-white/60 mb-1 block">Description</label>
            <p className="text-white/80 text-sm whitespace-pre-wrap bg-white/5 p-3 rounded-lg">
              {job.description}
            </p>
          </div>
        )}

        {job.skills && job.skills.length > 0 && (
          <div>
            <label className="text-xs text-white/60 mb-1 block">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.tags && job.tags.length > 0 && (
          <div>
            <label className="text-xs text-white/60 mb-1 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.match_scores && userId && job.match_scores[userId] && (
          <div>
            <label className="text-xs text-white/60 mb-1 block">Match Score</label>
            <p className="text-accent font-semibold text-lg">{job.match_scores[userId]}%</p>
          </div>
        )}
      </div>

      {/* Recruiter Info */}
      {job.recruiter && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Recruiter Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Recruiter Name</label>
              <p className="text-white font-medium">{job.recruiter.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Recruiter Email</label>
              <p className="text-white/80">{job.recruiter.email || 'N/A'}</p>
            </div>
          </div>
          {job.recruiter.id && (
            <div>
              <button
                onClick={() => navigate(`/dashboard/job-seeker/recruiters/${job.recruiter.id}`)}
                className="text-sm text-primary hover:underline"
              >
                View Recruiter Profile →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Job Activity Summary */}
      {job.stats && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Activity Summary</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <label className="text-xs text-white/60 mb-1 block">Applications</label>
              <p className="text-2xl font-semibold text-white">
                {job.stats.applications || 0}
              </p>
              <p className="text-xs text-white/60 mt-1">candidate(s) applied</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <label className="text-xs text-white/60 mb-1 block">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getStatusBadgeColor(job.status)}`}>
                {job.status || 'ACTIVE'}
              </span>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <label className="text-xs text-white/60 mb-1 block">Last Updated</label>
              <p className="text-white/80 text-sm mt-2">
                {formatDate(job.updated_at)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apply Button */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isApplied() || applying}
          onClick={handleApply}
          className="flex-1 px-4 py-3 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold transition-colors disabled:opacity-50"
        >
          {applying ? 'Applying...' : isApplied() ? 'Applied' : 'Apply Now'}
        </motion.button>
      </div>
    </div>
  );
}

