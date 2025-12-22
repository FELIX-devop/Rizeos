import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { listUsers } from '../../services/api.js';
import RecruiterSeekerProfile from '../../components/RecruiterSeekerProfile.jsx';

/**
 * JobSeekersPage
 * 
 * Dedicated page for viewing and searching job seekers.
 * This is the ONLY place where listUsers API (for seekers) is called.
 */
export default function JobSeekersPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [seekers, setSeekers] = useState([]);
  const [seekerQuery, setSeekerQuery] = useState({ name: '', skills: '' });
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSeekers = async (query = seekerQuery) => {
    setLoading(true);
    try {
      const res = await listUsers(token, {
        role: 'seeker',
        name: query.name,
        skills: query.skills,
      });
      setSeekers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load seekers', err);
      setSeekers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeekers();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    loadSeekers(seekerQuery);
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

      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Job Seekers</h2>
          <p className="text-sm text-white/70">Search and connect with candidates</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <input
            className="flex-1 min-w-[200px] p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors"
            placeholder="Search by name"
            value={seekerQuery.name}
            onChange={(e) => setSeekerQuery({ ...seekerQuery, name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <input
            className="flex-1 min-w-[200px] p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors"
            placeholder="Filter by skills (comma separated)"
            value={seekerQuery.skills}
            onChange={(e) => setSeekerQuery({ ...seekerQuery, skills: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-primary px-6 py-3" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-sm text-white/60">Loading seekers...</p>
          </div>
        )}

        {!loading && seekers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No seekers found. Try adjusting your search criteria.</p>
          </div>
        )}

        {!loading && seekers.length > 0 && (
          <div className="overflow-auto max-h-[70vh]">
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
              </tbody>
            </table>
          </div>
        )}
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


