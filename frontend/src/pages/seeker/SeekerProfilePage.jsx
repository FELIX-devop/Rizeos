import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updateProfile, getProfile, extractSkillsFromResume } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'sonner';

/**
 * SeekerProfilePage
 * 
 * Dedicated profile page for job seekers to edit their profile.
 * Clean structure with clear sections.
 */
export default function SeekerProfilePage() {
  const { token, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ 
    name: '', 
    email: '',
    bio: '', 
    linkedin_url: '', 
    skills: [], 
    wallet_address: '',
    phone_number: '',
    summary: '',
    education: '',
    tenth_marks: '',
    twelfth_marks: '',
    experience: '',
    is_active: true
  });
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const userId = user?.id || user?._id;

  const normalizeSkill = (s) => s.trim();
  const hasSkill = (list, skill) => list.some((v) => v.toLowerCase() === skill.toLowerCase());
  const parseSkills = (raw) => (Array.isArray(raw) ? raw : (raw || '').split(',').map((s) => s.trim()).filter(Boolean));

  useEffect(() => {
    getProfile(token)
      .then((p) => {
        setProfile({
          name: p.name || '',
          email: p.email || '',
          bio: p.bio || '',
          linkedin_url: p.linkedin_url || '',
          skills: parseSkills(p.skills),
          wallet_address: p.wallet_address || '',
          phone_number: p.phone_number || '',
          summary: p.summary || '',
          education: p.education || '',
          tenth_marks: p.tenth_marks || '',
          twelfth_marks: p.twelfth_marks || '',
          experience: p.experience || '',
          is_active: p.is_active !== undefined ? p.is_active : true,
        });
      })
      .catch(console.error);
  }, [token]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name || !profile.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      const payload = {
        name: profile.name,
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        skills: parseSkills(profile.skills),
        wallet_address: profile.wallet_address,
        phone_number: profile.phone_number || '',
        summary: profile.summary || '',
        education: profile.education || '',
        tenth_marks: profile.tenth_marks || null,
        twelfth_marks: profile.twelfth_marks || null,
        experience: profile.experience || null,
        is_active: profile.is_active,
      };
      await updateProfile(token, payload);
      // Show toast immediately after successful API call
      toast.success('Profile saved successfully');
      // Refresh profile in background
      refreshProfile().catch(console.error);
    } catch (err) {
      console.error('Profile save error:', err);
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Profile</h2>
        <button
          onClick={() => navigate('/dashboard/job-seeker')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleProfileSave} className="space-y-4">
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
          <div className="grid gap-3">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Name</label>
              <input 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20" 
                placeholder="Your full name" 
                value={profile.name} 
                onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                required
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">Email</label>
              <input 
                type="email"
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white/60" 
                value={profile.email} 
                disabled
                readOnly
              />
              <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">Phone Number</label>
              <input 
                type="tel"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20" 
                placeholder="+1 234 567 8900" 
                value={profile.phone_number} 
                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })} 
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">LinkedIn / Website</label>
              <input 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20" 
                placeholder="https://linkedin.com/in/yourprofile" 
                value={profile.linkedin_url} 
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })} 
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PROFESSIONAL SUMMARY */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Professional Summary</h3>
          <div>
            <label className="text-sm text-white/70 mb-1 block">Summary</label>
            <textarea 
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 min-h-[120px]" 
              placeholder="Write a brief professional summary about yourself, your career goals, and what you're looking for..." 
              value={profile.summary} 
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })} 
            />
          </div>
        </div>

        {/* SECTION 3: EDUCATION DETAILS */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Education Details</h3>
          <div className="grid gap-3">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Education</label>
              <input 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20" 
                placeholder="e.g., B.Tech Computer Science, MCA, etc." 
                value={profile.education} 
                onChange={(e) => setProfile({ ...profile, education: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-white/70 mb-1 block">10th Marks (%)</label>
                <input 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20" 
                  placeholder="e.g., 85" 
                  value={profile.tenth_marks} 
                  onChange={(e) => setProfile({ ...profile, tenth_marks: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-1 block">12th Marks (%)</label>
                <input 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20" 
                  placeholder="e.g., 90" 
                  value={profile.twelfth_marks} 
                  onChange={(e) => setProfile({ ...profile, twelfth_marks: e.target.value })} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: EXPERIENCE */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Experience</h3>
          <div>
            <label className="text-sm text-white/70 mb-1 block">Experience</label>
            <input 
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20" 
              placeholder="e.g., 2 years, Fresh Graduate, 5+ years in software development" 
              value={profile.experience} 
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })} 
            />
          </div>
        </div>

        {/* SECTION 5: SKILLS */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Skills</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20"
                placeholder="Add a skill (e.g., JavaScript, Python, React)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={onSkillKeyDown}
              />
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                type="button" 
                className="btn-primary px-4" 
                onClick={() => addSkill(skillInput)}
              >
                Add
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {parseSkills(profile.skills).map((skill) => (
                <span key={skill} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm flex items-center gap-2">
                  {skill}
                  <button type="button" className="text-white/70 hover:text-white transition-colors" onClick={() => removeSkill(skill)}>×</button>
                </span>
              ))}
              {parseSkills(profile.skills).length === 0 && (
                <p className="text-sm text-white/60">No skills added yet. Add skills manually or upload a resume to extract them.</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 6: PROFILE STATUS */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Profile Status</h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.is_active}
                onChange={(e) => setProfile({ ...profile, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-white/20 bg-white/10 text-accent focus:ring-accent"
              />
              <span className="text-sm text-white/80 font-medium">Active Profile</span>
            </label>
          </div>
          <p className="text-xs text-white/60">
            {profile.is_active 
              ? '✓ Your profile is visible to recruiters' 
              : '⚠ Inactive profiles are hidden from recruiters'}
          </p>
        </div>

        {/* SECTION 7: RESUME */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Resume</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-white/70">Upload Resume (PDF)</label>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleResumeUpload} 
                disabled={uploading} 
                className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/80" 
              />
              {uploading && <span className="text-sm text-white/60">Processing...</span>}
            </div>
            <p className="text-xs text-white/60">
              Upload your resume to automatically extract skills. Extracted skills will be merged with your existing skills.
            </p>
          </div>
          {suggestedSkills.length > 0 && (
            <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">Suggested Skills from Resume</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition-colors"
                    onClick={() => addSkill(skill)}
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <motion.button 
          whileHover={{ scale: 1.01 }} 
          whileTap={{ scale: 0.99 }}
          type="submit" 
          className="btn-primary w-full py-3 text-lg font-semibold"
        >
          Save Profile
        </motion.button>
      </form>
    </div>
  );
}
