import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { getJobApplicants, getUserProfilePublic, sendMessage } from '../../services/api.js';
import { toast } from 'sonner';
import PremiumName from '../../components/PremiumName.jsx';
import AdminSendMessageModal from '../../components/AdminSendMessageModal.jsx';
import { getScoreProps } from '../../utils/scoreColor.js';

/**
 * JobApplicantsPage
 * 
 * Shows all applicants for a specific job.
 * Recruiter can view profiles and send messages.
 */
export default function JobApplicantsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);

  useEffect(() => {
    const loadApplicants = async () => {
      setLoading(true);
      try {
        const data = await getJobApplicants(token, jobId);
        setApplicants(data.applicants || []);
        setJobTitle(data.jobTitle || 'Job Applicants');
      } catch (err) {
        console.error('Failed to load applicants', err);
        toast.error(err.response?.data?.error || 'Failed to load applicants');
        navigate('/dashboard/recruiter/jobs');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      loadApplicants();
    }
  }, [jobId, token, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleViewProfile = async (applicant) => {
    try {
      const profile = await getUserProfilePublic(token, applicant.jobSeekerId);
      setViewingProfile(profile);
      setProfileModalOpen(true);
    } catch (err) {
      toast.error('Failed to load profile');
    }
  };

  const handleSendMessage = (applicant) => {
    setSelectedApplicant({
      id: applicant.jobSeekerId,
      name: applicant.name,
      email: applicant.email,
      role: 'seeker',
    });
    setMessageModalOpen(true);
  };

  const handleMessageSent = async (message, toUserId) => {
    try {
      await sendMessage(token, message, toUserId, 'seeker', jobId);
      toast.success('Message sent');
      setMessageModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/recruiter/jobs')}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back to Jobs
          </button>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-white/60">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard/recruiter/jobs')}
            className="text-sm text-white/70 hover:text-white transition-colors mb-2"
          >
            ← Back to Jobs
          </button>
          <h2 className="text-2xl font-semibold">{jobTitle}</h2>
          <p className="text-sm text-white/70 mt-1">View and manage applicants</p>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="glass rounded-2xl p-6">
        {applicants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-2">No applicants yet</p>
            <p className="text-sm text-white/50">Job seekers will appear here when they apply</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Skills</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Fitment Score</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Applied Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => (
                  <motion.tr
                    key={applicant.jobSeekerId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <PremiumName 
                        name={applicant.name} 
                        isPremium={applicant.premiumUser || false}
                        showBadge={false}
                        className="font-medium"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-white/80">{applicant.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(applicant.skills || []).slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/70"
                          >
                            {skill}
                          </span>
                        ))}
                        {(applicant.skills || []).length > 3 && (
                          <span className="text-xs text-white/50">
                            +{(applicant.skills || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {applicant.fitmentScore !== null && applicant.fitmentScore !== undefined ? (
                        <span {...getScoreProps(applicant.fitmentScore, { className: 'text-sm' })}>
                          {applicant.fitmentScore.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-white/50">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-white/60">
                      {formatDate(applicant.appliedAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        applicant.profileStatus === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {applicant.profileStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewProfile(applicant)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                        >
                          View Profile
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSendMessage(applicant)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-accent hover:bg-accent/80 text-white transition-colors"
                        >
                          Send Message
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {profileModalOpen && viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Job Seeker Profile</h2>
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  setViewingProfile(null);
                }}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Basic Info */}
            <div className="glass rounded-xl p-4 space-y-3">
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Name</label>
                  <PremiumName 
                    name={viewingProfile.name || 'N/A'} 
                    isPremium={viewingProfile.is_premium || false}
                    className="text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Email</label>
                  <p className="text-white font-medium">{viewingProfile.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Phone Number</label>
                  <p className="text-white font-medium">{viewingProfile.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Profile Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                    viewingProfile.is_active !== false
                      ? 'bg-green-500/20 text-green-300 border-green-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {viewingProfile.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            {viewingProfile.summary && (
              <div className="glass rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">Professional Summary</h3>
                <p className="text-sm text-white/80 whitespace-pre-wrap">{viewingProfile.summary}</p>
              </div>
            )}

            {/* Education */}
            {(viewingProfile.education || viewingProfile.tenth_marks || viewingProfile.twelfth_marks) && (
              <div className="glass rounded-xl p-4 space-y-3">
                <h3 className="text-lg font-semibold mb-2">Education Details</h3>
                {viewingProfile.education && (
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Education</label>
                    <p className="text-white font-medium">{viewingProfile.education}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {viewingProfile.tenth_marks && (
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">10th Marks</label>
                      <p className="text-white font-medium">{viewingProfile.tenth_marks}%</p>
                    </div>
                  )}
                  {viewingProfile.twelfth_marks && (
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">12th Marks</label>
                      <p className="text-white font-medium">{viewingProfile.twelfth_marks}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {viewingProfile.experience && (
              <div className="glass rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">Experience</h3>
                <p className="text-white font-medium">{viewingProfile.experience}</p>
              </div>
            )}

            {/* Skills */}
            {viewingProfile.skills && viewingProfile.skills.length > 0 && (
              <div className="glass rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {viewingProfile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedApplicant({
                    id: viewingProfile.id || viewingProfile._id,
                    name: viewingProfile.name,
                    email: viewingProfile.email,
                    role: 'seeker',
                  });
                  setMessageModalOpen(true);
                  setProfileModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold transition-colors"
              >
                Send Message
              </motion.button>
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  setViewingProfile(null);
                }}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Message Modal */}
      {messageModalOpen && selectedApplicant && (
        <AdminSendMessageModal
          isOpen={messageModalOpen}
          onClose={() => {
            setMessageModalOpen(false);
            setSelectedApplicant(null);
          }}
          recipientUser={selectedApplicant}
          jobId={jobId}
          onSend={handleMessageSent}
        />
      )}
    </div>
  );
}

