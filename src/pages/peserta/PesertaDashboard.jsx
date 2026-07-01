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
  Tag,
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
  PlusOutlined,
  MedicineBoxOutlined,
  ReadOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useRegistration from '../../hooks/useRegistration';
import astraLogo from '../../assets/images/astra-logo.png';
import satuIndoLogo from '../../assets/images/satu-indonesia-logo.png';
import RegistrationDetailModal from '../../components/RegistrationDetailModal';

const { Title, Text, Paragraph } = Typography;

const PILAR_CONFIG = {
  kesehatan:     { Icon: MedicineBoxOutlined, color: '#10b981', bgLight: '#ecfdf5', label: 'Kesehatan' },
  pendidikan:    { Icon: ReadOutlined,        color: '#8b5cf6', bgLight: '#f5f3ff', label: 'Pendidikan' },
  lingkungan:    { Icon: EnvironmentOutlined, color: '#22c55e', bgLight: '#f0fdf4', label: 'Lingkungan' },
  kewirausahaan: { Icon: ShopOutlined,        color: '#f59e0b', bgLight: '#fffbeb', label: 'Kewirausahaan' },
};

const getPilarKey = (name) => {
  if (!name) return 'kewirausahaan';
  const lower = name.toLowerCase();
  if (lower.includes('kesehatan')) return 'kesehatan';
  if (lower.includes('pendidikan')) return 'pendidikan';
  if (lower.includes('lingkungan')) return 'lingkungan';
  return 'kewirausahaan';
};

const STATUS_TAGS = {
  draft: { label: 'Draft', color: 'default' },
  waiting_screening: { label: 'Menunggu Screening', color: 'processing' },
  being_assessed: { label: 'Sedang Dinilai', color: 'warning' },
  assessed: { label: 'Selesai Dinilai', color: 'blue' },
  finalist: { label: 'Lolos', color: 'success' },
  rejected: { label: 'Tidak Lolos', color: 'error' },
};

