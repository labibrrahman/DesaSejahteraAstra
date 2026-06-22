import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Row,
  Col,
  Typography,
  Modal,
  Descriptions,
  Spin,
  message,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  FileTextOutlined,
  EditOutlined,
  StarOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';

const { Title, Text, Paragraph } = Typography;

/**
 * Mapping data assessment dari API ke format UI.
 */
const mapFromApi = (item) => ({
  id: item.id,
  nama_desa: item.registration?.villageName || '-',
  nama_kelompok: item.registration?.groupName || '-',
  pilar: item.registration?.pillar?.name || '-',
  kategori: item.registration?.category?.name || '-',
  kriteria1: item.criteria1 || 0,
  kriteria2: item.criteria2 || 0,
  kriteria3: item.criteria3 || 0,
  total: item.totalScore || 0,
  tanggal_nilai: item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('id-ID')
    : '-',
  catatan: item.notes || '-',
  durasi_program: item.registration?.programDuration || '-',
});

const JuriPenilaianHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  /** Fetch riwayat penilaian juri dari API */
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getMyAssessmentHistory();
      const list = Array.isArray(result) ? result : [];
      setData(list.map(mapFromApi));
    } catch (error) {
      const status = error.response?.status;
      const backendMsg = error.response?.data?.message;

      if (status === 403) {
        message.error('Akses ditolak. Pastikan Anda login sebagai Juri.');
      } else if (status === 401) {
        message.error('Sesi habis. Silakan login kembali.');
      } else {
        message.error(backendMsg || 'Gagal memuat riwayat penilaian');
      }

      console.error('Fetch history error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /** Filter data di client side */
  const filteredData = data.filter((item) => {
    return (
      item.nama_desa.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nama_kelompok.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  /** Hitung statistik */
  const stats = {
    total: data.length,
    rataRata: data.length > 0
      ? Math.round(data.reduce((sum, item) => sum + item.total, 0) / data.length)
      : 0,
    tertinggi: data.length > 0
      ? Math.max(...data.map((item) => item.total))
      : 0,
  };

  const showDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#2563eb';
    if (score >= 75) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ff4d4f';
  };

  const columns = [
    {
      title: 'Nama DSA',
      dataIndex: 'nama_desa',
      key: 'nama_desa',
      render: (text, record) => (
        <Button type="link" onClick={() => showDetail(record)} style={{ padding: 0 }}>
          {text}
        </Button>
      ),
    },
    { title: 'Nama Peserta/Penanggung Jawab', dataIndex: 'nama_kelompok', key: 'nama_kelompok' },
    { title: 'Pilar', dataIndex: 'pilar', key: 'pilar' },
    { title: 'Kategori', dataIndex: 'kategori', key: 'kategori' },
    {
      title: 'Kriteria 1',
      dataIndex: 'kriteria1',
      key: 'kriteria1',
      render: (score) => (
        <Text style={{ color: getScoreColor(score), fontWeight: 'bold' }}>{score}</Text>
      ),
    },
    {
      title: 'Kriteria 2',
      dataIndex: 'kriteria2',
      key: 'kriteria2',
      render: (score) => (
        <Text style={{ color: getScoreColor(score), fontWeight: 'bold' }}>{score}</Text>
      ),
    },
    {
      title: 'Kriteria 3',
      dataIndex: 'kriteria3',
      key: 'kriteria3',
      render: (score) => (
        <Text style={{ color: getScoreColor(score), fontWeight: 'bold' }}>{score}</Text>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => (
        <Tag color={total >= 90 ? 'blue' : total >= 75 ? 'success' : total >= 60 ? 'warning' : 'error'}>
          <Text strong style={{ fontSize: 16 }}>{total}</Text>
          <Text type="secondary"> / 100</Text>
        </Tag>
      ),
    },
    { title: 'Tanggal', dataIndex: 'tanggal_nilai', key: 'tanggal_nilai' },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Riwayat Penilaian</Title>
        <Text type="secondary">Daftar penilaian yang telah dilakukan</Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>{stats.total}</Title>
              <Text type="secondary">Total Penilaian</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#52c41a' }}>{stats.rataRata}</Title>
              <Text type="secondary">Rata-rata Nilai</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#722ed1' }}>{stats.tertinggi}</Title>
              <Text type="secondary">Nilai Tertinggi</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Input
              placeholder="Cari Nama DSA atau Nama Peserta/Penanggung Jawab..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12}>
            <Button icon={<FilterOutlined />} onClick={() => setSearchText('')}>
              Reset Filter
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>

      {/* Detail Modal */}
      <Modal
        open={detailModalVisible}
        closable={false}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={720}
        styles={{ body: { padding: 0 } }}
      >
        {selectedRecord && (
          <div>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              padding: '24px 28px',
              borderRadius: '12px 12px 0 0',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                right: -30,
                top: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.08)',
              }} />
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Detail Penilaian
              </Text>
              <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: 20 }}>
                {selectedRecord.nama_desa}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4, display: 'block' }}>
                {selectedRecord.nama_kelompok}
              </Text>
            </div>

            {/* Content */}
            <div style={{ padding: '24px 28px 28px' }}>
              {/* Info Section */}
              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ marginRight: 6 }}><FileTextOutlined /></span> Informasi Penilaian
                </Text>
                <Row gutter={[20, 12]}>
                  {[
                    { label: 'Pilar', value: selectedRecord.pilar },
                    { label: 'Kategori', value: selectedRecord.kategori },
                    { label: 'Durasi Program', value: selectedRecord.durasi_program },
                    { label: 'Tanggal', value: selectedRecord.tanggal_nilai },
                  ].map((item, idx) => (
                    <Col xs={12} sm={8} key={idx}>
                      <Text style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {item.label}
                      </Text>
                      <Text strong style={{ fontSize: 13, color: '#1e293b' }}>
                        {item.value || '-'}
                      </Text>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Score Section */}
              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ marginRight: 6 }}><StarOutlined /></span> Rincian Nilai
                </Text>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  {[
                    { label: 'Inovasi & Kreativitas', score: selectedRecord.kriteria1, color: '#8b5cf6', bg: '#f5f3ff' },
                    { label: 'Dampak Program', score: selectedRecord.kriteria2, color: '#10b981', bg: '#ecfdf5' },
                    { label: 'Potensi Keberlanjutan', score: selectedRecord.kriteria3, color: '#f59e0b', bg: '#fffbeb' },
                  ].map((item, idx) => (
                    <Col xs={24} sm={8} key={idx}>
                      <div style={{
                        background: '#fff',
                        border: `1px solid ${item.color}20`,
                        borderRadius: 12,
                        padding: '20px 16px',
                        textAlign: 'center',
                      }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: item.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px',
                        }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: item.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {idx + 1}
                          </span>
                        </div>
                        <Text style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 8, lineHeight: 1.4 }}>
                          {item.label}
                        </Text>
                        <div style={{ fontSize: 32, fontWeight: 800, color: item.color, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
                          {item.score}
                        </div>
                        <Text style={{ fontSize: 12, color: '#94a3b8' }}>/ 100</Text>
                        <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${item.score}%`, background: item.color, borderRadius: 2 }} />
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Total Score */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #e2e8f0',
                }}>
                  <div>
                    <Text style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Total Nilai
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 36, fontWeight: 800, color: getScoreColor(selectedRecord.total), fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
                        {selectedRecord.total}
                      </span>
                      <Text style={{ fontSize: 14, color: '#94a3b8' }}>/ 100</Text>
                    </div>
                  </div>
                  <Tag
                    color={selectedRecord.total >= 90 ? 'blue' : selectedRecord.total >= 75 ? 'success' : selectedRecord.total >= 60 ? 'warning' : 'error'}
                    style={{ fontSize: 13, padding: '4px 14px', borderRadius: 16, margin: 0 }}
                  >
                    {selectedRecord.total >= 90 ? 'Sangat Baik' : selectedRecord.total >= 75 ? 'Baik' : selectedRecord.total >= 60 ? 'Cukup' : 'Rendah'}
                  </Tag>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ marginRight: 6 }}><EditOutlined /></span> Catatan Juri
                </Text>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: '14px 16px',
                  borderLeft: '3px solid #1890ff',
                }}>
                  <Paragraph style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                    {selectedRecord.catatan || 'Tidak ada catatan'}
                  </Paragraph>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JuriPenilaianHistory;
