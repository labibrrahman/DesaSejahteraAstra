import api from '../lib/api';

/**
 * Service untuk data master.
 * GET endpoints bersifat public, CUD endpoints butuh auth (admin).
 */
const masterService = {
  // ─── Pillars ──────────────────────────────────────────────────

  /** GET /api/pillars — ambil semua pilar */
  getPillars: async () => {
    const { data } = await api.get('/pillars');
    return data.data || data;
  },

  /** POST /api/pillars — buat pilar baru (admin) */
  createPillar: async (dto) => {
    const { data } = await api.post('/pillars', dto);
    return data.data || data;
  },

  /** PATCH /api/pillars/:id — update pilar (admin) */
  updatePillar: async (id, dto) => {
    const { data } = await api.patch(`/pillars/${id}`, dto);
    return data.data || data;
  },

  /** DELETE /api/pillars/:id — hapus pilar (admin) */
  deletePillar: async (id) => {
    const { data } = await api.delete(`/pillars/${id}`);
    return data.data || data;
  },

  // ─── Categories ───────────────────────────────────────────────

  /**
   * GET /api/categories — ambil semua kategori
   * @param {string} [pillarId] — filter berdasarkan pilar
   */
  getCategories: async (pillarId) => {
    const params = pillarId ? { pillar_id: pillarId } : {};
    const { data } = await api.get('/categories', { params });
    return data.data || data;
  },

  /** POST /api/categories — buat kategori baru (admin) */
  createCategory: async (dto) => {
    const { data } = await api.post('/categories', dto);
    return data.data || data;
  },

  /** PATCH /api/categories/:id — update kategori (admin) */
  updateCategory: async (id, dto) => {
    const { data } = await api.patch(`/categories/${id}`, dto);
    return data.data || data;
  },

  /** DELETE /api/categories/:id — hapus kategori (admin) */
  deleteCategory: async (id) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data.data || data;
  },

  // ─── Regions ──────────────────────────────────────────────────

  /**
   * GET /api/regions — ambil data wilayah
   * @param {{ type?: string, parent_id?: string, search?: string }} params
   */
  getRegions: async (params = {}) => {
    const { data } = await api.get('/regions', { params });
    return data.data || data;
  },

  /** GET /api/regions?type=province — ambil provinsi */
  getProvinces: async () => {
    const { data } = await api.get('/regions', { params: { type: 'province' } });
    return data.data || data;
  },

  /** GET /api/regions?parent_id=...&type=city — ambil kabupaten/kota */
  getCities: async (provinceId) => {
    const { data } = await api.get('/regions', { params: { parent_id: provinceId, type: 'city' } });
    return data.data || data;
  },

  /** GET /api/regions?parent_id=...&type=district — ambil kecamatan */
  getDistricts: async (cityId) => {
    const { data } = await api.get('/regions', { params: { parent_id: cityId, type: 'district' } });
    return data.data || data;
  },

  /** GET /api/regions?parent_id=...&type=village — ambil desa/kelurahan */
  getVillages: async (districtId) => {
    const { data } = await api.get('/regions', { params: { parent_id: districtId, type: 'village' } });
    return data.data || data;
  },

  /** POST /api/regions — buat wilayah baru (admin) */
  createRegion: async (dto) => {
    const { data } = await api.post('/regions', dto);
    return data.data || data;
  },

  /** PATCH /api/regions/:id — update wilayah (admin) */
  updateRegion: async (id, dto) => {
    const { data } = await api.patch(`/regions/${id}`, dto);
    return data.data || data;
  },

  /** DELETE /api/regions/:id — hapus wilayah (admin) */
  deleteRegion: async (id) => {
    const { data } = await api.delete(`/regions/${id}`);
    return data.data || data;
  },

  // ─── Astra Groups ─────────────────────────────────────────────

  /** GET /api/astra-groups — ambil semua grup astra */
  getAstraGroups: async () => {
    const { data } = await api.get('/astra-groups');
    return data.data || data;
  },

  /** POST /api/astra-groups — buat grup astra baru (admin) */
  createAstraGroup: async (dto) => {
    const { data } = await api.post('/astra-groups', dto);
    return data.data || data;
  },

  /** PATCH /api/astra-groups/:id — update grup astra (admin) */
  updateAstraGroup: async (id, dto) => {
    const { data } = await api.patch(`/astra-groups/${id}`, dto);
    return data.data || data;
  },

  /** DELETE /api/astra-groups/:id — hapus grup astra (admin) */
  deleteAstraGroup: async (id) => {
    const { data } = await api.delete(`/astra-groups/${id}`);
    return data.data || data;
  },
};

export default masterService;
