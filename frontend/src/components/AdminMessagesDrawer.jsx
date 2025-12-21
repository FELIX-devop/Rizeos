import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { getAdminInbox, markMessageAsRead } from '../services/api.js';
import { toast } from 'sonner';

/**
 * AdminMessagesDrawer
 * 
 * Drawer component for admin to view messages from recruiters.
 */
export default function AdminMessagesDrawer({ isOpen, onClose }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getAdminInbox(token);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load messages', err);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkAsRead = async (messageId, isRead) => {
    if (isRead) return; // Already read

    try {
      await markMessageAsRead(token, messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (err) {
      toast.error('Failed to mark message as read');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Messages</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && (
                <div className="text-center py-8">
                  <p className="text-sm text-white/60">Loading messages...</p>
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/60 mb-2">No messages yet</p>
                  <p className="text-sm text-white/50">
                    Recruiters can send you messages from their dashboard
                  </p>
                </div>
              )}

              {!loading &&
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      msg.is_read
                        ? 'bg-white/5 border-white/10'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                    onClick={() => handleMarkAsRead(msg.id, msg.is_read)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            {msg.from_user_name || 'Unknown Recruiter'}
                          </p>
                          {!msg.is_read && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60">
                          {msg.from_user_email || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 mb-2 whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    <p className="text-xs text-white/50">
                      {formatDate(msg.created_at)}
                    </p>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

