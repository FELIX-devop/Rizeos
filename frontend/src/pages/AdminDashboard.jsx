import React, { useEffect, useState } from 'react';
import { adminDashboard } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState({ payments: [], total_payments_matic: 0, users: 0, jobs: 0, user_list: [], job_list: [] });
  const [activeTab, setActiveTab] = useState('payments');

  useEffect(() => {
    adminDashboard(token).then(setData);
  }, [token]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Admin overview</h2>
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
                    <tr key={u._id || u.id} className="border-t border-white/10">
                      <td className="py-2 pr-4">{u.name}</td>
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
                    <tr key={j._id || j.id} className="border-t border-white/10">
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

