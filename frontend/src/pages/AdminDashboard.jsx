import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminDashboard, getUnreadCount } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AdminMessagesDrawer from '../components/AdminMessagesDrawer.jsx';
import AdminAnnouncementModal from '../components/AdminAnnouncementModal.jsx';
import PremiumName from '../components/PremiumName.jsx';

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ payments: [], total_payments_matic: 0, users: 0, jobs: 0, user_list: [], job_list: [] });
  const [activeTab, setActiveTab] = useState('payments');
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    adminDashboard(token).then(setData);
    loadUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUnreadCount = async () => {
    try {
      const result = await getUnreadCount(token);
      setUnreadCount(result.unread_count || 0);
    } catch (err) {
      console.error('Failed to load unread count', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Admin overview</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAnnouncementsOpen(true)}
            className="relative p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
            title="Announcements"
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
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </button>
          <button
            onClick={() => setMessagesOpen(true)}
            className="relative p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
            title="Messages"
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <MetricCard label="Total Payments" value={`${data.total_payments_matic} MATIC`} onClick={() => setActiveTab('payments')} active={activeTab === 'payments'} />
        <MetricCard label="Users" value={data.users} onClick={() => setActiveTab('users')} active={activeTab === 'users'} />
        <MetricCard label="Jobs" value={data.jobs} onClick={() => setActiveTab('jobs')} active={activeTab === 'jobs'} />
      </div>
      <div className="glass rounded-2xl p-5">
        {activeTab === 'payments' && (
          <>
        <h3 className="font-semibold mb-2">Transactions</h3>
        <div className="space-y-2 max-h-72 overflow-auto">
          {data.payments.map((p) => (
            <div key={p.id} className="p-3 bg-white/5 rounded-lg text-sm flex justify-between">
              <span className="truncate">{p.tx_hash || p.txHash}</span>
              <span className="text-accent">{p.amount} MATIC</span>
            </div>
          ))}
          {data.payments.length === 0 && <p className="text-sm text-white/60">No payments yet.</p>}
        </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h3 className="font-semibold mb-2">Users</h3>
            <div className="overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="text-left text-white/70">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {data.user_list?.map((u) => (
                    <tr
                      key={u._id || u.id}
                      onClick={() => navigate(`/dashboard/admin/users/${u._id || u.id}`)}
                      className="border-t border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="py-2 pr-4">
                        <PremiumName name={u.name} isPremium={u.is_premium || false} showBadge={false} />
                      </td>
                      <td className="py-2 pr-4 truncate">{u.email}</td>
                      <td className="py-2 pr-4">{u.role}</td>
                    </tr>
                  ))}
                  {(!data.user_list || data.user_list.length === 0) && (
                    <tr>
                      <td colSpan={3} className="py-3 text-white/60">No users.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'jobs' && (
          <>
            <h3 className="font-semibold mb-2">Jobs</h3>
            <div className="overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="text-left text-white/70">
                  <tr>
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Location</th>
                    <th className="py-2 pr-4">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {data.job_list?.map((j) => (
                    <tr
                      key={j._id || j.id}
                      onClick={() => navigate(`/dashboard/admin/jobs/${j._id || j.id}`)}
                      className="border-t border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="py-2 pr-4">{j.title}</td>
                      <td className="py-2 pr-4">{j.location || '—'}</td>
                      <td className="py-2 pr-4">{j.budget || 0}</td>
                    </tr>
                  ))}
                  {(!data.job_list || data.job_list.length === 0) && (
                    <tr>
                      <td colSpan={3} className="py-3 text-white/60">No jobs.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <AdminMessagesDrawer
        isOpen={messagesOpen}
        onClose={() => {
          setMessagesOpen(false);
          loadUnreadCount(); // Refresh count when drawer closes
        }}
      />

      <AdminAnnouncementModal
        isOpen={announcementsOpen}
        onClose={() => setAnnouncementsOpen(false)}
      />
    </div>
  );
}

function MetricCard({ label, value, onClick, active }) {
  return (
    <button type="button" onClick={onClick} className={`glass rounded-xl p-4 text-left w-full ${active ? 'border border-white/30' : ''}`}>
      <p className="text-sm text-white/60">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </button>
  );
}

