import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;


// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  sendOtp: (email) => api.post('/auth/send-otp', { email }),
  verifyOtp: (userData) => api.post('/auth/verify-otp', userData),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  getMe: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  getUserPosts: (userId) => api.get(`/users/${userId}/posts`),
  // Add this if you want to get user's network stats separately
  getNetworkStats: () => api.get('/users/network/stats')
};

// Posts API - SIMPLIFIED VERSION
export const postsAPI = {
  createPost: (postData) => {
    console.log('📦 Creating post with data:', postData);
    return api.post('/posts', postData);
  },
  
  getPosts: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  getFollowingPosts: (page = 1, limit = 10) => api.get(`/posts/following?page=${page}&limit=${limit}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  addComment: (postId, content) => api.post(`/posts/${postId}/comment`, { content }),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

// Connections API
export const connectionsAPI = {
  getConnections: () => api.get('/connections'),
  getSuggestions: () => api.get('/connections/suggestions'),
  getPendingRequests: () => api.get('/connections/pending'), // Add this
  sendRequest: (userId) => api.post(`/connections/request/${userId}`),
  acceptRequest: (connectionId) => api.put(`/connections/accept/${connectionId}`),
};

// In your existing services/api.js - add these if not present
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId, page = 1) => 
    api.get(`/messages/conversations/${conversationId}/messages?page=${page}`),
  sendMessage: (conversationId, content) => 
    api.post(`/messages/conversations/${conversationId}/messages`, { content }),
  createConversation: (participantId) => 
    api.post('/messages/conversations', { participantId }),
  deleteConversation: (conversationId) => 
    api.delete(`/messages/conversations/${conversationId}`),
  markAsRead: (conversationId) => 
    api.put(`/messages/conversations/${conversationId}/read`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (page = 1, limit = 20) => api.get(`/notifications?page=${page}&limit=${limit}`),
  getNotificationCount: () => api.get('/notifications/count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

// Questions API
export const questionsAPI = {
  getQuestions: (page = 1, limit = 10, filter = 'all') => 
    api.get(`/questions?page=${page}&limit=${limit}&filter=${filter}`),
  
  getQuestion: (questionId) => 
    api.get(`/questions/${questionId}`),
  
  createQuestion: (questionData) => 
    api.post('/questions', questionData),
  
  updateQuestion: (questionId, questionData) => 
    api.put(`/questions/${questionId}`, questionData),
  
  deleteQuestion: (questionId) => 
    api.delete(`/questions/${questionId}`),
  
  likeQuestion: (questionId) => 
    api.post(`/questions/${questionId}/like`),
  
  bookmarkQuestion: (questionId) => 
    api.post(`/questions/${questionId}/bookmark`),
  
  addAnswer: (questionId, answerData) => 
    api.post(`/questions/${questionId}/answers`, answerData),
  
  likeAnswer: (questionId, answerId) => 
    api.post(`/questions/${questionId}/answers/${answerId}/like`),
  
  acceptAnswer: (questionId, answerId) => 
    api.put(`/questions/${questionId}/answers/${answerId}/accept`),
  
  searchQuestions: (query, tag, page = 1, limit = 10) => 
    api.get(`/questions/search?q=${query}&tag=${tag}&page=${page}&limit=${limit}`)
};

// Moments API
export const momentsAPI = {
  createMoment: (momentData) => api.post('/moments', momentData),
  getMomentsFeed: (page = 1, limit = 10) => 
    api.get(`/moments/feed?page=${page}&limit=${limit}`),
  getMyMoments: (page = 1, limit = 20) => 
    api.get(`/moments/my?page=${page}&limit=${limit}`),
  likeMoment: (momentId) => api.post(`/moments/${momentId}/like`),
  addComment: (momentId, text) => 
    api.post(`/moments/${momentId}/comments`, { text }),
  deleteMoment: (momentId) => api.delete(`/moments/${momentId}`),
  getMomentStats: () => api.get('/moments/stats')
};

// services/api.js - Add these to your API exports
export const uploadAPI = {
  uploadProfileImage: (formData) => api.post('/upload/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadCoverImage: (formData) => api.post('/upload/cover-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  removeProfileImage: () => api.delete('/upload/profile-image'),
  removeCoverImage: () => api.delete('/upload/cover-image')
};

// Feedback API
export const feedbackAPI = {
  submitFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  getFeedbackHistory: (page = 1, limit = 10) => 
    api.get(`/feedback/history?page=${page}&limit=${limit}`),
  getFeedbackStats: () => api.get('/feedback/stats'),
  getFeedback: (feedbackId) => api.get(`/feedback/${feedbackId}`),
  updateFeedback: (feedbackId, updateData) => 
    api.put(`/feedback/${feedbackId}`, updateData),
  deleteFeedback: (feedbackId) => api.delete(`/feedback/${feedbackId}`)
};


export default api;