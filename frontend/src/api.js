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

// Curriculum
export const getCurriculumSubjects = () => api.get('/curriculum/subjects');
export const getTopics = (subject, grade) => api.get(`/curriculum/${subject}/${grade}/topics`);

// Prep Cards
export const getSituations = (subject, grade, topicId) =>
  api.get(`/prep-cards/${subject}/${grade}/${topicId}/situations`);

export const getPrepCard = (subject, grade, topicId, situation) =>
  api.get(`/prep-cards/${subject}/${grade}/${topicId}/${situation}`);

// Reflections
export const submitReflection = (data) =>
  api.post('/reflections', data);

// CRP
export const getCRPDashboard = (params) =>
  api.get('/crp/dashboard', { params });

export const getCRPHeatmap = (params) =>
  api.get('/crp/heatmap', { params });

export default api;
