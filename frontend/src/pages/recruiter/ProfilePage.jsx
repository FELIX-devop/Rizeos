import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateProfile, getProfile } from '../../services/api.js';
import { toast } from 'sonner';
import ProfileSection from '../../components/recruiter/ProfileSection.jsx';

/**
 * ProfilePage
 * 
 * Dedicated page for editing recruiter profile.
 */
export default function ProfilePage() {
  const { token, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    linkedin_url: '',
    skills: [],
    wallet_address: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const p = await getProfile(token);
        setProfile({
          name: p.name || '',
          bio: p.bio || '',
          linkedin_url: p.linkedin_url || '',
          skills: p.skills || [],
          wallet_address: p.wallet_address || '',
        });
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    loadProfile();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: profile.name,
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        skills: Array.isArray(profile.skills)
          ? profile.skills
          : (profile.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
        wallet_address: profile.wallet_address,
      };
      await updateProfile(token, payload);
      await refreshProfile();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/recruiter')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Overview
        </button>
      </div>

      <ProfileSection profile={profile} setProfile={setProfile} onSave={handleSave} loading={loading} />
    </div>
  );
}


