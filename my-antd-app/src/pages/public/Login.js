import React from 'react';
import { Button, Card, Form, Input, Typography, Divider, Layout } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = ({ role }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginRole = role || searchParams.get('role') || 'peserta';

  const onFinish = (values) => {
    console.log('Login values:', values);
    // TODO: Implement actual login logic
    localStorage.setItem('userRole', loginRole);
    localStorage.setItem('token', 'dummy-token');

    if (loginRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (loginRole === 'juri') {
      navigate('/juri/peserta');
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login clicked');
    localStorage.setItem('userRole', 'peserta');
    localStorage.setItem('token', 'dummy-token');
    navigate('/peserta/pendaftaran');
  };

  const getTitle = () => {
    switch (loginRole) {
      case 'admin':
        return 'Login Admin';
      case 'juri':
        return 'Login Juri';
      default:
        return 'Daftar / Login';
    }
  };

  const getBackPath = () => {
    switch (loginRole) {
      case 'admin':
      case 'juri':
        return '/';
      default:
        return '/';
    }
  };

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
              onClick={() => navigate(getBackPath())}
              style={{ marginBottom: 16 }}
            >
              Kembali
            </Button>
            <Title level={3} style={{ margin: 0, textAlign: 'center' }}>
              {getTitle()}
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
              Desa Sejahtera Astra
            </Text>
          </div>

          {loginRole === 'peserta' ? (
            <>
              <Button
                type="primary"
                icon={<GoogleOutlined />}
                size="large"
                block
                onClick={handleGoogleLogin}
                style={{
                  backgroundColor: '#db4437',
                  borderColor: '#db4437',
                  marginBottom: 16,
                }}
              >
                Masuk dengan Google
              </Button>
              <Divider plain>
                <Text type="secondary">atau</Text>
              </Divider>
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
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block>
                    Lanjutkan
                  </Button>
                </Form.Item>
              </Form>
              <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12 }}>
                Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami
              </Text>
            </>
          ) : (
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Masukkan username Anda' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Masukkan password Anda' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Masuk
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;