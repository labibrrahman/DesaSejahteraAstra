import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Typography,
  Space,
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
import RegistrationDetailModal from '../../components/RegistrationDetailModal';
import logger from '../../lib/logger';

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
  dampak_program_after: item.programImpactAfter || '-',
  document_link: item.documentLink || '-',
  rencana_pengembangan: item.developmentPlan || '-',
  metode_pelaksanaan: item.implementationMethod || '-',
  keberlanjutan_program: item.sustainabilityPlan || '-',
  evaluasi_program: item.programEvaluation || '-',
  social_media: item.socialMedia || '-',
  foto: Array.isArray(item.photos) ? item.photos : [],
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
  const [selectedPesertaRaw, setSelectedPesertaRaw] = useState(null);
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

      logger.error('Fetch tasks error:', error.response?.data || error.message);
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

  const showDetail = async (record) => {
    setSelectedPeserta(record);
    setDetailModalVisible(true);
    try {
      const detail = await adminService.getRegistrationDetail(record.id);
      setSelectedPesertaRaw(detail);
    } catch (error) {
      message.error('Gagal memuat detail peserta');
    }
  };

  const handleScore = (record) => {
    navigate(`/juri/penilaian/${record.id}`);
  };

  const columns = [
    {
      title: 'Nama DSA/Nama Desa',
      dataIndex: 'nama_desa',
      key: 'nama_desa',
      render: (text, record) => (
        <Button type="link" onClick={() => showDetail(record)} style={{ padding: 0 }}>
          {text}
        </Button>
      ),
    },
    { title: 'Nama Ketua Kelompok', dataIndex: 'nama_kelompok', key: 'nama_kelompok' },
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
            placeholder="Cari Nama DSA atau Nama Peserta/Ketua Kelompok..."
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
      <RegistrationDetailModal
        open={detailModalVisible}
        onClose={() => { setDetailModalVisible(false); setSelectedPeserta(null); }}
        registration={selectedPesertaRaw}
        title="Detail Peserta"
      />
    </div>
  );
};

export default JuriPesertaList;
