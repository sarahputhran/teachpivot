import axios from 'axios';

/* =========================
   Base URL (STRICT)
   ========================= */

if (!import.meta.env.VITE_API_URL) {
  throw new Error(
    '[TeachPivot] VITE_API_URL is not defined. ' +
    'Set it in .env (local) and Vercel Environment Variables (production).'
  );
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

/* =========================
   Axios Instance
   ========================= */

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // allow Render cold start
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =========================
   Helpers
   ========================= */

// Normalize ONLY slug-like params (not Mongo IDs)
const normalize = (value) =>
  typeof value === 'string'
    ? value.toLowerCase().trim().replace(/\s+/g, '-')
    : value;

/* =========================
   Role Management
   ========================= */

let currentRole = null;

export const setUserRole = (role) => {
  currentRole = role;
};

export const getUserRole = () => currentRole;

/* =========================
   Request Interceptor
   ========================= */

api.interceptors.request.use((config) => {
  if (currentRole) {
    config.headers['x-user-role'] = currentRole;
  }
  return config;
});

/* =========================
   Response Interceptor
   ========================= */

api.interceptors.response.use(
  (response) => {
    // Detect SPA HTML fallback
    if (
      typeof response.data === 'string' &&
      response.data.includes('<!DOCTYPE')
    ) {
      throw new Error(
        '[TeachPivot API] HTML returned instead of JSON. ' +
        'Likely wrong API path or missing /api.'
      );
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // 🔁 Retry once on Render cold start timeout
    if (error.code === 'ECONNABORTED' && !config.__isRetry) {
      config.__isRetry = true;
      return api(config);
    }

    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url: config?.url,
        status: error.response?.status,
        message: error.message,
      });
    }

    return Promise.reject(error);
  }
);

/* =========================
   Curriculum
   ========================= */

export const getCurriculumSubjects = () =>
  api.get('/curriculum/subjects');

export const getTopics = (subject, grade) =>
  api.get(
    `/curriculum/${normalize(subject)}/${normalize(grade)}/topics`
  );

/* =========================
   Prep Cards
   ========================= */

export const getSituations = (subject, grade, topicId) =>
  api.get(
    `/prep-cards/${normalize(subject)}/${normalize(grade)}/${topicId}/situations`
  );

export const getPrepCard = (subject, grade, topicId, situation) =>
  api.get(
    `/prep-cards/${normalize(subject)}/${normalize(grade)}/${topicId}/${normalize(situation)}`
  );

/* =========================
   Reflections
   ========================= */

export const submitReflection = (data) =>
  api.post('/reflections', data);

/* =========================
   CRP Dashboard & Reviews
   ========================= */

export const getCRPDashboard = (params) =>
  api.get('/crp/dashboard', { params });

export const getCRPHeatmap = (params) =>
  api.get('/crp/heatmap', { params });

export const submitCRPReview = (data) =>
  api.post('/crp/reviews', data);

/* =========================
   CRP Revisions
   ========================= */

export const createRevision = (data) =>
  api.post('/crp/revisions', data);

export const getRevisions = (basePrepCardId) =>
  api.get(`/crp/revisions/${basePrepCardId}`);

export const getRevisionDetail = (revisionId) =>
  api.get(`/crp/revisions/detail/${revisionId}`);

export const activateRevision = (revisionId) =>
  api.patch(`/crp/revisions/${revisionId}/activate`);

export const updateRevision = (revisionId, data) =>
  api.put(`/crp/revisions/${revisionId}`, data);

export const deleteRevision = (revisionId) =>
  api.delete(`/crp/revisions/${revisionId}`);

/* =========================
   Teacher Feedback
   ========================= */

export const submitFeedback = (data) =>
  api.post('/feedback', data);

export default api;
