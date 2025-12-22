import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { getAISuggestions } from '../services/api.js';
import { toast } from 'sonner';

/**
 * AIJobSuggestionModal
 * 
 * Modal component for AI-powered job posting suggestions.
 */
export default function AIJobSuggestionModal({ isOpen, onClose, onUseTemplate }) {
  const { token } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSuggestions();
    }
  }, [isOpen, token]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getAISuggestions(token);
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
    } catch (err) {
      console.error('Failed to load AI suggestions', err);
      toast.error('Failed to load AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (suggestion) => {
    if (onUseTemplate) {
      onUseTemplate({
        title: suggestion.title,
        description: suggestion.description,
        skills: suggestion.skills.join(', '),
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <span>💡</span>
                    AI Job Suggestions
                  </h2>
                  <p className="text-sm text-white/70 mt-1">
                    Based on available candidates and market demand
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {loading && (
                <div className="text-center py-12">
                  <p className="text-white/60">Analyzing market trends...</p>
                </div>
              )}

              {!loading && suggestions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/60">No suggestions available at this time.</p>
                </div>
              )}

              {!loading && suggestions.length > 0 && (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="glass rounded-xl p-5 border border-white/10 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold text-primary">
                              {suggestion.title}
                            </h3>
                            <p className="text-xs text-white/60 mt-1">{suggestion.reason}</p>
                          </div>

                          <div>
                            <label className="text-xs text-white/60 mb-1 block">Required Skills</label>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 border border-white/20"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-white/60 mb-1 block">Job Description</label>
                            <p className="text-sm text-white/80">{suggestion.description}</p>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUseTemplate(suggestion)}
                          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold transition-colors text-sm whitespace-nowrap"
                        >
                          Use This Template
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

