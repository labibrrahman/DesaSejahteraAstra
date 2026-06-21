import React from 'react';
import { Button, Typography, Layout } from 'antd';
import { ToolOutlined, ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import astraLogo from '../../assets/images/astra-logo.png';

const { Title, Text } = Typography;
const { Content } = Layout;

const MaintenancePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const message = location.state?.message || 'Sistem sedang dalam perbaikan. Silakan coba lagi nanti.';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={astraLogo} alt="Astra" style={{ height: 24, objectFit: 'contain' }} />
          {/* <Text strong style={{ fontSize: 16, color: '#005BAA', letterSpacing: 0.5 }}>ASTRA</Text> */}
        </div>
        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: '#ef4444', fontWeight: 600 }}>
          Keluar
        </Button>
      </div>

      {/* Content */}
      <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
          }}>
            <ToolOutlined style={{ fontSize: 36, color: '#fff' }} />
          </div>

          <Title level={3} style={{ marginBottom: 8, color: '#1e293b' }}>
            Sedang Dalam Perbaikan
          </Title>
          <Text style={{ fontSize: 14, color: '#64748b', display: 'block', marginBottom: 24, lineHeight: 1.6 }}>
            {message}
          </Text>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Kembali ke Beranda
            </Button>
            {/* <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Keluar
            </Button> */}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default MaintenancePage;
