import axios from 'axios';

// Determine the API base URL
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  }
  return import.meta.env.VITE_API_URL || '/api/v1';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('doctorToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Test API connection
export const testAPIConnection = async () => {
  try {
    const response = await API.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API connection test failed:', error);
    return {
      success: false,
      message: error.message || 'Failed to connect to API'
    };
  }
};

// Appointment API service - FIXED WITH CORRECT ENDPOINT
export const appointmentService = {
  getAll: async () => {
    try {
      console.log('Fetching all appointments...');
      const response = await API.get('/appointment/getall');
      console.log('Appointments fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);

      console.error('Error fetching appointments:', error);
      throw error;

      throw error;
    }
  },

  updateStatus: async (id, data) => {
    const response = await API.put(`/appointment/update/${id}`, data);
    return response.data;
  },

  confirm: async (id) => {
    const response = await API.put(`/appointment/confirm/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await API.delete(`/appointment/delete/${id}`);
    return response.data;
  },

  getStats: async () => {
    try {
      const response = await API.get('/appointment/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { success: false, stats: {} };
    }
  }
};

// Mock appointments for development
const getMockAppointments = () => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return {
    success: true,
    appointments: [
      {
        _id: '1',
        id: '1',
        patient: {
          firstName: 'John',
          lastName: 'Smith',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '9876543210'
        },
        appointment: {
          date: today,
          time: '10:30 AM',
          department: 'General Physician',
          symptoms: 'Fever and cold'
        },
        doctor: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          specialization: 'General Physician',
          fullName: 'Dr. Sarah Johnson'
        },
        doctorId: '101',
        patientId: '201',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        patient_name: 'John Smith',
        patient_phone: '9876543210',
        patient_email: 'john@example.com',
        doctorName: 'Dr. Sarah Johnson',
        department: 'General Physician',
        date: today,
        time: '10:30 AM',
        appointment_date: today,
        appointment_time: '10:30 AM',
        duration: '30 min'
      },
      {
        _id: '2',
        id: '2',
        patient: {
          firstName: 'Maria',
          lastName: 'Garcia',
          name: 'Maria Garcia',
          email: 'maria@example.com',
          phone: '9876543211'
        },
        appointment: {
          date: today,
          time: '02:15 PM',
          department: 'Cardiology',
          symptoms: 'Chest pain'
        },
        doctor: {
          firstName: 'Michael',
          lastName: 'Brown',
          specialization: 'Cardiologist',
          fullName: 'Dr. Michael Brown'
        },
        doctorId: '102',
        patientId: '202',
        status: 'Accepted',
        createdAt: new Date().toISOString(),
        patient_name: 'Maria Garcia',
        patient_phone: '9876543211',
        patient_email: 'maria@example.com',
        doctorName: 'Dr. Michael Brown',
        department: 'Cardiology',
        date: today,
        time: '02:15 PM',
        appointment_date: today,
        appointment_time: '02:15 PM',
        duration: '30 min'
      },
      {
        _id: '3',
        id: '3',
        patient: {
          firstName: 'Robert',
          lastName: 'Wilson',
          name: 'Robert Wilson',
          email: 'robert@example.com',
          phone: '9876543212'
        },
        appointment: {
          date: tomorrow,
          time: '11:00 AM',
          department: 'General Physician',
          symptoms: 'Regular checkup'
        },
        doctor: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          specialization: 'General Physician',
          fullName: 'Dr. Sarah Johnson'
        },
        doctorId: '101',
        patientId: '203',
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        patient_name: 'Robert Wilson',
        patient_phone: '9876543212',
        patient_email: 'robert@example.com',
        doctorName: 'Dr. Sarah Johnson',
        department: 'General Physician',
        date: tomorrow,
        time: '11:00 AM',
        appointment_date: tomorrow,
        appointment_time: '11:00 AM',
        duration: '30 min'
      }
    ],
    count: 3,
    message: 'Found 3 appointments'
  };
};

// User/Doctor service
export const userService = {
  getDoctors: async () => {
    try {
      const response = await API.get('/user/alldoctors');

      if (response.data && response.data.doctors) {
        return { success: true, doctors: response.data.doctors };
      } else if (response.data && Array.isArray(response.data)) {
        return { success: true, doctors: response.data };
      } else if (response.data && response.data.success) {
        return response.data;
      } else {
        return { success: false, doctors: [], message: 'No doctors found' };
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return {
        success: false,
        doctors: [],
        message: error.response?.data?.message || 'Failed to fetch doctors'
      };
    }
  },

  addDoctor: async (doctorData) => {
    try {
      const response = await API.post('/user/doctor/addnew', doctorData);
      return response.data;
    } catch (error) {
      console.error('Error adding doctor:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    const response = await API.get('/user/admin/me');
    return response.data;
  },

  login: async (email, password) => {
    const response = await API.post('/user/login', {
      email,
      password,
      role: 'Doctor'
    });
    return response.data;
  },

  logout: async () => {
    const response = await API.get('/user/admin/logout');
    return response.data;
  },

  registerAdmin: async (data) => {
    const response = await API.post('/user/admin/addnew', data);
    return response.data;
  },

  checkAdminStatus: async () => {
    try {
      const response = await API.get('/user/admin/check');
      return response.data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { success: false, adminExists: false };
    }
  }
};

export default API;