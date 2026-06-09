import React, { useState } from 'react';
import { Button, Row, Col, Typography, Space, Layout, Collapse } from 'antd';
import {
  HeartOutlined,
  ReadOutlined,
  GlobalOutlined,
  ShopOutlined,
  ArrowRightOutlined,
  LoginOutlined,
  PlusOutlined,
  MinusOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import astraLogo from '../../assets/images/astra-logo.png';
import satuIndoLogo from '../../assets/images/satu-indonesia-logo.png';

const { Title, Paragraph, Text, Link } = Typography;
const { Header, Content, Footer } = Layout;

const pilarData = [
  {
    icon: <HeartOutlined style={{ fontSize: 28, color: '#fff' }} />,
    title: 'Kesehatan',
    description: 'Meningkatkan kualitas hidup warga melalui akses layanan kesehatan dasar. Fokus pada pencegahan stunting dan penyedian sarana medis yang memadai.',
    color: '#1890ff',
  },
  {
    icon: <ReadOutlined style={{ fontSize: 28, color: '#fff' }} />,
    title: 'Pendidikan',
    description: 'Mendorong kecerdasan bangsa dengan bantuan sarana belajar dan pelatihan guru. Memberikan beasiswa bagi siswa berprestasi di wilayah pelosok.',
    color: '#1890ff',
  },
  {
    icon: <GlobalOutlined style={{ fontSize: 28, color: '#fff' }} />,
    title: 'Lingkungan',
    description: 'Menjaga kelestarian alam melalui program reboisasi dan pengolahan limbah mandiri. Menciptakan desa hijau yang tangguh terhadap perubahan iklim.',
    color: '#1890ff',
  },
  {
    icon: <ShopOutlined style={{ fontSize: 28, color: '#fff' }} />,
    title: 'Kewirausahaan',
    description: 'Membina UMKM lokal untuk naik kelas dan menembus pasar global yang luas. Menyediakan permodalan dan pelatihan manajemen usaha yang profesional.',
    color: '#1890ff',
  },
];

const statsData = [
  { number: '900+', label: 'Desa Terbina' },
  { number: '4.5M', label: 'Penerima Manfaat' },
  { number: '34', label: 'Provinsi Terjangkau' },
  { number: '15k', label: 'UMKM Berkembang' },
];

const faqData = [
  {
    question: 'Bagaimana cara mendaftarkan desa kami?',
    answer: 'Pendaftaran dapat dilakukan melalui tombol "Daftar Sekarang" di atas dengan mengisi formulir profil desa dan mengunggah dokumen pendukung program CSR yang sedang atau akan dijalankan. Tim Astra akan melakukan verifikasi data awal dalam waktu 7-14 hari kerja.',
  },
  {
    question: 'Apa saja kriteria penilaian utama?',
    answer: 'Kriteria penilaian meliputi aspek sosial, ekonomi, lingkungan, dan tata kelola desa. Setiap pilar dinilai berdasarkan dampak, keberlanjutan, dan keterlibatan masyarakat lokal.',
  },
  {
    question: 'Kapan pengumuman hasil penilaian dilakukan?',
    answer: 'Pengumuman hasil penilaian dilakukan setiap triwulan melalui situs resmi dan notifikasi langsung ke peserta yang terdaftar.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState([0]);

  const faqItems = faqData.map((item, index) => ({
    key: index,
    label: (
      <Text style={{ fontSize: 16, fontWeight: 500, color: '#1a1a2e' }}>
        {item.question}
      </Text>
    ),
    children: (
      <Paragraph style={{ fontSize: 15, color: '#555', lineHeight: 1.8 }}>
        {item.answer}
      </Paragraph>
    ),
  }));

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <Header
        style={{
          padding: '0 60px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: 80,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={astraLogo}
            alt="Astra Logo"
            style={{ height: 45, objectFit: 'contain' }}
          />
        </div>
        <Space size={32}>
          <Link
            style={{ fontSize: 15, color: '#333' }}
            onClick={() => {
              document.getElementById('tentang-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Tentang Program
          </Link>
          <Link
            style={{ fontSize: 15, color: '#333' }}
            onClick={() => {
              document.getElementById('kontak-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Kontak
          </Link>
          <Button
            type="primary"
            style={{ background: '#1890ff', borderColor: '#1890ff', borderRadius: 6, height: 38, paddingInline: 24 }}
            onClick={() => navigate('/login')}
          >
            Masuk
          </Button>
        </Space>
      </Header>

      <Content>
        {/* Hero Section */}
        <div
          style={{
            position: 'relative',
            minHeight: 480,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Background image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              zIndex: 0,
            }}
          />
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80"
            alt="Rice Field"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.4,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(26,26,46,0.85) 0%, rgba(22,33,62,0.7) 100%)',
              zIndex: 1,
            }}
          />
          <div style={{ position: 'relative', zIndex: 2, padding: '0 60px', maxWidth: 600 }}>
            <Title
              level={1}
              style={{
                color: '#fff',
                fontSize: 42,
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: 20,
              }}
            >
              Pemberdayaan Desa Menuju Sejahtera
            </Title>
            <Paragraph
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 16,
                lineHeight: 1.8,
                marginBottom: 32,
              }}
            >
              Platform pendaftaran dan penilaian program CSR Astra dalam empat pilar utama guna mewujudkan kemandirian ekonomi masyarakat desa.
            </Paragraph>
            <Space size={16}>
              <Button
                type="primary"
                size="large"
                style={{
                  background: '#1890ff',
                  borderColor: '#1890ff',
                  height: 46,
                  paddingInline: 28,
                  borderRadius: 8,
                  fontWeight: 500,
                }}
                onClick={() => navigate('/login')}
              >
                Daftar Sekarang
              </Button>
              <Button
                size="large"
                ghost
                style={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.5)',
                  height: 46,
                  paddingInline: 28,
                  borderRadius: 8,
                  fontWeight: 500,
                }}
                onClick={() => {
                  document.getElementById('tentang-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Pelajari Lebih Lanjut <ArrowRightOutlined />
              </Button>
            </Space>
          </div>
        </div>

        {/* 4 Pilar Section */}
        <div id="tentang-section" style={{ padding: '80px 60px', background: '#f8fafc' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Title level={2} style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
              4 Pilar Utama Pemberdayaan
            </Title>
            <Paragraph style={{ fontSize: 16, color: '#666', maxWidth: 550, margin: '0 auto' }}>
              Membangun ekosistem desa yang berkelanjutan melalui integrasi aspek esensial kehidupan masyarakat.
            </Paragraph>
          </div>
          <Row gutter={[24, 24]} justify="center">
            {pilarData.map((pilar, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '32px 24px',
                    height: '100%',
                    border: '1px solid #eee',
                    transition: 'box-shadow 0.3s, transform 0.3s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: '#e6f7ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                    }}
                  >
                    {React.cloneElement(pilar.icon, { style: { fontSize: 24, color: '#1890ff' } })}
                  </div>
                  <Title level={4} style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#1a1a2e' }}>
                    {pilar.title}
                  </Title>
                  <Paragraph style={{ fontSize: 14, color: '#666', lineHeight: 1.7, margin: 0 }}>
                    {pilar.description}
                  </Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Stats Section */}
        <div style={{ padding: '60px 60px', background: '#e6f7ff' }}>
          <Row gutter={[32, 32]} justify="center">
            {statsData.map((stat, index) => (
              <Col xs={12} sm={6} key={index} style={{ textAlign: 'center' }}>
                <Title style={{ color: '#1890ff', margin: 0, fontSize: 40, fontWeight: 700 }}>
                  {stat.number}
                </Title>
                <Text style={{ fontSize: 15, color: '#555', marginTop: 8, display: 'block' }}>
                  {stat.label}
                </Text>
              </Col>
            ))}
          </Row>
        </div>

        {/* FAQ Section */}
        <div id="faq-section" style={{ padding: '80px 60px', background: '#fff' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title level={2} style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
              Pertanyaan Sering Diajukan
            </Title>
            <Paragraph style={{ fontSize: 16, color: '#666', maxWidth: 500, margin: '0 auto' }}>
              Temukan jawaban cepat mengenai proses pendaftaran dan kriteria program.
            </Paragraph>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <Collapse
              items={faqItems}
              activeKey={activeFaq}
              onChange={(keys) => setActiveFaq(keys)}
              expandIconPosition="end"
              style={{
                background: 'transparent',
                border: 'none',
              }}
              size="large"
            />
          </div>
        </div>

        {/* Contact Section */}
        <div id="kontak-section" style={{ padding: '60px 60px', background: '#f8fafc' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Title level={3} style={{ fontSize: 24, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>
              Butuh Bantuan?
            </Title>
            <Paragraph style={{ fontSize: 15, color: '#666' }}>
              Hubungi tim kami untuk informasi lebih lanjut
            </Paragraph>
          </div>
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center', padding: 24 }}>
                <PhoneOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 12 }} />
                <br />
                <Text style={{ fontSize: 14, color: '#666' }}>Telepon</Text>
                <br />
                <Text style={{ fontSize: 15, fontWeight: 500 }}>+62 21 5000 1234</Text>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center', padding: 24 }}>
                <MailOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 12 }} />
                <br />
                <Text style={{ fontSize: 14, color: '#666' }}>Email</Text>
                <br />
                <Text style={{ fontSize: 15, fontWeight: 500 }}>csr@astra.co.id</Text>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center', padding: 24 }}>
                <EnvironmentOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 12 }} />
                <br />
                <Text style={{ fontSize: 14, color: '#666' }}>Alamat</Text>
                <br />
                <Text style={{ fontSize: 15, fontWeight: 500 }}>Jl. TB Simatupang, Jakarta</Text>
              </div>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Footer */}
      <Footer
        style={{
          padding: '32px 60px',
          background: '#1a1a2e',
          color: 'rgba(255,255,255,0.65)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Desa Sejahtera Astra
            </Text>
            <br />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              Astra International CSR Division
            </Text>
          </div>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            © 2024 Astra International. All Rights Reserved.
          </Text>
        </div>
      </Footer>
    </Layout>
  );
};

export default LandingPage;
