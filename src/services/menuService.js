import api from '../lib/api';

const menuService = {
  /**
   * GET /api/system-settings/public — ambil semua system settings
   */
  getSystemSettings: async () => {
    try {
      const { data } = await api.get('/system-settings/public');
      return data.data || [];
    } catch {
      return [];
    }
  },

  /**
   * GET /api/system-settings/public — ambil status semua menu (compat)
   */
  getMenuStatus: async () => {
    try {
      const settings = await menuService.getSystemSettings();
      return settings.filter(s => s.key.startsWith('menu_'));
    } catch {
      return [];
    }
  },
};

export default menuService;
