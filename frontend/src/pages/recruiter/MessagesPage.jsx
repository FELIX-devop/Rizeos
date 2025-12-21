import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { sendMessage, listUsers } from '../../services/api.js';
import { toast } from 'sonner';

/**
 * MessagesPage
 * 
 * Dedicated page for recruiters to send messages to admin.
 */
export default function MessagesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    // Load admin users for recipient selection
    const loadAdmins = async () => {
      try {
        const users = await listUsers(token, { role: 'admin' });
        setAdminUsers(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error('Failed to load admin users', err);
      }
    };
    loadAdmins();
  }, [token]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (adminUsers.length === 0) {
      toast.error('No admin user found');
      return;
    }

    setSending(true);
    try {
      // Send to first admin (backward compatibility)
      const adminId = adminUsers[0].id || adminUsers[0]._id;
      await sendMessage(token, message, adminId, 'admin');
      toast.success('Message sent successfully!');
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/recruiter')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Overview
        </button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Send Message to Admin</h2>
          <p className="text-sm text-white/70">Send a message to the platform administrator</p>
        </div>

        <form className="space-y-4" onSubmit={handleSend}>
          <div>
            <label className="text-sm text-white/70 mb-1 block">Message</label>
            <textarea
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Enter your message here..."
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={sending || !message.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </motion.button>
        </form>

        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-white/60">
            <strong>Note:</strong> Your message will be sent to the platform administrator. 
            You will receive a response if needed.
          </p>
        </div>
      </div>
    </div>
  );
}

