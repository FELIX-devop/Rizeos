import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { listUsers, listJobs, getRankedJobSeekers } from '../../services/api.js';
import RecruiterSeekerProfile from '../../components/RecruiterSeekerProfile.jsx';
import PremiumName from '../../components/PremiumName.jsx';

/**
 * JobSeekersPage
 * 
 * Dedicated page for viewing and searching job seekers.
 * Supports job-based ranking with AI fitment scores.
 */
export default function JobSeekersPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [seekers, setSeekers] = useState([]);
  const [seekerQuery, setSeekerQuery] = useState({ name: '', skills: '' });
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [rankedData, setRankedData] = useState(null); // { jobId, jobTitle, results: [{ jobSeekerId, name, email, skills, fitmentScore }] }

  // Load recruiter's jobs
  const loadRecruiterJobs = async () => {
    setLoadingJobs(true);
    try {
      const jobs = await listJobs(token);
      // Filter jobs posted by this recruiter
      const myJobs = Array.isArray(jobs) ? jobs.filter(job => {
        const recruiterId = job.recruiter_id || job.recruiterId || job.recruiter?.id || job.recruiter?._id;
        const currentUserId = user?.id || user?._id;
        // Handle both string and ObjectID formats
        return String(recruiterId) === String(currentUserId);
      }) : [];
      setRecruiterJobs(myJobs);
    } catch (err) {
      console.error('Failed to load jobs', err);
      setRecruiterJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadSeekers = async (query = seekerQuery) => {
    setLoading(true);
    try {
      const res = await listUsers(token, {
        role: 'seeker',
        name: query.name,
        skills: query.skills,
      });
      setSeekers(Array.isArray(res) ? res : []);
      setRankedData(null); // Clear ranking when loading normal list
    } catch (err) {
      console.error('Failed to load seekers', err);
      setSeekers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load ranked job seekers for selected job
  const loadRankedSeekers = async (jobId) => {
    if (!jobId) {
      loadSeekers();
      return;
    }

    setLoading(true);
    try {
      const data = await getRankedJobSeekers(token, jobId);
      setRankedData(data);
      // Convert ranked results to seekers format for compatibility
      const rankedSeekers = (data.results || []).map(r => ({
        id: r.jobSeekerId,
        _id: r.jobSeekerId,
        name: r.name,
        email: r.email,
        skills: r.skills,
        fitmentScore: r.fitmentScore,
        is_premium: r.isPremium || false,
      }));
      setSeekers(rankedSeekers);
    } catch (err) {
      console.error('Failed to load ranked seekers', err);
      setSeekers([]);
      setRankedData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeekers();
    loadRecruiterJobs();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    if (selectedJobId) {
      // If job is selected, reload ranking
      loadRankedSeekers(selectedJobId);
    } else {
      loadSeekers(seekerQuery);
    }
  };

  const handleJobChange = (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    if (jobId) {
      loadRankedSeekers(jobId);
    } else {
      loadSeekers();
    }
  };

  // Get score color class
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
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
            disabled={!!selectedJobId}
          />
          <input
            className="flex-1 min-w-[200px] p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors"
            placeholder="Filter by skills (comma separated)"
            value={seekerQuery.skills}
            onChange={(e) => setSeekerQuery({ ...seekerQuery, skills: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={!!selectedJobId}
          />
          <select
            className="flex-1 min-w-[200px] p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors text-white"
            value={selectedJobId}
            onChange={handleJobChange}
            disabled={loadingJobs}
          >
            <option value="">All Job Seekers</option>
            {recruiterJobs.map((job) => (
              <option key={job.id || job._id} value={job.id || job._id}>
                {job.title}
              </option>
            ))}
          </select>
          {!selectedJobId && (
            <button className="btn-primary px-6 py-3" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          )}
        </div>

        {selectedJobId && rankedData && (
          <div className="text-sm text-white/70 bg-white/5 rounded-lg p-3">
            <span className="font-semibold">Ranking by:</span> {rankedData.jobTitle || 'Selected Job'}
            <span className="ml-4 text-xs text-white/50">
              AI-generated fitment scores • Sorted by best match
            </span>
          </div>
        )}

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
                  <th className="py-3 pr-4">Rank</th>
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Skills</th>
                  {selectedJobId && (
                    <th className="py-3 pr-4">
                      Fitment Score
                      <span
                        className="ml-1 text-xs text-white/50 cursor-help"
                        title="AI-generated job fitment score based on skills and profile"
                      >
                        ⓘ
                      </span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {seekers.map((s, index) => {
                  const isTopMatch = selectedJobId && index === 0 && s.fitmentScore !== undefined;
                  return (
                    <tr
                      key={s.id || s._id}
                      className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                        isTopMatch ? 'bg-green-500/10' : ''
                      }`}
                      onClick={() => setSelectedSeeker(s)}
                    >
                      <td className="py-3 pr-4">
                        {selectedJobId ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white/60">#{index + 1}</span>
                            {isTopMatch && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/40">
                                Best Match
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/60">#{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-medium">
                        <PremiumName name={s.name} isPremium={s.is_premium || false} showBadge={false} />
                      </td>
                      <td className="py-3 pr-4 truncate text-white/80">{s.email}</td>
                      <td className="py-3 pr-4 truncate text-white/70">
                        {(s.skills || []).slice(0, 3).join(', ')}
                        {(s.skills || []).length > 3 && '...'}
                      </td>
                      {selectedJobId && (
                        <td className="py-3 pr-4">
                          {s.fitmentScore !== undefined ? (
                            <span
                              className={`font-semibold ${getScoreColor(s.fitmentScore)}`}
                              title="AI-generated job fitment score based on skills and profile"
                            >
                              {s.fitmentScore.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-white/40">N/A</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
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


