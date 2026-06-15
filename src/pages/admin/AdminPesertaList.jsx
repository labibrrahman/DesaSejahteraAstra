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
  CloseOutlined,
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
 * findAll hanya load: user, pillar, category, assignedJuror.
 * Relasi province/city/district/villageRegion/astraGroup TIDAK di-load di list.
 */
const mapFromApi = (item) => ({
  id: item.id,
  nama_desa: item.villageName || '-',
  nama_kelompok: item.groupName || '-',
  pilar: item.pillar?.name || '-',
  pilar_id: item.pillarId,
  kategori: item.category?.name || '-',
  // Region relations tidak di-load di findAll list, tampilkan '-'
  provinsi: item.province?.name || '-',
  kota: item.city?.name || '-',
  status: item.status,
  tanggal_daftar: item.submittedAt
    ? new Date(item.submittedAt).toLocaleDateString('id-ID')
    : item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('id-ID')
      : '-',
  juri: item.assignedJuror?.name || '-',
  // Detail fields (hanya tersedia saat fetch detail via findOne)
  jenis_dsa: item.dsaType || '-',
  nama_ketua: item.leaderName || '-',
  phone_number: item.phoneNumber || '-',
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
      const status = error.response?.status;
      const backendMsg = error.response?.data?.message;

      if (status === 401) {
        message.error('Sesi habis. Silakan login kembali.');
      } else {
        message.error(backendMsg || 'Gagal memuat data peserta');
      }

      console.error('Fetch registrations error:', error.response?.data || error.message);
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

  /** Helper: download blob sebagai file */
  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  /** Export data peserta ke Excel */
  const handleExport = async () => {
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (pilarFilter) filters.pillar_id = pilarFilter;
      if (searchText) filters.search = searchText;

      const blob = await adminService.exportRegistrations(filters);
      const today = new Date().toISOString().split('T')[0];
      downloadBlob(blob, `export-peserta-${today}.xlsx`);
      message.success('Berhasil mengunduh file export');
    } catch (error) {
      message.error('Gagal mengexport data');
      console.error('Export error:', error);
    }
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
        <Button icon={<ExportOutlined />} onClick={handleExport}>Export Data</Button>
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
        open={detailModalVisible}
        closable={false}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedPeserta(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={720}
        styles={{ body: { padding: 0 } }}
      >
        <Spin spinning={detailLoading}>
          {selectedPeserta && (
            <div>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                padding: '24px 28px',
                borderRadius: '12px 12px 0 0',
                position: 'relative',
              }}>
                {/* Close Button */}
                <Button
                  type="text"
                  icon={<CloseOutlined style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }} />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    setSelectedPeserta(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                />

                <Row justify="space-between" align="middle" gutter={[12, 12]} style={{ paddingRight: 32 }}>
                  <Col xs={18} sm={20}>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                      Detail Peserta
                    </Text>
                    <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: 20, lineHeight: 1.3 }}>
                      {selectedPeserta.nama_desa}
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 6, display: 'block' }}>
                      {selectedPeserta.nama_kelompok}
                    </Text>
                  </Col>
                  <Col xs={6} sm={4} style={{ textAlign: 'right' }}>
                    <Tag color={STATUS_MAP[selectedPeserta.status]?.color || 'default'} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 16, margin: 0, whiteSpace: 'nowrap' }}>
                      {STATUS_MAP[selectedPeserta.status]?.label || selectedPeserta.status}
                    </Tag>
                  </Col>
                </Row>
              </div>

              {/* Content */}
              <div style={{ padding: '24px 32px 28px' }}>
                {/* Section: Identitas Pendaftar */}
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    🏷️ Identitas Pendaftar
                  </Text>
                  <Row gutter={[20, 16]}>
                    <Col xs={12} sm={8}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Jenis DSA</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.jenis_dsa}</Text>
                    </Col>
                    {selectedPeserta.jenis_dsa === 'Kelompok' && (
                      <Col xs={12} sm={8}>
                        <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nama Ketua</Text>
                        <Text strong style={{ fontSize: 13 }}>{selectedPeserta.nama_ketua}</Text>
                      </Col>
                    )}
                    <Col xs={12} sm={8}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nomor HP</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.phone_number}</Text>
                    </Col>
                  </Row>
                </div>

                {/* Section: Program */}
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    📋 Informasi Program
                  </Text>
                  <Row gutter={[20, 16]}>
                    <Col xs={12} sm={8}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Pilar</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.pilar}</Text>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Kategori</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.kategori}</Text>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Grup Astra</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.grup_astra}</Text>
                    </Col>
                  </Row>
                </div>

                {/* Section: Wilayah */}
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    📍 Lokasi & Wilayah
                  </Text>
                  <Row gutter={[20, 16]}>
                    <Col xs={12} sm={8}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Provinsi</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.provinsi}</Text>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Kabupaten / Kota</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.kota}</Text>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Kecamatan</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.kecamatan}</Text>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Desa / Kelurahan</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.desa}</Text>
                    </Col>
                    <Col span={24}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Alamat Lengkap</Text>
                      <Text style={{ fontSize: 13, lineHeight: 1.6 }}>{selectedPeserta.alamat}</Text>
                    </Col>
                  </Row>
                </div>

                {/* Section: Penilaian */}
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    👨‍⚖️ Penilaian
                  </Text>
                  <Row gutter={[20, 16]}>
                    <Col xs={12} sm={12}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Juri Penilai</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.juri}</Text>
                    </Col>
                    <Col xs={12} sm={12}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Tanggal Daftar</Text>
                      <Text strong style={{ fontSize: 13 }}>{selectedPeserta.tanggal_daftar}</Text>
                    </Col>
                  </Row>
                </div>

                {/* Section: Deskripsi Program */}
                <div style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    📝 Deskripsi Program
                  </Text>
                  <div style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Latar Belakang</Text>
                    <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #1890ff' }}>
                      <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{selectedPeserta.latar_belakang}</Text>
                    </div>
                  </div>
                  <div>
                    <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Dampak Program</Text>
                    <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #52c41a' }}>
                      <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{selectedPeserta.dampak_program}</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default AdminPesertaList;
