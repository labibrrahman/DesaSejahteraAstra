import React, { useEffect, useState } from 'react';
import { Button, Typography, Layout, Spin } from 'antd';
import { ToolOutlined, ArrowLeftOutlined, LogoutOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useMenuStore from '../../stores/menuStore';
import useIsMobile from '../../hooks/useIsMobile';
import astraLogo from '../../assets/images/astra-logo.png';

const { Title, Text } = Typography;
const { Content } = Layout;

// Mapping role → dashboard
const DASHBOARD_MAP = {
  admin: '/admin',
  juri: '/juri',
  peserta: '/peserta',
};

// Menu key mapping (konsisten dengan App.jsx)
const MENU_KEY_MAP = {
  admin: 'menu_admin',
  juri: 'menu_juri',
  peserta: 'menu_peserta',
};

const MaintenancePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, role } = useAuthStore();
  const { menuStatus, loading: menuLoading, fetchMenuStatus } = useMenuStore();
  const isMobile = useIsMobile();
  const customMessage = location.state?.message;
  const [checking, setChecking] = useState(true);

  // Cek ulang status maintenance saat mount / refresh
  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      // Jika menuStatus belum ada, fetch ulang (safety net)
      if (menuStatus.length === 0 && !menuLoading) {
        await fetchMenuStatus();
        return;
      }

      // Tunggu sampai loading selesai
      if (menuLoading) return;

      // Cek apakah user terotentikasi
      if (isAuthenticated && role) {
        const menuKey = MENU_KEY_MAP[role];
        const menu = menuStatus.find(m => m.key === menuKey);

        // Jika menu sudah bukan maintenance, redirect ke dashboard
        if (menu && menu.value !== 'maintenance') {
          navigate(DASHBOARD_MAP[role] || '/', { replace: true });
          return;
        }
      }

      // Selesai mengecek
      setChecking(false);
    };

    checkMaintenanceStatus();
  }, [menuStatus, menuLoading, isAuthenticated, role, navigate, fetchMenuStatus]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Tampilkan spinner saat masih mengecek status
  if (checking || menuLoading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={astraLogo} alt="Astra" style={{ height: 24, objectFit: 'contain' }} />
        </div>
        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: '#ef4444', fontWeight: 600 }}>
          Keluar
        </Button>
      </div>

      {/* Content */}
      <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '32px 20px' : '40px' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          {/* Icon */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 12px 32px rgba(245,158,11,0.3)',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <ToolOutlined style={{ fontSize: 40, color: '#fff' }} />
          </div>

          {/* Title */}
          <Title level={2} style={{ marginBottom: 12, color: '#1e293b', fontWeight: 700 }}>
            Sedang Dalam Perbaikan
          </Title>

          {/* Main Message */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px',
            marginBottom: 24,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <Text style={{ fontSize: 15, color: '#334155', display: 'block', lineHeight: 1.8, marginBottom: 16 }}>
              Halo! Kami sedang merapikan dan memperbaiki beberapa bagian di dalam website ini agar nanti lebih nyaman dan cepat saat Anda gunakan.
            </Text>
            <Text style={{ fontSize: 14, color: '#64748b', display: 'block', lineHeight: 1.7 }}>
              Jangan khawatir, data Anda tetap aman dan kami akan segera kembali dalam beberapa jam. Terima kasih banyak atas pengertiannya!
            </Text>
          </div>

          {/* Features */}
          {/* <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: 16 }} />
              <Text style={{ fontSize: 13, color: '#64748b' }}>Estimasi: Beberapa jam</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 16 }} />
              <Text style={{ fontSize: 13, color: '#64748b' }}>Data tetap aman</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HeartOutlined style={{ color: '#ef4444', fontSize: 16 }} />
              <Text style={{ fontSize: 13, color: '#64748b' }}>Terima kasih</Text>
            </div>
          </div> */}

          {/* Custom message from BE */}
          {/* {customMessage && (
            <div style={{
              background: '#fffbeb',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 24,
              border: '1px solid #fde68a',
            }}>
              <Text style={{ fontSize: 13, color: '#92400e' }}>{customMessage}</Text>
            </div>
          )} */}
          

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              style={{ borderRadius: 8, fontWeight: 600, height: 44, paddingInline: 24 }}
            >
              Kembali ke Beranda
            </Button>
            {/* <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ borderRadius: 8, fontWeight: 600, height: 44, paddingInline: 24 }}
            >
              Keluar
            </Button> */}
          </div>
        </div>
      </Content>

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(245,158,11,0.3); }
          50% { transform: scale(1.05); box-shadow: 0 12px 32px rgba(245,158,11,0.4); }
        }
      `}</style>
    </Layout>
  );
};

export default MaintenancePage;
