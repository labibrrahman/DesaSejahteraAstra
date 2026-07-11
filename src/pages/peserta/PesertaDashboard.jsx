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
import RegistrationDetailModal from '../../components/RegistrationDetailModal';

const { Title, Text, Paragraph } = Typography;

const PesertaDashboard = () => {
  const navigate = useNavigate();
  const { registration, dashboardData, loading, hasRegistration } = useRegistration();
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [announcementDate, setAnnouncementDate] = useState(null);

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
    if (allCategories.length > 0) {
      // 1. Max 2 registrations limit (regardless of status)
      if (registrations.length >= 2) {
        setCanAddMore(false);
        return;
      }

      // 2. Max 1 category per pillar limit
      if (registrations.length > 0) {
        const registeredPillarIds = registrations
          .map(r => r.pillarId || r.pillar?.id)
          .filter(Boolean);

        const hasMoreCombos = allCategories.some(
          cat => {
            const pId = cat.pillarId || cat.pillar?.id;
            // Cannot register if this pilar is already registered
            if (registeredPillarIds.includes(pId)) return false;
            return true;
          }
        );
        setCanAddMore(hasMoreCombos);
      } else {
        setCanAddMore(true);
      }
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
        const sadSetting = settings.find(s => s.key === 'selection_announcement_date');
        if (sadSetting?.value) {
          setAnnouncementDate(sadSetting.value);
        }
      }).catch(() => {});
    });
  }, []);

  const nama = registrations[0]?.user?.name || 'Peserta';

  const isAnnouncementPassed = React.useMemo(() => {
    if (!announcementDate) return false;
    try {
      const annTime = new Date(announcementDate).getTime();
      const nowTime = new Date().getTime();
      return nowTime >= annTime;
    } catch {
      return false;
    }
  }, [announcementDate]);

  const processedRegistrations = React.useMemo(() => {
    if (!Array.isArray(registrations)) return [];
    return registrations.map(reg => {
      let status = reg.status || 'draft';
      if ((status === 'finalist' || status === 'rejected') && !isAnnouncementPassed) {
        status = 'assessed';
      }
      return {
        ...reg,
        status,
      };
    });
  }, [registrations, isAnnouncementPassed]);

  // Sembunyikan timeline jika semua pendaftaran rejected
  const allRejected = processedRegistrations.length > 0 && processedRegistrations.every(r => r.status === 'rejected');

  const leftItemsCount = processedRegistrations.length + (canAddMore ? 1 : 0);
  const cardSpan = leftItemsCount === 1 ? 24 : 12;

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

  // Data dari API
  const reg = registration;
  const dash = dashboardData;
  const nama = reg?.user?.name || 'Peserta';
  const namaDesa = reg?.villageName || '—';
  const namaKelompok = reg?.groupName || '—';
  const namaLabel = 'Nama Ketua Kelompok';
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
              Pantau kemajuan seleksi dan ikuti perkembangan Lomba Apresiasi Desa Sejahtera Astra Anda di sini.
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
      <div style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          {/* Left Column: Pendaftaran Saya */}
          <Col xs={24} lg={allRejected ? 24 : 16} xl={allRejected ? 24 : 17}>
            <div style={{ height: '40px', display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 600 }}>
                Pendaftaran Saya
              </Title>
            </div>
            <Row gutter={[20, 20]} align="stretch">
              {processedRegistrations.map(regItem => {
                const pk = getPilarKey(regItem.pillar?.name);
                const pilarConf = PILAR_CONFIG[pk];
                const IconComponent = pilarConf.Icon;
                const stat = regItem.status || 'draft';
                const statConf = STATUS_TAGS[stat];

                return (
                  <Col xs={24} sm={cardSpan} key={regItem.id} style={{ display: 'flex' }}>
                    <Card
                      style={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      styles={{
                        body: {
                          padding: 20,
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }
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
                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                          {(regItem.innovationTitle || regItem.innovation_title || regItem.summary?.innovation_title || regItem.program_info?.innovation_title) && (
                            <div style={{ marginBottom: 6 }}>
                              <Text style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Judul Inovasi</Text>
                              <Text strong style={{ fontSize: 13, color: '#1e293b' }}>
                                {regItem.innovationTitle || regItem.innovation_title || regItem.summary?.innovation_title || regItem.program_info?.innovation_title}
                              </Text>
                            </div>
                          )}
                          <div style={{ marginBottom: 6 }}>
                            <Text style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Nama Desa / Kelompok</Text>
                            <Text strong style={{ fontSize: 13, color: '#1e293b' }}>
                              {regItem.villageName || '—'} / {regItem.groupName || '—'}
                            </Text>
                          </div>
                          <div>
                            <Text style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Ketua Kelompok</Text>
                            <Text style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>
                              {regItem.groupName || '—'}
                            </Text>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section: Status Step + Actions */}
                      <div style={{ marginTop: '20px', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                        {/* Compact Status Step */}
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            {(() => {
                              const stepIdx = { draft: 0, waiting_screening: 1, being_assessed: 2, assessed: 3, finalist: 4, rejected: 4 }[stat] || 0;
                              const isFinal = stat === 'finalist' || stat === 'rejected';
                              const steps = [
                                { label: 'Draft', icon: <FileTextOutlined /> },
                                { label: 'Screening', icon: <SearchOutlined /> },
                                { label: 'Dinilai', icon: <FormOutlined /> },
                                { label: 'Selesai', icon: <CheckCircleFilled /> },
                              ];
                              return steps.map((s, i) => {
                                const completed = i < stepIdx;
                                const current = i === stepIdx;
                                const active = completed || current;
                                return (
                                  <React.Fragment key={i}>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                      <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: completed
                                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                          : current
                                            ? isFinal
                                              ? stat === 'finalist'
                                                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                                : 'linear-gradient(135deg, #ef4444, #dc2626)'
                                              : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                            : '#e5e7eb',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, color: active ? '#fff' : '#9ca3af',
                                        margin: '0 auto',
                                      }}>
                                        {completed || (current && isFinal) ? <CheckCircleFilled style={{ fontSize: 12 }} /> : s.icon}
                                      </div>
                                      <Text style={{
                                        fontSize: 10,
                                        color: active ? '#1e293b' : '#9ca3af',
                                        fontWeight: active ? 600 : 400,
                                        marginTop: 4,
                                        display: 'block',
                                        lineHeight: 1.2,
                                      }}>
                                        {s.label}
                                      </Text>
                                    </div>
                                    {i < steps.length - 1 && (
                                      <div style={{
                                        width: 20, height: 2, borderRadius: 1, flexShrink: 0,
                                        marginTop: 13,
                                      }}>
                                        <div style={{
                                          width: '100%', height: '100%', borderRadius: 1,
                                          background: completed ? '#22c55e' : '#e5e7eb',
                                        }} />
                                      </div>
                                    )}
                                  </React.Fragment>
                                );
                              });
                            })()}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div style={{ display: 'flex', gap: 10 }}>
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
                      </div>
                    </Card>
                  </Col>
                );
              })}

              {/* Add New Pillar Card */}
              {canAddMore && (
                <Col xs={24} sm={cardSpan} style={{ display: 'flex' }}>
                  <div
                    onClick={() => navigate('/register?mode=new')}
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: 12,
                      width: '100%',
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
          </Col>

          {/* Right Column: Jadwal Acara */}
          {!allRejected && (
            <Col xs={24} lg={8} xl={7}>
              <div className="hidden lg:block" style={{ height: '40px', marginBottom: 16 }} />
              <Card
                style={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  width: '100%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
                styles={{ body: { padding: 0 } }}
              >
                <div
                  style={{
                    maxHeight: '480px',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 transparent',
                  }}
                >
                  {timelineData.map((phase, phaseIdx) => (
                    <React.Fragment key={phaseIdx}>
                      <div
                        style={{
                          background: phaseIdx === 0 ? '#2563eb' : '#7c3aed',
                          padding: '10px 16px',
                          position: 'sticky',
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        <Text strong style={{ color: '#fff', fontSize: 12, letterSpacing: 0.5 }}>{phase.phase}</Text>
                      </div>
                      <div style={{ padding: '4px 0' }}>
                        {phase.schedules.map((schedule, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: idx < phase.schedules.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: '#cbd5e1' }} />
                            <div style={{ flex: 1 }}>
                              <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{schedule.date}</Text>
                              {schedule.activities.map((act, actIdx) => (
                                <Text key={actIdx} style={{ fontSize: 12, color: '#1e293b', display: 'block', marginTop: 2 }}>{act}</Text>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </Card>
            </Col>
          )}
        </Row>
      </div>

      {/* Modal Detail Pendaftaran */}
      <RegistrationDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        registration={reg}
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
