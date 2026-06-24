import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Row, Col, Typography, Tag, Space, Input, Select,
  Checkbox, Modal, message, Spin, Progress, Tooltip,
} from 'antd';
import {
  SearchOutlined, ExportOutlined, CheckCircleOutlined, CloseCircleOutlined,
  UndoOutlined, EyeOutlined, FilterOutlined, TrophyOutlined,
  ClockCircleOutlined, TeamOutlined, BarChartOutlined,
  TagOutlined, FileTextOutlined, EnvironmentOutlined, EditOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';
import masterService from '../../services/masterService';

const { Title, Text } = Typography;
const { Option } = Select;

// ── Score Indicator ──────────────────────────────────────────────────────────
const getScoreIndicator = (score) => {
  if (score == null) return { label: '-', color: '#94a3b8' };
  if (score < 60) return { label: 'Rendah', color: '#ef4444' };
  if (score < 75) return { label: 'Cukup', color: '#f59e0b' };
  if (score < 90) return { label: 'Baik', color: '#22c55e' };
  return { label: 'Sangat Baik', color: '#2563eb' };
};

const getStatusSend = (isSend) => {
  if (isSend) return { label: 'Terkirim', color: '#22c55e' };
  return { label: 'Belum Dikirim', color: '#94a3b8' };
};

const STATUS_MAP = {
  'belum_diputuskan': { label: 'Belum Diputuskan', color: 'warning' },
  'lolos': { label: 'Lolos', color: 'success' },
  'tidak_lolos': { label: 'Tidak Lolos', color: '#ef4444' },
};

// ── Component ────────────────────────────────────────────────────────────────
const AdminSelectionReview = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ totalAssessed: 0, undecidedCount: 0, lolosCount: 0, tidakLolosCount: 0 });
  const [loading, setLoading] = useState(false);
  const [pilarOptions, setPilarOptions] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [pilarFilter, setPilarFilter] = useState(null);
  const [indicatorFilter, setIndicatorFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [durasiFilter, setDurasiFilter] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Detail modal (penilaian juri)
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailPeserta, setDetailPeserta] = useState(null);

  // Detail modal (registrasi peserta)
  const [regDetailVisible, setRegDetailVisible] = useState(false);
  const [regDetailData, setRegDetailData] = useState(null);
  const [regDetailLoading, setRegDetailLoading] = useState(false);

  const [previewPhoto, setPreviewPhoto] = useState(null);

  // ── Fetch data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (searchText) params.search = searchText;
      if (pilarFilter) params.pillar_id = pilarFilter;
      if (indicatorFilter) params.indicator = indicatorFilter;
      if (statusFilter) params.status = statusFilter;
      if (durasiFilter) params.program_duration = durasiFilter;

      const result = await adminService.getSelectionReview(params);
      setData(result.data || []);
      setSummary(result.summary || { totalAssessed: 0, undecidedCount: 0, lolosCount: 0, tidakLolosCount: 0 });
      setPagination(prev => ({ ...prev, current: result.page || page, total: result.total || 0 }));
    } catch (error) {
      message.error('Gagal memuat data seleksi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchText, pilarFilter, indicatorFilter, statusFilter, durasiFilter]);

  const fetchPilars = useCallback(async () => {
    try {
      const result = await masterService.getPillars();
      setPilarOptions((result || []).map(p => ({ id: p.id, name: p.name })));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchPilars(); }, [fetchPilars]);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (pilarFilter) params.pillar_id = pilarFilter;
      if (indicatorFilter) params.indicator = indicatorFilter;
      if (statusFilter) params.status = statusFilter;
      if (durasiFilter) params.program_duration = durasiFilter;

      const blob = await adminService.exportSelectionReview(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hasil-seleksi-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success('Export berhasil');
    } catch (error) {
      message.error('Gagal export data');
      console.error(error);
    }
  };

  // ── Decision (approve / reject / cancel) ──────────────────────────────────
  const handleDecision = async (action, ids) => {
    if (!ids || ids.length === 0) {
      message.warning('Pilih peserta terlebih dahulu');
      return;
    }

    const actionLabels = { approve: 'Meloloskan', reject: 'Menolak', cancel: 'Membatalkan' };
    const actionColors = { approve: '#10b981', reject: '#ef4444', cancel: '#f59e0b' };

    Modal.confirm({
      title: `${actionLabels[action]} Peserta`,
      content: `Anda yakin ingin ${actionLabels[action].toLowerCase()} ${ids.length} peserta?`,
      okText: 'Ya, Lanjutkan',
      cancelText: 'Batal',
      okButtonProps: { style: { background: actionColors[action], borderColor: actionColors[action] } },
      onOk: async () => {
        try {
          const result = await adminService.selectionDecision({ registrationIds: ids, action });
          message.success(result.message || `${actionLabels[action]} berhasil`);
          setSelectedRowKeys([]);
          fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
          const msg = error.response?.data?.message || 'Gagal memproses keputusan';
          message.error(msg);
        }
      },
    });
  };

  // ── Kirim Email Single ────────────────────────────────────────────────────
  const handleSendEmail = async (record) => {
    const templateType = record.status === 'finalist' ? 'finalist' : 'rejected';
    const subject = templateType === 'finalist'
      ? 'Selamat! Anda Terpilih Menjadi Finalis 4 Pilar DSA 2026'
      : 'Hasil Seleksi Pendaftaran 4 Pilar DSA 2026';

    Modal.confirm({
      title: 'Kirim Email',
      content: `Kirim email "${templateType}" ke ${record.namaDsa}?`,
      okText: 'Ya, Kirim',
      cancelText: 'Batal',
      okButtonProps: { style: { background: '#2563eb', borderColor: '#2563eb' } },
      onOk: async () => {
        try {
          const result = await adminService.sendSingleEmail(record.id, { templateType, subject });
          message.success(result.message || 'Email berhasil dikirim');
          fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error(error.response?.data?.message || 'Gagal mengirim email');
        }
      },
    });
  };

  // ── Kirim Email Bulk (semua yang lolos) ───────────────────────────────────
  const handleSendEmailAllLolos = () => {
    Modal.confirm({
      title: 'Kirim Email ke Semua Peserta Lolos',
      content: 'Semua peserta berstatus "Lolos" akan menerima email notifikasi. Lanjutkan?',
      okText: 'Ya, Kirim Semua',
      cancelText: 'Batal',
      okButtonProps: { style: { background: '#2563eb', borderColor: '#2563eb' } },
      onOk: async () => {
        try {
          const result = await adminService.sendBulkEmail({
            targetStatus: 'finalist',
            subject: 'Selamat! Anda Terpilih Menjadi Finalis 4 Pilar DSA 2026',
          });
          message.success(result.message || `Email berhasil dikirim ke ${result.queuedCount || 0} peserta`);
          fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error(error.response?.data?.message || 'Gagal mengirim email massal');
        }
      },
    });
  };

  // ── Detail Registrasi Peserta ────────────────────────────────────────────
  const showRegDetail = async (record) => {
    setRegDetailVisible(true);
    setRegDetailLoading(true);
    try {
      const detail = await adminService.getRegistrationDetail(record.id);
      setRegDetailData(detail);
    } catch (error) {
      message.error('Gagal memuat detail peserta');
      setRegDetailData(null);
    } finally {
      setRegDetailLoading(false);
    }
  };

  // ── Detail Assessment ─────────────────────────────────────────────────────
  const showDetail = async (record) => {
    setDetailPeserta(record);
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const result = await adminService.getAssessmentsByRegistration(record.id);
      setDetailData(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      message.error('Gagal memuat detail penilaian');
      console.error(error);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Reset filters ─────────────────────────────────────────────────────────
  const handleReset = () => {
    setSearchText('');
    setPilarFilter(null);
    setIndicatorFilter(null);
    setStatusFilter(null);
    setDurasiFilter(null);
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Nama DSA',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'namaDsa',
      key: 'namaDsa',
      render: (text, record) => (
        <Button type="link" onClick={() => showRegDetail(record)} style={{ padding: 0, fontWeight: 600 }}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Pilar',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'pillar',
      key: 'pillar',
      render: (p) => p?.name || '-',
    },
    {
      title: 'Wilayah',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      key: 'wilayah',
      render: (_, r) => {
        const w = [r.province?.name, r.city?.name, r.district?.name].filter(Boolean).join(', ');
        return <Text style={{ fontSize: 12 }}>{w || '-'}</Text>;
      },
    },
    {
      title: 'Jumlah Juri',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'jurorCount',
      key: 'jurorCount',
      align: 'center',
      render: (v) => <Tag color="blue">{v || 0}</Tag>,
    },
    {
      title: 'Rata-rata',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'averageScore',
      key: 'averageScore',
      align: 'center',
      render: (v) => {
        const ind = getScoreIndicator(v);
        return (
          <div>
            <Text strong style={{ fontSize: 16, color: ind.color }}>{v != null ? v.toFixed(1) : '-'}</Text>
            <br />
            <Tag color={ind.color} style={{ fontSize: 11, marginTop: 4 }}>{ind.label}</Tag>
          </div>
        );
      },
    },
    {
      title: 'Status',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'statusLabel',
      key: 'statusLabel',
      render: (label, record) => {
        const s = STATUS_MAP[record.statusLabel] || { label, color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: 'Status Email',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      key: 'emailStatus',
      align: 'center',
      render: (_, record) => {
        if (record.status !== 'finalist' && record.status !== 'rejected') {
          return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
        }

        const ind = getStatusSend(record.isEmailSent);
        return (
          <div>
            <Tag color={ind.color} style={{ fontSize: 11, marginTop: 4 }}>{record.isEmailSent ? 'Terkirim':'Belum Dikirim'}</Tag>
          </div>
        );
      },
    },
    {
      title: 'Aksi',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Detail Penilaian">
            <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)} style={{ padding: '0 4px' }} />
          </Tooltip>
          {(record.status === 'finalist' || record.status === 'rejected') && (
            <Tooltip title="Kirim Email">
              <Button type="link" icon={<ExportOutlined />} onClick={() => handleSendEmail(record)} style={{ padding: '0 4px', color: '#2563eb' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // ── Row selection ─────────────────────────────────────────────────────────
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: (record) => ({
      disabled: false,
    }),
  };

  // ── Selected row statuses ──────────────────────────────────────────────────
  const selectedRows = data.filter(r => selectedRowKeys.includes(r.id));
  const hasDecided = selectedRows.some(r => r.status === 'finalist' || r.status === 'rejected');
  const hasUndecided = selectedRows.some(r => r.status === 'being_assessed' || r.status === 'assessed');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Hasil Seleksi</Title>
          <Text type="secondary">Review dan putuskan hasil penilaian peserta oleh juri</Text>
        </div>
        <Space>
          <Button icon={<ExportOutlined />} onClick={handleExport}>Export Excel</Button>
          {summary.lolosCount > 0 && (
            <Button icon={<ExportOutlined />} onClick={handleSendEmailAllLolos} style={{ background: '#2563eb', borderColor: '#2563eb', color: '#fff' }}>
              kirim email (untuk semua yang lolos) 
            </Button>
          )}
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Dinilai', value: summary.totalAssessed, icon: <TeamOutlined />, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Belum Diputuskan', value: summary.undecidedCount, icon: <ClockCircleOutlined />, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Lolos', value: summary.lolosCount, icon: <CheckCircleOutlined />, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Tidak Lolos', value: summary.tidakLolosCount, icon: <CloseCircleOutlined />, color: '#ef4444', bg: '#fef2f2' },
        ].map((item, idx) => (
          <Col xs={12} sm={6} key={idx}>
            <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, fontSize: 20 }}>
                  {item.icon}
                </div>
                <div>
                  <Text style={{ fontSize: 12, color: '#64748b', display: 'block' }}>{item.label}</Text>
                  <Text strong style={{ fontSize: 24, color: '#1e293b' }}>{item.value}</Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input placeholder="Cari nama DSA..." prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} value={searchText} onChange={e => setSearchText(e.target.value)} allowClear style={{ flex: '1 1 200px', minWidth: 180 }} />
          <Select placeholder="Pilar" style={{ flex: '1 1 140px', minWidth: 130 }} allowClear value={pilarFilter} onChange={v => setPilarFilter(v)}>
            {pilarOptions.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
          </Select>
          <Select placeholder="Indikator Nilai" style={{ flex: '1 1 150px', minWidth: 140 }} allowClear value={indicatorFilter} onChange={v => setIndicatorFilter(v)}>
            <Option value="Rendah">Rendah (&lt;60)</Option>
            <Option value="Cukup">Cukup (60-74)</Option>
            <Option value="Baik">Baik (75-89)</Option>
            <Option value="Sangat Baik">Sangat Baik (90+)</Option>
          </Select>
          <Select placeholder="Status" style={{ flex: '1 1 150px', minWidth: 140 }} allowClear value={statusFilter} onChange={v => setStatusFilter(v)}>
            <Option value="belum_diputuskan">Belum Diputuskan</Option>
            <Option value="lolos">Lolos</Option>
            <Option value="tidak_lolos">Tidak Lolos</Option>
          </Select>
          <Select placeholder="Lama Program" style={{ flex: '1 1 140px', minWidth: 130 }} allowClear value={durasiFilter} onChange={v => setDurasiFilter(v)}>
            <Option value="<1 Tahun">&lt;1 Tahun</Option>
            <Option value="1-3 Tahun">1-3 Tahun</Option>
            <Option value="3-5 Tahun">3-5 Tahun</Option>
            <Option value=">5 Tahun">&gt;5 Tahun</Option>
          </Select>
          <Button onClick={handleReset} style={{ flexShrink: 0 }}>Reset</Button>
        </div>
      </Card>

      {/* Action Buttons */}
      {selectedRowKeys.length > 0 && (
        <Card style={{ marginBottom: 16, background: '#f0f7ff', borderColor: '#bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text strong style={{ fontSize: 13 }}>{selectedRowKeys.length} peserta dipilih</Text>
            <div style={{ flex: 1 }} />
            {hasUndecided && (
              <>
                <Button type="primary" icon={<CheckCircleOutlined />} style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => handleDecision('approve', selectedRowKeys)}>
                  Lolos
                </Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => handleDecision('reject', selectedRowKeys)}>
                  Tidak Lolos
                </Button>
              </>
            )}
            {hasDecided && (
              <Button icon={<UndoOutlined />} style={{ borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => handleDecision('cancel', selectedRowKeys)}>
                Batal Keputusan
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            rowSelection={rowSelection}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} data`,
              onChange: (page, limit) => fetchData(page, limit),
            }}
            scroll={{ x: 900 }}
          />
        </Spin>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChartOutlined style={{ color: '#2563eb' }} />
            <span>Detail Penilaian Juri — {detailPeserta?.namaDsa}</span>
          </div>
        }
        open={detailVisible}
        onCancel={() => { setDetailVisible(false); setDetailData([]); setDetailPeserta(null); }}
        footer={[
          <Button key="close" onClick={() => { setDetailVisible(false); setDetailData([]); setDetailPeserta(null); }}>Tutup</Button>,
        ]}
        width={700}
      >
        <Spin spinning={detailLoading}>
          {detailData.length === 0 && !detailLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Text type="secondary">Belum ada data penilaian dari juri</Text>
            </div>
          ) : (
            <>
              {/* Summary */}
              {detailPeserta && (
                <div style={{ marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div>
                    <Text style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Jumlah Juri</Text>
                    <Text strong style={{ fontSize: 20, color: '#2563eb' }}>{detailPeserta.jurorCount || detailData.length}</Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Rata-rata Skor</Text>
                    <Text strong style={{ fontSize: 20, color: getScoreIndicator(detailPeserta.averageScore).color }}>
                      {detailPeserta.averageScore != null ? detailPeserta.averageScore.toFixed(1) : '-'}
                    </Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Status</Text>
                    <Tag color={STATUS_MAP[detailPeserta.statusLabel]?.color || 'default'} style={{ fontSize: 13 }}>
                      {detailPeserta.statusLabel || '-'}
                    </Tag>
                  </div>
                </div>
              )}

              {/* Assessment Cards */}
              {detailData.map((item, idx) => (
                <div key={item.id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 14 }}>Juri {idx + 1}: {item.jurorName || '-'}</Text>
                    <Tag color={getScoreIndicator(item.totalScore).color} style={{ fontSize: 12 }}>
                      {item.totalScore?.toFixed(1) || '-'} / 100
                    </Tag>
                  </div>
                  <Row gutter={[16, 8]}>
                    {[
                      { label: 'Inovasi & Kreativitas', value: item.criteria1, color: '#8b5cf6' },
                      { label: 'Dampak Program', value: item.criteria2, color: '#10b981' },
                      { label: 'Potensi Keberlanjutan', value: item.criteria3, color: '#f59e0b' },
                    ].map((c, ci) => (
                      <Col xs={8} key={ci}>
                        <Text style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>{c.label}</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Progress percent={c.value || 0} showInfo={false} strokeColor={c.color} size="small" style={{ flex: 1 }} />
                          <Text strong style={{ color: c.color, fontSize: 13, minWidth: 30 }}>{c.value || 0}</Text>
                        </div>
                      </Col>
                    ))}
                  </Row>
                  {item.notes && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, borderLeft: '3px solid #2563eb' }}>
                      <Text style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>"{item.notes}"</Text>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </Spin>
      </Modal>

      {/* Detail Registrasi Modal */}
      <Modal
        open={regDetailVisible}
        closable={false}
        onCancel={() => { setRegDetailVisible(false); setRegDetailData(null); }}
        footer={[
          <Button key="close" onClick={() => { setRegDetailVisible(false); setRegDetailData(null); }}>Tutup</Button>,
        ]}
        width={720}
        styles={{ body: { padding: 0 } }}
      >
        <Spin spinning={regDetailLoading}>
          {regDetailData && (
            <div>
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '24px 28px', borderRadius: '12px 12px 0 0', position: 'relative' }}>
                <div style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Detail Pendaftaran</Text>
                <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: 20 }}>{regDetailData.villageName || '-'}</Title>
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 6, display: 'block' }}>{regDetailData.groupName || '-'}</Text>
              </div>

              {/* Content */}
              <div style={{ padding: '24px 28px 28px' }}>
                {/* Identitas */}
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}><span style={{ marginRight: 6 }}><TagOutlined /></span> Identitas Pendaftar</Text>
                  <Row gutter={[20, 16]}>
                    {[
                      { label: 'Jenis DSA', value: regDetailData.dsaType },
                      { label: 'Nomor HP', value: regDetailData.phoneNumber },
                      { label: 'Nama Kontak Darurat', value: regDetailData.emergencyContactName },
                      { label: 'No HP Kontak Darurat', value: regDetailData.emergencyContactPhone },
                      ...(regDetailData.socialMedia ? [{ label: 'Media Sosial', value: regDetailData.socialMedia, span: 24 }] : []),
                    ].map((item, idx) => (
                      <Col xs={12} sm={8} key={idx} span={item.span}>
                        <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>{item.label}</Text>
                        <Text strong style={{ fontSize: 13 }}>{item.value || '—'}</Text>
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* Informasi Program */}
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}><span style={{ marginRight: 6 }}><FileTextOutlined /></span> Informasi Program</Text>
                  <Row gutter={[20, 16]}>
                    {[
                      { label: 'Pilar', value: regDetailData.pillar?.name },
                      { label: 'Kategori', value: regDetailData.category?.name },
                      { label: 'Binaan', value: regDetailData.astraGroupCustom || regDetailData.astraGroup?.name },
                      { label: 'Durasi Program', value: regDetailData.programDuration },
                    ].map((item, idx) => (
                      <Col xs={12} sm={6} key={idx}>
                        <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>{item.label}</Text>
                        <Text strong style={{ fontSize: 13 }}>{item.value || '—'}</Text>
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* Wilayah */}
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}><span style={{ marginRight: 6 }}><EnvironmentOutlined /></span> Lokasi & Wilayah</Text>
                  <Row gutter={[20, 16]}>
                    {[
                      { label: 'Provinsi', value: regDetailData.province?.name },
                      { label: 'Kabupaten / Kota', value: regDetailData.city?.name },
                      { label: 'Kecamatan', value: regDetailData.district?.name },
                      { label: 'Desa / Kelurahan', value: regDetailData.villageRegion?.name },
                    ].map((item, idx) => (
                      <Col xs={12} sm={6} key={idx}>
                        <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>{item.label}</Text>
                        <Text strong style={{ fontSize: 13 }}>{item.value || '—'}</Text>
                      </Col>
                    ))}
                    <Col span={24}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Alamat Lengkap</Text>
                      <Text style={{ fontSize: 13, lineHeight: 1.6 }}>{regDetailData.address || '—'}</Text>
                    </Col>
                  </Row>
                </div>

                {/* Deskripsi Program */}
                <div>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}><span style={{ marginRight: 6 }}><EditOutlined /></span> Deskripsi Program</Text>
                  {[
                    { label: 'Latar Belakang', value: regDetailData.background, color: '#1890ff' },
                    { label: 'Dampak Yang Sudah Terealisasi', value: regDetailData.programImpact, color: '#52c41a' },
                    { label: 'Rencana Pengembangan', value: regDetailData.developmentPlan, color: '#722ed1' },
                  ].map((item, idx) => (
                    <div key={idx} style={{ marginBottom: idx < 2 ? 12 : 0 }}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>{item.label}</Text>
                      <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: `3px solid ${item.color}` }}>
                        <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{item.value || '—'}</Text>
                      </div>
                    </div>
                  ))}

                  {/* Foto Dokumentasi */}
                  {Array.isArray(regDetailData.photos) && regDetailData.photos.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 8 }}>Foto Dokumentasi</Text>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {regDetailData.photos.map((photo, i) => (
                          <div key={i} onClick={() => setPreviewPhoto(photo.photoUrl?.startsWith('http') ? photo.photoUrl : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.photoUrl}`)} style={{ width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                            <img src={photo.photoUrl?.startsWith('http') ? photo.photoUrl : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.photoUrl}`} alt={photo.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Spin>
      </Modal>

      {/* Modal Preview Foto */}
      <Modal
        open={!!previewPhoto}
        onCancel={() => setPreviewPhoto(null)}
        footer={null}
        centered
        width={600}
        styles={{ body: { padding: 0, background: 'transparent' } }}
      >
        {previewPhoto && (
          <img
            src={previewPhoto}
            alt="Preview"
            style={{ width: '100%', borderRadius: 8 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminSelectionReview;
