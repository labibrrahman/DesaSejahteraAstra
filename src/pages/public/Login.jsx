import React, { useEffect } from 'react';
import { Button, Form, Input, Typography, Layout, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import astraLogo from '../../assets/images/astra-logo.png';

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = ({ adminMode = false }) => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthenticated, role: currentRole, loading, error, clearError } = useAuthStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated && currentRole) {
      const redirectMap = { admin: '/admin/dashboard', juri: '/juri/peserta', peserta: '/peserta/dashboard' };
      navigate(redirectMap[currentRole] || '/', { replace: true });
    }
  }, [isAuthenticated, currentRole, navigate]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onFinish = async (values) => {
    try {
      const role = await login({ email: values.email, password: values.password });
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'juri') navigate('/juri/peserta');
    } catch { /* handled by store */ }
  };

  // ── Admin / Juri Login ─────────────────────────────────────────────
  if (adminMode) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Content style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Left: Branding */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, #005BAA 0%, #003d7a 50%, #001c3b 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            padding: '60px 48px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', right: 40, top: -120, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
              <img src={astraLogo} alt="Astra" style={{ height: 48, marginBottom: 32, filter: 'brightness(0) invert(1)' }} />
              <Title level={2} style={{ color: '#fff', fontWeight: 700, fontSize: 32, lineHeight: 1.2, marginBottom: 16 }}>
                Lomba 4 Pilar
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7, display: 'block' }}>
              Apresiasi untuk program binaan yang memberikan dampak sosial terbaik bagi masyarakat.
                {/* Akses sistem pengelolaan dan penilaian program Desa Sejahtera Astra. */}
              </Text>
            </div>
          </div>

          {/* Right: Form */}
          <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 40px', background: '#fff' }}>
            <div style={{ width: '100%', maxWidth: 360 }}>
              <Button type="text" icon={<BankOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 32, color: '#64748b', padding: 0 }}>
                Kembali ke Beranda
              </Button>

              <Title level={3} style={{ margin: '0 0 8px', fontWeight: 700, color: '#1e293b' }}>Masuk</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 14 }}>
                Gunakan akun Admin atau Juri yang telah terdaftar
              </Text>

              <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                <Form.Item name="email" rules={[{ required: true, message: 'Masukkan email Anda' }, { type: 'email', message: 'Email tidak valid' }]}>
                  <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Email" style={{ height: 48, borderRadius: 10, borderColor: '#e2e8f0' }} />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Masukkan password Anda' }]}>
                  <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Password" style={{ height: 48, borderRadius: 10, borderColor: '#e2e8f0' }} />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 48, borderRadius: 10, fontWeight: 600, fontSize: 15, background: 'linear-gradient(135deg, #005BAA, #1870F0)', border: 'none', boxShadow: '0 4px 12px rgba(0,91,170,0.3)' }}>
                    Masuk
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>© 2026 Astra International. All Rights Reserved.</Text>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  // ── Peserta Login (Google OAuth) ───────────────────────────────────
  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Content style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Left: Branding */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #005BAA 0%, #003d7a 50%, #001c3b 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          padding: '60px 48px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', right: 40, top: -120, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
            <img src={astraLogo} alt="Astra" style={{ height: 48, marginBottom: 32, filter: 'brightness(0) invert(1)' }} />
            <Title level={2} style={{ color: '#fff', fontWeight: 700, fontSize: 32, lineHeight: 1.2, marginBottom: 16 }}>
              Desa Sejahtera Astra
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7, display: 'block' }}>
              Apresiasi untuk program binaan yang memberikan dampak sosial terbaik bagi masyarakat.
            </Text>
            <div style={{ marginTop: 48, display: 'flex', gap: 32, justifyContent: 'center' }}>
              {/* {[{ num: '900+', label: 'Desa' }, { num: '4.5M', label: 'Manfaat' }, { num: '34', label: 'Provinsi' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.num}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))} */}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 40px', background: '#fff' }}>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <Button type="text" icon={<BankOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 32, color: '#64748b', padding: 0 }}>
              Kembali ke Beranda
            </Button>

            <Title level={3} style={{ margin: '0 0 8px', fontWeight: 700, color: '#1e293b' }}>Masuk sebagai Peserta</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 14 }}>
              Gunakan akun Google yang terdaftar untuk mengakses dashboard peserta.
            </Text>

            <Button
              type="default"
              icon={<GoogleOutlined style={{ color: '#4285f4' }} />}
              size="large"
              block
              onClick={loginWithGoogle}
              loading={loading}
              style={{ height: 52, borderRadius: 10, border: '1px solid #e2e8f0', fontWeight: 500, fontSize: 15, color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              Masuk dengan Google
            </Button>

            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>© 2026 Astra International. All Rights Reserved.</Text>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Login;
