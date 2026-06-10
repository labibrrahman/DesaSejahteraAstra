import { create } from 'zustand';
import authService from '../services/authService';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  accessToken: localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,
  role: localStorage.getItem('userRole') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,

  // Actions

  /**
   * Login admin / juri via email + password
   */
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const tokens = await authService.login(credentials);
      const { access_token, refresh_token } = tokens;

      // Simpan token ke localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Ambil profile user setelah login
      const user = await authService.getProfile();
      localStorage.setItem('userRole', user.role);

      set({
        user,
        accessToken: access_token,
        refreshToken: refresh_token,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return user.role;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.data?.message ||
        'Login gagal. Silakan coba lagi.';
      set({ loading: false, error: message });
      throw error;
    }
  },

  /**
   * Login peserta via Google OAuth redirect
   * Tidak ada API call — langsung redirect ke backend
   */
  loginWithGoogle: () => {
    authService.redirectToGoogle();
  },

  /**
   * Handle callback dari Google OAuth
   * Dipanggil di halaman /auth/callback setelah redirect dari backend
   */
  handleGoogleCallback: async (accessToken, refreshToken) => {
    set({ loading: true, error: null });
    try {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      const user = await authService.getProfile();
      localStorage.setItem('userRole', user.role);

      set({
        user,
        accessToken,
        refreshToken,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return user.role;
    } catch (error) {
      get().forceLogout();
      set({ loading: false, error: 'Gagal memverifikasi akun Google.' });
      throw error;
    }
  },

  /**
   * Ambil profile user (dipanggil saat app mount / refresh halaman)
   */
  fetchProfile: async () => {
    const { accessToken } = get();
    if (!accessToken) return;

    set({ loading: true });
    try {
      const user = await authService.getProfile();
      set({
        user,
        role: user.role,
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      get().forceLogout();
    }
  },

  /**
   * Logout — bersihkan state & localStorage
   */
  logout: async () => {
    const { refreshToken } = get();
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Abaikan error backend, tetap bersihkan client
    }
    get().forceLogout();
  },

  /**
   * Force logout tanpa panggil API (dipakai interceptor 401)
   */
  forceLogout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userRole');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },

  /**
   * Clear error message
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
