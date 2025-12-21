import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRecruiterInbox, markMessageAsRead } from '../../services/api.js';
import { toast } from 'sonner';

/**
 * RecruiterInboxPage
 * 
 * Dedicated page for recruiters to view messages from job seekers.
 */
export default function RecruiterInboxPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getRecruiterInbox(token);
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
    loadMessages();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Inbox</h2>
          <p className="text-sm text-white/70">Messages from job seekers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadMessages}
            disabled={loading}
            className="text-sm px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => navigate('/dashboard/recruiter')}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back to Overview
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        {loading && (
          <div className="text-center py-8">
            <p className="text-sm text-white/60">Loading messages...</p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 mb-2">No messages yet</p>
            <p className="text-sm text-white/50">
              Job seekers can send you messages from their dashboard
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
                      {msg.from_user_name || 'Unknown Job Seeker'}
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
    </div>
  );
}

