import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function DashboardJobs() {
  const { jobs, jobsLoading, loadJobs } = useOutletContext();

  return (
    <div className="glass rounded-2xl p-5 min-h-[70vh]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">My Jobs</h3>
        <button className="text-xs px-3 py-1 rounded-lg bg-white/10 border border-white/20" onClick={loadJobs} disabled={jobsLoading}>
          {jobsLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <div className="space-y-2 max-h-[70vh] overflow-auto">
        {(jobs || []).map((job) => (
          <div key={job.id} className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{job.title}</span>
              <span className="text-xs text-white/60">{job.location || 'Remote'}</span>
            </div>
            <p className="text-sm text-white/70 line-clamp-2">{job.description}</p>
          </div>
        ))}
        {jobs.length === 0 && !jobsLoading && <p className="text-sm text-white/60">No jobs yet.</p>}
        {jobsLoading && <p className="text-sm text-white/60">Loading jobs…</p>}
      </div>
    </div>
  );
}

