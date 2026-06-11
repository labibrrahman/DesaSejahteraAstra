import React from 'react';
import { Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import useRegistration from '../../hooks/useRegistration';
import PesertaLayout from '../../components/layouts/PesertaLayout';

/**
 * Wrapper untuk route /peserta/pendaftaran.
 * - Belum daftar: tampilkan FormPendaftaran tanpa sidebar
 * - Sudah daftar: tampilkan FormPendaftaran dengan sidebar ( PesertaLayout )
 */
const PendaftaranGuard = () => {
  const { loading, hasRegistration } = useRegistration();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" description="Memuat data..." />
      </div>
    );
  }

  // Sudah daftar → tampilkan dengan sidebar
  if (hasRegistration) {
    return <PesertaLayout />;
  }

  // Belum daftar → tampilkan tanpa sidebar (FormPendaftaran punya header sendiri)
  return <Outlet />;
};

export default PendaftaranGuard;
