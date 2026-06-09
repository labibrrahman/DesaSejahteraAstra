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
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

// Dummy data - will be replaced with API calls
const pesertaData = [
  {
    key: '1',
    nama_desa: 'Desa Sukamaju',
    nama_kelompok: 'Kelompok Tani Makmur',
    pilar: 'Pilar Ekonomi',
    kategori: 'UMKM',
    wilayah: 'Jawa Barat - Bandung',
    status: 3,
    tanggal_daftar: '2026-01-15',
  },
  {
    key: '2',
    nama_desa: 'Desa Makmur',
    nama_kelompok: 'Kelompok Wanita Sejahtera',
    pilar: 'Pilar Sosial',
    kategori: 'Pendidikan',
    wilayah: 'Jawa Tengah - Semarang',
    status: 3,
    tanggal_daftar: '2026-01-14',
  },
  {
    key: '3',
    nama_desa: 'Desa Sejahtera',
    nama_kelompok: 'Kelompok Tani Hijau',
    pilar: 'Pilar Lingkungan',
    kategori: 'Konservasi',
    wilayah: 'Jawa Timur - Surabaya',
    status: 3,
    tanggal_daftar: '2026-01-13',
  },
  {
    key: '4',
    nama_desa: 'Desa Damai',
    nama_kelompok: 'Kelompok Pembangunan',
    pilar: 'Pilar Infrastruktur',
    kategori: 'Jalan & Jembatan',
    wilayah: 'Bali - Denpasar',
    status: 3,
    tanggal_daftar: '2026-01-12',
  },
];

const statusMap = {
  1: { label: 'Draft', color: 'default' },
  2: { label: 'Menunggu Screening', color: 'processing' },
  3: { label: 'Sedang Dinilai', color: 'warning' },
  4: { label: 'Selesai Dinilai', color: 'success' },
  5: { label: 'Finalis', color: 'purple' },
};

const JuriPesertaList = () => {
  const [searchText, setSearchText] = useState('');
  const [pilarFilter, setPilarFilter] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const navigate = useNavigate();

  const filteredData = pesertaData.filter((item) => {
    const matchSearch = item.nama_desa.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nama_kelompok.toLowerCase().includes(searchText.toLowerCase());
    const matchPilar = !pilarFilter || item.pilar === pilarFilter;
    return matchSearch && matchPilar;
  });

  const showDetail = (record) => {
    setSelectedPeserta(record);
    setDetailModalVisible(true);
  };

  const handleScore = (record) => {
    navigate(`/juri/penilaian/${record.key}`);
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
      title: 'Kelompok/Individu',
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
      title: 'Wilayah',
      dataIndex: 'wilayah',
      key: 'wilayah',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusMap[status]?.color}>
          {statusMap[status]?.label}
        </Tag>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'tanggal_daftar',
      key: 'tanggal_daftar',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            Detail
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleScore(record)}
          >
            Nilai
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Daftar Peserta untuk Dinilai</Title>
        <Text type="secondary">Daftar peserta yang siap untuk dinilai</Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={10}>
            <Input
              placeholder="Cari nama desa atau kelompok..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Filter Pilar"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setPilarFilter(value)}
            >
              <Option value="Pilar Ekonomi">Pilar Ekonomi</Option>
              <Option value="Pilar Sosial">Pilar Sosial</Option>
              <Option value="Pilar Lingkungan">Pilar Lingkungan</Option>
              <Option value="Pilar Infrastruktur">Pilar Infrastruktur</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => { setSearchText(''); setPilarFilter(null); }}
            >
              Reset Filter
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
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Detail Peserta"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
          <Button
            key="score"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              handleScore(selectedPeserta);
            }}
          >
            Beri Nilai
          </Button>,
        ]}
        width={700}
      >
        {selectedPeserta && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Nama Desa">{selectedPeserta.nama_desa}</Descriptions.Item>
            <Descriptions.Item label="Kelompok/Individu">{selectedPeserta.nama_kelompok}</Descriptions.Item>
            <Descriptions.Item label="Pilar">{selectedPeserta.pilar}</Descriptions.Item>
            <Descriptions.Item label="Kategori">{selectedPeserta.kategori}</Descriptions.Item>
            <Descriptions.Item label="Wilayah" span={2}>{selectedPeserta.wilayah}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusMap[selectedPeserta.status]?.color}>
                {statusMap[selectedPeserta.status]?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Daftar">{selectedPeserta.tanggal_daftar}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default JuriPesertaList;