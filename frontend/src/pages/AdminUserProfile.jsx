import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserProfile } from '../services/api.js';
import { toast } from 'sonner';
import AdminSendMessageModal from '../components/AdminSendMessageModal.jsx';
import PremiumName from '../components/PremiumName.jsx';

/**
 * AdminUserProfile
 * 
 * Dedicated page for admin to inspect a specific user's profile.
 */
export default function AdminUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserProfile(token, userId);
        setUser(data);
      } catch (err) {
        console.error('Failed to load user profile', err);
        if (err.response?.status === 404) {
          setError('User not found');
        } else {
          setError(err.response?.data?.error || 'Failed to load user profile');
        }
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId, token]);

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/admin')}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-white/60">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/admin')}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-red-400 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => navigate('/dashboard/admin')}
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
          onClick={() => navigate('/dashboard/admin')}
          className="hover:text-white transition-colors"
        >
          Admin
        </button>
        <span>/</span>
        <button
          onClick={() => navigate('/dashboard/admin')}
          className="hover:text-white transition-colors"
        >
          Users
        </button>
        <span>/</span>
        <PremiumName name={user.name || 'User Profile'} isPremium={user.is_premium || false} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">User Profile</h2>
          <p className="text-sm text-white/70">Inspect user details and activity</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Show Send Message button only for non-admin users */}
          {user.role !== 'admin' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMessageModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold transition-colors text-sm"
            >
              Send Message
            </motion.button>
          )}
          <button
            onClick={() => navigate('/dashboard/admin')}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back to Dashboard
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
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
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
          <div>
            <label className="text-xs text-white/60 mb-1 block">Created Date</label>
            <p className="text-white/80 text-sm">{formatDate(user.created_at)}</p>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Last Updated</label>
            <p className="text-white/80 text-sm">{formatDate(user.updated_at)}</p>
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

      {/* Skills - Always show for Job Seekers, conditional for others */}
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

      {/* Role-Specific Stats */}
      {user.stats && Object.keys(user.stats).length > 0 && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Role-Specific Statistics</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {user.role === 'recruiter' && (
              <>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <label className="text-xs text-white/60 mb-1 block">Jobs Posted</label>
                  <p className="text-2xl font-semibold text-white">
                    {user.stats.jobs_posted || 0}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <label className="text-xs text-white/60 mb-1 block">Total Payments</label>
                  <p className="text-2xl font-semibold text-accent">
                    {user.stats.payments_matic?.toFixed(3) || '0.000'} MATIC
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    {user.stats.payments_count || 0} transaction(s)
                  </p>
                </div>
              </>
            )}

            {user.role === 'seeker' && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <label className="text-xs text-white/60 mb-1 block">Jobs Applied</label>
                <p className="text-2xl font-semibold text-white">
                  {user.stats.jobs_applied || 0}
                </p>
              </div>
            )}

            {user.role === 'admin' && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <label className="text-xs text-white/60 mb-1 block">Account Type</label>
                <p className="text-white font-medium">System Administrator</p>
                <p className="text-xs text-white/60 mt-1">
                  {user.stats.note || 'Full system access'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      <AdminSendMessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        recipientUser={user ? { 
          id: user.id || user._id || userId, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } : null}
      />
    </div>
  );
}