const PesertaDashboard = () => {
  const navigate = useNavigate();
  const { registrations, dashboardData, loading, hasRegistration } = useRegistration();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [timelineData, setTimelineData] = useState([]);

  const [allCategories, setAllCategories] = useState([]);
  const [canAddMore, setCanAddMore] = useState(false);

  // Fetch all pillars & categories on mount
  React.useEffect(() => {
    if (hasRegistration) {
      import('../../services/masterService').then(({ default: masterService }) => {
        masterService.getPillars().then(async (pillarsData) => {
          const cats = [];
          for (const p of pillarsData) {
            try {
              const c = await masterService.getCategories(p.id);
              if (Array.isArray(c)) cats.push(...c);
            } catch { /* ignore */ }
          }
          setAllCategories(cats);
        }).catch(() => {});
      });
    }
  }, [hasRegistration]);

  // Check if user can add more registrations
  React.useEffect(() => {
    if (allCategories.length > 0 && registrations.length > 0) {
      const registeredCombos = registrations
        .filter(r => r.pillarId && r.categoryId)
        .map(r => `${r.pillarId}__${r.categoryId}`);

      const hasMoreCombos = allCategories.some(
        cat => !registeredCombos.includes(`${cat.pillarId || cat.pillar?.id}__${cat.id}`)
      );
      setCanAddMore(hasMoreCombos);
    } else if (allCategories.length > 0 && registrations.length === 0) {
      setCanAddMore(true);
    }
  }, [allCategories, registrations]);

  // Fetch timeline dari system-settings
  React.useEffect(() => {
    import('../../services/menuService').then(({ default: menuService }) => {
      menuService.getSystemSettings().then(result => {
        const settings = Array.isArray(result) ? result : [];
        const tlSetting = settings.find(s => s.key === 'timeline');
        if (tlSetting?.value) {
          try {
            const parsed = JSON.parse(tlSetting.value);
            setTimelineData(Array.isArray(parsed) ? parsed : []);
          } catch { /* ignore invalid JSON */ }
        }
      }).catch(() => {});
    });
  }, []);

  const STATUS_ORDER = ['draft', 'waiting_screening', 'being_assessed', 'assessed', 'finalist', 'rejected'];

  // Find registration with the most advanced status for Welcome Banner step progress
  const mostAdvancedReg = registrations.reduce((most, r) => {
    return STATUS_ORDER.indexOf(r.status) > STATUS_ORDER.indexOf(most?.status ?? 'draft') ? r : most;
  }, registrations[0] ?? null);

  const status = mostAdvancedReg?.status || 'draft';
  const nama = registrations[0]?.user?.name || 'Peserta';

  // Auto-open status modal untuk finalist/rejected
  React.useEffect(() => {
    if (status === 'finalist' || status === 'rejected') {
      setStatusModalOpen(true);
    }
  }, [status]);

  // Belum ada registrasi → redirect ke form
  React.useEffect(() => {
    if (!loading && !hasRegistration) {
      navigate('/register', { replace: true });
    }
  }, [loading, hasRegistration, navigate]);

  // Loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" description="Memuat data..." />
      </div>
    );
  }

  if (!hasRegistration) {
    return null;
  }

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
              Pantau kemajuan seleksi dan ikuti perkembangan Lomba Apresiasi Desa Sejahtera Astra Anda di sini.
            </Text>
          </Col>
          <Col xs={24} sm={24} md={8} style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
            {!isFinal && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 12,
                  padding: '12px 18px',
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
                  Status Seleksi Terjauh
                </Text>
                <Space size={8}>
                  <ClockCircleOutlined style={{ color: '#60a5fa', fontSize: 16 }} />
                  <Text strong style={{ color: '#fff', fontSize: 14 }}>
                    {STATUS_TAGS[status]?.label || 'Draft'}
                  </Text>
                </Space>
              </div>
            )}
            {canAddMore && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/register?mode=new')}
                style={{
                  height: 40,
                  borderRadius: 8,
                  fontWeight: 600,
                  background: '#2563eb',
                  borderColor: '#2563eb',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                }}
              >
                Tambah Pilar Baru
              </Button>
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
      <div style={{ padding: '24px' }}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            {/* Daftar Pendaftaran */}
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ marginBottom: 16, color: '#0f172a', fontWeight: 600 }}>
                Pendaftaran Saya
              </Title>
              <Row gutter={[16, 16]}>
                {registrations.map(regItem => {
                  const pk = getPilarKey(regItem.pillar?.name);
                  const pilarConf = PILAR_CONFIG[pk];
                  const IconComponent = pilarConf.Icon;
                  const stat = regItem.status || 'draft';
                  const statConf = STATUS_TAGS[stat];

                  return (
                    <Col xs={24} sm={12} key={regItem.id}>
                      <Card
                        style={{
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                        bodyStyle={{
                          padding: 20,
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          {/* Card Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 8,
                                  background: pilarConf.bgLight,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <IconComponent style={{ color: pilarConf.color, fontSize: 20 }} />
                              </div>
                              <div>
                                <Text strong style={{ fontSize: 15, color: '#0f172a', display: 'block' }}>
                                  {regItem.pillar?.name || 'Pilar'}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Kategori: {regItem.category?.name || '—'}
                                </Text>
                              </div>
                            </div>
                            <Tag color={statConf.color} style={{ margin: 0, borderRadius: 6, padding: '2px 8px', fontWeight: 500 }}>
                              {statConf.label}
                            </Tag>
                          </div>

                          {/* Card Content Summary */}
                          <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
                            <div style={{ marginBottom: 6 }}>
                              <Text style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Nama Desa / Kelompok</Text>
                              <Text strong style={{ fontSize: 13, color: '#1e293b' }}>
                                {regItem.villageName || '—'} / {regItem.groupName || '—'}
                              </Text>
                            </div>
                            <div>
                              <Text style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Ketua Kelompok</Text>
                              <Text style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>
                                {regItem.leaderName || regItem.groupName || '—'}
                              </Text>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                          <Button
                            style={{ flex: 1, borderRadius: 8 }}
                            onClick={() => {
                              setSelectedReg(regItem);
                              setDetailOpen(true);
                            }}
                          >
                            Lihat Detail
                          </Button>
                          {stat === 'draft' && (
                            <Button
                              type="primary"
                              icon={<EditOutlined />}
                              style={{ flex: 1, borderRadius: 8, background: '#2563eb', borderColor: '#2563eb' }}
                              onClick={() => navigate(`/register?id=${regItem.id}`)}
                            >
                              Edit Draft
                            </Button>
                          )}
                        </div>
                      </Card>
                    </Col>
                  );
                })}

                {/* Add New Pillar Card */}
                {canAddMore && (
                  <Col xs={24} sm={12}>
                    <div
                      onClick={() => navigate('/register?mode=new')}
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: 12,
                        height: '100%',
                        minHeight: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: 24,
                        transition: 'all 0.2s',
                        background: '#fff',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.background = '#eff6ff';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.background = '#fff';
                      }}
                    >
                      <PlusOutlined style={{ fontSize: 24, color: '#64748b', marginBottom: 12 }} />
                      <Text strong style={{ fontSize: 14, color: '#475569', display: 'block', textAlign: 'center' }}>
                        Daftar Pilar / Kategori Baru
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                        Daftarkan desa Anda untuk pilar lomba lainnya.
                      </Text>
                    </div>
                  </Col>
                )}
              </Row>
            </div>

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
              {timelineData.map((phase, phaseIdx) => (
                <React.Fragment key={phaseIdx}>
                  <div style={{ background: phaseIdx === 0 ? '#2563eb' : '#7c3aed', padding: '12px 20px' }}>
                    <Text strong style={{ color: '#fff', fontSize: 13, letterSpacing: 0.5 }}>{phase.phase}</Text>
                  </div>
                  {phase.schedules.map((schedule, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 20px', borderBottom: idx < phase.schedules.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: '#d1d5db' }} />
                      <div style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{schedule.date}</Text>
                        {schedule.activities.map((act, actIdx) => (
                          <Text key={actIdx} style={{ fontSize: 13, color: '#1e293b', display: 'block', marginTop: 2 }}>{act}</Text>
                        ))}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
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
                  onClick={() => {
                    const url = dashboardData?.support?.whatsapp || 'https://wa.me/6285713043230';
                    if (url.match(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//)) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  }}
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
          </Col>
        </Row>
      </div>

      {/* Modal Detail Pendaftaran */}
      <RegistrationDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        registration={selectedReg}
      />

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
