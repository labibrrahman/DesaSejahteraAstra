import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';

const { Text } = Typography;

/**
 * Halaman callback setelah Google OAuth redirect dari backend.
 * Backend redirect ke: FRONTEND_URL/auth/callback?access_token=...&refresh_token=...
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuthStore();

  useEffect(() => {
    const processCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (!accessToken || !refreshToken) {
        navigate('/login?error=missing_tokens', { replace: true });
        return;
      }

      try {
        const role = await handleGoogleCallback(accessToken, refreshToken);
        if (role === 'peserta') {
          navigate('/peserta/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch {
        navigate('/login?error=callback_failed', { replace: true });
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
        gap: 16,
      }}
    >
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      <Text type="secondary" style={{ fontSize: 16 }}>
        Memverifikasi akun Google Anda...
      </Text>
    </div>
  );
};

export default AuthCallback;
