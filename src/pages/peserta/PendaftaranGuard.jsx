import React from 'react';
import { Spin } from 'antd';
import { Outlet, Navigate } from 'react-router-dom';
import useRegistration from '../../hooks/useRegistration';

/**
 * Wrapper untuk route /peserta/pendaftaran.
 * - Belum daftar: tampilkan FormPendaftaran tanpa sidebar
 * - Sudah daftar: redirect ke /peserta/dashboard (tidak boleh akses form lagi)
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

  // Sudah daftar → redirect ke dashboard, tidak boleh akses form pendaftaran lagi
  if (hasRegistration) {
    return <Navigate to="/peserta/dashboard" replace />;
  }

  // Belum daftar → tampilkan tanpa sidebar (FormPendaftaran punya header sendiri)
  return <Outlet />;
};

export default PendaftaranGuard;
