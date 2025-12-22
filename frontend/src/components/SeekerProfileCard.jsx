import React from 'react';
import { getScoreProps } from '../utils/scoreColor.js';

export default function SeekerProfileCard({ seeker, onClose, currentUserId }) {
  const skills = seeker?.skills || [];
  const match = seeker?.match_scores && currentUserId && seeker.match_scores[currentUserId];
  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-lg">{seeker?.name || 'Unnamed'}</h4>
        {onClose && (
          <button className="text-sm text-secondary underline" onClick={onClose}>
            Close
          </button>
        )}
      </div>
      <p className="text-white/70 text-sm">Email: {seeker?.email || '—'}</p>
      <p className="text-white/70 text-sm">Skills: {skills.join(', ') || '—'}</p>
      <p className="text-white/70 text-sm">Bio: {seeker?.bio || '—'}</p>
      {match && (
        <p {...getScoreProps(match, { className: 'text-sm' })}>
          Match: {match.toFixed(1)}%
        </p>
      )}
    </div>
  );
}

