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
      message.error('Gagal memuat riwayat penilaian');
      console.error('Fetch history error:', error);
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
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#1890ff';
    if (score >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const columns = [
    {
      title: 'Nama Desa',
      dataIndex: 'nama_desa',
      key: 'nama_desa',
      render: (text, record) => (
        <Button type="link" onClick={() => showDetail(record)} style={{ padding: 0 }}>
          {text}
        </Button>
      ),
    },
    { title: 'Kelompok', dataIndex: 'nama_kelompok', key: 'nama_kelompok' },
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
        <Tag color={total >= 270 ? 'success' : total >= 240 ? 'processing' : 'warning'}>
          <Text strong style={{ fontSize: 16 }}>{total}</Text>
          <Text type="secondary"> / 300</Text>
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
              placeholder="Cari nama desa atau kelompok..."
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
        title="Detail Penilaian"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={700}
      >
        {selectedRecord && (
          <>
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Nama Desa">{selectedRecord.nama_desa}</Descriptions.Item>
              <Descriptions.Item label="Kelompok">{selectedRecord.nama_kelompok}</Descriptions.Item>
              <Descriptions.Item label="Pilar">{selectedRecord.pilar}</Descriptions.Item>
              <Descriptions.Item label="Kategori">{selectedRecord.kategori}</Descriptions.Item>
              <Descriptions.Item label="Tanggal Penilaian">{selectedRecord.tanggal_nilai}</Descriptions.Item>
            </Descriptions>

            <Card title="Rincian Nilai" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">Kriteria 1</Text>
                    <br />
                    <Title level={2} style={{ margin: 0, color: getScoreColor(selectedRecord.kriteria1) }}>
                      {selectedRecord.kriteria1}
                    </Title>
                    <Text type="secondary">/ 100</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">Kriteria 2</Text>
                    <br />
                    <Title level={2} style={{ margin: 0, color: getScoreColor(selectedRecord.kriteria2) }}>
                      {selectedRecord.kriteria2}
                    </Title>
                    <Text type="secondary">/ 100</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">Kriteria 3</Text>
                    <br />
                    <Title level={2} style={{ margin: 0, color: getScoreColor(selectedRecord.kriteria3) }}>
                      {selectedRecord.kriteria3}
                    </Title>
                    <Text type="secondary">/ 100</Text>
                  </div>
                </Col>
              </Row>
              <div style={{ textAlign: 'center', marginTop: 16, padding: '16px', background: '#f5f5f5', borderRadius: 8 }}>
                <Text type="secondary">Total Nilai</Text>
                <br />
                <Title level={1} style={{ margin: 0, color: getScoreColor(selectedRecord.total / 3) }}>
                  {selectedRecord.total}
                </Title>
                <Text type="secondary">/ 300</Text>
              </div>
            </Card>

            <Card title="Catatan Juri">
              <Paragraph>{selectedRecord.catatan || '-'}</Paragraph>
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
};

export default JuriPenilaianHistory;
