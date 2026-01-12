import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

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
