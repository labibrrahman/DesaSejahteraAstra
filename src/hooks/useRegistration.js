import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * Hook untuk cek apakah peserta sudah punya registrasi.
 * Mengembalikan { registration, loading, hasRegistration }.
 */
const useRegistration = () => {
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await api.get('/registrations/my');
        // Backend wrap response: { success, message, data }
        // data bisa: null, object kosong, atau object dengan id
        const regData = data?.data ?? data;
        if (regData && regData.id) {
          setRegistration(regData);
        } else {
          setRegistration(null);
        }
      } catch (err) {
        // 404 = belum ada registrasi (normal)
        // 403 = role bukan peserta (juga anggap belum ada)
        // Error lain = juga anggap belum ada
        setRegistration(null);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  return { registration, loading, hasRegistration: !!registration };
};

export default useRegistration;
