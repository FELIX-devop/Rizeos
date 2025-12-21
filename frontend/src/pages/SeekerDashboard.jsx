import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { listJobs, updateProfile, getProfile, applyJob, extractSkillsFromResume, matchScore } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SeekerDashboard() {
  const { token, user, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [profile, setProfile] = useState({ name: '', bio: '', linkedin_url: '', skills: [], wallet_address: '' });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const userId = user?.id || user?._id;

  const normalizeSkill = (s) => s.trim();
  const hasSkill = (list, skill) => list.some((v) => v.toLowerCase() === skill.toLowerCase());
  const parseSkills = (raw) => (Array.isArray(raw) ? raw : (raw || '').split(',').map((s) => s.trim()).filter(Boolean));
  const candidateSkills = useMemo(() => parseSkills(profile.skills), [profile.skills]);
  const candidateSignature = useMemo(
    () => `${profile.bio || ''}|${candidateSkills.slice().sort().join(',')}`,
    [profile.bio, candidateSkills]
  );
  const jobsSignature = useMemo(
    () => JSON.stringify((jobs || []).map((j) => j.id || j._id || '')),
    [jobs]
  );

  // respect tab query param (?tab=profile)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'profile') {
      setActiveTab('profile');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const data = await listJobs(token);
      setJobs(data || []);
    } catch (err) {
      console.error('jobs load error', err);
      toast.error('Failed to load jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    getProfile(token)
      .then((p) => {
        setProfile({
          name: p.name || '',
          bio: p.bio || '',
          linkedin_url: p.linkedin_url || '',
          skills: parseSkills(p.skills),
          wallet_address: p.wallet_address || '',
        });
        setProfileLoaded(true);
      })
      .catch(console.error);
  }, [token]);

  // Compute fitment scores via AI service; include skills context and refresh when profile changes.
  useEffect(() => {
    const run = async () => {
      if (!userId || !profileLoaded || !jobs.length) return;
      const candidateText = `${profile.bio || ''}\nSkills: ${candidateSkills.join(', ')}`;
      setLoadingScores(true);
      try {
        const scoredJobs = await Promise.all(
          jobs.map(async (job) => {
            try {
              const score = await matchScore(job.description || '', candidateText, job.skills || [], candidateSkills);
              const match_scores = { ...(job.match_scores || {}) };
              match_scores[userId] = score;
              return { ...job, match_scores };
            } catch (err) {
              console.error('match score error', err);
              return job;
            }
          })
        );
        setJobs(scoredJobs);
      } finally {
        setLoadingScores(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateSignature, userId, profileLoaded, jobsSignature]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: profile.name,
        bio: profile.bio, // reuse bio for education/summary
        linkedin_url: profile.linkedin_url, // reuse for contact
        skills: parseSkills(profile.skills),
        wallet_address: profile.wallet_address,
      };
      await updateProfile(token, payload);
      await refreshProfile();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Profile update failed');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const skills = await extractSkillsFromResume(base64);
      if (skills.length) {
        setSuggestedSkills(skills);
        setProfile((p) => {
          const existing = parseSkills(p.skills);
          const merged = [...existing];
          skills.forEach((s) => {
            const skill = normalizeSkill(s);
            if (skill && !hasSkill(merged, skill)) merged.push(skill);
          });
          return { ...p, skills: merged };
        });
        toast.success('Skills extracted from resume');
      } else {
        toast.info('No skills extracted');
      }
    } catch (err) {
      console.error(err);
      toast.error('Resume parsing failed');
    } finally {
      setUploading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const updated = await applyJob(token, jobId);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      toast.success('Applied');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Apply failed');
    }
  };

  const isApplied = (job) => {
    if (!userId) return false;
    return (job.candidates || []).some((c) => c === userId);
  };

  const addSkill = (skill) => {
    const normalized = normalizeSkill(skill);
    if (!normalized) return;
    setProfile((p) => {
      const current = parseSkills(p.skills);
      if (hasSkill(current, normalized)) return p;
      return { ...p, skills: [...current, normalized] };
    });
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setProfile((p) => {
      const current = parseSkills(p.skills).filter((s) => s.toLowerCase() !== skill.toLowerCase());
      return { ...p, skills: current };
    });
  };

  const onSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button className={`px-4 py-2 rounded-lg border border-white/20 ${activeTab === 'jobs' ? 'bg-white/10' : ''}`} onClick={() => setActiveTab('jobs')}>Jobs</button>
        <button className={`px-4 py-2 rounded-lg border border-white/20 ${activeTab === 'messages' ? 'bg-white/10' : ''}`} onClick={() => setActiveTab('messages')}>Messages</button>
      </div>

      {activeTab === 'jobs' && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Smart matches for {user?.name}</h2>
            <button className="text-sm px-3 py-2 rounded-lg bg-white/10 border border-white/20" onClick={loadJobs} disabled={jobsLoading}>
              {jobsLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{job.title}</h3>
                  {job.match_scores && userId && job.match_scores[userId] ? (
                    <span className="text-xs text-accent">Match {job.match_scores[userId]}%</span>
                  ) : (
                    <span className="text-xs text-white/60">{loadingScores ? 'Scoring…' : 'No score yet'}</span>
                  )}
                </div>
                <p className="text-sm text-white/70 line-clamp-3">{job.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
              {job.skills?.map((s, idx) => (
                <span key={`${s}-${idx}`} className="text-xs px-2 py-1 bg-white/10 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-white/60">{job.location || 'Remote'}</span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    disabled={isApplied(job)}
                    onClick={() => handleApply(job.id)}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm disabled:opacity-60"
                  >
                    {isApplied(job) ? 'Applied' : 'Apply'}
                  </motion.button>
                </div>
              </div>
            ))}
            {jobs.length === 0 && !jobsLoading && <p className="text-white/60 text-sm">No jobs yet.</p>}
            {jobsLoading && <p className="text-white/60 text-sm">Loading jobs…</p>}
          </div>
        </>
      )}

      {activeTab === 'messages' && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/dashboard/job-seeker/messages/send">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass rounded-xl p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📤</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Send Message</h3>
                    <p className="text-sm text-white/70">Send a message to a recruiter</p>
                  </div>
                </div>
              </motion.div>
            </Link>
            <div className="glass rounded-xl p-6 bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-white/10 opacity-50">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📥</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">Inbox</h3>
                  <p className="text-sm text-white/70">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Your Profile</h2>
          <form className="grid gap-3" onSubmit={handleProfileSave}>
            <input className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <textarea className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Education / Summary" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            <input className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Contact (phone or LinkedIn)" value={profile.linkedin_url} onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })} />
            <div className="space-y-3">
              <label className="text-sm text-white/70">Add Skill</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={onSkillKeyDown}
                />
                <motion.button whileHover={{ scale: 1.02 }} type="button" className="btn-primary" onClick={() => addSkill(skillInput)}>
                  Add
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-2">
                {parseSkills(profile.skills).map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm flex items-center gap-2">
                    {skill}
                    <button type="button" className="text-white/70 hover:text-white" onClick={() => removeSkill(skill)}>×</button>
                  </span>
                ))}
                {parseSkills(profile.skills).length === 0 && <p className="text-sm text-white/60">No skills added yet.</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-white/70">Resume (PDF)</label>
              <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={uploading} className="text-sm" />
            </div>
            {suggestedSkills.length > 0 && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Suggested based on your profile</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm hover:bg-white/20"
                      onClick={() => addSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <motion.button whileHover={{ scale: 1.01 }} type="submit" className="btn-primary w-full">Save Profile</motion.button>
          </form>
        </div>
      )}
    </div>
  );
}

