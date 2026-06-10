import React, { useEffect } from 'react';
import { Button, Card, Form, Input, Typography, Layout, Alert } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = ({ role }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginRole = role || searchParams.get('role') || 'peserta';

  const { login, loginWithGoogle, isAuthenticated, role: currentRole, loading, error, clearError } = useAuthStore();

  // Kalau sudah login, redirect ke dashboard sesuai role
  useEffect(() => {
    if (isAuthenticated && currentRole) {
      const redirectMap = {
        admin: '/admin/dashboard',
        juri: '/juri/peserta',
        peserta: '/peserta/pendaftaran',
      };
      navigate(redirectMap[currentRole] || '/', { replace: true });
    }
  }, [isAuthenticated, currentRole, navigate]);

  // Tampilkan error dari store
  useEffect(() => {
    if (error) {
      // error handled by store
      clearError();
    }
  }, [error, clearError]);

  const onFinish = async (values) => {
    try {
      if (loginRole === 'peserta') {
        // Peserta hanya bisa login via Google OAuth
        loginWithGoogle();
      } else {
        // Admin / Juri login via email + password
        const role = await login({ email: values.email, password: values.password });
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'juri') {
          navigate('/juri/peserta');
        }
      }
    } catch {
      // Error sudah ditangani oleh store
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  // ── Tampilan Khusus Peserta ────────────────────────────────
  if (loginRole === 'peserta') {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Content
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px 20px',
          }}
        >
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 56,
                height: 56,
                background: '#1e293b',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 2px 8px rgba(30,41,59,0.15)',
              }}
            >
              <BankOutlined style={{ color: '#fff', fontSize: 24 }} />
            </div>
            <Title level={2} style={{ margin: '0 0 8px', fontWeight: 700, color: '#1e293b' }}>
              Selamat Datang
            </Title>
            <Text type="secondary" style={{ fontSize: 15 }}>
              Masuk ke portal pengembangan masyarakat Desa Sejahtera
              <br />
              Astra.
            </Text>
          </div>

          {/* Card Login Peserta */}
          <Card
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
            }}
            bodyStyle={{ padding: '32px 28px' }}
          >
            <Title level={4} style={{ margin: '0 0 8px', fontWeight: 600, color: '#1e293b' }}>
              Masuk sebagai Peserta
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
              Gunakan akun Google yang terdaftar untuk mengakses
              dashboard peserta dan mengirimkan laporan.
            </Text>

            {/* Google Login Button */}
            <Button
              type="default"
              icon={
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GoogleOutlined style={{ color: '#4285f4', fontSize: 16 }} />
                </span>
              }
              size="large"
              block
              onClick={handleGoogleLogin}
              loading={loading}
              style={{
                height: 48,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontWeight: 500,
                fontSize: 14,
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              Masuk dengan Google (Mulai Daftar)
            </Button>

            {/* Divider INFO */}
            <div
              style={{
                margin: '24px 0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                }}
              >
                INFO
              </Text>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            {/* Info Alert */}
            <Alert
              message="Hanya peserta yang telah terverifikasi oleh tim Astra yang dapat masuk ke sistem ini."
              type="info"
              showIcon
              icon={<InfoCircleOutlined style={{ color: '#2563eb' }} />}
              style={{
                borderRadius: 8,
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
              }}
            />
          </Card>
        </Content>
      </Layout>
    );
  }

  // ── Tampilan Admin / Juri (tetap sama) ─────────────────────
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 50,
        }}
      >
        <Card
          style={{
            width: 400,
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              style={{ marginBottom: 16 }}
            >
              Kembali
            </Button>
            <Title level={3} style={{ margin: 0, textAlign: 'center' }}>
              {loginRole === 'admin' ? 'Login Admin' : 'Login Juri'}
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
              Desa Sejahtera Astra
            </Text>
          </div>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Masukkan email Anda' },
                { type: 'email', message: 'Email tidak valid' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Masukkan password Anda' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Masuk
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;
