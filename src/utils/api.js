// src/utils/api.js
import { store } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { BASE_URL } from '@/api/configs';

// Base API URL
const API_URL = BASE_URL;

// Create authenticated API requests
export const api = {
  get: async (endpoint) => {
    const state = store.getState();
    const { token } = state.auth;
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        store.dispatch(logout());
        throw new Error('Session expired. Please login again.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  post: async (endpoint, data) => {
    const state = store.getState();
    const { token } = state.auth;
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify(data)
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        store.dispatch(logout());
        throw new Error('Session expired. Please login again.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  // Add other methods (PUT, DELETE) as needed
};
