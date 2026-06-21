import api from '../lib/api';

// ── Dummy data (ganti dengan API saat BE ready) ──────────────────────────
const DUMMY_MENU_STATUS = [
  { key: 'menu_admin', value: 'active', description: '' },
  { key: 'menu_peserta', value: 'active', description: '' },
  { key: 'menu_juri', value: 'active', description: '' },
  // Ubah value ke 'maintenance' untuk mode maintenance
  // Contoh: { key: 'menu_juri', value: 'maintenance', description: 'Sedang ada perbaikan pada Fitur Juri' },
];

const menuService = {
  /**
   * GET /api/menu-status — ambil status semua menu
   * Saat ini pakai dummy data. Ganti ke API saat BE ready.
   */
  getMenuStatus: async () => {
    try {
      // Aktifkan baris ini saat API sudah ready:
      // const { data } = await api.get('/menu-status');
      // return data.data || [];
      return DUMMY_MENU_STATUS;
    } catch {
      return DUMMY_MENU_STATUS;
    }
  },
};

export default menuService;
