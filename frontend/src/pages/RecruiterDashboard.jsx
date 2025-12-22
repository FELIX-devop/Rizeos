import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { listJobs, listPayments, listUsers, updateProfile, getProfile } from '../services/api.js';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import JobsSection from '../components/recruiter/JobsSection.jsx';
import PostJobSection from '../components/recruiter/PostJobSection.jsx';
import JobSeekersSection from '../components/recruiter/JobSeekersSection.jsx';
import ProfileSection from '../components/recruiter/ProfileSection.jsx';

/**
 * RecruiterDashboard - Unified Overview Page
 * 
 * This is the single source of truth for recruiter dashboard.
 * All sections (Post Job, Jobs, Job Seekers, Payments) are displayed
 * in a unified overview layout.
 * 
 * Profile section is accessible via ?tab=profile query parameter.
 */
export default function RecruiterDashboard({ config }) {
  const { token, refreshProfile } = useAuth();
  const location = useLocation();
  
  // State management
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState({ name: '', bio: '', linkedin_url: '', skills: [], wallet_address: '' });
  const [seekerQuery, setSeekerQuery] = useState({ name: '', skills: '' });
  const [seekers, setSeekers] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Check for ?tab=profile query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    setShowProfile(tab === 'profile');
  }, [location.search]);

  // Load jobs
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

  // Load payments
  const loadPayments = async () => {
    try {
      const res = await listPayments(token);
      if (Array.isArray(res)) setPayments(res);
      else if (Array.isArray(res?.payments)) setPayments(res.payments);
      else setPayments([]);
    } catch (err) {
        console.error('Failed to load payments', err);
        setPayments([]);
    }
  };

  // Load profile
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

  // Load seekers
  const loadSeekers = async (query = seekerQuery) => {
    try {
      const res = await listUsers(token, { role: 'seeker', name: query.name, skills: query.skills });
      setSeekers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load seekers', err);
      setSeekers([]);
    }
  };

  // Initial data load
  useEffect(() => {
    loadJobs();
    loadPayments();
    loadProfile();
    loadSeekers(); // Load seekers on mount
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle job creation success
  const handleJobCreated = () => {
    loadJobs(); // Refresh jobs list
    loadPayments(); // Refresh payments (new payment was made)
  };

  // Handle profile save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
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
      setProfileLoading(false);
    }
  };

  // Calculate total payments
  const totalMatic = useMemo(
    () => (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toFixed(3),
    [payments]
  );

  // If profile tab is active, show only profile
  if (showProfile) {
  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
          <a href="/" className="text-sm text-secondary underline">Back to Home</a>
        </div>
        <ProfileSection
          profile={profile}
          setProfile={setProfile}
          onSave={handleProfileSave}
          loading={profileLoading}
        />
      </div>
    );
  }

  // Main Overview Layout
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
          <p className="text-sm text-white/70 mt-1">Manage jobs, candidates, and payments from one place</p>
            </div>
        <a href="/" className="text-sm text-secondary underline">Back to Home</a>
          </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 border border-white/10">
          <p className="text-xs text-white/60">Total Jobs</p>
          <p className="text-2xl font-semibold mt-1">{(jobs || []).length}</p>
                </div>
        <div className="glass rounded-xl p-4 border border-white/10">
          <p className="text-xs text-white/60">Job Seekers</p>
          <p className="text-2xl font-semibold mt-1">{(seekers || []).length}</p>
        </div>
        <div className="glass rounded-xl p-4 border border-white/10">
          <p className="text-xs text-white/60">Total Payments</p>
          <p className="text-2xl font-semibold mt-1">{totalMatic} MATIC</p>
        </div>
      </div>

      {/* Post Job Section */}
      <PostJobSection
        token={token}
        config={config}
        onJobCreated={handleJobCreated}
      />

      {/* Jobs and Payments Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <JobsSection
          jobs={jobs}
          jobsLoading={jobsLoading}
          onRefresh={loadJobs}
        />
        
        <div className="glass rounded-2xl p-5">
          <h3 className="text-xl font-semibold mb-4">Recent Payments</h3>
          <div className="space-y-2 max-h-96 overflow-auto">
            {(payments || []).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <span className="truncate font-mono text-xs">{p.tx_hash || p.txHash}</span>
                <span className="text-accent font-semibold">{p.amount} MATIC</span>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-sm text-white/60 text-center py-8">No payments yet.</p>
            )}
          </div>
        </div>
        </div>

      {/* Job Seekers Section */}
      <JobSeekersSection
        seekers={seekers}
        seekerQuery={seekerQuery}
        setSeekerQuery={setSeekerQuery}
        onSearch={() => loadSeekers()}
        onLoad={() => loadSeekers()}
      />
    </div>
  );
}
