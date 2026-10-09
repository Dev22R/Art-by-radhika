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

// Reels Service Endpoints
export const reelsService = {
  getReels: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.sort) query.append('sort', params.sort);
    if (params.tag) query.append('tag', params.tag);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString();
    const url = `/reels${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },
  likeReel: async (reelId) => {
    const response = await api.post(`/reels/${reelId}/like`);
    return response.data;
  },
  shareReel: async (reelId, platform = 'whatsapp') => {
    const response = await api.post(`/reels/${reelId}/share`, { platform });
    return response.data;
  },
  getComments: async (reelId, params = { page: 1, limit: 20 }) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString();
    const url = `/reels/${reelId}/comments${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },
  addComment: async (reelId, text) => {
    const response = await api.post(`/reels/${reelId}/comments`, { text });
    return response.data;
  },
  deleteComment: async (reelId, commentId) => {
    const response = await api.delete(`/reels/${reelId}/comments/${commentId}`);
    return response.data;
  },
  bookReelDesign: async (reelId, bookingData) => {
    const response = await api.post(`/reels/${reelId}/book`, bookingData);
    return response.data;
  },
  trackView: async (reelId, watchDuration) => {
    const response = await api.post(`/reels/${reelId}/view`, { watchDuration });
    return response.data;
  },
};

export default api;
