import axios from 'axios';

// Determine the API base URL
const getBaseURL = () => {
  // If running in development with Vite dev server
  if (import.meta.env.DEV) {
    // Ensure this matches your backend URL
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  }
  // In production, use relative path if same origin, otherwise use env
  return import.meta.env.VITE_API_URL || '/api/v1';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use((config) => {
  // For admin, use adminToken first, then fallback to token
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear all auth data to prevent infinite loops
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Appointment API service
export const appointmentService = {
  // Get all appointments (for admin)
  getAll: async () => {
    const response = await API.get('/appointment/getall');
    return response.data;
  },

  // Update appointment status
  updateStatus: async (id, data) => {
    const response = await API.put(`/appointment/update/${id}`, data);
    return response.data;
  },

  // Confirm appointment
  confirm: async (id) => {
    const response = await API.put(`/appointment/confirm/${id}`);
    return response.data;
  },

  // Delete appointment
  delete: async (id) => {
    const response = await API.delete(`/appointment/delete/${id}`);
    return response.data;
  },

  // Get appointment stats
  getStats: async () => {
    const response = await API.get('/appointment/stats');
    return response.data;
  }
};

// User/Doctor service
export const userService = {
  // Get all doctors
  getDoctors: async () => {
    const response = await API.get('/user/doctors');
    return response.data;
  },

  // Get current user (admin)
  getCurrentUser: async () => {
    const response = await API.get('/user/admin/me');
    return response.data;
  },

  // Login admin
  login: async (email, password) => {
    const response = await API.post('/user/admin/login', { email, password });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await API.get('/user/admin/logout');
    return response.data;
  }
};

export default API;