import axios from 'axios';

// Use Vite env or default to backend v1 base URL
const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/user/login', {
      email,
      password,
      confirmPassword: password,
      role: 'Patient',
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/user/patient/register', {
      ...userData,
      role: 'Patient',
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/user/patient/me');
    return response.data.user;
  },

  logout: async () => {
    await api.get('/user/patient/logout');
  },
};

export const appointmentService = {
  create: async (appointmentData) => {
    const response = await api.post('/appointment/post', appointmentData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/appointment/getall');
    return response.data;
  },

  getMine: async () => {
    const response = await api.get('/appointment/me');
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/appointment/update/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/appointment/delete/${id}`);
    return response.data;
  },
  cancel: async (id) => {
    const response = await api.put(`/appointment/cancel/${id}`);
    return response.data;
  },
  stats: async () => {
    const response = await api.get('/appointment/stats/me');
    return response.data;
  },
};

export const doctorService = {
  getAll: async () => {
    const response = await api.get('/user/doctors');
    return response.data;
  },
};

export const messageService = {
  send: async (messageData) => {
    const response = await api.post('/message/send', messageData);
    return response.data;
  },
};

export default api;