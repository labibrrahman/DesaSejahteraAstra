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
  TagOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
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
  wilayah: item.province?.name
    ? [item.province?.name, item.city?.name, item.district?.name, item.villageRegion?.name].filter(Boolean).join(', ')
    : '-',
  jenis_dsa: item.dsaType || '-',
  phone_number: item.phoneNumber || '-',
  nama_kontak_darurat: item.emergencyContactName || '-',
  no_hp_kontak_darurat: item.emergencyContactPhone || '-',
  durasi_program: item.programDuration || '-',
  latar_belakang: item.background || '-',
  dampak_program: item.programImpact || '-',
  rencana_pengembangan: item.developmentPlan || '-',
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
  const [durasiFilter, setDurasiFilter] = useState(null);
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
    const matchDurasi = !durasiFilter || item.durasi_program === durasiFilter;
    return matchSearch && matchPilar && matchDurasi;
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
    { title: 'Wilayah', dataIndex: 'wilayah', key: 'wilayah' },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (status) => (
    //     <Tag color={STATUS_MAP[status]?.color || 'default'}>
    //       {STATUS_MAP[status]?.label || status}
    //     </Tag>
    //   ),
    // },
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
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Cari Nama DSA atau Nama Peserta/Penanggung Jawab..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ flex: '1 1 200px', minWidth: 180 }}
          />
          <Select
            placeholder="Pilar"
            style={{ flex: '1 1 140px', minWidth: 130 }}
            allowClear
            value={pilarFilter}
            onChange={(value) => setPilarFilter(value)}
          >
            {pilarOptions.map((pilar) => (
              <Option key={pilar} value={pilar}>{pilar}</Option>
            ))}
          </Select>
          <Select
            placeholder="Durasi"
            style={{ flex: '1 1 130px', minWidth: 120 }}
            allowClear
            value={durasiFilter}
            onChange={(value) => setDurasiFilter(value)}
          >
            <Option value="<1 Tahun">&lt;1 Tahun</Option>
            <Option value="1-3 Tahun">1-3 Tahun</Option>
            <Option value="3-5 Tahun">3-5 Tahun</Option>
            <Option value=">5 Tahun">&gt;5 Tahun</Option>
          </Select>
          <Button icon={<FilterOutlined />} onClick={() => { setSearchText(''); setPilarFilter(null); setDurasiFilter(null); }} style={{ flexShrink: 0 }}>
            Reset
          </Button>
        </div>
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
        open={detailModalVisible}
        closable={false}
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
            style={{ background: '#1890ff', borderColor: '#1890ff', fontWeight: 600 }}
          >
            Beri Nilai
          </Button>,
        ]}
        width={720}
        styles={{ body: { padding: 0 } }}
      >
        {selectedPeserta && (
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
                Detail Peserta
              </Text>
              <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: 20 }}>
                {selectedPeserta.nama_desa}
              </Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
                  {selectedPeserta.nama_kelompok}
                </Text>
                {/* <Tag color={STATUS_MAP[selectedPeserta.status]?.color || 'default'} style={{ margin: 0, fontSize: 11 }}>
                  {STATUS_MAP[selectedPeserta.status]?.label || selectedPeserta.status}
                </Tag> */}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px 28px 28px' }}>
              {/* Informasi Program */}
              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ marginRight: 6 }}><FileTextOutlined /></span> Informasi Program
                </Text>
                <Row gutter={[20, 12]}>
                  {[
                    { label: 'Pilar', value: selectedPeserta.pilar },
                    { label: 'Kategori', value: selectedPeserta.kategori },
                    { label: 'Durasi Program', value: selectedPeserta.durasi_program },
                    { label: 'Tanggal Daftar', value: selectedPeserta.tanggal_daftar },
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

              {/* Identitas Pendaftar */}
              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ marginRight: 6 }}><TagOutlined /></span> Identitas Pendaftar
                </Text>
                <Row gutter={[20, 12]}>
                  {[
                    { label: 'Jenis DSA', value: selectedPeserta.jenis_dsa },
                    { label: 'Nomor HP', value: selectedPeserta.phone_number },
                    { label: 'Nama Kontak Darurat', value: selectedPeserta.nama_kontak_darurat },
                    { label: 'No HP Kontak Darurat', value: selectedPeserta.no_hp_kontak_darurat },
                  ].filter(item => item.value).map((item, idx) => (
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

              {/* Wilayah */}
              <div>
                <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ marginRight: 6 }}><EnvironmentOutlined /></span> Wilayah
                </Text>
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '12px 16px',
                    borderLeft: '3px solid #1890ff',
                  }}
                >
                  <Text style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                    {selectedPeserta.wilayah}
                  </Text>
                </div>
              </div>

              {/* Deskripsi Program */}
              <div style={{ 
                paddingTop:'20px'
               }}>
                <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ marginRight: 6 }}><EditOutlined /></span> Deskripsi Program
                </Text>
                <div style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Latar Belakang</Text>
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #1890ff' }}>
                    <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{selectedPeserta.latar_belakang}</Text>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Dampak Yang Sudah Terealisasi</Text>
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #52c41a' }}>
                    <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{selectedPeserta.dampak_program}</Text>
                  </div>
                </div>
                <div>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Rencana Pengembangan</Text>
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #722ed1' }}>
                    <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{selectedPeserta.rencana_pengembangan}</Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JuriPesertaList;
