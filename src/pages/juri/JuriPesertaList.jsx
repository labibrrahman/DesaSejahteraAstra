import React, { useState, useEffect, useCallback } from 'react';
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
  Spin,
  message,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

const { Title, Text } = Typography;
const { Option } = Select;

/** Mapping status dari backend */
const STATUS_MAP = {
  draft: { label: 'Draft', color: 'default' },
  waiting_screening: { label: 'Menunggu Screening', color: 'processing' },
  being_assessed: { label: 'Sedang Dinilai', color: 'warning' },
  assessed: { label: 'Selesai Dinilai', color: 'success' },
  finalist: { label: 'Finalis', color: 'purple' },
};

/**
 * Mapping data task dari API ke format UI.
 * Backend findTasks hanya load: pillar, category, user, astraGroup.
 * Relasi province/city/district TIDAK di-load, jadi gunakan ID atau '-'
 */
const mapFromApi = (item) => ({
  id: item.id,
  nama_desa: item.villageName || '-',
  nama_kelompok: item.groupName || '-',
  pilar: item.pillar?.name || '-',
  kategori: item.category?.name || '-',
  // Region relations tidak di-load oleh findTasks, tampilkan '-' atau ID
  wilayah: item.province?.name
    ? [item.province?.name, item.city?.name].filter(Boolean).join(' - ')
    : '-',
  jenis_dsa: item.dsaType || '-',
  nama_ketua: item.leaderName || '-',
  phone_number: item.phoneNumber || '-',
  status: item.status,
  tanggal_daftar: item.submittedAt
    ? new Date(item.submittedAt).toLocaleDateString('id-ID')
    : '-',
});

const JuriPesertaList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pilarFilter, setPilarFilter] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const navigate = useNavigate();

  /** Fetch assessment tasks dari API */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getAssessmentTasks();
      const list = Array.isArray(result) ? result : [];
      setData(list.map(mapFromApi));
    } catch (error) {
      const status = error.response?.status;
      const backendMsg = error.response?.data?.message;

      if (status === 403) {
        message.error('Akses ditolak. Pastikan Anda login sebagai Juri.');
      } else if (status === 422) {
        message.error(backendMsg || 'Juri belum ditugaskan ke pilar. Hubungi admin.');
      } else if (status === 401) {
        message.error('Sesi habis. Silakan login kembali.');
      } else {
        message.error(backendMsg || 'Gagal memuat data peserta');
      }

      console.error('Fetch tasks error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /** Filter data di client side */
  const filteredData = data.filter((item) => {
    const matchSearch =
      item.nama_desa.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nama_kelompok.toLowerCase().includes(searchText.toLowerCase());
    const matchPilar = !pilarFilter || item.pilar === pilarFilter;
    return matchSearch && matchPilar;
  });

  /** Ambil daftar pilar unik dari data */
  const pilarOptions = [...new Set(data.map((item) => item.pilar))].filter(Boolean);

  const showDetail = (record) => {
    setSelectedPeserta(record);
    setDetailModalVisible(true);
  };

  const handleScore = (record) => {
    navigate(`/juri/penilaian/${record.id}`);
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
    { title: 'Kelompok/Individu', dataIndex: 'nama_kelompok', key: 'nama_kelompok' },
    { title: 'Pilar', dataIndex: 'pilar', key: 'pilar' },
    { title: 'Kategori', dataIndex: 'kategori', key: 'kategori' },
    { title: 'Wilayah', dataIndex: 'wilayah', key: 'wilayah' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={STATUS_MAP[status]?.color || 'default'}>
          {STATUS_MAP[status]?.label || status}
        </Tag>
      ),
    },
    { title: 'Tanggal', dataIndex: 'tanggal_daftar', key: 'tanggal_daftar' },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
            Detail
          </Button>
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleScore(record)}>
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
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={10}>
            <Input
              placeholder="Cari nama desa atau kelompok..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter Pilar"
              style={{ width: '100%' }}
              allowClear
              value={pilarFilter}
              onChange={(value) => setPilarFilter(value)}
            >
              {pilarOptions.map((pilar) => (
                <Option key={pilar} value={pilar}>{pilar}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Button icon={<FilterOutlined />} onClick={() => { setSearchText(''); setPilarFilter(null); }}>
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
            scroll={{ x: 900 }}
          />
        </Spin>
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
            <Descriptions.Item label="Jenis DSA">{selectedPeserta.jenis_dsa}</Descriptions.Item>
            <Descriptions.Item label="Kelompok/Individu">{selectedPeserta.nama_kelompok}</Descriptions.Item>
            {selectedPeserta.jenis_dsa === 'Kelompok' && (
              <Descriptions.Item label="Nama Ketua">{selectedPeserta.nama_ketua}</Descriptions.Item>
            )}
            <Descriptions.Item label="Nomor HP">{selectedPeserta.phone_number}</Descriptions.Item>
            <Descriptions.Item label="Pilar">{selectedPeserta.pilar}</Descriptions.Item>
            <Descriptions.Item label="Kategori">{selectedPeserta.kategori}</Descriptions.Item>
            <Descriptions.Item label="Wilayah" span={2}>{selectedPeserta.wilayah}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={STATUS_MAP[selectedPeserta.status]?.color || 'default'}>
                {STATUS_MAP[selectedPeserta.status]?.label || selectedPeserta.status}
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
