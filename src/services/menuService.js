import api from '../lib/api';

const menuService = {
  /**
   * GET /api/system-settings/public — ambil status semua menu
   */
  getMenuStatus: async () => {
    try {
      const { data } = await api.get('/system-settings/public');
      const settings = data.data || [];
      return settings.filter(s => s.key.startsWith('menu_'));
    } catch {
      return [];
    }
  },
};

export default menuService;
