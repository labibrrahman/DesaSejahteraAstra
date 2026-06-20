import React, { useState, useEffect  } from 'react';
import { Button, Row, Col, Typography, Space, Layout } from 'antd';
import {
  HeartOutlined,
  ReadOutlined,
  GlobalOutlined,
  ShopOutlined,
  ArrowRightOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UpOutlined,
  DownOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import astraLogo from '../../assets/images/astra-logo.png';
import satuIndoLogo from '../../assets/images/satu-indonesia-logo.png';
import useIsMobile from '../../hooks/useIsMobile';
import useAuthStore from '../../stores/authStore';

const { Title, Paragraph, Text, Link } = Typography;
const { Header, Content, Footer } = Layout;

// ─── Data ────────────────────────────────────────────────────────────────────

const pilarData = [
  {
    icon: <ReadOutlined />,
    title: 'Pendidikan',
    description: 'Meningkatkan kualitas sumber daya manusia melalui akses pendidikan yang merata dan bermutu.',
    color: '#1870F0',
  },
  {
    icon: <HeartOutlined />,
    title: 'Kesehatan',
    description: 'Mendorong gaya hidup sehat dan ketersediaan layanan kesehatan primer yang berkualitas.',
    color: '#1870F0',
  },
  {
    icon: <GlobalOutlined />,
    title: 'Lingkungan',
    description: 'Konservasi alam dan pengurangan jejak karbon untuk masa depan bumi yang lebih hijau.',
    color: '#1870F0',
  },
  {
    icon: <ShopOutlined />,
    title: 'Kewirausahaan',
    description: 'Pemberdayaan UMKM dan ekonomi lokal untuk menciptakan kemandirian finansial masyarakat.',
    color: '#1870F0',
  },
];

const statsData = [
  { number: '900+', label: 'Desa Terbina' },
  { number: '4.5M', label: 'Penerima Manfaat' },
  { number: '34', label: 'Provinsi Terjangkau' },
  { number: '15k', label: 'UMKM Berkembang' },
];

// ─── Component ───────────────────────────────────────────────────────────────

// ─── Component ───────────────────────────────────────────────────────────────

const LandingPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isAuthenticated, user } = useAuthStore();
  const [faqData, setFaqData] = useState([]);

  useEffect(() => {
    import('../../services/adminService').then(({ default: adminService }) => {
      adminService.getFaqs({ isActive: true }).then(result => {
        const list = Array.isArray(result) ? result : [];
        setFaqData(list.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }).catch(() => {});
    });
  }, []);

  const px = isMobile ? 20 : 30;

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9ff' }}>
      <Content>
        {/* ── Hero Section ──────────────────────────────────────────────────── */}
        <section
          style={{
            position: 'relative',
            minHeight: isMobile ? '80vh' : '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Background */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #005BAA 0%, #003d7a 50%, #001c3b 100%)',
              }}
            />
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80"
              alt="Corporate background"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.3,
                mixBlendMode: 'overlay',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,91,170,0.2) 0%, transparent 40%, rgba(248,249,255,1) 100%)',
              }}
            />
          </div>

          {/* Floating Satu Indonesia Badge */}
          <div
            style={{
              position: 'absolute',
              top: isMobile ? 16 : 24,
              left: isMobile ? 20 : 64,
              zIndex: 30,
              height: 65,
              padding: '12px 16px',
              // background: 'rgba(255,255,255,0.1)',
              // backdropFilter: 'blur(12px)',
              // border: '1px solid rgba(255,255,255,0.2)',
              // borderRadius: 12,
              // boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            // onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            // onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            <img src={astraLogo} alt="Astra Logo" style={{ height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>

          <div
            style={{
              position: 'absolute',
              top: isMobile ? 16 : 24,
              right: isMobile ? 20 : 64,
              zIndex: 30,
              height: 65,
              padding: '12px 16px',
              // background: 'rgba(255,255,255,0.1)',
              // backdropFilter: 'blur(12px)',
              // border: '1px solid rgba(255,255,255,0.2)',
              // borderRadius: 12,
              // boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            // onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            // onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            <img src={satuIndoLogo} alt="Satu Indonesia Logo" style={{ height: 50, objectFit: 'contain' }} />
          </div>

          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              padding: `150px ${isMobile ? 20 : 64}px`,
              textAlign: 'center',
              maxWidth: 800,
              width: '100%',
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: isMobile ? 20 : 28,
              }}
            >
              Astra International Present
            </div>

            {/* Title */}
            <h1
              style={{
                color: '#fff',
                fontSize: isMobile ? 40 : 80,
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                lineHeight: 1.05,
                marginBottom: isMobile ? 16 : 24,
                textShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              Lomba 4 Pilar
            </h1>

            {/* Subtitle */}
            <p
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: isMobile ? 15 : 24,
                lineHeight: 1.7,
                marginBottom: isMobile ? 28 : 40,
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto',
                textShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              Apresiasi untuk program binaan yang memberikan dampak sosial terbaik bagi masyarakat.
              {/* Membangun masa depan berkelanjutan melalui sinergi dan inovasi sosial. */}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: 16 }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: isMobile ? '16px 48px' : '18px 56px',
                  borderRadius: 999,
                  background: '#fff',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  color: '#005BAA',
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  cursor: 'pointer',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: isMobile ? '100%' : 'auto',
                  letterSpacing: 0.3,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
                }}
              >
                Daftar Sekarang
              </button>
              {/* <button
                onClick={() => scrollTo('tentang-section')}
                style={{
                  padding: isMobile ? '14px 40px' : '16px 48px',
                  borderRadius: 999,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  width: isMobile ? '100%' : 'auto',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Pelajari Selengkapnya
              </button> */}
            </div>
          </div>

          {/* Bounce Arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: isMobile ? 24 : 48,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              cursor: 'pointer',
              animation: 'bounce 2s infinite',
            }}
            onClick={() => scrollTo('tentang-section')}
          >
            <ArrowDownOutlined style={{ fontSize: 28, color: 'rgba(255,255,255,0.5)' }} />
          </div>
        </section>

        {/* ── 4 Pilar Section ────────────────────────────────────────────────── */}
        <section id="tentang-section" style={{ padding: `${isMobile ? 48 : 96}px ${px}px`, background: '#fff' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'flex-end',
                marginBottom: isMobile ? 36 : 64,
                gap: isMobile ? 12 : 24,
              }}
            >
              <div style={{ maxWidth: 600 }}>
                <h2
                  style={{
                    fontSize: isMobile ? 24 : 40,
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#005BAA',
                    marginBottom: 12,
                    lineHeight: 1.2,
                  }}
                >
                  Membangun Negeri Melalui 4 Pilar Utama
                </h2>
                <p style={{ fontSize: isMobile ? 14 : 16, color: '#414751', lineHeight: 1.7, margin: 0 }}>
                  Program ini dirancang untuk mengidentifikasi, mendukung, dan mempercepat
                  pertumbuhan inisiatif sosial yang memiliki dampak nyata bagi ekosistem sekitar.
                </p>
              </div>
            </div>

            {/* Cards */}
            <Row gutter={[24, 24]}>
              {pilarData.map((pilar, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <div
                    style={{
                      padding: isMobile ? '28px 24px' : '32px',
                      borderRadius: 12,
                      border: '1px solid #c1c6d3',
                      background: '#fff',
                      height: '100%',
                      cursor: 'default',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#1870F0';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#c1c6d3';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        background: 'rgba(24,112,240,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24,
                        color: '#1870F0',
                        fontSize: 22,
                        transition: 'all 0.3s',
                      }}
                    >
                      {pilar.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#181c21',
                        marginBottom: 10,
                      }}
                    >
                      {pilar.title}
                    </h3>
                    <p style={{ fontSize: 12, color: '#414751', lineHeight: 1.7, margin: 0 }}>
                      {pilar.description}
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* ── Stats Section ──────────────────────────────────────────────────── */}
        <section style={{ padding: `${isMobile ? 48 : 80}px ${px}px`, background: '#f0f7ff' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Row gutter={[isMobile ? 16 : 32, isMobile ? 32 : 40]} justify="center">
              {statsData.map((stat, index) => (
                <Col xs={12} sm={6} key={index} style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      fontSize: isMobile ? 40 : 56,
                      fontWeight: 700,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#1870F0',
                      display: 'block',
                      lineHeight: 1.1,
                      marginBottom: 8,
                    }}
                  >
                    {stat.number}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#414751' }}>
                    {stat.label}
                  </span>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* ── FAQ Section ────────────────────────────────────────────────────── */}
        <section id="faq-section" style={{ padding: `${isMobile ? 48 : 96}px ${px}px`, background: '#fff' }}>
          <div style={{ maxWidth: 768, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 36 : 64 }}>
              <h2
                style={{
                  fontSize: isMobile ? 24 : 40,
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: '#181c21',
                  marginBottom: 12,
                }}
              >
                Pertanyaan Sering Diajukan
              </h2>
              <p style={{ fontSize: isMobile ? 14 : 16, color: '#414751', lineHeight: 1.7 }}>
                Temukan jawaban cepat mengenai proses pendaftaran dan kriteria program.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {faqData.map((item, index) => (
                <FaqItem key={index} item={item} defaultOpen={index === 0} isMobile={isMobile} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact Section ────────────────────────────────────────────────── */}
        <section id="kontak-section" style={{ padding: `${isMobile ? 48 : 96}px ${px}px`, background: '#f8f9ff' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 36 : 64 }}>
              <h2
                style={{
                  fontSize: isMobile ? 24 : 40,
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: '#181c21',
                  marginBottom: 12,
                }}
              >
                Butuh Bantuan?
              </h2>
              <p style={{ fontSize: isMobile ? 14 : 16, color: '#414751' }}>
                Hubungi tim kami untuk informasi lebih lanjut
              </p>
            </div>

            <Row gutter={[isMobile ? 16 : 48, isMobile ? 32 : 48]} justify="center">
              <Col xs={24} sm={8} onClick={() => window.open('https://wa.me/6285713043230', '_blank')}>
                <div style={{ textAlign: 'center', padding: isMobile ? 20 : 32 }}>
                  <div style={{ marginBottom: 16 }}>
                    <PhoneOutlined style={{ fontSize: 32, color: '#1870F0' }} />
                  </div>
                  <Text style={{ fontSize: 14, fontWeight: 600, color: '#414751', display: 'block', marginBottom: 8 }}>
                    Telepon
                  </Text>
                  <Text style={{ fontSize: isMobile ? 18 : 20, fontWeight: 600, color: '#181c21', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    +62 85713043230
                  </Text>
                </div>
              </Col>
              {/* <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: isMobile ? 20 : 32 }}>
                  <div style={{ marginBottom: 16 }}>
                    <MailOutlined style={{ fontSize: 32, color: '#1870F0' }} />
                  </div>
                  <Text style={{ fontSize: 14, fontWeight: 600, color: '#414751', display: 'block', marginBottom: 8 }}>
                    Email
                  </Text>
                  <Text style={{ fontSize: isMobile ? 18 : 20, fontWeight: 600, color: '#181c21', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    csr@astra.co.id
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: isMobile ? 20 : 32 }}>
                  <div style={{ marginBottom: 16 }}>
                    <EnvironmentOutlined style={{ fontSize: 32, color: '#1870F0' }} />
                  </div>
                  <Text style={{ fontSize: 14, fontWeight: 600, color: '#414751', display: 'block', marginBottom: 8 }}>
                    Alamat
                  </Text>
                  <Text style={{ fontSize: isMobile ? 18 : 20, fontWeight: 600, color: '#181c21', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Jl. TB Simatupang, Jakarta
                  </Text>
                </div>
              </Col> */}
            </Row>
          </div>
        </section>
      </Content>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <Footer
        style={{
          padding: `${isMobile ? 32 : 48}px ${px}px`,
          background: '#181c21',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 24 : 0,
          }}
        >
          <div>
            {/* <Text style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'block', marginBottom: 4 }}>
              Desa Sejahtera Astra
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
              Astra International CSR Division
            </Text> */}
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 24 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              {/* <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
                Kebijakan Privasi
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
                Syarat & Ketentuan
              </Text> */}
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              © 2026 Astra International. All Rights Reserved.
            </Text>
          </div>
        </div>
      </Footer>

      {/* ── Bounce Animation CSS ──────────────────────────────────────────── */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-12px); }
          60% { transform: translateX(-50%) translateY(-6px); }
        }
      `}</style>
    </Layout>
  );
};

// ─── FAQ Item Component ──────────────────────────────────────────────────────

const FaqItem = ({ item, defaultOpen = false, isMobile }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderBottom: '1px solid #c1c6d3',
        padding: isMobile ? '16px 0' : '20px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setOpen(!open)}
      >
        <Text
          style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: 600,
            color: '#181c21',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {item.question}
        </Text>
        {open ? (
          <UpOutlined style={{ fontSize: 14, color: '#181c21', flexShrink: 0, marginLeft: 16 }} />
        ) : (
          <DownOutlined style={{ fontSize: 14, color: '#181c21', flexShrink: 0, marginLeft: 16 }} />
        )}
      </div>
      <div
        style={{
          maxHeight: open ? 300 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, padding 0.3s ease',
          paddingTop: open ? 12 : 0,
        }}
      >
        <p
          style={{
            fontSize: isMobile ? 14 : 16,
            color: '#414751',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {item.answer}
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
