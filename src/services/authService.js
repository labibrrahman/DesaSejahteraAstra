import api from '../lib/api';

const authService = {
  /**
   * Login admin / juri (email + password)
   * Backend: POST /api/auth/login
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ access_token: string, refresh_token: string }>}
   */
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    // Response interceptor wraps: { success, message, data: { access_token, refresh_token } }
    return data.data || data;
  },

  /**
   * Ambil data user yang sedang login
   * Backend: GET /api/auth/me
   * @returns {Promise<object>}
   */
  getProfile: async () => {
    const { data } = await api.get('/auth/me');
    return data.data || data;
  },

  /**
   * Logout — invalidate refresh token di backend
   * Backend: POST /api/auth/logout
   * @param {string} refreshToken
   * @returns {Promise<void>}
   */
  logout: async (refreshToken) => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  /**
   * Refresh access token
   * Backend: POST /api/auth/refresh
   * @param {string} refreshToken
   * @returns {Promise<{ access_token: string, refresh_token: string }>}
   */
  refreshToken: async (refreshToken) => {
    const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return data.data || data;
  },

  /**
   * Redirect ke Google OAuth
   * Backend: GET /api/auth/google (redirect browser ke Google)
   */
  redirectToGoogle: () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${baseURL}/auth/google`;
  },
};

export default authService;
