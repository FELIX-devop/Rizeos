/**
 * Score Color Utility
 * 
 * Provides color coding for job fitment scores (0-100).
 * 
 * Color Rules:
 * - GREEN  → score ≥ 75 (Strong Match)
 * - YELLOW → score 50-74 (Moderate Match)
 * - RED    → score < 50 (Weak Match)
 */

/**
 * Get Tailwind CSS class for score color
 * @param {number} score - Fitment score (0-100)
 * @returns {string} Tailwind CSS class for text color
 */
export const getScoreColorClass = (score) => {
  if (typeof score !== 'number' || isNaN(score)) {
    return 'text-white/60'; // Default for invalid scores
  }
  
  if (score >= 75) {
    return 'text-green-500'; // #22c55e equivalent
  }
  if (score >= 50) {
    return 'text-yellow-400'; // #facc15 equivalent
  }
  return 'text-red-500'; // #ef4444 equivalent
};

/**
 * Get score color as hex value (for custom styling)
 * @param {number} score - Fitment score (0-100)
 * @returns {string} Hex color code
 */
export const getScoreColorHex = (score) => {
  if (typeof score !== 'number' || isNaN(score)) {
    return '#9ca3af'; // Default gray
  }
  
  if (score >= 75) {
    return '#22c55e'; // Green
  }
  if (score >= 50) {
    return '#facc15'; // Yellow
  }
  return '#ef4444'; // Red
};

/**
 * Get score label/meaning
 * @param {number} score - Fitment score (0-100)
 * @returns {string} Label (Strong Match, Moderate Match, Weak Match)
 */
export const getScoreLabel = (score) => {
  if (typeof score !== 'number' || isNaN(score)) {
    return 'No Score';
  }
  
  if (score >= 75) {
    return 'Strong Match';
  }
  if (score >= 50) {
    return 'Moderate Match';
  }
  return 'Weak Match';
};

/**
 * Format score with color styling (React component helper)
 * @param {number} score - Fitment score (0-100)
 * @param {object} options - Optional styling options
 * @returns {object} Props object for styling
 */
export const getScoreProps = (score, options = {}) => {
  const {
    showTooltip = true,
    className = '',
    formatScore = (s) => `${s.toFixed(1)}%`,
  } = options;
  
  const colorClass = getScoreColorClass(score);
  const label = getScoreLabel(score);
  
  return {
    className: `font-semibold ${colorClass} ${className}`.trim(),
    title: showTooltip ? `AI-generated job fitment score: ${label}` : undefined,
  };
};

