import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserProfilePublic } from '../services/api.js';
import { toast } from 'sonner';
import AdminSendMessageModal from './AdminSendMessageModal.jsx';
import PremiumName from './PremiumName.jsx';

/**
 * RecruiterSeekerProfile
 * 
 * Full profile view for recruiters to inspect job seeker profiles.
 * Matches Admin panel structure and displays all extended profile fields.
 */
export default function RecruiterSeekerProfile({ seeker, onClose }) {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!seeker || !seeker.id) {
        setError('Invalid seeker data');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getUserProfilePublic(token, seeker.id || seeker._id);
        setUser(data);
      } catch (err) {
        console.error('Failed to load seeker profile', err);
        if (err.response?.status === 404) {
          setError('Job seeker not found');
        } else {
          setError(err.response?.data?.error || 'Failed to load profile');
        }
        toast.error('Failed to load job seeker profile');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [seeker, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-white/60">Loading job seeker profile...</p>
          </div>
        </div>
      </AnimatePresence>
    );
  }

  if (error || !user) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass rounded-2xl p-6 text-center max-w-md">
            <p className="text-red-400 mb-4">{error || 'Job seeker not found'}</p>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Job Seeker Profile</h2>
              <p className="text-sm text-white/70">View candidate details and qualifications</p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMessageModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold transition-colors text-sm"
              >
                Send Message
              </motion.button>
              <button
                onClick={onClose}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Name</label>
                <PremiumName name={user.name || 'N/A'} isPremium={user.is_premium || false} className="text-white font-medium" />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Email</label>
                <p className="text-white font-medium">{user.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Phone Number</label>
                {user.phone_number ? (
                  <p className="text-white font-medium">{user.phone_number}</p>
                ) : (
                  <p className="text-white/40 text-sm italic">Not provided</p>
                )}
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Role</label>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium border bg-green-500/20 text-green-300 border-green-500/40">
                  {user.role?.toUpperCase() || 'N/A'}
                </span>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Profile Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                  user.is_active !== false 
                    ? 'bg-green-500/20 text-green-300 border-green-500/40' 
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {user.is_active !== false ? 'Active Profile' : 'Inactive Profile'}
                </span>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Account Status</label>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/40">
                  Active
                </span>
              </div>
            </div>

            {user.linkedin_url && (
              <div>
                <label className="text-xs text-white/60 mb-1 block">LinkedIn / Website</label>
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  {user.linkedin_url}
                </a>
              </div>
            )}

            {user.wallet_address && (
              <div>
                <label className="text-xs text-white/60 mb-1 block">Wallet Address</label>
                <p className="text-white/80 text-sm font-mono">{user.wallet_address}</p>
              </div>
            )}
          </div>

          {/* Professional Summary - Only for Job Seekers */}
          {user.role === 'seeker' && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Professional Summary</h3>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Summary</label>
                {user.summary ? (
                  <p className="text-white/80 text-sm whitespace-pre-wrap">{user.summary}</p>
                ) : (
                  <p className="text-white/40 text-sm italic">No summary provided</p>
                )}
              </div>
            </div>
          )}

          {/* Education Details - Only for Job Seekers */}
          {user.role === 'seeker' && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Education Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Education / Degree</label>
                  {user.education ? (
                    <p className="text-white font-medium">{user.education}</p>
                  ) : (
                    <p className="text-white/40 text-sm italic">Not provided</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">10th Marks</label>
                  {user.tenth_marks ? (
                    <p className="text-white font-medium">{user.tenth_marks}{typeof user.tenth_marks === 'number' ? '%' : ''}</p>
                  ) : (
                    <p className="text-white/40 text-sm italic">Not provided</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">12th Marks</label>
                  {user.twelfth_marks ? (
                    <p className="text-white font-medium">{user.twelfth_marks}{typeof user.twelfth_marks === 'number' ? '%' : ''}</p>
                  ) : (
                    <p className="text-white/40 text-sm italic">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Experience - Only for Job Seekers */}
          {user.role === 'seeker' && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Experience</h3>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Experience</label>
                {user.experience ? (
                  <p className="text-white font-medium">{user.experience}</p>
                ) : (
                  <p className="text-white/40 text-sm italic">Not provided</p>
                )}
              </div>
            </div>
          )}

          {/* Skills - Always show for Job Seekers */}
          {(user.role === 'seeker' || (user.skills && user.skills.length > 0)) && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Skills</h3>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 border border-white/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm italic">No skills added</p>
              )}
            </div>
          )}

          {/* Legacy Bio field - Show only if exists and no summary (for backward compatibility) */}
          {user.bio && !user.summary && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Bio</h3>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Bio</label>
                <p className="text-white/80 text-sm whitespace-pre-wrap">{user.bio}</p>
              </div>
            </div>
          )}

          {/* Send Message Modal */}
          <AdminSendMessageModal
            isOpen={messageModalOpen}
            onClose={() => setMessageModalOpen(false)}
            recipientUser={user ? { 
              id: user.id || user._id || seeker?.id || seeker?._id, 
              name: user.name, 
              email: user.email, 
              role: user.role 
            } : null}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

