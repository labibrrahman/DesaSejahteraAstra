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
  TagOutlined,
  EnvironmentOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useRegistration from '../../hooks/useRegistration';
import astraLogo from '../../assets/images/astra-logo.png';
import satuIndoLogo from '../../assets/images/satu-indonesia-logo.png';

const { Title, Text, Paragraph } = Typography;

const PesertaDashboard = () => {
  const navigate = useNavigate();
  const { registration, dashboardData, loading, hasRegistration } = useRegistration();
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Auto-open status modal untuk finalist/rejected
  React.useEffect(() => {
    if (dashboardData?.registration?.status === 'finalist' || dashboardData?.registration?.status === 'rejected') {
      setStatusModalOpen(true);
    }
  }, [dashboardData?.registration?.status]);

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
    navigate('/register', { replace: true });
    return null;
  }

  // Data dari API
  const reg = registration;
  const dash = dashboardData;
  const nama = reg?.user?.name || 'Peserta';
  const namaDesa = reg?.villageName || '—';
  const namaKelompok = reg?.groupName || '—';
  const namaLabel = 'Nama Peserta / Penanggung Jawab';
  const pilar = reg?.pillar?.name || '—';
  const status = dash?.registration?.status || 'draft';

  // Gunakan status_label dari BE dashboard jika ada
  const statusLabel = dashboardData?.registration?.status_label || {
    draft: 'Draft',
    waiting_screening: 'Menunggu Screening',
    being_assessed: 'Sedang Dinilai',
    assessed: 'Selesai Dinilai',
    finalist: 'Selamat! Anda Lolos',
    rejected: 'Tidak Lolos',
  }[status] || status;

  const statusStep = {
    draft: 0,
    waiting_screening: 1,
    being_assessed: 2,
    assessed: 3,
    finalist: 4,
    rejected: 4,
  }[status] || 0;

  const isFinal = status === 'finalist' || status === 'rejected';

  const statusSteps = [
    { title: 'Registrasi', icon: <CheckCircleFilled />, completed: statusStep >= 1 },
    { title: 'Menunggu Screening', icon: <SearchOutlined />, current: statusStep === 1, completed: statusStep > 1 },
    { title: isFinal ? 'Sudah Dinilai' : 'Sedang Dinilai', icon: <FormOutlined />, current: statusStep === 2, completed: statusStep > 2 },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
          padding: '25px 32px',
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
        <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ paddingBottom:'20px' }}>
          <Col xs={12} sm={12} md={12}>
              <img src={astraLogo} alt="Astra Logo" style={{ height: 22, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </Col>
          <Col xs={12} sm={12} md={12} align="right">
              <img src={satuIndoLogo} alt="Satu Indonesia Logo" style={{ height: 35, objectFit: 'contain' }} />
          </Col>
        </Row>
 
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={24} md={16}>
            <Title level={3} style={{ color: '#fff', margin: 0, marginBottom: 8, fontWeight: 600, fontSize: 22 }}>
              Selamat Datang, <span style={{ whiteSpace: 'nowrap' }}>{nama}</span>!
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6 }}>
              Pantau kemajuan seleksi dan ikuti perkembangan Lomba 4 Pilar Astra Anda di sini.
            </Text>
          </Col>
          <Col xs={24} sm={24} md={8}>
            {!isFinal && (
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
            )}
          </Col>
        </Row>

        {/* Progress Steps */}
        <div style={{ marginTop: 32 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              // maxWidth: 640,
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

          {/* Status Message — Finalis / Ditolak */}
          {isFinal && (
            <div
              style={{
                marginTop: 24,
                padding: '16px 24px',
                borderRadius: 12,
                background: status === 'finalist' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${status === 'finalist' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {status === 'finalist'
                ? <CheckCircleFilled style={{ fontSize: 24, color: '#22c55e' }} />
                : <CloseOutlined style={{ fontSize: 24, color: '#ef4444' }} />
              }
              <div>
                <Text strong style={{ color: status === 'finalist' ? '#22c55e' : '#ef4444', fontSize: 15, display: 'block' }}>
                  {status === 'finalist' ? 'Selamat! Anda Lolos' : 'Maaf, Anda Tidak Lolos'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                  {status === 'finalist'
                    ? 'Pendaftaran Anda telah dinyatakan lolos ke tahap berikutnya.'
                    : 'Pendaftaran Anda belum memenuhi kriteria untuk tahap berikutnya.'}
                </Text>
              </div>
            </div>
          )}
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
                      Nama DSA
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

            {/* Timeline Acara — hide jika rejected */}
            {status !== 'rejected' && (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ClockCircleOutlined style={{ color: '#2563eb', fontSize: 16 }} />
                  </div>
                  <span style={{ fontWeight: 600 }}>Jadwal Acara</span>
                </div>
              }
              style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom:'20px' }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Tahap 1 */}
              <div style={{ background: '#2563eb', padding: '12px 20px' }}>
                <Text strong style={{ color: '#fff', fontSize: 13, letterSpacing: 0.5 }}>TAHAP 1 — PENDAFTARAN & SOSIALISASI</Text>
              </div>
              {[
                { date: '22 Juni', desc: 'Kick Off & Pembukaan Pendaftaran Lomba Inovasi', active: status === 'draft' },
                { date: '22 Juni – 11 Juli', desc: 'Open Registration', active: ['draft', 'waiting_screening'].includes(status) },
                { date: '30 Juni', desc: 'Sosialisasi Lomba Inovasi', active: false },
                { date: '13 – 17 Juli', desc: 'Proses Seleksi & Penilaian Tahap 1', active: ['waiting_screening', 'being_assessed'].includes(status) },
                { date: '21 – 23 Juli', desc: 'Pengumuman Hasil Seleksi Tahap 1 & Pengumuman Linimasa Tahap 2', active: ['assessed', 'finalist', 'rejected'].includes(status) },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 20px', borderBottom: idx < 4 ? '1px solid #f1f5f9' : 'none', background: item.active ? '#f0f7ff' : 'transparent' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: item.active ? '#2563eb' : '#d1d5db', boxShadow: item.active ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none' }} />
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{item.date}</Text>
                    <Text style={{ fontSize: 13, color: '#1e293b', display: 'block', marginTop: 2 }}>{item.desc}</Text>
                  </div>
                </div>
              ))}

              {/* Tahap 2 */}
              <div style={{ background: '#7c3aed', padding: '12px 20px' }}>
                <Text strong style={{ color: '#fff', fontSize: 13, letterSpacing: 0.5 }}>TAHAP 2 — PENJURIAN</Text>
              </div>
              {[
                { date: '28 Juli', desc: 'Kategori Kesehatan Kelompok (1-5), Kategori Pendidikan Kelompok (1-5)' },
                { date: '30 Juli', desc: 'Kategori Kesehatan Kelompok (6-10), Kategori Pendidikan Kelompok (6-10)' },
                { date: '4 Agustus', desc: 'Kategori Kesehatan Individual (1-5), Kategori Pendidikan Individual (1-5)' },
                { date: '6 Agustus', desc: 'Kategori Kesehatan Individual (6-10), Kategori Pendidikan Individual (6-10)' },
                { date: '11 Agustus', desc: 'Kategori Lingkungan Kelompok (1-5), Kategori Kewirausahaan Kelompok (1-5), Kategori Lingkungan Kelompok (6-10)' },
                { date: '13 Agustus', desc: 'Kategori Kewirausahaan Kelompok (6-10)' },
                { date: '18 Agustus', desc: 'Kategori Lingkungan Individual (1-5), Kategori Kewirausahaan Individual (1-5)' },
                { date: '20 Agustus', desc: 'Kategori Lingkungan Individual (6-10), Kategori Kewirausahaan Individual (6-10)' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 20px', borderBottom: idx < 7 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: '#d1d5db' }} />
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{item.date}</Text>
                    <Text style={{ fontSize: 13, color: '#1e293b', display: 'block', marginTop: 2 }}>{item.desc}</Text>
                  </div>
                </div>
              ))}
            </Card>
            )}
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
                  onClick={() => window.open(`${dashboardData?.support?.whatsapp || 'https://wa.me/6285713043230'}`, '_blank')}
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
                <TagOutlined style={{ marginRight: 6 }} /> Identitas Pendaftar
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
                <FileTextOutlined style={{ marginRight: 6 }} /> Informasi Program
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
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Binaan</Text>
                  <Text strong style={{ fontSize: 13 }}>{reg?.astraGroupCustom || reg?.astraGroup?.name || '—'}</Text>
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
                <EnvironmentOutlined style={{ marginRight: 6 }} /> Lokasi & Wilayah
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
                <EditOutlined style={{ marginRight: 6 }} /> Deskripsi Program
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

      {/* Status Modal — Finalist / Rejected */}
      <Modal
        open={statusModalOpen}
        closable={false}
        footer={[
          <Button key="close" type="primary" onClick={() => setStatusModalOpen(false)} style={{ background: status === 'finalist' ? '#10b981' : '#ef4444', borderColor: status === 'finalist' ? '#10b981' : '#ef4444' }}>
            Tutup
          </Button>,
        ]}
        width={480}
        centered
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: status === 'finalist' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: status === 'finalist' ? '0 8px 24px rgba(16,185,129,0.3)' : '0 8px 24px rgba(239,68,68,0.3)',
          }}>
            {status === 'finalist'
              ? <CheckCircleFilled style={{ fontSize: 40, color: '#fff' }} />
              : <CloseOutlined style={{ fontSize: 40, color: '#fff' }} />
            }
          </div>
          <Title level={3} style={{ marginBottom: 8, color: status === 'finalist' ? '#10b981' : '#ef4444' }}>
            {status === 'finalist' ? 'Selamat! Anda Lolos' : 'Maaf, Anda Tidak Lolos'}
          </Title>
          <Text style={{ fontSize: 15, color: '#64748b', display: 'block', lineHeight: 1.6 }}>
            {status === 'finalist'
              ? 'Pendaftaran Anda telah dinyatakan lolos ke tahap berikutnya. Silakan pantau perkembangan selanjutnya.'
              : 'Mohon maaf, pendaftaran Anda belum memenuhi kriteria untuk tahap berikutnya. Terima kasih telah berpartisipasi.'}
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default PesertaDashboard;
