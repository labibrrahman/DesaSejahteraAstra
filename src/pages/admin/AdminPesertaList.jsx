import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
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
  ExportOutlined,
} from '@ant-design/icons';

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
    status: 2,
    tanggal_daftar: '2026-01-15',
    juri: '-',
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
    juri: 'Juri 1',
  },
  {
    key: '3',
    nama_desa: 'Desa Sejahtera',
    nama_kelompok: 'Kelompok Tani Hijau',
    pilar: 'Pilar Lingkungan',
    kategori: 'Konservasi',
    wilayah: 'Jawa Timur - Surabaya',
    status: 4,
    tanggal_daftar: '2026-01-13',
    juri: 'Juri 2',
  },
  {
    key: '4',
    nama_desa: 'Desa Damai',
    nama_kelompok: 'Kelompok Pembangunan',
    pilar: 'Pilar Infrastruktur',
    kategori: 'Jalan & Jembatan',
    wilayah: 'Bali - Denpasar',
    status: 2,
    tanggal_daftar: '2026-01-12',
    juri: '-',
  },
  {
    key: '5',
    nama_desa: 'Desa Sentosa',
    nama_kelompok: 'Koperasi Desa Sentosa',
    pilar: 'Pilar Ekonomi',
    kategori: 'Koperasi',
    wilayah: 'Sumatera Utara - Medan',
    status: 3,
    tanggal_daftar: '2026-01-11',
    juri: 'Juri 1',
  },
];

const statusMap = {
  1: { label: 'Draft', color: 'default' },
  2: { label: 'Menunggu Screening', color: 'processing' },
  3: { label: 'Sedang Dinilai', color: 'warning' },
  4: { label: 'Selesai Dinilai', color: 'success' },
  5: { label: 'Finalis', color: 'purple' },
};

const AdminPesertaList = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [pilarFilter, setPilarFilter] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);

  const filteredData = pesertaData.filter((item) => {
    const matchSearch = item.nama_desa.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nama_kelompok.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    const matchPilar = !pilarFilter || item.pilar === pilarFilter;
    return matchSearch && matchStatus && matchPilar;
  });

  const showDetail = (record) => {
    setSelectedPeserta(record);
    setDetailModalVisible(true);
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
      title: 'Juri',
      dataIndex: 'juri',
      key: 'juri',
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
          <Title level={3} style={{ margin: 0 }}>Daftar Peserta</Title>
          <Text type="secondary">Kelola data peserta pendaftaran</Text>
        </div>
        <Button icon={<ExportOutlined />}>Export Data</Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Input placeholder="Cari nama desa atau kelompok..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select placeholder="Filter Status" style={{ width: '100%' }} allowClear onChange={(value) => setStatusFilter(value)}>
              {Object.entries(statusMap).map(([key, value]) => (<Option key={key} value={parseInt(key)}>{value.label}</Option>))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select placeholder="Filter Pilar" style={{ width: '100%' }} allowClear onChange={(value) => setPilarFilter(value)}>
              <Option value="Pilar Ekonomi">Pilar Ekonomi</Option>
              <Option value="Pilar Sosial">Pilar Sosial</Option>
              <Option value="Pilar Lingkungan">Pilar Lingkungan</Option>
              <Option value="Pilar Infrastruktur">Pilar Infrastruktur</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Space wrap>
              <Button icon={<FilterOutlined />}>Filter Lanjutan</Button>
              <Button onClick={() => { setSearchText(''); setStatusFilter(null); setPilarFilter(null); }}>Reset</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 10 }} size="middle" scroll={{ x: 900 }} />
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
            <Descriptions.Item label="Juri">{selectedPeserta.juri}</Descriptions.Item>
            <Descriptions.Item label="Tanggal Daftar">{selectedPeserta.tanggal_daftar}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminPesertaList;