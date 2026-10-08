import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://artbyradhika-app.vercel.app/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT token if present and handle FormData headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData, let the browser/axios automatically generate 'multipart/form-data; boundary=...'
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle unauthenticated or network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear entire local storage
      localStorage.clear();
    }
    return Promise.reject(error);
  }
);

// Auth Service Endpoints
export const authService = {
  signup: async (payload) => {
    const response = await api.post('/auth/signup', payload);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  completeProfile: async (formData) => {
    const response = await api.post('/auth/complete-profile', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },
  updateProfile: async (formData) => {
    const response = await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Address Service Endpoints
export const addressService = {
  getAddresses: async () => {
    const response = await api.get('/auth/addresses');
    return response.data;
  },
  createAddress: async (payload) => {
    const response = await api.post('/auth/addresses', payload);
    return response.data;
  },
  updateAddress: async (addressId, payload) => {
    const response = await api.put(`/auth/addresses/${addressId}`, {
      addressId,
      ...payload,
    });
    return response.data;
  },
  setDefaultAddress: async (addressId) => {
    const response = await api.patch(`/auth/addresses/${addressId}/default`);
    return response.data;
  },
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/auth/addresses/${addressId}`, {
      data: { addressId },
    });
    return response.data;
  },
};

export default api;
