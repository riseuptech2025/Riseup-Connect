import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
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

// Posts API
export const postsAPI = {
  createPost: (postData) => api.post('/posts', postData),
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

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId, page = 1) => api.get(`/messages/conversations/${conversationId}/messages?page=${page}`),
  sendMessage: (conversationId, content) => api.post(`/messages/conversations/${conversationId}/messages`, { content }),
  createConversation: (participantId) => api.post('/messages/conversations', { participantId }),
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

// stories API
export const storiesAPI = {
  getStories: (page = 1, limit = 20) => 
    api.get(`/stories?page=${page}&limit=${limit}`),
  
  getFollowingStories: (page = 1, limit = 20) => 
    api.get(`/stories/following?page=${page}&limit=${limit}`),
  
  getUserStories: (userId = null) => 
    api.get(userId ? `/stories/user/${userId}` : '/stories/user'),
  
  getStory: (storyId) => 
    api.get(`/stories/${storyId}`),
  
  createStory: (storyData) => 
    api.post('/stories', storyData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateStory: (storyId, storyData) => 
    api.put(`/stories/${storyId}`, storyData),
  
  deleteStory: (storyId) => 
    api.delete(`/stories/${storyId}`),
  
  likeStory: (storyId) => 
    api.post(`/stories/${storyId}/like`),
  
  addComment: (storyId, content) => 
    api.post(`/stories/${storyId}/comments`, { content }),
  
  deleteComment: (storyId, commentId) => 
    api.delete(`/stories/${storyId}/comments/${commentId}`),
  
  getCategories: () => 
    api.get('/stories/categories/all')
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


export default api;