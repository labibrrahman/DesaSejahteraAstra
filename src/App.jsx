import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import idID from 'antd/locale/id_ID';
import useAuthStore from './stores/authStore';
import useMenuStore from './stores/menuStore';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/public/Login';
import AuthCallback from './pages/public/AuthCallback';
import MaintenancePage from './pages/public/MaintenancePage';

// Peserta Pages
import AppLayout from './components/layouts/AppLayout';
import PesertaDashboard from './pages/peserta/PesertaDashboard';
import FormPendaftaran from './pages/peserta/FormPendaftaran';
import PendaftaranGuard from './pages/peserta/PendaftaranGuard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPesertaList from './pages/admin/AdminPesertaList';
import AdminPenilaianHistory from './pages/admin/AdminPenilaianHistory';
import AdminSelectionReview from './pages/admin/AdminSelectionReview';
import MasterPilar from './pages/admin/MasterPilar';
import MasterKategori from './pages/admin/MasterKategori';
import MasterUser from './pages/admin/MasterUser';
import MasterWilayah from './pages/admin/MasterWilayah';
import MasterGrupAstra from './pages/admin/MasterGrupAstra';

// Juri Pages
import JuriPesertaList from './pages/juri/JuriPesertaList';
import JuriFormPenilaian from './pages/juri/JuriFormPenilaian';
import JuriPenilaianHistory from './pages/juri/JuriPenilaianHistory';

import './App.css';

// Menu key mapping
const MENU_KEY_MAP = {
  admin: 'menu_admin',
  juri: 'menu_juri',
  peserta: 'menu_peserta',
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore();
  const { menuStatus, loading: menuLoading } = useMenuStore();

  if (!isAuthenticated || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  // Tunggu menu status di-load dulu
  if (menuLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Spin size="large" /></div>;
  }

  // Cek status menu
  const menuKey = MENU_KEY_MAP[role];
  if (menuKey) {
    const menu = menuStatus.find(m => m.key === menuKey);
    if (menu && menu.value === 'maintenance') {
      return <Navigate to="/maintenance" state={{ message: menu.description }} replace />;
    }
  }

  return children;
};

function App() {
  const { fetchProfile, accessToken } = useAuthStore();
  const { fetchMenuStatus } = useMenuStore();

  useEffect(() => {
    fetchMenuStatus();
    if (accessToken) {
      fetchProfile();
    }
  }, []);

  return (
    <ConfigProvider locale={idID}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/admin" element={<Login adminMode />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/maintenance" element={<MaintenancePage />} />

          {/* Peserta Routes — dengan sidebar */}
          <Route
            path="/peserta"
            element={
              <ProtectedRoute allowedRoles={['peserta']}>
                <AppLayout role="peserta" />
              </ProtectedRoute>
            }
          >
            <Route index element={<PesertaDashboard />} />
            <Route path="dashboard" element={<PesertaDashboard />} />
          </Route>

          {/* Form Pendaftaran — guard cek status registrasi */}
          <Route
            path="/register"
            element={
              <ProtectedRoute allowedRoles={['peserta']}>
                <PendaftaranGuard />
              </ProtectedRoute>
            }
          >
            <Route index element={<FormPendaftaran />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout role="admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="peserta" element={<AdminPesertaList />} />
            <Route path="penilaian" element={<AdminPenilaianHistory />} />
            <Route path="seleksi" element={<AdminSelectionReview />} />
            <Route path="master/pilar" element={<MasterPilar />} />
            <Route path="master/kategori" element={<MasterKategori />} />
            <Route path="master/user" element={<MasterUser />} />
            <Route path="master/wilayah" element={<MasterWilayah />} />
            <Route path="master/grup-astra" element={<MasterGrupAstra />} />
          </Route>

          {/* Juri Routes */}
          <Route
            path="/juri"
            element={
              <ProtectedRoute allowedRoles={['juri']}>
                <AppLayout role="juri" />
              </ProtectedRoute>
            }
          >
            <Route index element={<JuriPesertaList />} />
            <Route path="peserta" element={<JuriPesertaList />} />
            <Route path="penilaian/:id" element={<JuriFormPenilaian />} />
            <Route path="riwayat" element={<JuriPenilaianHistory />} />
          </Route>

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;