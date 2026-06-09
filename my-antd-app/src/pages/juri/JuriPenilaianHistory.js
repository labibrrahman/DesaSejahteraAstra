import React, { useState } from 'react';
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
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Dummy data - will be replaced with API calls
const historyData = [
  {
    key: '1',
    nama_desa: 'Desa Sukamaju',
    nama_kelompok: 'Kelompok Tani Makmur',
    pilar: 'Pilar Ekonomi',
    kategori: 'UMKM',
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
    kriteria1: 92,
    kriteria2: 95,
    kriteria3: 90,
    total: 277,
    tanggal_nilai: '2026-01-18',
    catatan: 'Program luar biasa dengan dampak lingkungan yang sangat positif.',
  },
];

const JuriPenilaianHistory = () => {
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredData = historyData.filter((item) => {
    return item.nama_desa.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nama_kelompok.toLowerCase().includes(searchText.toLowerCase());
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
      title: 'Kategori',
      dataIndex: 'kategori',
      key: 'kategori',
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
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Riwayat Penilaian</Title>
        <Text type="secondary">Daftar penilaian yang telah dilakukan</Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                {historyData.length}
              </Title>
              <Text type="secondary">Total Penilaian</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                {Math.round(historyData.reduce((sum, item) => sum + item.total, 0) / historyData.length)}
              </Title>
              <Text type="secondary">Rata-rata Nilai</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#722ed1' }}>
                {Math.max(...historyData.map(item => item.total))}
              </Title>
              <Text type="secondary">Nilai Tertinggi</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Input
              placeholder="Cari nama desa atau kelompok..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={12}>
            <Button icon={<FilterOutlined />}>
              Filter Lanjutan
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 1200 }}
        />
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