import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * Hook untuk data peserta dashboard.
 * Menggabungkan data dari:
 * - GET /dashboard/peserta (structured steps, status, support — berisi registrations array)
 * - GET /registrations/my (full registration data array untuk detail modal)
 */
const useRegistration = () => {
  const [registrations, setRegistrations] = useState([]);
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

        // Parse registration data — selalu array
        if (regRes.status === 'fulfilled') {
          const raw = regRes.value?.data?.data ?? regRes.value?.data;
          const list = Array.isArray(raw)
            ? raw
            : raw?.id
            ? [raw]
            : [];
          setRegistrations(list);
        }

        // Parse dashboard data (steps, status_label, support, registrations)
        if (dashRes.status === 'fulfilled') {
          const dashData = dashRes.value?.data?.data ?? dashRes.value?.data;
          if (dashData) {
            setDashboardData(dashData);
          }
        }
      } catch {
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return {
    registrations,
    // Backward-compat alias: registrasi pertama (untuk komponen lama)
    registration: registrations[0] ?? null,
    dashboardData,
    loading,
    hasRegistration: registrations.length > 0,
  };
};

export default useRegistration;
