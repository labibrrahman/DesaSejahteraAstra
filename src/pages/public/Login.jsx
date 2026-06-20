import React, { useEffect } from 'react';
import { Button, Form, Input, Typography, Layout, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useIsMobile from '../../hooks/useIsMobile';
import astraLogo from '../../assets/images/astra-logo.png';

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = ({ adminMode = false }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { login, loginWithGoogle, isAuthenticated, role: currentRole, loading, error, clearError } = useAuthStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated && currentRole) {
      const redirectMap = { admin: '/admin/dashboard', juri: '/juri/peserta', peserta: '/peserta/dashboard' };
      navigate(redirectMap[currentRole] || '/', { replace: true });
    }
  }, [isAuthenticated, currentRole, navigate]);

  useEffect(() => {
    if (error) { message.error(error); clearError(); }
  }, [error, clearError]);

  const onFinish = async (values) => {
    try {
      const role = await login({ email: values.email, password: values.password });
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'juri') navigate('/juri/peserta');
    } catch { /* handled by store */ }
  };

  // ═══════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ═══════════════════════════════════════════════════════════════════
  if (isMobile) {
    const MobileBranding = ({ title, subtitle }) => (
      <div style={{
        background: 'linear-gradient(135deg, #005BAA 0%, #004a94 100%)',
        padding: '32px 24px 60px', textAlign: 'center', position: 'relative',
        flex: '0 0 auto',
      }}>
        {/* <div style={{
          width: 56, height: 56, borderRadius: 12, background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <img src={astraLogo} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div> */}
        <Title level={2} style={{ color: '#fff', fontWeight: 700, fontSize: 24, marginBottom: 8 }}>{title}</Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.6 }}>{subtitle}</Text>
      </div>
    );

    const MobileFormCard = ({ title, subtitle, children }) => (
      <div style={{
        background: '#fff', borderRadius: '24px 24px 0 0', marginTop: -32,
        position: 'relative', zIndex: 10, padding: '12px 24px 32px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {/* <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 20px' }} /> */}
        <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>
          <Title level={3} style={{ margin: '0 0 8px', fontWeight: 700, color: '#1e293b', textAlign: 'center', fontSize: 20 }}>{title}</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 28, fontSize: 13, textAlign: 'center' }}>{subtitle}</Text>
          {children}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button type="text" icon={<BankOutlined />} onClick={() => navigate('/')} style={{ color: '#64748b', fontSize: 13 }}>
              ← Kembali ke Beranda
            </Button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>© 2026 Astra International. All rights reserved.</Text>
          </div>
        </div>
      </div>
    );

    if (adminMode) {
      return (
        <Layout style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 }}>
            <img src={astraLogo} alt="Astra" style={{ height: 24, objectFit: 'contain' }} />
            {/* <Text strong style={{ fontSize: 16, color: '#005BAA', letterSpacing: 0.5 }}>ASTRA</Text> */}
          </div>
          <MobileBranding title="Lomba 4 Pilar" subtitle="Apresiasi untuk program binaan yang memberikan dampak sosial terbaik bagi masyarakat." />
          <MobileFormCard title="Masuk" subtitle="Gunakan akun Admin atau Juri yang telah terdaftar">
            <Form form={form} layout="vertical" onFinish={onFinish} size="large">
              <Form.Item name="email" rules={[{ required: true, message: 'Masukkan email Anda' }, { type: 'email', message: 'Email tidak valid' }]}>
                <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Email" style={{ height: 46, borderRadius: 10, borderColor: '#e2e8f0' }} />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: 'Masukkan password Anda' }]}>
                <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Password" style={{ height: 46, borderRadius: 10, borderColor: '#e2e8f0' }} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 46, borderRadius: 10, fontWeight: 600, fontSize: 15, background: 'linear-gradient(135deg, #005BAA, #1870F0)', border: 'none', boxShadow: '0 4px 12px rgba(0,91,170,0.3)' }}>
                  Masuk
                </Button>
              </Form.Item>
            </Form>
          </MobileFormCard>
        </Layout>
      );
    }

    return (
      <Layout style={{ minHeight: '60vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <img src={astraLogo} alt="Astra" style={{ height: 24, objectFit: 'contain' }} />
          {/* <Text strong style={{ fontSize: 16, color: '#005BAA', letterSpacing: 0.5 }}>ASTRA</Text> */}
        </div>
        <MobileBranding title="Desa Sejahtera Astra" subtitle="Apresiasi untuk program binaan yang memberikan dampak sosial terbaik bagi masyarakat." />
        <MobileFormCard title="Masuk sebagai Peserta" subtitle="Gunakan akun Google yang terdaftar untuk mengakses dashboard peserta.">
          <Button type="default" icon={<GoogleOutlined style={{ color: '#4285f4', fontSize: 18 }} />} size="large" block onClick={loginWithGoogle} loading={loading}
            style={{ height: 48, borderRadius: 10, border: '1px solid #e2e8f0', fontWeight: 500, fontSize: 14, color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            Masuk dengan Google
          </Button>
        </MobileFormCard>
      </Layout>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT (split: left branding, right form)
  // ═══════════════════════════════════════════════════════════════════
  const DesktopBranding = ({ title, subtitle, stats }) => (
    <div style={{
      flex: 1, background: 'linear-gradient(135deg, #005BAA 0%, #003d7a 50%, #001c3b 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '60px 48px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', right: 40, top: -120, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
        <img src={astraLogo} alt="Astra" style={{ height: 48, marginBottom: 32, filter: 'brightness(0) invert(1)' }} />
        <Title level={2} style={{ color: '#fff', fontWeight: 700, fontSize: 32, lineHeight: 1.2, marginBottom: 16 }}>{title}</Title>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7, display: 'block' }}>{subtitle}</Text>
        {stats && (
          <div style={{ marginTop: 48, display: 'flex', gap: 32, justifyContent: 'center' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.num}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const DesktopFormPanel = ({ title, subtitle, children }) => (
    <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 40px', background: '#fff' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <Button type="text" icon={<BankOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 32, color: '#64748b', padding: 0 }}>
          Kembali ke Beranda
        </Button>
        <Title level={3} style={{ margin: '0 0 8px', fontWeight: 700, color: '#1e293b' }}>{title}</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 14 }}>{subtitle}</Text>
        {children}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>© 2026 Astra International. All Rights Reserved.</Text>
        </div>
      </div>
    </div>
  );

  if (adminMode) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Content style={{ display: 'flex', minHeight: '100vh' }}>
          <DesktopBranding title="Lomba 4 Pilar" subtitle="Apresiasi untuk program binaan yang memberikan dampak sosial terbaik bagi masyarakat." />
          <DesktopFormPanel title="Masuk" subtitle="Gunakan akun Admin atau Juri yang telah terdaftar">
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
          </DesktopFormPanel>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Content style={{ display: 'flex', minHeight: '100vh' }}>
        <DesktopBranding
          title="Desa Sejahtera Astra"
          subtitle="Apresiasi untuk program binaan yang memberikan dampak sosial terbaik bagi masyarakat."
          stats={[{ num: '900+', label: 'Desa' }, { num: '4.5M', label: 'Manfaat' }, { num: '34', label: 'Provinsi' }]}
        />
        <DesktopFormPanel title="Masuk sebagai Peserta" subtitle="Gunakan akun Google yang terdaftar untuk mengakses dashboard peserta.">
          <Button type="default" icon={<GoogleOutlined style={{ color: '#4285f4' }} />} size="large" block onClick={loginWithGoogle} loading={loading}
            style={{ height: 52, borderRadius: 10, border: '1px solid #e2e8f0', fontWeight: 500, fontSize: 15, color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            Masuk dengan Google
          </Button>
        </DesktopFormPanel>
      </Content>
    </Layout>
  );
};

export default Login;
