import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { createRecruiterAnnouncement } from '../services/api.js';
import { toast } from 'sonner';

/**
 * RecruiterAnnouncementModal
 * 
 * Modal component for recruiters to send announcements to other recruiters.
 * These announcements are only visible to recruiters (not admin, not job seekers).
 */
export default function RecruiterAnnouncementModal({ isOpen, onClose, onAnnouncementCreated }) {
  const { token } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter an announcement message');
      return;
    }

    setSending(true);
    try {
      await createRecruiterAnnouncement(token, message);
      toast.success('Announcement sent successfully to all recruiters');
      setMessage('');
      onClose();
      // Notify parent to refresh announcements
      if (onAnnouncementCreated) {
        onAnnouncementCreated();
      }
    } catch (err) {
      console.error('Failed to send announcement', err);
      toast.error(err.response?.data?.error || 'Failed to send announcement');
    } finally {
      setSending(false);
    }
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
            <div className="glass rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Send Announcement</h2>
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

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Announcement Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your announcement message..."
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
                    rows={6}
                    disabled={sending}
                  />
                  <p className="text-xs text-white/50 mt-1">
                    This announcement will be visible to all recruiters only.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={sending}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="flex-1 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

