import React, { useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';

export default function DashboardOverview() {
  const { payments, paymentsLoading, jobs, seekers } = useOutletContext();

  const totalMatic = useMemo(
    () => (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toFixed(3),
    [payments]
  );

  return (
    <div className="grid md:grid-cols-2 gap-6 min-h-[70vh]">
      <div className="glass rounded-2xl p-6 space-y-4 h-full">
        <h2 className="text-xl font-semibold">Welcome back</h2>
        <p className="text-white/70 text-sm">Manage jobs and candidates from your dashboard.</p>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-primary" to="/dashboard/post-job">Post Job</Link>
          <Link className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10" to="/dashboard/jobs">Jobs</Link>
          <Link className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10" to="/dashboard/job-seekers">Job Seekers</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <StatCard label="Jobs" value={jobs?.length || 0} />
          <StatCard label="Job Seekers" value={seekers?.length || 0} />
          <StatCard label="Payments (MATIC)" value={totalMatic} />
        </div>
      </div>
      <div className="glass rounded-2xl p-5 h-full">
        <h3 className="font-semibold mb-2">Recent Payments</h3>
        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {(payments || []).map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm bg-white/5 p-3 rounded-lg">
              <span className="truncate">{p.tx_hash || p.txHash}</span>
              <span className="text-accent">{p.amount} MATIC</span>
            </div>
          ))}
          {paymentsLoading && <p className="text-sm text-white/60">Loading…</p>}
          {!paymentsLoading && (!payments || payments.length === 0) && <p className="text-sm text-white/60">No payments yet.</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass rounded-xl p-3 border border-white/10">
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}

