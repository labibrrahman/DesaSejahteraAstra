import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * Hook untuk data peserta dashboard.
 * Menggabungkan data dari:
 * - GET /dashboard/perseta (structured steps, status, support)
 * - GET /registrations/my (full registration data untuk detail modal)
 */
const useRegistration = () => {
  const [registration, setRegistration] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch kedua endpoint secara paralel
        const [regRes, dashRes] = await Promise.allSettled([
          api.get('/registrations/my'),
          api.get('/dashboard/peserta'),
        ]);

        // Parse registration data
        if (regRes.status === 'fulfilled') {
          const regData = regRes.value?.data?.data ?? regRes.value?.data;
          if (regData && regData.id) {
            setRegistration(regData);
          }
        }

        // Parse dashboard data (steps, status_label, support)
        if (dashRes.status === 'fulfilled') {
          console.log(dashRes);
          const dashData = dashRes.value?.data?.data ?? dashRes.value?.data;
          if (dashData) {
            setDashboardData(dashData);
          }
        }
      } catch {
        setRegistration(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return {
    registration,
    dashboardData,
    loading,
    hasRegistration: !!registration,
  };
};

export default useRegistration;
