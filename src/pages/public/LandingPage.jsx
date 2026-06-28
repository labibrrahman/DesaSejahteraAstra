import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Layout } from 'antd';
import {
  HeartOutlined,
  ReadOutlined,
  GlobalOutlined,
  ShopOutlined,
  PhoneOutlined,
  UpOutlined,
  DownOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import astraLogo from '../../assets/images/astra-logo.png';
import satuIndoLogo from '../../assets/images/satu-indonesia-logo.png';
import heroBg from '../../assets/LandingPageAsset/ASET-01.png';
import useIsMobile from '../../hooks/useIsMobile';

const { Text } = Typography;
const { Content, Footer } = Layout;

// ─── Icon & Color Map ────────────────────────────────────────────────────────

const PILAR_ICON_MAP = {
  kesehatan:     { icon: <HeartOutlined />,    color: '#e11d48' },
  pendidikan:    { icon: <ReadOutlined />,     color: '#0284c7' },
  lingkungan:    { icon: <GlobalOutlined />,   color: '#059669' },
  kewirausahaan: { icon: <ShopOutlined />,     color: '#ea580c' },
};

const getPilarStyle = (name) => {
  if (!name) return { icon: <HeartOutlined />, color: '#1870F0' };
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(PILAR_ICON_MAP)) {
    if (lower.includes(key)) return val;
  }
  return { icon: <HeartOutlined />, color: '#1870F0' };
};

const statsData = [
  { number: '3,01 Jt', label: 'Penerima Manfaat Program (2025)' },
  { number: '1533', label: 'Desa Sejahtera Astra di 35 Provinsi' },
  // { number: '492', label: 'Desa Ekspor ke 26 Negara' },
  // { number: 'Rp 411 M', label: 'Valuasi Ekspor Produk DSA (kumulatif s/d 2025)' },
];

// ─── Component ───────────────────────────────────────────────────────────────

// ─── Component ───────────────────────────────────────────────────────────────

const LandingPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [faqData, setFaqData] = useState([]);
  const [pilarData, setPilarData] = useState([]);
  const [supportWhatsapp, setSupportWhatsapp] = useState('');
  const [lazyImages, setLazyImages] = useState({ geoLeft: null, geoRight: null, titleImage: null });

  // Lazy load gambar dekoratif setelah hero load
  useEffect(() => {
    const timer = setTimeout(() => {
      Promise.all([
        import('../../assets/LandingPageAsset/ASET-07(1).png').then(m => m.default),
        import('../../assets/LandingPageAsset/ASET-08(2).png').then(m => m.default),
        import('../../assets/LandingPageAsset/ASET-09.png').then(m => m.default),
      ]).then(([geoL, geoR, title]) => {
        setLazyImages({ geoLeft: geoL, geoRight: geoR, titleImage: title });
      }).catch(() => {});
    }, 300); // delay 300ms agar hero load dulu
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      try {
        const [masterService, menuService, adminService] = await Promise.all([
          import('../../services/masterService').then(m => m.default),
          import('../../services/menuService').then(m => m.default),
          import('../../services/adminService').then(m => m.default),
        ]);

        // Fetch semua data secara paralel
        const [pillars, settings, faqs] = await Promise.all([
          masterService.getPillars().catch(() => []),
          menuService.getSystemSettings().catch(() => []),
          adminService.getFaqs({ isActive: true }).catch(() => []),
        ]);

        if (cancelled) return;

        // Set Pilar
        const pilarList = Array.isArray(pillars) ? pillars : [];
        setPilarData(pilarList.map(p => ({
          ...getPilarStyle(p.name),
          title: p.name,
          description: p.description || '',
        })));

        // Set WhatsApp
        const settingsList = Array.isArray(settings) ? settings : [];
        const waSetting = settingsList.find(s => s.key === 'support_whatsapp');
        if (waSetting?.value) setSupportWhatsapp(waSetting.value);

        // Set FAQ
        const faqList = Array.isArray(faqs) ? faqs : [];
        setFaqData(faqList.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch {
        // ignore
      }
    };

    loadAll();
    return () => { cancelled = true; };
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
            <img
              src={heroBg}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
              }}
            />
            {/* Gradient transisi ke section pilar */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '30%',
              background: 'linear-gradient(to bottom, transparent 0%, #fff 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }} />
          </div>

          {/* Geometric kiri */}
          {lazyImages.geoLeft && (
            <img
              src={lazyImages.geoLeft}
              alt=""
              className="geo-left"
              loading="lazy"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '30%',
                maxWidth: 400,
                zIndex: 1,
                pointerEvents: 'none',
                opacity: 0.9,
                WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              }}
            />
          )}

          {/* Geometric kanan */}
          {lazyImages.geoRight && (
            <img
              src={lazyImages.geoRight}
              alt=""
              className="geo-right"
              loading="lazy"
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '30%',
                maxWidth: 400,
                zIndex: 1,
                pointerEvents: 'none',
                opacity: 0.9,
                WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              }}
            />
          )}

          {/* Floating Satu Indonesia Badge */}
          <div
            style={{
              position: 'absolute',
              top: isMobile ? 20 : 30,
              left: isMobile ? 16 : 30,
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img src={astraLogo} alt="Astra Logo" style={{ height: isMobile ? 24 : 32, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>

          <div
            style={{
              position: 'absolute',
              top: isMobile ? 12 : 24,
              right: isMobile ? 16 : 30,
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img src={satuIndoLogo} alt="Satu Indonesia Logo" style={{ height: isMobile ? 36 : 50, objectFit: 'contain' }} />
          </div>

          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              padding: `150px ${isMobile ? 20 : 64}px`,
              textAlign: 'center',
              maxWidth: 1500,
              width: '100%',
            }}
          >

            {/* Title */}
            {lazyImages.titleImage ? (
              <img
                src={lazyImages.titleImage}
                alt="Lomba Apresiasi Desa Sejahtera Astra"
                style={{
                  maxWidth: isMobile ? 300 : 500,
                  width: '100%',
                  height: 'auto',
                  marginBottom: isMobile ? 16 : 24,
                  filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.2))',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            ) : (
              <div style={{ maxWidth: isMobile ? 300 : 500, height: isMobile ? 150 : 250, margin: '0 auto', marginBottom: isMobile ? 16 : 24 }} />
            )}

            {/* Subtitle */}
            <p
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: isMobile ? 15 : 20,
                lineHeight: 1.7,
                marginBottom: isMobile ? 28 : 40,
                maxWidth: 900,
                marginLeft: 'auto',
                marginRight: 'auto',
                textShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              Lomba ini adalah semangat Astra untuk terus mendorong inovasi 4 bidang (kesehatan, pendidikan, lingkungan, kewirausahaan) di desa binaan Grup & Yayasan Astra melalui flagship program Desa Sejahtera Astra yang menjadi semangat bersama dalam pemberdayaan rural development.
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
                        background: `${pilar.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24,
                        color: pilar.color,
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
                <Col xs={24} sm={6} key={index} style={{ textAlign: 'center' }}>
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
              <Col xs={24} sm={8} onClick={() => {
                const url = supportWhatsapp || '';
                if (url.match(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//)) {
                  window.open(url, '_blank', 'noopener,noreferrer');
                }
              }} style={{ cursor: 'pointer' }}>
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
            </Row>
          </div>
        </section>
      </Content>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <Footer
        style={{
          padding: 0,
          background: '#0f172a',
        }}
      >
        {/* Footer Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: `${isMobile ? 20 : 24}px ${px}px`,
        }}>
          <div style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: isMobile ? 12 : 0,
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
              © 2026 Astra International. All Rights Reserved.
            </Text>
            <div style={{ display: 'flex', gap: 20 }}>
              <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/privacy')} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>Kebijakan Privasi</Text>
              <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/terms')} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>Ketentuan Layanan</Text>
            </div>
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

        .geo-left {
          width: 30%;
          max-width: 400px;
        }
        .geo-right {
          width: 30%;
          max-width: 400px;
        }

        @media (max-width: 768px) {
          .geo-left {
            width: 50%;
            max-width: 250px;
            left: -20px;
            top: 30% !important;
          }
          .geo-right {
            width: 50%;
            max-width: 250px;
            right: -20px;
            top: 5%;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .geo-left {
            width: 25%;
            max-width: 300px;
          }
          .geo-right {
            width: 25%;
            max-width: 300px;
          }
        }

        @media (min-width: 1025px) {
          .geo-left {
            width: 22%;
            max-width: 350px;
            left: 0;
            top: 0;
          }
          .geo-right {
            width: 22%;
            max-width: 350px;
            right: 0;
            top: 0;
          }
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
