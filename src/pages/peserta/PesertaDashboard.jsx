import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Spin,
  Modal,
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleFilled,
  SearchOutlined,
  FormOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useRegistration from '../../hooks/useRegistration';

const { Title, Text, Paragraph } = Typography;

const PesertaDashboard = () => {
  const navigate = useNavigate();
  const { registration, loading, hasRegistration } = useRegistration();
  const [detailOpen, setDetailOpen] = useState(false);

  // Loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" description="Memuat data..." />
      </div>
    );
  }

  // Belum ada registrasi → redirect ke form
  if (!hasRegistration) {
    navigate('/peserta/pendaftaran', { replace: true });
    return null;
  }

  // Data dari API
  const reg = registration;
  const nama = reg?.user?.name || 'Peserta';
  const namaDesa = reg?.villageName || '—';
  const namaKelompok = reg?.groupName || '—';
  const namaLabel = reg?.dsaType === 'Individu' ? 'Nama Peserta' : 'Nama Penanggung Jawab';
  const pilar = reg?.pillar?.name || '—';
  const status = reg?.status || 'draft';

  const statusLabel = {
    draft: 'Draft',
    waiting_screening: 'Menunggu Screening',
    being_assessed: 'Sedang Dinilai',
    assessed: 'Selesai Dinilai',
    finalist: 'Finalis',
  }[status] || status;

  const statusStep = {
    draft: 0,
    waiting_screening: 1,
    being_assessed: 2,
    assessed: 3,
    finalist: 4,
  }[status] || 0;

  const statusSteps = [
    { title: 'Registration', icon: <CheckCircleFilled />, completed: statusStep >= 1 },
    { title: 'Screening', icon: <SearchOutlined />, current: statusStep === 1, completed: statusStep > 1 },
    { title: 'Assessment', icon: <FormOutlined />, current: statusStep === 2, completed: statusStep > 2 },
    { title: 'Finalist', icon: <TrophyOutlined />, current: statusStep >= 3, completed: statusStep > 3 },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
          padding: '36px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            right: -60,
            top: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 20,
            top: -90,
            width: 280,
            height: 280,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 60,
            top: -40,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />

        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={24} md={16}>
            <Title level={3} style={{ color: '#fff', margin: 0, marginBottom: 8, fontWeight: 600, fontSize: 22 }}>
              Selamat Datang, {nama}!
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6 }}>
              Pantau kemajuan pendaftaran dan kelola informasi program desa Anda di sini.
            </Text>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <div
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                borderRadius: 12,
                padding: '14px 20px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.5)',
                  display: 'block',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Status Saat Ini
              </Text>
              <Space size={8}>
                <ClockCircleOutlined style={{ color: '#60a5fa', fontSize: 16 }} />
                <Text strong style={{ color: '#fff', fontSize: 14 }}>
                  {statusLabel}
                </Text>
              </Space>
            </div>
          </Col>
        </Row>

        {/* Progress Steps */}
        <div style={{ marginTop: 32 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: 640,
            }}
          >
            {statusSteps.map((step, index) => (
              <React.Fragment key={step.title}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: step.completed
                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                        : step.current
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        : 'rgba(255,255,255,0.15)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '0 auto',
                      fontSize: 18,
                      color: '#fff',
                      border: step.current ? '3px solid rgba(255,255,255,0.4)' : 'none',
                      boxShadow: step.completed || step.current
                        ? '0 4px 12px rgba(0,0,0,0.2)'
                        : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {step.icon}
                  </div>
                  <Text
                    style={{
                      color: step.completed || step.current ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontSize: 12,
                      fontWeight: step.completed || step.current ? 600 : 400,
                      marginTop: 8,
                      display: 'block',
                    }}
                  >
                    {step.title}
                  </Text>
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      background: step.completed
                        ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                        : 'rgba(255,255,255,0.15)',
                      margin: '0 8px',
                      marginBottom: 22,
                      borderRadius: 2,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '16px' }}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            {/* Ringkasan Pendaftaran */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileTextOutlined style={{ color: '#2563eb', fontSize: 16 }} />
                  </div>
                  <span style={{ fontWeight: 600 }}>Ringkasan Pendaftaran</span>
                </div>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => setDetailOpen(true)}
                  style={{
                    padding: 0,
                    color: '#2563eb',
                    fontWeight: 500,
                  }}
                >
                  Lihat Detail <ArrowRightOutlined style={{ fontSize: 12 }} />
                </Button>
              }
              style={{
                marginBottom: 24,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: 10,
                      padding: '16px 18px',
                      height: '100%',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Text
                      style={{
                        color: '#64748b',
                        fontSize: 11,
                        display: 'block',
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Pilar Program
                    </Text>
                    <Text strong style={{ fontSize: 15, color: '#1e293b' }}>
                      {pilar}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: 10,
                      padding: '16px 18px',
                      height: '100%',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Text
                      style={{
                        color: '#64748b',
                        fontSize: 11,
                        display: 'block',
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Nama Desa
                    </Text>
                    <Text strong style={{ fontSize: 15, color: '#1e293b' }}>
                      {namaDesa}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: 10,
                      padding: '16px 18px',
                      height: '100%',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Text
                      style={{
                        color: '#64748b',
                        fontSize: 11,
                        display: 'block',
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {namaLabel}
                    </Text>
                    <Text strong style={{ fontSize: 15, color: '#1e293b' }}>
                      {namaKelompok}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Informasi Program */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <InfoCircleOutlined style={{ color: '#2563eb', fontSize: 16 }} />
                  </div>
                  <span style={{ fontWeight: 600 }}>Informasi Program Desa Sejahtera Astra</span>
                </div>
              }
              style={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    color: '#2563eb',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'block',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Latar Belakang
                </Text>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: 10,
                    padding: '16px 20px',
                    borderLeft: '4px solid #2563eb',
                  }}
                >
                  <Paragraph
                    style={{
                      margin: 0,
                      color: '#475569',
                      lineHeight: 1.8,
                      fontSize: 13,
                    }}
                  >
                    Desa Sejahtera Astra (DSA) merupakan program kontribusi sosial berkelanjutan Astra
                    yang berfokus pada pengembangan ekonomi desa berbasis potensi lokal. Melalui
                    pendampingan intensif, Astra berkomitmen untuk meningkatkan kemandirian ekonomi
                    masyarakat melalui pilar-pilar strategis seperti kewirausahaan, pendidikan, dan
                    lingkungan.
                  </Paragraph>
                </div>
              </div>

              <div>
                <Text
                  style={{
                    color: '#2563eb',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'block',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Dampak Program
                </Text>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: 10,
                    padding: '16px 20px',
                    borderLeft: '4px solid #2563eb',
                  }}
                >
                  <Paragraph
                    style={{
                      margin: 0,
                      color: '#475569',
                      lineHeight: 1.8,
                      fontSize: 13,
                    }}
                  >
                    Program ini ditargetkan untuk menciptakan minimal 100 lapangan kerja baru di
                    tingkat desa dalam 2 tahun pertama, meningkatkan pendapatan rata-rata rumah
                    tangga peserta sebesar 25%, serta mengintegrasikan teknologi digital dalam rantai
                    pasok produk unggulan desa.
                  </Paragraph>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Sidebar */}
          <Col xs={24} lg={8}>
            {/* Butuh Bantuan */}
            <Card
              style={{
                marginBottom: 24,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
              }}
              bodyStyle={{ padding: '28px 24px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto 18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <QuestionCircleOutlined style={{ fontSize: 28, color: '#fff' }} />
                </div>
                <Text
                  strong
                  style={{
                    color: '#fff',
                    fontSize: 17,
                    display: 'block',
                    marginBottom: 10,
                  }}
                >
                  Butuh Bantuan?
                </Text>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.85)',
                    display: 'block',
                    marginBottom: 20,
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  Tim pendamping Astra siap membantu Anda dalam setiap tahapan program.
                </Text>
                <Button
                  onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
                  style={{
                    background: '#fff',
                    borderColor: '#fff',
                    color: '#2563eb',
                    fontWeight: 600,
                    height: 42,
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  block
                >
                  Hubungi Support
                </Button>
              </div>
            </Card>

            {/* Aktivitas Terakhir */}
            {/* <Card
              title={
                <Text strong style={{ fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Aktivitas Terakhir
                </Text>
              }
              style={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
              }}
              bodyStyle={{ padding: '16px 20px' }}
            >
              <div style={{ padding: '4px 0' }}>
                {[
                  {
                    color: '#22c55e',
                    title: 'Pendaftaran Terverifikasi',
                    time: '2 hari yang lalu',
                  },
                  {
                    color: '#3b82f6',
                    title: 'Memulai Tahap Screening',
                    time: '1 hari yang lalu',
                  },
                  {
                    color: '#f59e0b',
                    title: 'Formulir Dikirim',
                    time: '3 hari yang lalu',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      marginBottom: index < 2 ? 18 : 0,
                      padding: '8px 0',
                      borderBottom: index < 2 ? '1px solid #f1f5f9' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: item.color,
                        marginTop: 5,
                        flexShrink: 0,
                        boxShadow: `0 0 0 3px ${item.color}20`,
                      }}
                    />
                    <div>
                      <Text strong style={{ display: 'block', fontSize: 13, color: '#1e293b', marginBottom: 2 }}>
                        {item.title}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.time}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card> */}
          </Col>
        </Row>
      </div>

      {/* Modal Detail Pendaftaran */}
      <Modal
        open={detailOpen}
        closable={false}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            Tutup
          </Button>,
        ]}
        width={720}
        styles={{ body: { padding: 0 } }}
      >
        <div>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            padding: '24px 28px',
            borderRadius: '12px 12px 0 0',
            position: 'relative',
          }}>
            <Button
              type="text"
              icon={<CloseOutlined style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }} />}
              onClick={() => setDetailOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
            />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Detail Pendaftaran
            </Text>
            <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: 20 }}>
              {namaDesa}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 6, display: 'block' }}>
              {namaKelompok}
            </Text>
          </div>

          {/* Content */}
          <div style={{ padding: '24px 28px 28px' }}>
            {/* Identitas Pendaftar */}
            <div style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                🏷️ Identitas Pendaftar
              </Text>
              <Row gutter={[20, 16]}>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Jenis DSA</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.dsaType || '—'}</Text>
                </Col>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nomor HP</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.phoneNumber || '—'}</Text>
                </Col>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nama Kontak Darurat</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.emergencyContactName || '—'}</Text>
                </Col>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>No HP Kontak Darurat</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.emergencyContactPhone || '—'}</Text>
                </Col>
              </Row>
            </div>

            {/* Informasi Program */}
            <div style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                📋 Informasi Program
              </Text>
              <Row gutter={[20, 16]}>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Pilar</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.pillar?.name || '—'}</Text>
                </Col>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Kategori</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.category?.name || '—'}</Text>
                </Col>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Grup Astra</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.astraGroup?.name || '—'}</Text>
                </Col>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Durasi Program</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.programDuration || '—'}</Text>
                </Col>
              </Row>
            </div>

            {/* Lokasi & Wilayah */}
            <div style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                📍 Lokasi & Wilayah
              </Text>
              <Row gutter={[20, 16]}>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Provinsi</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.province?.name || '—'}</Text>
                </Col>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Kabupaten / Kota</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.city?.name || '—'}</Text>
                </Col>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Kecamatan</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.district?.name || '—'}</Text>
                </Col>
                <Col xs={12} sm={8}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Desa / Kelurahan</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.villageRegion?.name || '—'}</Text>
                </Col>
                <Col span={24}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Alamat Lengkap</Text>
                  <Text style={{ fontSize: 13, lineHeight: 1.6 }}>{reg?.address || '—'}</Text>
                </Col>
              </Row>
            </div>

            {/* Deskripsi Program */}
            <div style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                📝 Deskripsi Program
              </Text>
              <div style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Latar Belakang</Text>
                <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #1890ff' }}>
                  <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{reg?.background || '—'}</Text>
                </div>
              </div>
              <div>
                <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Dampak Yang Sudah Terealisasi</Text>
                <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #52c41a' }}>
                  <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{reg?.programImpact || '—'}</Text>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Rencana Pengembangan</Text>
                <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #722ed1' }}>
                  <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{reg?.developmentPlan || '—'}</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PesertaDashboard;
