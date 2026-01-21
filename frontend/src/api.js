import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error(
    '[TeachPivot] VITE_API_URL is not set. API calls will fail. ' +
    'Set this environment variable in Vercel dashboard or .env.local'
  );
}

const api = axios.create({
  baseURL: API_BASE_URL || '/api', // Fallback for local dev with proxy
  timeout: 10000
});

/* =========================
   Role Management
   ========================= */

let currentRole = null;

/**
 * Set the current user role for API calls.
 * This role is sent via x-user-role header for backend authorization.
 * @param {string} role - 'teacher' or 'crp'
 */
export const setUserRole = (role) => {
  currentRole = role;
};

/**
 * Get the current user role.
 * @returns {string|null} Current role
 */
export const getUserRole = () => currentRole;

// Request interceptor to inject role header
api.interceptors.request.use((config) => {
  if (currentRole) {
    config.headers['x-user-role'] = currentRole;
  }
  return config;
});

// Response interceptor to catch common Vercel deployment issues
api.interceptors.response.use(
  (response) => {
    // Detect HTML response (SPA fallback returning index.html instead of API data)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE')) {
      console.error(
        `[API] ${response.config.url} returned HTML instead of JSON. ` +
        'This indicates VITE_API_URL is misconfigured for production.'
      );
      // Convert to a rejected promise so error handlers catch it
      return Promise.reject(new Error('API returned HTML - check VITE_API_URL configuration'));
    }
    return response;
  },
  (error) => {
    // Log helpful debugging info in development
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);

/* =========================
   Curriculum
   ========================= */

export const getCurriculumSubjects = () => api.get('/curriculum/subjects');
export const getTopics = (subject, grade) => api.get(`/curriculum/${subject}/${grade}/topics`);

/* =========================
   Prep Cards
   ========================= */

export const getSituations = (subject, grade, topicId) =>
  api.get(`/prep-cards/${subject}/${grade}/${topicId}/situations`);

export const getPrepCard = (subject, grade, topicId, situation) =>
  api.get(`/prep-cards/${subject}/${grade}/${topicId}/${situation}`);

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

/**
 * Create a new revision for a PrepCard (CRP only)
 * @param {object} data - { basePrepCardId, revisedGuidance, crpNotes, triggeringReasons }
 */
export const createRevision = (data) =>
  api.post('/crp/revisions', data);

/**
 * Get all revisions for a PrepCard (CRP only)
 * @param {string} basePrepCardId - The base PrepCard ID
 */
export const getRevisions = (basePrepCardId) =>
  api.get(`/crp/revisions/${basePrepCardId}`);

/**
 * Get single revision details (CRP only)
 * @param {string} revisionId - The revision ID
 */
export const getRevisionDetail = (revisionId) =>
  api.get(`/crp/revisions/detail/${revisionId}`);

/**
 * Activate a revision (makes it visible to teachers) (CRP only)
 * @param {string} revisionId - The revision ID to activate
 */
export const activateRevision = (revisionId) =>
  api.patch(`/crp/revisions/${revisionId}/activate`);

/**
 * Update a draft revision (CRP only)
 * @param {string} revisionId - The revision ID to update
 * @param {object} data - { revisedGuidance, crpNotes }
 */
export const updateRevision = (revisionId, data) =>
  api.put(`/crp/revisions/${revisionId}`, data);

/**
 * Delete a draft revision (CRP only)
 * @param {string} revisionId - The revision ID to delete
 */
export const deleteRevision = (revisionId) =>
  api.delete(`/crp/revisions/${revisionId}`);

/* =========================
   Teacher Feedback
   ========================= */

export const submitFeedback = (data) =>
  api.post('/feedback', data);

export default api;
