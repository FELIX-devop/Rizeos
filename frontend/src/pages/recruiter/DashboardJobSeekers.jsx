import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import SeekerProfileCard from '../../components/SeekerProfileCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DashboardJobSeekers() {
  const {
    seekers,
    setSeekers,
    seekerQuery,
    setSeekerQuery,
    loadSeekers,
  } = useOutletContext();
  const { user } = useAuth();
  const [selectedSeeker, setSelectedSeeker] = React.useState(null);

  useEffect(() => {
    loadSeekers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="glass rounded-2xl p-5 space-y-4 min-h-[70vh]">
      <div className="flex gap-3 flex-wrap">
        <input className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Search name" value={seekerQuery.name} onChange={(e) => setSeekerQuery({ ...seekerQuery, name: e.target.value })} />
        <input className="p-3 rounded-lg bg-white/10 border border-white/20" placeholder="Skills (comma separated)" value={seekerQuery.skills} onChange={(e) => setSeekerQuery({ ...seekerQuery, skills: e.target.value })} />
        <button className="btn-primary px-4 py-2" onClick={() => loadSeekers()}>Search</button>
      </div>
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-sm">
          <thead className="text-left text-white/70">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Skills</th>
            </tr>
          </thead>
          <tbody>
            {seekers.map((s) => (
              <tr key={s.id || s._id} className="border-t border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => setSelectedSeeker(s)}>
                <td className="py-2 pr-4">{s.name}</td>
                <td className="py-2 pr-4 truncate">{s.email}</td>
                <td className="py-2 pr-4 truncate">{(s.skills || []).join(', ')}</td>
              </tr>
            ))}
            {seekers.length === 0 && (
              <tr>
                <td colSpan={3} className="py-3 text-white/60">No seekers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedSeeker && (
        <SeekerProfileCard seeker={selectedSeeker} currentUserId={user?.id} onClose={() => setSelectedSeeker(null)} />
      )}
    </div>
  );
}

