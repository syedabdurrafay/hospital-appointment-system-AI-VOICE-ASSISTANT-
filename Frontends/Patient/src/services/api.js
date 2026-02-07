import axios from 'axios';

// Use Vite env or default to backend v1 base URL
const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
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
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/user/login', {
      email,
      password,
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
    // Normalize appointment data for backend
    const normalizedData = {
      patient: {
        firstName: appointmentData.patient?.firstName || appointmentData.firstName,
        lastName: appointmentData.patient?.lastName || appointmentData.lastName,
        email: appointmentData.patient?.email || appointmentData.email,
        phone: appointmentData.patient?.phone || appointmentData.phone,
        dob: appointmentData.patient?.dob || appointmentData.dob,
        gender: appointmentData.patient?.gender || appointmentData.gender,
      },
      appointment: {
        date: appointmentData.appointment?.date || appointmentData.date,
        time: appointmentData.appointment?.time || appointmentData.time,
        department: appointmentData.appointment?.department || appointmentData.department,
        symptoms: appointmentData.appointment?.symptoms || appointmentData.symptoms,
        emergencyContact: appointmentData.appointment?.emergencyContact || appointmentData.emergencyContact,
        hasVisited: appointmentData.appointment?.hasVisited || appointmentData.hasVisited || false,
      },
      doctorId: appointmentData.doctorId || appointmentData.appointment?.doctorId
    };

    console.log('Sending appointment data:', normalizedData);
    const response = await api.post('/appointment/post', normalizedData);
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

  // Get available slots endpoint
  getAvailableSlots: async (doctorId, date) => {
    try {
      const response = await api.get(`/appointment/slots/${doctorId}?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching slots:', error);
      throw error;
    }
  },
};

export const doctorService = {
  getAll: async () => {
    try {
      // Try multiple endpoints
      const endpoints = ['/user/alldoctors', '/user/doctors'];

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);

          if (response.data && response.data.doctors && Array.isArray(response.data.doctors)) {
            return { success: true, doctors: response.data.doctors };
          } else if (response.data && Array.isArray(response.data)) {
            return { success: true, doctors: response.data };
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
        }
      }

      // Fallback to mock data if all endpoints fail
      console.warn('All doctor endpoints failed, using mock data');
      return {
        success: false,
        doctors: getMockDoctors(),
        message: 'Using mock data - API endpoints failed'
      };
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return {
        success: false,
        doctors: getMockDoctors(),
        message: error.message || 'Failed to fetch doctors'
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/user/doctors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      // Return mock doctor
      const mockDoctors = getMockDoctors();
      return mockDoctors.find(d => d._id === id) || mockDoctors[0];
    }
  },
};

// Mock doctors data
const getMockDoctors = () => {
  return [
    {
      _id: '1',
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      specialization: 'General Physician',
      experience: '15',
      qualification: 'MD, MBBS',
      description: 'Specialized in general medicine with 15 years of experience.',
      rating: '4.8',
      availability: 'Mon-Fri, 9AM-5PM',
      workingHours: { start: '09:00', end: '17:00' },
      consultationDuration: 30,
      doctDptmnt: 'General Physician'
    },
    {
      _id: '2',
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      specialization: 'General Physician',
      experience: '12',
      qualification: 'MD, MBBS',
      description: 'Expert in comprehensive healthcare and preventive medicine.',
      rating: '4.9',
      availability: 'Mon-Sat, 10AM-6PM',
      workingHours: { start: '10:00', end: '18:00' },
      consultationDuration: 30,
      doctDptmnt: 'General Physician'
    }
  ];
};

export const messageService = {
  send: async (messageData) => {
    const response = await api.post('/message/send', messageData);
    return response.data;
  },
};

export default api;