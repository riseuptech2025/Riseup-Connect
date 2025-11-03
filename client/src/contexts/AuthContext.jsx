import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        // Set user immediately for better UX
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Verify token is still valid by calling getMe
        const response = await authAPI.getMe();
        if (response.data.success) {
          // Update user data with fresh data from server
          setUser(response.data.data);
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        // Don't logout immediately on network errors
        if (error.response?.status !== 401) {
          // If it's not an auth error, keep the user logged in
          console.log('Network error, keeping user logged in');
        } else {
          logout();
        }
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const response = await authAPI.login(email, password);
      
      if (response.data.success) {
        const { data } = response.data;
        const token = data.token;
        
        console.log('Login successful, storing token and user data');
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        
        return { success: true };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Login error details:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration:', userData);
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        const { data } = response.data;
        const token = data.token;
        
        console.log('Registration successful, storing token and user data');
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        
        return { success: true };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Registration error details:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (updatedData) => {
    try {
      const response = await usersAPI.updateProfile(updatedData);
      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};