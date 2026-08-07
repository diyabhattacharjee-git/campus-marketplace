import { api } from '@/lib/axios';

/**
 * Every function here returns the full { success, message, data } envelope
 * the backend sends (see server ApiResponse), not just `data` — several
 * callers need the `message` (e.g. "check your email for a reset link")
 * even when there's no `data` to show.
 */
export const authService = {
  signup: (payload) => api.post('/auth/signup', payload).then((res) => res.data),

  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),

  logout: () => api.post('/auth/logout').then((res) => res.data),

  getMe: () => api.get('/auth/me').then((res) => res.data),

  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`).then((res) => res.data),

  resendVerification: (email) => api.post('/auth/resend-verification', { email }).then((res) => res.data),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((res) => res.data),

  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }).then((res) => res.data),
};
