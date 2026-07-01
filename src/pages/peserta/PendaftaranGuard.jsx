import React from 'react';
import { Spin } from 'antd';
import { Outlet, Navigate, useSearchParams } from 'react-router-dom';
import useRegistration from '../../hooks/useRegistration';

/**
 * Wrapper untuk route /register.
 * - Belum daftar: tampilkan FormPendaftaran tanpa sidebar
 * - Sudah daftar + mode=new: tampilkan FormPendaftaran untuk tambah pilar baru
 * - Sudah daftar (normal): redirect ke /peserta/dashboard
 */
const PendaftaranGuard = () => {
  const { loading, hasRegistration } = useRegistration();
  const [searchParams] = useSearchParams();
  const isAddNew = searchParams.get('mode') === 'new';
  const hasEditId = !!searchParams.get('id');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" description="Memuat data..." />
      </div>
    );
  }

  // Sudah daftar & BUKAN mode tambah baru & BUKAN sedang edit draft tertentu → redirect ke dashboard
  if (hasRegistration && !isAddNew && !hasEditId) {
    return <Navigate to="/peserta/dashboard" replace />;
  }

  // Belum daftar / mode=new / edit draft → tampilkan form tanpa sidebar (FormPendaftaran punya header sendiri)
  return <Outlet />;
};

export default PendaftaranGuard;
