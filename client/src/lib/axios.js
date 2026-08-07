import axios from 'axios';

const TOKEN_STORAGE_KEY = 'campus_marketplace_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT (if present) to every outgoing request.
// Token storage/retrieval is centralized here so Step 4 (Auth) only has to
// call setAuthToken() once on login/logout — no other file touches storage.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error shape and handle expired/invalid sessions in one place.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    if (status === 401) {
      // Session expired or invalid — clear it. AuthContext (Step 4) listens
      // for this by re-checking auth state on next mount/route change.
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    return Promise.reject({ status, message, original: error });
  },
);

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}
