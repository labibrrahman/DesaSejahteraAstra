import api from '../lib/api';

/**
 * Service untuk fetch data master dari API.
 * Semua endpoint ini public (tidak perlu auth).
 */
const masterService = {
  /** GET /api/pillars */
  getPillars: async () => {
    const { data } = await api.get('/pillars');
    return data.data || data;
  },

  /** GET /api/categories?pillar_id=... */
  getCategories: async (pillarId) => {
    const params = pillarId ? { pillar_id: pillarId } : {};
    const { data } = await api.get('/categories', { params });
    return data.data || data;
  },

  /** GET /api/regions?type=province */
  getProvinces: async () => {
    const { data } = await api.get('/regions', { params: { type: 'province' } });
    return data.data || data;
  },

  /** GET /api/regions?parent_id=...&type=city */
  getCities: async (provinceId) => {
    const { data } = await api.get('/regions', { params: { parent_id: provinceId, type: 'city' } });
    return data.data || data;
  },

  /** GET /api/regions?parent_id=...&type=district */
  getDistricts: async (cityId) => {
    const { data } = await api.get('/regions', { params: { parent_id: cityId, type: 'district' } });
    return data.data || data;
  },

  /** GET /api/regions?parent_id=...&type=village */
  getVillages: async (districtId) => {
    const { data } = await api.get('/regions', { params: { parent_id: districtId, type: 'village' } });
    return data.data || data;
  },

  /** GET /api/astra-groups */
  getAstraGroups: async () => {
    const { data } = await api.get('/astra-groups');
    return data.data || data;
  },
};

export default masterService;
