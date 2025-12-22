import React, { useState, useEffect } from 'react';
import RecruiterSeekerProfile from '../RecruiterSeekerProfile.jsx';

/**
 * JobSeekersSection Component
 * Displays and searches job seekers
 */
export default function JobSeekersSection({ seekers, seekerQuery, setSeekerQuery, onSearch, onLoad }) {
  const [selectedSeeker, setSelectedSeeker] = useState(null);

  // Load seekers on mount
  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">Job Seekers</h3>
        <p className="text-xs text-white/60">Search and connect with candidates</p>
      </div>
      
      <div className="flex gap-3 flex-wrap">
        <input 
          className="flex-1 min-w-[200px] p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors" 
          placeholder="Search by name" 
          value={seekerQuery.name} 
          onChange={(e) => setSeekerQuery({ ...seekerQuery, name: e.target.value })} 
        />
        <input 
          className="flex-1 min-w-[200px] p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors" 
          placeholder="Filter by skills (comma separated)" 
          value={seekerQuery.skills} 
          onChange={(e) => setSeekerQuery({ ...seekerQuery, skills: e.target.value })} 
        />
        <button 
          className="btn-primary px-6 py-3" 
          onClick={onSearch}
        >
          Search
        </button>
      </div>
      
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="text-left text-white/70 border-b border-white/10">
            <tr>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Skills</th>
            </tr>
          </thead>
          <tbody>
            {seekers.map((s) => (
              <tr 
                key={s.id || s._id} 
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors" 
                onClick={() => setSelectedSeeker(s)}
              >
                <td className="py-3 pr-4 font-medium">{s.name}</td>
                <td className="py-3 pr-4 truncate text-white/80">{s.email}</td>
                <td className="py-3 pr-4 truncate text-white/70">
                  {(s.skills || []).slice(0, 3).join(', ')}
                  {(s.skills || []).length > 3 && '...'}
                </td>
              </tr>
            ))}
            {(!seekers || seekers.length === 0) && (
              <tr>
                <td colSpan={3} className="py-8 text-white/60 text-center">
                  No seekers found. Try adjusting your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedSeeker && (
        <RecruiterSeekerProfile 
          seeker={selectedSeeker} 
          onClose={() => setSelectedSeeker(null)} 
        />
      )}
    </div>
  );
}

