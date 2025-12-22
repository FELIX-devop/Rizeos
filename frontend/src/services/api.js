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

export const verifyJobSeekerPremium = async (token, txHash) => {
  const { data } = await client.post('/payments/verify-jobseeker-premium', { tx_hash: txHash }, { headers: authHeaders(token) });
  return data.data;
};

export const getPremiumStatus = async (token) => {
  const { data } = await client.get('/jobseeker/premium-status', { headers: authHeaders(token) });
  return data.data || data;
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
  try {
    const { data } = await client.get('/jobs', { params, headers: token ? authHeaders(token) : {} });
    const result = data.data;
    return Array.isArray(result) ? result : (Array.isArray(result?.jobs) ? result.jobs : []);
  } catch (err) {
    console.error('Failed to load jobs', err);
    return [];
  }
};

export const adminDashboard = async (token) => {
  try {
    const { data } = await client.get('/admin/dashboard', { headers: authHeaders(token) });
    const result = data.data || {};
    return {
      payments: Array.isArray(result.payments) ? result.payments : [],
      total_payments_matic: result.total_payments_matic || 0,
      users: result.users || 0,
      jobs: result.jobs || 0,
      user_list: Array.isArray(result.user_list) ? result.user_list : [],
      job_list: Array.isArray(result.job_list) ? result.job_list : [],
    };
  } catch (err) {
    console.error('Failed to load admin dashboard', err);
    return { payments: [], total_payments_matic: 0, users: 0, jobs: 0, user_list: [], job_list: [] };
  }
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
  try {
    const { data } = await client.get('/users', { params, headers: authHeaders(token) });
    const result = data.data;
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Failed to load users', err);
    return [];
  }
};

export const applyJob = async (token, jobId) => {
  const { data } = await client.post(`/jobs/${jobId}/apply`, {}, { headers: authHeaders(token) });
  return data.data;
};

export const applyToJob = async (token, jobId) => {
  const { data } = await client.post('/job-applications/apply', { jobId }, { headers: authHeaders(token) });
  return data.data || data;
};

export const getJobApplicants = async (token, jobId) => {
  const { data } = await client.get(`/recruiter/jobs/${jobId}/applicants`, { headers: authHeaders(token) });
  return data.data || data;
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
  try {
    const { data } = await client.get('/admin/messages/inbox', { headers: authHeaders(token) });
    const result = data.data;
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Failed to load admin inbox', err);
    return [];
  }
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
  try {
    const { data } = await client.get('/messages/recruiter/inbox', { headers: authHeaders(token) });
    const result = data.data;
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Failed to load recruiter inbox', err);
    return [];
  }
};

export const getRecruiterUnreadCount = async (token) => {
  const { data } = await client.get('/messages/recruiter/unread-count', { headers: authHeaders(token) });
  return data.data;
};

// Job seeker inbox APIs
export const getSeekerInbox = async (token) => {
  try {
    const { data } = await client.get('/messages/seeker/inbox', { headers: authHeaders(token) });
    const result = data.data || data;
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Failed to load seeker inbox', err);
    return [];
  }
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
  
  // First verify the service is accessible
  try {
    const healthCheck = await fetch(`${aiBase}/`, { method: 'GET', mode: 'cors' });
    if (!healthCheck.ok && healthCheck.status === 404) {
      const errorText = await healthCheck.text();
      if (errorText.includes('Application not found')) {
        throw new Error(`AI service not found at ${aiBase}. Please check Railway dashboard for the correct URL.`);
      }
    }
  } catch (err) {
    if (err.message.includes('AI service not found')) {
      throw err;
    }
    // Network error - continue to try the actual request
    console.warn('Health check failed, but continuing:', err);
  }
  
  const resp = await fetch(`${aiBase}/skills/extract`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ resume_base64: base64Content }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    let errorMsg = text || `AI service error ${resp.status}`;
    
    // Provide helpful error messages
    if (resp.status === 404) {
      if (text.includes('Application not found')) {
        errorMsg = `AI service URL is incorrect or service is not deployed. Current URL: ${aiBase}. Please check Railway dashboard.`;
      } else {
        errorMsg = `AI service endpoint not found. Check if service is running at ${aiBase}`;
      }
    } else if (resp.status === 0 || text.includes('Failed to fetch')) {
      errorMsg = `Cannot connect to AI service at ${aiBase}. Check if the service is running and CORS is configured.`;
    }
    
    throw new Error(errorMsg);
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

