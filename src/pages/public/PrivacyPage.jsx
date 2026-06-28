import React, { useEffect } from 'react';
import { Typography, Layout, Button } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useIsMobile from '../../hooks/useIsMobile';
import astraLogo from '../../assets/images/astra-logo.png';
import heroBg from '../../assets/LandingPageAsset/ASET-01.png';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;

const PrivacyPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const isMobile = useIsMobile();
  const px = isMobile ? 20 : 30;

  const sections = [
    {
      num: '01',
      title: 'Informasi yang Kami Kumpulkan',
      content: 'Saat Anda mendaftar atau masuk menggunakan akun Google, kami hanya mengumpulkan nama lengkap yang digunakan sebagai identitas akun Anda di platform, dan alamat email yang digunakan untuk komunikasi dan identifikasi akun. Kami tidak mengumpulkan kata sandi, nomor telepon, lokasi, atau informasi sensitif lainnya.',
    },
    {
      num: '02',
      title: 'Cara Kami Menggunakan Informasi',
      content: 'Informasi yang kami kumpulkan digunakan semata-mata untuk membuat dan mengelola akun Anda di platform, menampilkan identitas Anda dalam proses pendaftaran dan penilaian program, serta mengirimkan notifikasi penting terkait program jika diperlukan. Kami tidak menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga untuk tujuan komersial.',
    },
    {
      num: '03',
      title: 'Penggunaan Google OAuth',
      content: 'Platform kami menggunakan layanan Google OAuth 2.0 untuk autentikasi. Dengan masuk menggunakan akun Google, Anda menyetujui bahwa kami menerima nama dan alamat email dari profil Google Anda. Proses ini tunduk pada Kebijakan Privasi Google (https://policies.google.com/privacy).',
    },
    {
      num: '04',
      title: 'Penyimpanan dan Keamanan Data',
      content: 'Data Anda disimpan di server yang berlokasi di Indonesia dan dilindungi dengan langkah-langkah keamanan teknis yang memadai, termasuk enkripsi data saat transit (HTTPS/TLS) dan kontrol akses yang ketat. Kami akan memberitahu Anda jika terjadi pelanggaran data yang berdampak pada informasi Anda.',
    },
    {
      num: '05',
      title: 'Retensi Data',
      content: 'Data Anda akan disimpan selama akun Anda aktif atau selama diperlukan untuk keperluan program Desa Sejahtera Astra Awards. Setelah program selesai, data dapat dihapus atas permintaan Anda.',
    },
    {
      num: '06',
      title: 'Hak Anda',
      content: 'Anda memiliki hak untuk mengakses data pribadi yang kami miliki tentang Anda, meminta koreksi data yang tidak akurat, dan meminta penghapusan akun dan data Anda dari platform kami. Untuk menggunakan hak-hak tersebut, silakan hubungi kami melalui email di bawah.',
    },
    {
      num: '07',
      title: 'Cookie',
      content: 'Platform kami menggunakan cookie sesi yang diperlukan untuk menjaga status login Anda. Kami tidak menggunakan cookie pelacak atau iklan.',
    },
    {
      num: '08',
      title: 'Perubahan Kebijakan Privasi',
      content: 'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau pemberitahuan di platform. Tanggal pembaruan terakhir selalu tercantum di bagian atas halaman ini.',
    },
    {
      num: '09',
      title: 'Hubungi Kami',
      content: 'Jika Anda memiliki pertanyaan atau kekhawatiran terkait Kebijakan Privasi ini, silakan hubungi kami di email rizkyalkus12@gmail.com atau melalui website desasejahteraastraawards.id.',
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
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img src={heroBg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,91,170,0.85) 0%, rgba(0,61,122,0.9) 100%)' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: `0 ${px}`, maxWidth: 700 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ color: 'rgba(255,255,255,0.8)', marginBottom: isMobile ? 20 : 32, fontWeight: 600 }}>
              Kembali
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: isMobile ? 16 : 20 }}>
              <LockOutlined style={{ fontSize: isMobile ? 28 : 36, color: '#fff' }} />
            </div>
            <Title level={isMobile ? 2 : 1} style={{ color: '#fff', fontWeight: 700, marginBottom: 12 }}>
              Kebijakan Privasi
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: isMobile ? 14 : 16, display: 'block', marginBottom: 8 }}>
              Desa Sejahtera Astra Awards
            </Text>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 16px' }}>
              <CalendarOutlined style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }} />
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Terakhir diperbarui: 28 Juni 2026</Text>
            </div>
          </div>

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
                Kebijakan Privasi ini menjelaskan bagaimana Desa Sejahtera Astra Awards ("kami") mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan platform kami di desasejahteraastraawards.id.
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
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#1870F0'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 14 : 20 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Text strong style={{ color: '#fff', fontSize: 14 }}>{section.num}</Text>
                  </div>
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
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer' }} onClick={() => navigate('/privacy')}>Kebijakan Privasi</Text>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer' }} onClick={() => navigate('/terms')}>Ketentuan Layanan</Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default PrivacyPage;
