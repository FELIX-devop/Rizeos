import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { getUserProfilePublic, listJobs } from '../../services/api.js';
import { toast } from 'sonner';
import RecruiterSendMessageModal from '../../components/RecruiterSendMessageModal.jsx';

/**
 * JobSeekerRecruiterProfile
 * 
 * Recruiter profile view for job seekers - matches AdminUserProfile structure exactly.
 * READ-ONLY view with Send Message button.
 */
export default function JobSeekerRecruiterProfile() {
  const { recruiterId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [recruiter, setRecruiter] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load recruiter info using public endpoint
        const userData = await getUserProfilePublic(token, recruiterId);
        setRecruiter(userData);

        // Load recruiter's jobs
        const allJobs = await listJobs(token);
        const recruiterJobs = allJobs.filter((j) => {
          const jobRecruiterId = j.recruiter_id || j.recruiterId;
          return jobRecruiterId === recruiterId || jobRecruiterId?.toString() === recruiterId;
        });
        setJobs(recruiterJobs);
      } catch (err) {
        console.error('Failed to load recruiter profile', err);
        if (err.response?.status === 404) {
          setError('Recruiter not found');
        } else {
          setError(err.response?.data?.error || 'Failed to load recruiter profile');
        }
        toast.error('Failed to load recruiter profile');
      } finally {
        setLoading(false);
      }
    };

    if (recruiterId) {
      loadData();
    }
  }, [recruiterId, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'recruiter':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'seeker':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const handleSendMessage = (job) => {
    setSelectedJob(job);
    setMessageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-white/60">Loading recruiter profile...</p>
        </div>
      </div>
    );
  }

  if (error || !recruiter) {
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
          <p className="text-red-400 mb-4">{error || 'Recruiter not found'}</p>
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
        <span className="text-white">{recruiter.name || 'Recruiter Profile'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Recruiter Profile</h2>
          <p className="text-sm text-white/70">View recruiter information and jobs</p>
        </div>
        <div className="flex items-center gap-3">
          {jobs.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSendMessage(jobs[0])}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold transition-colors text-sm"
            >
              Send Message
            </motion.button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Name</label>
            <p className="text-white font-medium">{recruiter.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Email</label>
            <p className="text-white font-medium">{recruiter.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Role</label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(recruiter.role)}`}>
              {recruiter.role?.toUpperCase() || 'N/A'}
            </span>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Jobs Posted</label>
            <p className="text-white font-medium">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Created Date</label>
            <p className="text-white/80 text-sm">{formatDate(recruiter.created_at)}</p>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Last Updated</label>
            <p className="text-white/80 text-sm">{formatDate(recruiter.updated_at)}</p>
          </div>
        </div>

        {recruiter.bio && (
          <div>
            <label className="text-xs text-white/60 mb-1 block">Bio</label>
            <p className="text-white/80 text-sm whitespace-pre-wrap">{recruiter.bio}</p>
          </div>
        )}

        {recruiter.linkedin_url && (
          <div>
            <label className="text-xs text-white/60 mb-1 block">LinkedIn</label>
            <a
              href={recruiter.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {recruiter.linkedin_url}
            </a>
          </div>
        )}
      </div>

      {/* Jobs Posted */}
      {jobs.length > 0 && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Active Jobs</h3>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id || job._id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{job.title}</h4>
                    <p className="text-sm text-white/70 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.skills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-white/10 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/dashboard/job-seeker/jobs/${job.id || job._id}`)}
                      className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 text-white text-sm"
                    >
                      View Job
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendMessage(job)}
                      className="px-3 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold text-sm"
                    >
                      Send Message
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-white/70">This recruiter has no active jobs posted yet.</p>
        </div>
      )}

      <RecruiterSendMessageModal
        isOpen={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false);
          setSelectedJob(null);
        }}
        recruiter={recruiter}
        job={selectedJob}
      />
    </div>
  );
}

