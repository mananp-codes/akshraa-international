/**
 * Auth Store (Zustand)
 * Global authentication state management
 */

import { create } from 'zustand';
import { loginUser, registerUser, getMe } from '../api/authApi';

const useAuthStore = create((set, get) => ({
  // ── State ─────────────────────────────────────────────────
  user: JSON.parse(localStorage.getItem('akshraa_user')) || null,
  token: localStorage.getItem('akshraa_token') || null,
  loading: false,
  error: null,

  // ── Computed ───────────────────────────────────────────────
  // Note: these are getter functions, not reactive values.
  // For reactive checks in components, select `token` or `user` directly:
  //   const isLoggedIn = useAuthStore(s => !!s.token);
  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'admin',
  isSeller: () => get().user?.role === 'seller',
  isBuyer: () => get().user?.role === 'buyer',

  // ── Actions ────────────────────────────────────────────────
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await loginUser(credentials);
      // Persist to localStorage for page refreshes
      localStorage.setItem('akshraa_token', data.token);
      localStorage.setItem('akshraa_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await registerUser(userData);
      localStorage.setItem('akshraa_token', data.token);
      localStorage.setItem('akshraa_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('akshraa_token');
    localStorage.removeItem('akshraa_user');
    set({ user: null, token: null, error: null });
  },

  refreshUser: async () => {
    try {
      const { data } = await getMe();
      localStorage.setItem('akshraa_user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch {
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
