import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://artbyradhika-app.vercel.app/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
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
  getCaptcha: async () => {
    const response = await api.get('/auth/captcha');
    return response.data;
  },
  forgotPassword: async (payload) => {
    const response = await api.post('/auth/forgot-password', payload);
    return response.data;
  },
  verifyForgotPasswordOtp: async (payload) => {
    const response = await api.post('/auth/forgot-password/verify-otp', payload);
    return response.data;
  },
  resetPassword: async (payload) => {
    const response = await api.post('/auth/reset-password', payload);
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

// Category Service Endpoints
export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getSubcategories: async (categorySlug) => {
    const response = await api.get(`/categories/${categorySlug}/subcategories`);
    return response.data;
  },
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },
};

// Design Service Endpoints
export const designService = {
  getDesigns: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.subcategory && params.subcategory !== 'all') query.append('subcategory', params.subcategory);
    if (params.search) query.append('search', params.search);
    if (params.complexity && params.complexity !== 'all') query.append('complexity', params.complexity);
    if (params.density && params.density !== 'all') query.append('density', params.density);
    if (params.style && params.style !== 'all') query.append('style', params.style);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString();
    const url = `/designs${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },
  getDesignBySlug: async (slugOrId) => {
    const response = await api.get(`/designs/${slugOrId}`);
    return response.data;
  },
  likeDesign: async (designId) => {
    const response = await api.post(`/designs/${designId}/like`);
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

// FAQ Service Endpoints
export const faqService = {
  getFaqs: async () => {
    const response = await api.get('/faqs');
    return response.data;
  },
  voteFaq: async (faqId, isHelpful = true) => {
    const response = await api.post(`/faqs/${faqId}/vote`, { isHelpful });
    return response.data;
  },
};

// Testimonial Service Endpoints
export const testimonialService = {
  getTestimonials: async (params = { page: 1, limit: 10, sort: 'latest' }) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sort) query.append('sort', params.sort);
    const queryString = query.toString();
    const url = `/testimonials${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },
};

// Estimator Service Endpoints
export const estimatorService = {
  getConfig: async () => {
    try {
      const response = await api.get('/v1/estimator/config');
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const response = await api.get('/estimator/config');
        return response.data;
      }
      throw err;
    }
  },
  calculate: async (payload) => {
    try {
      const response = await api.post('/v1/estimator/calculate', payload);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const response = await api.post('/estimator/calculate', payload);
        return response.data;
      }
      throw err;
    }
  },
  submitEnquiry: async (payload) => {
    try {
      const response = await api.post('/v1/estimator/enquiry', payload);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const response = await api.post('/estimator/enquiry', payload);
        return response.data;
      }
      throw err;
    }
  },
};

export default api;
