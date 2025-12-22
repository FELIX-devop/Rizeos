import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { getProfile, updateProfile } from '../services/api.js';
import { toast } from 'sonner';

/**
 * AdminProfilePage
 * 
 * Editable profile page for Admin showing name and email.
 * Visible only to Admin role.
 */
export default function AdminProfilePage() {
  const { token, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const p = await getProfile(token);
        setProfile({
          name: p.name || '',
          email: p.email || '',
        });
      } catch (err) {
        console.error('Failed to load profile', err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      loadProfile();
    }
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!profile.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim(),
      };
      await updateProfile(token, payload);
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile', err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-2xl p-6">
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Admin Profile</h2>
        <button
          onClick={() => navigate('/dashboard/admin')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              placeholder="Enter your name"
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              placeholder="Enter your email"
              required
              disabled={saving}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              type="button"
              onClick={() => navigate('/dashboard/admin')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50"
              disabled={saving}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold transition-colors disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}

