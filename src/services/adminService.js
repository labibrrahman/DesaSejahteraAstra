import api from '../lib/api';

/**
 * Service untuk admin-specific endpoints.
 * Dashboard, manajemen peserta (registrations), dan penilaian (assessments).
 */
const adminService = {
  // ─── Dashboard ────────────────────────────────────────────────

  /** GET /api/dashboard/admin — statistik dashboard admin */
  getDashboard: async () => {
    const { data } = await api.get('/dashboard/admin');
    return data.data || data;
  },

  // ─── Registrations (Peserta Management) ───────────────────────

  /**
   * GET /api/registrations — daftar semua pendaftaran (admin)
   * @param {{ status?: string, pillar_id?: string, search?: string, page?: number, limit?: number }} params
   */
  getRegistrations: async (params = {}) => {
    const { data } = await api.get('/registrations', { params });
    return data;
  },

  /**
   * GET /api/registrations/:id — detail satu pendaftaran
   * @param {string} id
   */
  getRegistrationDetail: async (id) => {
    const { data } = await api.get(`/registrations/${id}`);
    return data.data || data;
  },

  /**
   * PATCH /api/registrations/:id/status — update status pendaftaran
   * @param {string} id
   * @param {{ status: string, assignedJurorId?: string }} dto
   */
  updateRegistrationStatus: async (id, dto) => {
    const { data } = await api.patch(`/registrations/${id}/status`, dto);
    return data.data || data;
  },

  // ─── Assessments (Penilaian) ──────────────────────────────────

  /**
   * GET /api/assessments — daftar semua penilaian (admin)
   * @param {{ search?: string, page?: number, limit?: number }} params
   */
  getAssessments: async (params = {}) => {
    const { data } = await api.get('/assessments', { params });
    return data;
  },

  /**
   * GET /api/assessments/:id — detail satu penilaian
   * @param {string} id
   */
  getAssessmentDetail: async (id) => {
    const { data } = await api.get(`/assessments/${id}`);
    return data.data || data;
  },

  // ─── Users ────────────────────────────────────────────────────

  /**
   * GET /api/users — daftar semua user (admin)
   * @param {{ role?: string, search?: string, page?: number, limit?: number }} params
   */
  getUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params });
    return data;
  },

  /**
   * GET /api/users/:id — detail satu user
   * @param {string} id
   */
  getUserDetail: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data.data || data;
  },

  /**
   * POST /api/users — buat user baru
   * @param {{ name: string, email: string, password: string, role: string, pillarId?: string }} dto
   */
  createUser: async (dto) => {
    const { data } = await api.post('/users', dto);
    return data.data || data;
  },

  /**
   * PATCH /api/users/:id — update user
   * @param {string} id
   * @param {{ name?: string, email?: string, password?: string, role?: string, pillarId?: string }} dto
   */
  updateUser: async (id, dto) => {
    const { data } = await api.patch(`/users/${id}`, dto);
    return data.data || data;
  },

  /**
   * DELETE /api/users/:id — nonaktifkan user (soft delete)
   * @param {string} id
   */
  deleteUser: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data.data || data;
  },

  // ─── Juri Endpoints ───────────────────────────────────────────

  /**
   * GET /api/assessments/tasks — daftar peserta yang siap dinilai juri
   */
  getAssessmentTasks: async () => {
    const { data } = await api.get('/assessments/tasks');
    return data.data || data;
  },

  /**
   * GET /api/assessments/history — riwayat penilaian juri sendiri
   */
  getMyAssessmentHistory: async () => {
    const { data } = await api.get('/assessments/history');
    return data.data || data;
  },

  /**
   * POST /api/assessments — submit penilaian baru
   * @param {{ registrationId: string, criteria1: number, criteria2: number, criteria3: number, notes?: string }} dto
   */
  createAssessment: async (dto) => {
    const { data } = await api.post('/assessments', dto);
    return data.data || data;
  },
};

export default adminService;
