import axios from 'axios';
import { upload } from '@vercel/blob/client';

// Dynamically determine API Base URL:
// 1. If VITE_API_URL environment variable is provided, use it (handles deployed backends)
// 2. Otherwise default to '/api' (handled by Vite proxy in development or reverse-proxy in production)
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Send and receive cookies
  timeout: 15000, // 15-second timeout for responsive failure feedback
});

// Request Interceptor: Attach token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('docukeep_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      return Promise.reject(
        new Error('The API returned a web page instead of JSON. Check that VITE_API_URL points to the deployed DocuKeep backend.')
      );
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register') &&
        window.location.pathname !== '/'
      ) {
        localStorage.removeItem('docukeep_token');
        localStorage.removeItem('docukeep_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Document Service
export const documentApi = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  uploadFile: (file) => {
    const token = localStorage.getItem('docukeep_token');
    const user = JSON.parse(localStorage.getItem('docukeep_user') || 'null');
    if (!token || !user?._id) {
      throw new Error('Your session expired. Please sign in again before uploading.');
    }

    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
    const pathname = `documents/${user._id}/${crypto.randomUUID()}-${safeFilename}`;
    return upload(pathname, file, {
      access: 'private',
      contentType: file.type,
      handleUploadUrl: `${api.defaults.baseURL}/documents/blob-upload`,
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  deleteUploadedFile: (pathname) =>
    api.delete('/documents/blob-upload', { data: { pathname } }),
  create: (data) => api.post('/documents', data),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
  getDownloadUrl: (id) => {
    const token = localStorage.getItem('docukeep_token');
    const base = `${api.defaults.baseURL}/documents/${id}/download`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },
  getPreviewUrl: (id) => {
    const token = localStorage.getItem('docukeep_token');
    const base = `${api.defaults.baseURL}/documents/${id}/preview`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },
};

// Dashboard Service
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentDocuments: () => api.get('/dashboard/recent-documents'),
  getExpiry: () => api.get('/dashboard/expiry'),
};

// Category Service
export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Profile Service
export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

export default api;
