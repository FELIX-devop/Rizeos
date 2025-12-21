import React, { useEffect, useState, useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { listJobs, listPayments, listUsers, getProfile } from '../../services/api.js';
import { toast } from 'sonner';

export default function DashboardLayout({ config }) {
  const { token, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [profile, setProfile] = useState({ name: '', bio: '', linkedin_url: '', skills: [], wallet_address: '' });
  const [seekers, setSeekers] = useState([]);
  const [seekerQuery, setSeekerQuery] = useState({ name: '', skills: '' });

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await listJobs(token);
      if (Array.isArray(res)) setJobs(res);
      else if (Array.isArray(res?.jobs)) setJobs(res.jobs);
      else setJobs([]);
    } catch (err) {
      console.error('Failed to load jobs', err);
      toast.error('Failed to load jobs');
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await listPayments(token);
      if (Array.isArray(res)) setPayments(res);
      else if (Array.isArray(res?.payments)) setPayments(res.payments);
      else setPayments([]);
    } catch (err) {
      console.error('Failed to load payments', err);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

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

  const loadSeekers = async (query = seekerQuery) => {
    try {
      const res = await listUsers(token, { role: 'seeker', name: query.name, skills: query.skills });
      setSeekers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load seekers', err);
      setSeekers([]);
    }
  };

  useEffect(() => {
    loadJobs();
    loadPayments();
    loadProfile();
  }, [token]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg border border-white/20 ${isActive ? 'bg-white/10' : ''}`
          }
        >
          Overview
        </NavLink>
        <a href="/" className="ml-auto text-sm text-secondary underline">Back to Home</a>
      </div>

      <Outlet
        context={{
          token,
          config,
          jobs,
          setJobs,
          jobsLoading,
          loadJobs,
          payments,
          paymentsLoading,
          profile,
          setProfile,
          loadProfile,
          refreshProfile,
          seekers,
          setSeekers,
          seekerQuery,
          setSeekerQuery,
          loadSeekers,
          navigate,
        }}
      />
    </div>
  );
}

