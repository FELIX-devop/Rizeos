import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SeekerInboxPage
 * 
 * Placeholder page for job seeker inbox (optional feature).
 */
export default function SeekerInboxPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/job-seeker/messages')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Messages
        </button>
      </div>

      <div className="glass rounded-2xl p-6 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-2xl font-semibold mb-2">Inbox</h2>
        <p className="text-white/60 mb-4">
          Your inbox is currently empty.
        </p>
        <p className="text-sm text-white/50">
          This feature will be available in a future update.
        </p>
      </div>
    </div>
  );
}

