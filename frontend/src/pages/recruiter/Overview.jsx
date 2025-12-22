import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Overview - Navigation Hub
 * 
 * This is a HUB page only. No heavy API logic here.
 * Just navigation cards that redirect to dedicated pages.
 */
export default function Overview() {
  const navCards = [
    {
      title: 'Post Job',
      description: 'Create a new job posting',
      route: '/dashboard/recruiter/post-job',
      icon: '📝',
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: 'Jobs',
      description: 'View and manage your job postings',
      route: '/dashboard/recruiter/jobs',
      icon: '💼',
      color: 'from-purple-500/20 to-pink-500/20',
    },
    {
      title: 'Job Seekers',
      description: 'Browse and connect with candidates',
      route: '/dashboard/recruiter/job-seekers',
      icon: '👥',
      color: 'from-green-500/20 to-emerald-500/20',
    },
    {
      title: 'Payments',
      description: 'View transaction history and make payments',
      route: '/dashboard/recruiter/payments',
      icon: '💰',
      color: 'from-yellow-500/20 to-orange-500/20',
    },
    {
      title: 'Messages',
      description: 'Send message to admin or view inbox',
      route: '/dashboard/recruiter/messages',
      icon: '📩',
      color: 'from-indigo-500/20 to-blue-500/20',
    },
    {
      title: 'Analytics',
      description: 'View market trends and candidate insights',
      route: '/dashboard/recruiter/analytics',
      icon: '📊',
      color: 'from-pink-500/20 to-rose-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">Welcome back!</h2>
        <p className="text-sm text-white/70">
          Use the navigation cards below to access different sections of your dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {navCards.map((card) => (
          <Link key={card.route} to={card.route}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`glass rounded-2xl p-6 bg-gradient-to-br ${card.color} border border-white/10 hover:border-white/20 transition-all cursor-pointer h-full`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{card.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                  <p className="text-sm text-white/70">{card.description}</p>
                </div>
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
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

