import React, { useState, useEffect, useCallback } from 'react';
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
  Spin,
  message,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';
import masterService from '../../services/masterService';

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
 * Mapping data registration dari API ke format UI.
 */
const mapFromApi = (item) => ({
  id: item.id,
  nama_desa: item.villageName || '-',
  nama_kelompok: item.groupName || '-',
  pilar: item.pillar?.name || '-',
  pilar_id: item.pillarId,
  kategori: item.category?.name || '-',
  wilayah: [item.province?.name, item.city?.name].filter(Boolean).join(' - ') || '-',
  status: item.status,
  tanggal_daftar: item.submittedAt
    ? new Date(item.submittedAt).toLocaleDateString('id-ID')
    : item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('id-ID')
      : '-',
  juri: item.assignedJuror?.name || '-',
  // Detail fields
  alamat: item.address || '-',
  grup_astra: item.astraGroup?.name || '-',
  latar_belakang: item.background || '-',
  dampak_program: item.programImpact || '-',
  kecamatan: item.district?.name || '-',
  desa: item.villageRegion?.name || '-',
});

const AdminPesertaList = () => {
  const [data, setData] = useState([]);
  const [pilarOptions, setPilarOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [pilarFilter, setPilarFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /** Fetch registrations dari API */
  const fetchRegistrations = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (searchText) params.search = searchText;
      if (statusFilter) params.status = statusFilter;
      if (pilarFilter) params.pillar_id = pilarFilter;

      const result = await adminService.getRegistrations(params);

      // Handle paginated response
      const list = Array.isArray(result) ? result : result?.data || [];
      const meta = result?.meta || {};

      setData(list.map(mapFromApi));
      setPagination((prev) => ({
        ...prev,
        current: meta.page || page,
        total: meta.total || list.length,
        pageSize: meta.limit || limit,
      }));
    } catch (error) {
      message.error('Gagal memuat data peserta');
      console.error('Fetch registrations error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter, pilarFilter]);

  /** Fetch pilar options untuk filter */
  const fetchPillars = useCallback(async () => {
    try {
      const result = await masterService.getPillars();
      const list = Array.isArray(result) ? result : [];
      setPilarOptions(list.map((item) => ({ id: item.id, name: item.name })));
    } catch (error) {
      console.error('Fetch pilar error:', error);
    }
  }, []);

  useEffect(() => {
    fetchPillars();
  }, [fetchPillars]);

  useEffect(() => {
    fetchRegistrations(1, pagination.pageSize);
  }, [fetchRegistrations, pagination.pageSize]);

  /** Fetch detail peserta */
  const showDetail = async (record) => {
    setDetailLoading(true);
    setDetailModalVisible(true);
    try {
      const detail = await adminService.getRegistrationDetail(record.id);
      setSelectedPeserta(mapFromApi(detail));
    } catch (error) {
      message.error('Gagal memuat detail peserta');
      setSelectedPeserta(record);
    } finally {
      setDetailLoading(false);
    }
  };

  /** Handle perubahan halaman */
  const handleTableChange = (pag) => {
    fetchRegistrations(pag.current, pag.pageSize);
  };

  /** Reset semua filter */
  const handleReset = () => {
    setSearchText('');
    setStatusFilter(null);
    setPilarFilter(null);
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
    { title: 'Juri', dataIndex: 'juri', key: 'juri' },
    { title: 'Tanggal', dataIndex: 'tanggal_daftar', key: 'tanggal_daftar' },
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
            <Input
              placeholder="Cari nama desa atau kelompok..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              placeholder="Filter Status"
              style={{ width: '100%' }}
              allowClear
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
            >
              {Object.entries(STATUS_MAP).map(([key, val]) => (
                <Option key={key} value={key}>{val.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              placeholder="Filter Pilar"
              style={{ width: '100%' }}
              allowClear
              value={pilarFilter}
              onChange={(value) => setPilarFilter(value)}
            >
              {pilarOptions.map((pilar) => (
                <Option key={pilar.id} value={pilar.id}>{pilar.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Space wrap>
              <Button onClick={handleReset}>Reset</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} peserta`,
            }}
            onChange={handleTableChange}
            size="middle"
            scroll={{ x: 900 }}
          />
        </Spin>
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Detail Peserta"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedPeserta(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={700}
      >
        <Spin spinning={detailLoading}>
          {selectedPeserta && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Nama Desa">{selectedPeserta.nama_desa}</Descriptions.Item>
              <Descriptions.Item label="Kelompok/Individu">{selectedPeserta.nama_kelompok}</Descriptions.Item>
              <Descriptions.Item label="Pilar">{selectedPeserta.pilar}</Descriptions.Item>
              <Descriptions.Item label="Kategori">{selectedPeserta.kategori}</Descriptions.Item>
              <Descriptions.Item label="Grup Astra">{selectedPeserta.grup_astra}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={STATUS_MAP[selectedPeserta.status]?.color || 'default'}>
                  {STATUS_MAP[selectedPeserta.status]?.label || selectedPeserta.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Provinsi" span={1}>{selectedPeserta.wilayah}</Descriptions.Item>
              <Descriptions.Item label="Kecamatan">{selectedPeserta.kecamatan}</Descriptions.Item>
              <Descriptions.Item label="Desa">{selectedPeserta.desa}</Descriptions.Item>
              <Descriptions.Item label="Alamat" span={2}>{selectedPeserta.alamat}</Descriptions.Item>
              <Descriptions.Item label="Juri">{selectedPeserta.juri}</Descriptions.Item>
              <Descriptions.Item label="Tanggal Daftar">{selectedPeserta.tanggal_daftar}</Descriptions.Item>
              <Descriptions.Item label="Latar Belakang" span={2}>{selectedPeserta.latar_belakang}</Descriptions.Item>
              <Descriptions.Item label="Dampak Program" span={2}>{selectedPeserta.dampak_program}</Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default AdminPesertaList;
