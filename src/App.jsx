import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import idID from 'antd/locale/id_ID';
import useAuthStore from './stores/authStore';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/public/Login';
import AuthCallback from './pages/public/AuthCallback';

// Peserta Pages
import PesertaLayout from './components/layouts/PesertaLayout';
import PesertaDashboard from './pages/peserta/PesertaDashboard';
import FormPendaftaran from './pages/peserta/FormPendaftaran';
import PendaftaranGuard from './pages/peserta/PendaftaranGuard';

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPesertaList from './pages/admin/AdminPesertaList';
import AdminPenilaianHistory from './pages/admin/AdminPenilaianHistory';
import MasterPilar from './pages/admin/MasterPilar';
import MasterKategori from './pages/admin/MasterKategori';
import MasterUser from './pages/admin/MasterUser';
import MasterWilayah from './pages/admin/MasterWilayah';
import MasterGrupAstra from './pages/admin/MasterGrupAstra';

// Juri Pages
import JuriLayout from './components/layouts/JuriLayout';
import JuriPesertaList from './pages/juri/JuriPesertaList';
import JuriFormPenilaian from './pages/juri/JuriFormPenilaian';
import JuriPenilaianHistory from './pages/juri/JuriPenilaianHistory';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ConfigProvider locale={idID}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/admin" element={<Login role="admin" />} />
          <Route path="/login/juri" element={<Login role="juri" />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Peserta Routes — dengan sidebar */}
          <Route
            path="/peserta"
            element={
              <ProtectedRoute allowedRoles={['peserta']}>
                <PesertaLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PesertaDashboard />} />
            <Route path="dashboard" element={<PesertaDashboard />} />
          </Route>

          {/* Form Pendaftaran — guard cek status registrasi */}
          <Route
            path="/peserta/pendaftaran"
            element={
              <ProtectedRoute allowedRoles={['peserta']}>
                <PendaftaranGuard />
              </ProtectedRoute>
            }
          >
            {/* Child route: tampil tanpa sidebar (Outlet) */}
            <Route index element={<FormPendaftaran />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="peserta" element={<AdminPesertaList />} />
            <Route path="penilaian" element={<AdminPenilaianHistory />} />
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
                <JuriLayout />
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