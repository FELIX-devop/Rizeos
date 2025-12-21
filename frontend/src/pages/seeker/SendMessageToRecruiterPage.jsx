import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { sendMessage, listUsers, listJobs } from '../../services/api.js';
import { toast } from 'sonner';

/**
 * SendMessageToRecruiterPage
 * 
 * Dedicated page for job seekers to send messages to recruiters.
 */
export default function SendMessageToRecruiterPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [selectedRecruiterId, setSelectedRecruiterId] = useState('');
  const [recruiters, setRecruiters] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);

  useEffect(() => {
    const loadRecruiters = async () => {
      setLoadingRecruiters(true);
      try {
        // Load recruiters from users list
        const users = await listUsers(token, { role: 'recruiter' });
        setRecruiters(Array.isArray(users) ? users : []);
        
        // If user has applied to jobs, prioritize those recruiters
        const jobs = await listJobs(token);
        const appliedJobRecruiters = new Set();
        jobs.forEach((job) => {
          if (job.candidates && job.candidates.includes(user?.id || user?._id)) {
            if (job.recruiter_id) {
              appliedJobRecruiters.add(job.recruiter_id);
            }
          }
        });
        
        // Sort recruiters: those with applied jobs first
        const sorted = (Array.isArray(users) ? users : []).sort((a, b) => {
          const aId = a.id || a._id;
          const bId = b.id || b._id;
          const aHasApplied = appliedJobRecruiters.has(aId);
          const bHasApplied = appliedJobRecruiters.has(bId);
          if (aHasApplied && !bHasApplied) return -1;
          if (!aHasApplied && bHasApplied) return 1;
          return 0;
        });
        
        setRecruiters(sorted);
        
        // Auto-select first recruiter if available
        if (sorted.length > 0 && !selectedRecruiterId) {
          setSelectedRecruiterId(sorted[0].id || sorted[0]._id);
        }
      } catch (err) {
        console.error('Failed to load recruiters', err);
        toast.error('Failed to load recruiters');
      } finally {
        setLoadingRecruiters(false);
      }
    };
    loadRecruiters();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!selectedRecruiterId) {
      toast.error('Please select a recruiter');
      return;
    }

    setSending(true);
    try {
      await sendMessage(token, message, selectedRecruiterId, 'recruiter');
      toast.success('Message sent successfully!');
      setMessage('');
      // Navigate back to messages hub
      navigate('/dashboard/job-seeker/messages');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/job-seeker/messages')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Messages
        </button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Send Message to Recruiter</h2>
          <p className="text-sm text-white/70">Send a message to a recruiter</p>
        </div>

        <form className="space-y-4" onSubmit={handleSend}>
          <div>
            <label className="text-sm text-white/70 mb-1 block">Select Recruiter</label>
            {loadingRecruiters ? (
              <p className="text-sm text-white/60">Loading recruiters...</p>
            ) : recruiters.length === 0 ? (
              <p className="text-sm text-white/60">No recruiters available</p>
            ) : (
              <select
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors"
                value={selectedRecruiterId}
                onChange={(e) => setSelectedRecruiterId(e.target.value)}
                required
              >
                <option value="">Select a recruiter...</option>
                {recruiters.map((recruiter) => (
                  <option key={recruiter.id || recruiter._id} value={recruiter.id || recruiter._id}>
                    {recruiter.name || recruiter.email} {recruiter.email ? `(${recruiter.email})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-sm text-white/70 mb-1 block">Message</label>
            <textarea
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Enter your message here..."
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={sending || !message.trim() || !selectedRecruiterId || loadingRecruiters}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </motion.button>
        </form>

        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-white/60">
            <strong>Note:</strong> Your message will be sent to the selected recruiter. 
            They can view it in their inbox.
          </p>
        </div>
      </div>
    </div>
  );
}

