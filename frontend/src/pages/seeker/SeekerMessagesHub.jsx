import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * SeekerMessagesHub
 * 
 * Hub page for job seeker messages with two options:
 * 1. Send Message (to recruiter)
 * 2. Inbox (optional, can be empty)
 */
export default function SeekerMessagesHub() {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Send Message',
      description: 'Send a message to a recruiter',
      route: '/dashboard/job-seeker/messages/send',
      icon: '📤',
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: 'Inbox',
      description: 'View your messages (coming soon)',
      route: '/dashboard/job-seeker/messages/inbox',
      icon: '📥',
      color: 'from-gray-500/20 to-gray-600/20',
      disabled: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/job-seeker')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">Messages</h2>
        <p className="text-sm text-white/70">
          Send messages to recruiters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const content = (
            <motion.div
              whileHover={!option.disabled ? { scale: 1.02 } : {}}
              whileTap={!option.disabled ? { scale: 0.98 } : {}}
              className={`glass rounded-2xl p-6 bg-gradient-to-br ${option.color} border border-white/10 ${
                option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20 cursor-pointer'
              } transition-all h-full`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{option.title}</h3>
                  <p className="text-sm text-white/70">{option.description}</p>
                </div>
                {!option.disabled && (
                  <div className="text-white/40">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </motion.div>
          );

          return option.disabled ? (
            <div key={option.route}>{content}</div>
          ) : (
            <Link key={option.route} to={option.route}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

