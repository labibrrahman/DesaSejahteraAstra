import { create } from 'zustand';
import menuService from '../services/menuService';

const useMenuStore = create((set) => ({
  menuStatus: [],
  loading: false,

  fetchMenuStatus: async () => {
    set({ loading: true });
    try {
      const data = await menuService.getMenuStatus();
      set({ menuStatus: data, loading: false });
    } catch {
      set({ menuStatus: [], loading: false });
    }
  },

  /**
   * Cek apakah menu tertentu aktif
   * @param {string} menuKey - key menu (menu_admin, menu_peserta, menu_juri)
   * @returns {{ active: boolean, maintenance: boolean, description: string }}
   */
  getMenuState: (menuKey) => {
    const menu = useMenuStore.getState().menuStatus.find(m => m.key === menuKey);
    if (!menu) return { active: true, maintenance: false, description: '' };
    return {
      active: menu.value === 'active',
      maintenance: menu.value === 'maintenance',
      description: menu.description || '',
    };
  },
}));

export default useMenuStore;
