import React from 'react';
import { motion } from 'framer-motion';

/**
 * JobsSection Component
 * Displays list of recruiter's jobs
 */
export default function JobsSection({ jobs, jobsLoading, onRefresh }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">My Jobs</h3>
        <button 
          className="text-xs px-3 py-1 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors" 
          onClick={onRefresh} 
          disabled={jobsLoading}
        >
          {jobsLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <div className="space-y-2 max-h-96 overflow-auto">
        {(jobs || []).map((job) => (
          <motion.div 
            key={job.id} 
            whileHover={{ scale: 1.01 }}
            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{job.title}</span>
              <span className="text-xs text-white/60">{job.location || 'Remote'}</span>
            </div>
            <p className="text-sm text-white/70 line-clamp-2 mt-1">{job.description}</p>
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {job.skills.slice(0, 5).map((skill, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
        {jobs.length === 0 && !jobsLoading && (
          <p className="text-sm text-white/60 text-center py-8">No jobs yet. Post your first job above!</p>
        )}
        {jobsLoading && (
          <p className="text-sm text-white/60 text-center py-8">Loading jobs…</p>
        )}
      </div>
    </div>
  );
}

