import React, { useEffect } from 'react';
import { Typography, Layout, Button } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useIsMobile from '../../hooks/useIsMobile';
import astraLogo from '../../assets/images/astra-logo.png';
import heroBg from '../../assets/LandingPageAsset/ASET-01.png';

const { Title, Text, Paragraph } = Typography;
const { Content, Footer } = Layout;

const TermsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const isMobile = useIsMobile();
  const px = isMobile ? 20 : 30;

  const sections = [
    {
      num: '01',
      title: 'Penerimaan Syarat',
      content: 'Dengan mendaftar atau masuk ke platform ini, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum di sini. Jika Anda tidak menyetujui syarat ini, harap tidak menggunakan platform kami.',
    },
    {
      num: '02',
      title: 'Deskripsi Layanan',
      content: 'Platform Desa Sejahtera Astra Awards adalah sistem pendaftaran dan penilaian program yang diselenggarakan oleh Desa Sejahtera Astra. Platform ini digunakan untuk mengelola proses pendaftaran peserta, pengumpulan data program, dan penilaian oleh juri yang ditunjuk.',
    },
    {
      num: '03',
      title: 'Akun Pengguna',
      content: 'Anda bertanggung jawab untuk menjaga keamanan akun Anda. Akun dibuat melalui Google OAuth dan hanya dapat digunakan oleh pemilik akun yang sah. Kami berhak menonaktifkan akun yang melanggar syarat dan ketentuan ini tanpa pemberitahuan sebelumnya.',
    },
    {
      num: '04',
      title: 'Penggunaan yang Diizinkan',
      content: 'Anda setuju untuk menggunakan platform ini hanya untuk keperluan yang sah dalam rangka program Desa Sejahtera Astra Awards. Anda dilarang menggunakan platform ini untuk tujuan yang melanggar hukum, menyebarkan konten yang menyinggung atau menyesatkan, mencoba mengakses sistem atau data pengguna lain tanpa izin, serta melakukan tindakan yang dapat mengganggu atau merusak fungsi platform.',
    },
    {
      num: '05',
      title: 'Konten Pengguna',
      content: 'Anda bertanggung jawab penuh atas konten yang Anda submit melalui platform ini. Dengan mengirimkan konten, Anda menyatakan bahwa konten tersebut akurat, tidak melanggar hak pihak ketiga, dan sesuai dengan ketentuan program Desa Sejahtera Astra Awards.',
    },
    {
      num: '06',
      title: 'Hak Kekayaan Intelektual',
      content: 'Seluruh konten, desain, logo, dan materi yang terdapat di platform ini adalah milik Desa Sejahtera Astra Awards dan dilindungi oleh hukum hak cipta yang berlaku. Anda tidak diizinkan untuk menyalin, mendistribusikan, atau memodifikasi konten platform tanpa izin tertulis dari kami.',
    },
    {
      num: '07',
      title: 'Penolakan Jaminan',
      content: 'Platform ini disediakan "sebagaimana adanya" tanpa jaminan apapun. Kami tidak menjamin bahwa platform akan selalu tersedia, bebas dari kesalahan, atau memenuhi semua kebutuhan Anda. Kami tidak bertanggung jawab atas kerugian yang timbul akibat gangguan layanan atau kehilangan data.',
    },
    {
      num: '08',
      title: 'Batasan Tanggung Jawab',
      content: 'Desa Sejahtera Astra Awards tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan platform ini.',
    },
    {
      num: '09',
      title: 'Perubahan Layanan',
      content: 'Kami berhak mengubah, menangguhkan, atau menghentikan layanan kapan saja tanpa pemberitahuan sebelumnya. Kami juga berhak memperbarui Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan berlaku segera setelah dipublikasikan di platform.',
    },
    {
      num: '10',
      title: 'Hukum yang Berlaku',
      content: 'Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui musyawarah mufakat, atau jika tidak tercapai, melalui pengadilan yang berwenang di Indonesia.',
    },
    {
      num: '11',
      title: 'Hubungi Kami',
      content: 'Jika Anda memiliki pertanyaan terkait Syarat dan Ketentuan ini, silakan hubungi kami di email rizkyalkus12@gmail.com atau melalui website desasejahteraastraawards.id.',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9ff' }}>
      <Content>
        {/* Hero Header */}
        <section style={{
          position: 'relative',
          minHeight: isMobile ? 280 : 360,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* Background */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img src={heroBg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,91,170,0.85) 0%, rgba(0,61,122,0.9) 100%)' }} />
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: `0 ${px}`, maxWidth: 700 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ color: 'rgba(255,255,255,0.8)', marginBottom: isMobile ? 20 : 32, fontWeight: 600 }}
            >
              Kembali
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: isMobile ? 16 : 20 }}>
              <FileTextOutlined style={{ fontSize: isMobile ? 28 : 36, color: '#fff' }} />
            </div>
            <Title level={isMobile ? 2 : 1} style={{ color: '#fff', fontWeight: 700, marginBottom: 12 }}>
              Syarat dan Ketentuan Layanan
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: isMobile ? 14 : 16, display: 'block', marginBottom: 8 }}>
              Desa Sejahtera Astra Awards
            </Text>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 16px' }}>
              <CalendarOutlined style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }} />
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Terakhir diperbarui: 28 Juni 2026</Text>
            </div>
          </div>

          {/* Gradient bawah */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to bottom, transparent 0%, #f8f9ff 100%)', zIndex: 2 }} />
        </section>

        {/* Intro */}
        <section style={{ padding: `${isMobile ? 32 : 48}px ${px}`, background: '#f8f9ff' }}>
          <div style={{ maxWidth: 768, margin: '0 auto' }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: isMobile ? '24px 20px' : '28px 32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <Text style={{ fontSize: isMobile ? 14 : 15, color: '#334155', lineHeight: 1.8 }}>
                Dengan mengakses dan menggunakan platform Desa Sejahtera Astra Awards ("platform"), Anda menyetujui Syarat dan Ketentuan Layanan ini. Harap baca dengan seksama sebelum menggunakan platform kami.
              </Text>
            </div>
          </div>
        </section>

        {/* Sections */}
        <section style={{ padding: `0 ${px} ${isMobile ? 48 : 80}px`, background: '#f8f9ff' }}>
          <div style={{ maxWidth: 768, margin: '0 auto' }}>
            {sections.map((section, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: isMobile ? '24px 20px' : '28px 32px',
                  marginBottom: 16,
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#1870F0';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 14 : 20 }}>
                  {/* Nomor */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'linear-gradient(135deg, #005BAA, #1870F0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Text strong style={{ color: '#fff', fontSize: 14 }}>{section.num}</Text>
                  </div>
                  {/* Konten */}
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: isMobile ? 15 : 16, color: '#1e293b', display: 'block', marginBottom: 8 }}>
                      {section.title}
                    </Text>
                    <Text style={{ fontSize: isMobile ? 13 : 14, color: '#475569', lineHeight: 1.8 }}>
                      {section.content}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Content>

      {/* Footer */}
      <Footer style={{ padding: `${isMobile ? 24 : 32}px ${px}px`, background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: isMobile ? 12 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={astraLogo} alt="Astra" style={{ height: 20, filter: 'brightness(0) invert(1)', opacity: 0.6 }} />
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>© 2026 Astra International. All Rights Reserved.</Text>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer' }} onClick={() => navigate('/terms')}>Ketentuan Layanan</Text>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>Beranda</Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default TermsPage;
