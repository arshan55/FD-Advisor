import axios from 'axios';
import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Supabase JWT token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      // Could not get session, proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors — do NOT do a hard redirect; let AuthContext handle auth state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just reject cleanly; screens handle the error via try/catch
    return Promise.reject(error);
  }
);

export default api;
