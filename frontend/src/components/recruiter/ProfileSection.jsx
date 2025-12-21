import React from 'react';
import { motion } from 'framer-motion';

/**
 * ProfileSection Component
 * Handles recruiter profile editing
 */
export default function ProfileSection({ profile, setProfile, onSave, loading }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h2 className="text-xl font-semibold">Company Profile</h2>
      <p className="text-sm text-white/70">Update your company information and preferences</p>
      
      <form className="grid gap-4" onSubmit={onSave}>
        <div>
          <label className="text-sm text-white/70 mb-1 block">Company/Recruiter Name</label>
          <input 
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors" 
            placeholder="Your company name" 
            value={profile.name} 
            onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
          />
        </div>
        
        <div>
          <label className="text-sm text-white/70 mb-1 block">Company Description</label>
          <textarea 
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors resize-none" 
            placeholder="Describe your company, culture, and what you're looking for..." 
            rows={4}
            value={profile.bio} 
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })} 
          />
        </div>
        
        <div>
          <label className="text-sm text-white/70 mb-1 block">Company Website / LinkedIn</label>
          <input 
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors" 
            placeholder="https://linkedin.com/company/..." 
            value={profile.linkedin_url} 
            onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })} 
          />
        </div>
        
        <div>
          <label className="text-sm text-white/70 mb-1 block">Company Skills / Focus Areas</label>
          <input 
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors" 
            placeholder="Tech, Finance, Healthcare (comma separated)" 
            value={Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || ''} 
            onChange={(e) => setProfile({ ...profile, skills: e.target.value })} 
          />
        </div>
        
        <div>
          <label className="text-sm text-white/70 mb-1 block">Wallet Address</label>
          <input 
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors font-mono text-sm" 
            placeholder="0x..." 
            value={profile.wallet_address} 
            onChange={(e) => setProfile({ ...profile, wallet_address: e.target.value })} 
          />
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.01 }} 
          whileTap={{ scale: 0.99 }}
          type="submit" 
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </motion.button>
      </form>
    </div>
  );
}

