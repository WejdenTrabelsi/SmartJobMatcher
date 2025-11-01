// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Jobs APIs
export const jobsAPI = {
  getAllJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/my-jobs'),
};

// Applications APIs
export const applicationsAPI = {
  applyToJob: (jobId, data) => api.post(`/applications/${jobId}`, data),
  getMyApplications: () => api.get('/applications/my-applications'),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  updateApplicationStatus: (id, status) => 
    api.patch(`/applications/${id}/status`, { status }),
};

// Recommendations APIs
export const recommendationsAPI = {
  getRecommendations: () => api.get('/recommendations'),
  generateRecommendations: () => api.post('/recommendations/generate'),
  markAsViewed: (id) => api.patch(`/recommendations/${id}/viewed`),
};

// Skills APIs
export const skillsAPI = {
  getAllSkills: () => api.get('/skills'),
  searchSkills: (query) => api.get(`/skills/search?q=${query}`),
  createSkill: (data) => api.post('/skills', data),
};
export const profileAPI = {
  updateProfile: (data) => api.put('/profile', data),
  getProfile: () => api.get('/profile'),
};

export default api;