import React from 'react';

/**
 * PremiumName Component
 * 
 * Displays a user's name with premium styling if they are a premium user.
 * 
 * @param {string} name - User's name
 * @param {boolean} isPremium - Whether the user has premium status
 * @param {string} className - Additional CSS classes
 * @param {boolean} showBadge - Whether to show the premium badge (default: true)
 */
export default function PremiumName({ name, isPremium = false, className = '', showBadge = true }) {
  const nameStyle = isPremium 
    ? { color: '#FFD700' } // Gold color
    : {};

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span style={nameStyle} className={isPremium ? 'font-medium' : ''}>
        {name}
      </span>
      {isPremium && showBadge && (
        <span 
          className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          title="Premium User"
        >
          Premium
        </span>
      )}
    </span>
  );
}

