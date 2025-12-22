import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const client = axios.create({
  baseURL: API_BASE,
});

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export const fetchConfig = async () => {
  const { data } = await client.get('/config/public');
  return data.data;
};

export const register = async (payload) => {
  const { data } = await client.post('/auth/register', payload);
  return data.data;
};

export const login = async (email, password) => {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data;
};

export const getProfile = async (token) => {
  const { data } = await client.get('/auth/me', { headers: authHeaders(token) });
  return data.data;
};

export const updateProfile = async (token, payload) => {
  const { data } = await client.put('/profile', payload, { headers: authHeaders(token) });
  return data.data;
};

export const verifyPayment = async (token, txHash) => {
  const { data } = await client.post('/payments/verify', { tx_hash: txHash }, { headers: authHeaders(token) });
  return data.data;
};

export const listPayments = async (token) => {
  const { data } = await client.get('/payments', { headers: authHeaders(token) });
  return data.data;
};

export const createJob = async (token, payload) => {
  const { data } = await client.post('/jobs', payload, { headers: authHeaders(token) });
  return data.data;
};

export const listJobs = async (token, params = {}) => {
  const { data } = await client.get('/jobs', { params, headers: token ? authHeaders(token) : {} });
  return data.data;
};

export const adminDashboard = async (token) => {
  const { data } = await client.get('/admin/dashboard', { headers: authHeaders(token) });
  return data.data;
};

export const getUserProfile = async (token, userId) => {
  const { data } = await client.get(`/admin/users/${userId}`, { headers: authHeaders(token) });
  return data.data;
};

export const getUserProfilePublic = async (token, userId) => {
  const { data } = await client.get(`/users/${userId}`, { headers: authHeaders(token) });
  return data.data || data;
};

export const getJobProfile = async (token, jobId) => {
  const { data } = await client.get(`/admin/jobs/${jobId}`, { headers: authHeaders(token) });
  return data.data;
};

export const getJobProfilePublic = async (token, jobId) => {
  const { data } = await client.get(`/jobs/${jobId}`, { headers: authHeaders(token) });
  return data.data || data;
};

// Get ranked job seekers for a specific job (recruiter only)
export const getRankedJobSeekers = async (token, jobId) => {
  const { data } = await client.get(`/recruiter/jobs/${jobId}/ranked-jobseekers`, { headers: authHeaders(token) });
  return data.data || data;
};

export const listUsers = async (token, params = {}) => {
  const { data } = await client.get('/users', { params, headers: authHeaders(token) });
  return data.data;
};

export const applyJob = async (token, jobId) => {
  const { data } = await client.post(`/jobs/${jobId}/apply`, {}, { headers: authHeaders(token) });
  return data.data;
};

// Message APIs
export const sendMessage = async (token, message, toUserId, toRole, jobId = null) => {
  const payload = { message, toUserId, toRole };
  if (jobId) {
    payload.jobId = jobId;
  }
  const { data } = await client.post('/messages/send', payload, { headers: authHeaders(token) });
  return data.data;
};

export const getAdminInbox = async (token) => {
  const { data } = await client.get('/admin/messages/inbox', { headers: authHeaders(token) });
  return data.data;
};

export const getUnreadCount = async (token) => {
  const { data } = await client.get('/admin/messages/unread-count', { headers: authHeaders(token) });
  return data.data;
};

export const markMessageAsRead = async (token, messageId) => {
  const { data } = await client.put(`/messages/${messageId}/read`, {}, { headers: authHeaders(token) });
  return data.data;
};

// Recruiter inbox APIs
export const getRecruiterInbox = async (token) => {
  const { data } = await client.get('/messages/recruiter/inbox', { headers: authHeaders(token) });
  return data.data;
};

export const getRecruiterUnreadCount = async (token) => {
  const { data } = await client.get('/messages/recruiter/unread-count', { headers: authHeaders(token) });
  return data.data;
};

// Job seeker inbox APIs
export const getSeekerInbox = async (token) => {
  const { data } = await client.get('/messages/seeker/inbox', { headers: authHeaders(token) });
  return data.data || data;
};

export const getSeekerUnreadCount = async (token) => {
  const { data } = await client.get('/messages/seeker/unread-count', { headers: authHeaders(token) });
  return data.data || data;
};

// Announcement APIs
export const createAnnouncement = async (token, message) => {
  const { data } = await client.post('/admin/announcements', { message }, { headers: authHeaders(token) });
  return data.data || data;
};

export const listAnnouncements = async (token) => {
  const { data } = await client.get('/announcements', { headers: authHeaders(token) });
  return data.data || data;
};

// Optional helper to call AI service directly for resume skill extraction.
export const extractSkillsFromResume = async (base64Content) => {
  const aiBase = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
  const resp = await fetch(`${aiBase}/skills/extract`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ resume_base64: base64Content }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `AI service error ${resp.status}`);
  }
  const json = await resp.json();
  return json.extractedSkills || json.skills || json.data?.skills || [];
};

// Optional helper to get match score directly from AI service.
export const matchScore = async (jobDescription, candidateBio, jobSkills = [], candidateSkills = []) => {
  const aiBase = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
  const resp = await fetch(`${aiBase}/match`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      job_description: jobDescription,
      candidate_bio: candidateBio,
      job_skills: jobSkills,
      candidate_skills: candidateSkills,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `AI service error ${resp.status}`);
  }
  const json = await resp.json();
  return json.score || json.data?.score || 0;
};

// Recruiter Analytics APIs
export const getSkillsAnalytics = async (token) => {
  const { data } = await client.get('/recruiter/analytics/skills', { headers: authHeaders(token) });
  return data.data || data;
};

export const getJobsAnalytics = async (token) => {
  const { data } = await client.get('/recruiter/analytics/jobs', { headers: authHeaders(token) });
  return data.data || data;
};

// Recruiter AI Suggestions API
export const getAISuggestions = async (token) => {
  const { data } = await client.get('/recruiter/jobs/ai-suggestions', { headers: authHeaders(token) });
  return data.data || data;
};

