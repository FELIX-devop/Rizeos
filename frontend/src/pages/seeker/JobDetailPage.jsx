import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { listJobs, applyJob } from '../../services/api.js';
import { toast } from 'sonner';

/**
 * JobDetailPage
 * 
 * Full job detail page for job seekers.
 */
export default function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [job, setJob] = useState(null);
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const userId = user?.id || user?._id;

  useEffect(() => {
    const loadJob = async () => {
      try {
        const jobs = await listJobs(token);
        const foundJob = jobs.find((j) => (j.id || j._id) === jobId);
        if (!foundJob) {
          toast.error('Job not found');
          navigate('/dashboard/job-seeker');
          return;
        }
        setJob(foundJob);
        // Set recruiter info for message modal
        if (foundJob.recruiter_id || foundJob.recruiterId) {
          setRecruiter({
            id: foundJob.recruiter_id || foundJob.recruiterId,
            name: foundJob.recruiter_name || 'Recruiter',
          });
        }
      } catch (err) {
        console.error('Failed to load job', err);
        toast.error('Failed to load job');
        navigate('/dashboard/job-seeker');
      } finally {
        setLoading(false);
      }
    };
    if (jobId && token) {
      loadJob();
    }
  }, [jobId, token, navigate]);

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

  const handleViewRecruiter = () => {
    const recruiterId = job?.recruiter_id || job?.recruiterId;
    if (recruiterId) {
      navigate(`/dashboard/job-seeker/recruiters/${recruiterId}`);
    }
  };

  const isApplied = () => {
    if (!userId || !job) return false;
    return (job.candidates || []).some((c) => c === userId || (typeof c === 'object' && (c.id === userId || c._id === userId)));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-white/60">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/job-seeker')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Jobs
        </button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <span>{job.location || 'Remote'}</span>
            {job.budget && <span>${job.budget.toLocaleString()}</span>}
            {job.match_scores && userId && job.match_scores[userId] && (
              <span className="text-accent">Match: {job.match_scores[userId]}%</span>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-white/80 whitespace-pre-wrap">{job.description}</p>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.tags && job.tags.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-sm text-white/70">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-white/10 pt-4">
          <h2 className="text-xl font-semibold mb-2">Posted By</h2>
          {(job.recruiter_id || job.recruiterId) ? (
            <button
              onClick={handleViewRecruiter}
              className="text-primary hover:underline font-medium"
            >
              {job.recruiter_name || 'View Recruiter'} →
            </button>
          ) : (
            <p className="text-white/70">Recruiter information not available</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isApplied() || applying}
            onClick={handleApply}
            className="flex-1 px-4 py-3 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {applying ? 'Applying...' : isApplied() ? 'Applied' : 'Apply Now'}
          </motion.button>
          {recruiter && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMessageModalOpen(true)}
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              Message Recruiter
            </motion.button>
          )}
        </div>
      </div>

      {recruiter && (
        <RecruiterSendMessageModal
          isOpen={messageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          recruiter={recruiter}
          job={job}
        />
      )}
    </div>
  );
}

