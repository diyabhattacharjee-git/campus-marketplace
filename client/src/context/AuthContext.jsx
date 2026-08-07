import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

import { authService } from '@/services/authService';
import { setAuthToken, getAuthToken } from '@/lib/axios';
import { connectSocket, disconnectSocket } from '@/lib/socket';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Starts true: on first mount we don't yet know if a stored token is
  // still valid, so every consumer (ProtectedRoute especially) should treat
  // "unknown" as loading, not as "logged out" — otherwise a page refresh
  // would flash-redirect a logged-in user to /login before the /me call
  // resolves.
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((sessionUser, token) => {
    setAuthToken(token);
    setUser(sessionUser);
    connectSocket();
  }, []);

  const clearSession = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  // Lets ProfilePage merge in the fresh user object returned directly from
  // a successful update/avatar-upload response, so the Navbar avatar/name
  // reflect the change immediately instead of waiting on a refetch.
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  // On mount: if a token is already in storage (from a previous session),
  // verify it's still valid by fetching the current user rather than
  // trusting it blindly.
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then((res) => {
        setUser(res.data.user);
        connectSocket();
      })
      .catch(() => {
        // Token expired/invalid — the axios interceptor already cleared it.
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const res = await authService.login({ email, password });
      applySession(res.data.user, res.data.token);
      return res.data.user;
    },
    [applySession],
  );

  const signup = useCallback(async (payload) => {
    // Deliberately does NOT log the user in — the account exists but is
    // unverified until they click the emailed link (see VerifyEmailPage).
    const res = await authService.signup(payload);
    return res;
  }, []);

  const verifyEmail = useCallback(
    async (token) => {
      const res = await authService.verifyEmail(token);
      applySession(res.data.user, res.data.token);
      return res.data.user;
    },
    [applySession],
  );

  const resetPassword = useCallback(
    async (token, password) => {
      const res = await authService.resetPassword(token, password);
      applySession(res.data.user, res.data.token);
      return res.data.user;
    },
    [applySession],
  );

  const forgotPassword = useCallback((email) => authService.forgotPassword(email), []);

  const resendVerification = useCallback((email) => authService.resendVerification(email), []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the request fails (e.g. token already expired), still clear
      // the local session — logging out should never get "stuck".
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      signup,
      logout,
      verifyEmail,
      resetPassword,
      forgotPassword,
      resendVerification,
      updateUser,
    }),
    [
      user,
      isLoading,
      login,
      signup,
      logout,
      verifyEmail,
      resetPassword,
      forgotPassword,
      resendVerification,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

// Re-exported so pages can show a consistent error toast without importing
// react-hot-toast directly in six different files.
export function notifyAuthError(error) {
  toast.error(error?.message || 'Something went wrong — please try again');
}
