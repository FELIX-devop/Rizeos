import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { sendMessage } from '../services/api.js';
import { toast } from 'sonner';

/**
 * AdminSendMessageModal
 * 
 * Modal component for admin/recruiter to send direct messages to users.
 * Supports optional jobId for job-context messages and custom onSend handler.
 */
export default function AdminSendMessageModal({ isOpen, onClose, recipientUser, jobId = null, onSend = null }) {
  const { token } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!recipientUser || !recipientUser.id) {
      toast.error('Recipient information is missing');
      return;
    }

    setSending(true);
    try {
      // If custom onSend handler provided, use it
      if (onSend) {
        await onSend(message.trim(), recipientUser.id);
      } else {
        // Default behavior: call sendMessage API
        await sendMessage(token, message.trim(), recipientUser.id, recipientUser.role, jobId);
        toast.success('Message sent successfully');
      }
      setMessage('');
      onClose();
    } catch (err) {
      console.error('Failed to send message', err);
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!recipientUser) return null;

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
                <h2 className="text-2xl font-semibold">Send Message</h2>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                  disabled={sending}
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
                <div className="space-y-2">
                  <label className="block text-sm text-white/70">To</label>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-white">
                    {recipientUser.name || 'N/A'}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-white/70">Email</label>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-white">
                    {recipientUser.email || 'N/A'}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-white/70">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
                    rows={6}
                    disabled={sending}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={sending}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={sending || !message.trim()}
                    className="flex-1 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

