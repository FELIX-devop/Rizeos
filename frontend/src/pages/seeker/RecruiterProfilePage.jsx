import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { listUsers, listJobs } from '../../services/api.js';
import { toast } from 'sonner';
import RecruiterSendMessageModal from '../../components/RecruiterSendMessageModal.jsx';

/**
 * RecruiterProfilePage
 * 
 * Public view of recruiter profile for job seekers.
 */
export default function RecruiterProfilePage() {
  const { recruiterId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [recruiter, setRecruiter] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load recruiter info
        const users = await listUsers(token, { role: 'recruiter' });
        const foundRecruiter = users.find((u) => (u.id || u._id) === recruiterId);
        if (!foundRecruiter) {
          toast.error('Recruiter not found');
          navigate('/dashboard/job-seeker');
          return;
        }
        setRecruiter(foundRecruiter);

        // Load recruiter's jobs
        const allJobs = await listJobs(token);
        const recruiterJobs = allJobs.filter((j) => {
          const jobRecruiterId = j.recruiter_id || j.recruiterId;
          return jobRecruiterId === recruiterId || jobRecruiterId?.toString() === recruiterId;
        });
        setJobs(recruiterJobs);
      } catch (err) {
        console.error('Failed to load recruiter profile', err);
        toast.error('Failed to load recruiter profile');
        navigate('/dashboard/job-seeker');
      } finally {
        setLoading(false);
      }
    };
    if (recruiterId && token) {
      loadData();
    }
  }, [recruiterId, token, navigate]);

  const handleSendMessage = (job) => {
    setSelectedJob(job);
    setMessageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-white/60">Loading recruiter profile...</p>
        </div>
      </div>
    );
  }

  if (!recruiter) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{recruiter.name}</h1>
          <p className="text-white/70">{recruiter.email}</p>
        </div>

        {recruiter.bio && (
          <div>
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-white/80 whitespace-pre-wrap">{recruiter.bio}</p>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-2">Jobs Posted</h2>
          <p className="text-white/80">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>
        </div>

        {jobs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Active Jobs</h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id || job._id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{job.title}</h3>
                      <p className="text-sm text-white/70 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {job.skills?.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-white/10 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendMessage(job)}
                      className="ml-4 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold text-sm"
                    >
                      Send Message
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {jobs.length === 0 && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-sm text-white/70">
              This recruiter has no active jobs posted yet.
            </p>
          </div>
        )}
      </div>

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

