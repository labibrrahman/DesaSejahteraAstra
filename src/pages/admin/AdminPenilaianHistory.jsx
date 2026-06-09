import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Space,
  Modal,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  ExportOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Dummy data - will be replaced with API calls
const historyData = [
  {
    key: '1',
    nama_desa: 'Desa Sukamaju',
    nama_kelompok: 'Kelompok Tani Makmur',
    pilar: 'Pilar Ekonomi',
    kategori: 'UMKM',
    juri: 'Juri 1',
    kriteria1: 85,
    kriteria2: 90,
    kriteria3: 88,
    total: 263,
    tanggal_nilai: '2026-01-20',
    catatan: 'Program sangat inovatif dan memiliki dampak yang baik untuk masyarakat.',
  },
  {
    key: '2',
    nama_desa: 'Desa Makmur',
    nama_kelompok: 'Kelompok Wanita Sejahtera',
    pilar: 'Pilar Sosial',
    kategori: 'Pendidikan',
    juri: 'Juri 2',
    kriteria1: 78,
    kriteria2: 82,
    kriteria3: 75,
    total: 235,
    tanggal_nilai: '2026-01-19',
    catatan: 'Program cukup baik, namun perlu ditingkatkan aspek keberlanjutan.',
  },
  {
    key: '3',
    nama_desa: 'Desa Sejahtera',
    nama_kelompok: 'Kelompok Tani Hijau',
    pilar: 'Pilar Lingkungan',
    kategori: 'Konservasi',
    juri: 'Juri 1',
    kriteria1: 92,
    kriteria2: 95,
    kriteria3: 90,
    total: 277,
    tanggal_nilai: '2026-01-18',
    catatan: 'Program luar biasa dengan dampak lingkungan yang sangat positif.',
  },
  {
    key: '4',
    nama_desa: 'Desa Damai',
    nama_kelompok: 'Kelompok Pembangunan',
    pilar: 'Pilar Infrastruktur',
    kategori: 'Jalan & Jembatan',
    juri: 'Juri 3',
    kriteria1: 70,
    kriteria2: 68,
    kriteria3: 72,
    total: 210,
    tanggal_nilai: '2026-01-17',
    catatan: 'Program perlu diperjelas target dan indikator keberhasilannya.',
  },
];

const AdminPenilaianHistory = () => {
  const [searchText, setSearchText] = useState('');
  const [pilarFilter, setPilarFilter] = useState(null);
  const [juriFilter, setJuriFilter] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredData = historyData.filter((item) => {
    const matchSearch = item.nama_desa.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nama_kelompok.toLowerCase().includes(searchText.toLowerCase());
    const matchPilar = !pilarFilter || item.pilar === pilarFilter;
    const matchJuri = !juriFilter || item.juri === juriFilter;
    return matchSearch && matchPilar && matchJuri;
  });

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
    {
      title: 'Kelompok',
      dataIndex: 'nama_kelompok',
      key: 'nama_kelompok',
    },
    {
      title: 'Pilar',
      dataIndex: 'pilar',
      key: 'pilar',
    },
    {
      title: 'Juri',
      dataIndex: 'juri',
      key: 'juri',
      render: (juri) => <Tag color="blue">{juri}</Tag>,
    },
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
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Tanggal',
      dataIndex: 'tanggal_nilai',
      key: 'tanggal_nilai',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Riwayat Penilaian</Title>
          <Text type="secondary">Daftar seluruh penilaian dari semua juri</Text>
        </div>
        <Button icon={<ExportOutlined />}>Export Data</Button>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card><div style={{ textAlign: 'center' }}><Title level={2} style={{ margin: 0, color: '#1890ff' }}>{historyData.length}</Title><Text type="secondary">Total Penilaian</Text></div></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><div style={{ textAlign: 'center' }}><Title level={2} style={{ margin: 0, color: '#52c41a' }}>{Math.round(historyData.reduce((sum, item) => sum + item.total, 0) / historyData.length)}</Title><Text type="secondary">Rata-rata Nilai</Text></div></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><div style={{ textAlign: 'center' }}><Title level={2} style={{ margin: 0, color: '#722ed1' }}>{Math.max(...historyData.map(item => item.total))}</Title><Text type="secondary">Nilai Tertinggi</Text></div></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><div style={{ textAlign: 'center' }}><Title level={2} style={{ margin: 0, color: '#1890ff' }}>{new Set(historyData.map(item => item.juri)).size}</Title><Text type="secondary">Juri Aktif</Text></div></Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Input placeholder="Cari nama desa atau kelompok..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select placeholder="Filter Pilar" style={{ width: '100%' }} allowClear onChange={(value) => setPilarFilter(value)}>
              <Option value="Pilar Ekonomi">Pilar Ekonomi</Option>
              <Option value="Pilar Sosial">Pilar Sosial</Option>
              <Option value="Pilar Lingkungan">Pilar Lingkungan</Option>
              <Option value="Pilar Infrastruktur">Pilar Infrastruktur</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select placeholder="Filter Juri" style={{ width: '100%' }} allowClear onChange={(value) => setJuriFilter(value)}>
              <Option value="Juri 1">Juri 1</Option>
              <Option value="Juri 2">Juri 2</Option>
              <Option value="Juri 3">Juri 3</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Space wrap>
              <Button icon={<FilterOutlined />}>Filter Lanjutan</Button>
              <Button onClick={() => { setSearchText(''); setPilarFilter(null); setJuriFilter(null); }}>Reset</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 10 }} size="middle" scroll={{ x: 1200 }} />
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
              <Descriptions.Item label="Juri">{selectedRecord.juri}</Descriptions.Item>
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

export default AdminPenilaianHistory;