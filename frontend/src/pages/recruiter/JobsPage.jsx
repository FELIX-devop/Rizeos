import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { listJobs } from '../../services/api.js';
import { toast } from 'sonner';

/**
 * JobsPage
 * 
 * Dedicated page for viewing and managing jobs.
 * This is the ONLY place where listJobs API is called.
 */
export default function JobsPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const currentUserId = user?.id || user?._id;

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
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/recruiter')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Overview
        </button>
        <button
          onClick={() => navigate('/dashboard/recruiter/post-job')}
          className="btn-primary text-sm"
        >
          + Post New Job
        </button>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">My Jobs</h2>
            <p className="text-sm text-white/70 mt-1">Manage all your job postings</p>
          </div>
          <button
            className="text-xs px-3 py-1 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
            onClick={loadJobs}
            disabled={jobsLoading}
          >
            {jobsLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        <div className="space-y-3">
          {jobsLoading && (
            <div className="text-center py-8">
              <p className="text-sm text-white/60">Loading jobs…</p>
            </div>
          )}

          {!jobsLoading && jobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 mb-4">No jobs yet.</p>
              <button
                onClick={() => navigate('/dashboard/recruiter/post-job')}
                className="btn-primary"
              >
                Post Your First Job
              </button>
            </div>
          )}

          {!jobsLoading &&
            jobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                    {job.location || 'Remote'}
                  </span>
                </div>
                <p className="text-sm text-white/70 line-clamp-2 mb-3">{job.description}</p>
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 6).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/80"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 6 && (
                      <span className="text-xs px-2 py-1 text-white/60">
                        +{job.skills.length - 6} more
                      </span>
                    )}
                  </div>
                )}
                {job.budget && (
                  <div className="mt-3 text-sm">
                    <span className="text-white/60">Budget: </span>
                    <span className="text-accent font-semibold">{job.budget} ETH</span>
                  </div>
                )}
                {/* Applicants Button - Only show for job owner */}
                {(() => {
                  const jobRecruiterId = job.recruiter_id || job.recruiterId || job.recruiter?.id || job.recruiter?._id;
                  const isJobOwner = String(jobRecruiterId) === String(currentUserId);
                  return isJobOwner ? (
                    <div className="mt-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/dashboard/recruiter/jobs/${job.id || job._id}/applicants`)}
                        className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold text-sm transition-colors"
                      >
                        Applicants
                      </motion.button>
                    </div>
                  ) : null;
                })()}
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}


