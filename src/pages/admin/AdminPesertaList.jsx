import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Form,
  Row,
  Col,
  Typography,
  Modal,
  Descriptions,
  Spin,
  message,
  Upload,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  ExportOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';
import masterService from '../../services/masterService';
import registrationService from '../../services/registrationService';
import RegistrationDetailModal from '../../components/RegistrationDetailModal';
import logger from '../../lib/logger';

const { Title, Text } = Typography;
const { Option } = Select;

/** Mapping status dari backend */
const STATUS_MAP = {
  draft: { label: 'Draft', color: 'default' },
  waiting_screening: { label: 'Menunggu Screening', color: 'processing' },
  being_assessed: { label: 'Sedang Dinilai', color: 'warning' },
  assessed: { label: 'Selesai Dinilai', color: 'info' },
  finalist: { label: 'Lolos', color: 'success' },
  rejected: { label: 'Tidak Lolos', color: 'error' },
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
  // Region — gabungkan semua level wilayah
  wilayah: [
    item.province?.name,
    item.city?.name,
    item.district?.name,
    item.villageRegion?.name,
  ].filter(Boolean).join(', ') || '-',
  provinsi: item.province?.name || '-',
  kota: item.city?.name || '-',
  status: item.status,
  tanggal_daftar: item.submittedAt
    ? new Date(item.submittedAt).toLocaleDateString('id-ID')
    : item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('id-ID')
      : '-',
  juri: item.assessments?.[0]?.juror?.name || item.assignedJuror?.name || '-',
  // Detail fields (hanya tersedia saat fetch detail via findOne)
  jenis_dsa: item.dsaType || '-',
  phone_number: item.phoneNumber || '-',
  nama_kontak_darurat: item.emergencyContactName || '-',
  no_hp_kontak_darurat: item.emergencyContactPhone || '-',
  alamat: item.address || '-',
  grup_astra: item.astraGroupCustom || item.astraGroup?.name || '-',
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
  kecamatan: item.district?.name || '-',
  desa: item.villageRegion?.name || '-',
});

const AdminPesertaList = () => {
  const [data, setData] = useState([]);
  const [pilarOptions, setPilarOptions] = useState([]);
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [astraGroupOptions, setAstraGroupOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [pilarFilter, setPilarFilter] = useState(null);
  const [durasiFilter, setDurasiFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [selectedPesertaRaw, setSelectedPesertaRaw] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm] = Form.useForm();
  const [editPhotos, setEditPhotos] = useState([]);
  const [uploadingEditPhoto, setUploadingEditPhoto] = useState(false);

  // Region options & loading for Edit Modal
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [desaOptions, setDesaOptions] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingDesa, setLoadingDesa] = useState(false);

  /** Fetch registrations dari API */
  const fetchRegistrations = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (searchText) params.search = searchText;
      if (statusFilter) params.status = statusFilter;
      if (pilarFilter) params.pillar_id = pilarFilter;
      if (durasiFilter) params.program_duration = durasiFilter;

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

      logger.error('Fetch registrations error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter, pilarFilter, durasiFilter]);

  /** Fetch pilar options untuk filter */
  const fetchPillars = useCallback(async () => {
    try {
      const result = await masterService.getPillars();
      const list = Array.isArray(result) ? result : [];
      setPilarOptions(list.map((item) => ({ id: item.id, name: item.name })));
    } catch (error) {
      logger.error('Fetch pilar error:', error);
    }
  }, []);

  /** Fetch kategori berdasarkan pilar */
  const fetchKategoriByPilar = async (pilarId) => {
    if (!pilarId) { setKategoriOptions([]); return; }
    try {
      const cats = await masterService.getCategories(pilarId);
      setKategoriOptions(Array.isArray(cats) ? cats.map(c => ({ id: c.id, name: c.name })) : []);
    } catch {
      setKategoriOptions([]);
    }
  };

  /** Fetch provinces dari API */
  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const result = await masterService.getProvinces({ limit: 100 });
      const list = Array.isArray(result) ? result : result?.data || [];
      setProvinceOptions(list.map(p => ({ id: p.id, name: p.name })));
    } catch {
      message.error('Gagal memuat data provinsi');
    } finally {
      setLoadingProvinces(false);
    }
  };

  /** Fetch kota/kabupaten dari API */
  const fetchCities = async (provinceId) => {
    if (!provinceId) { setCityOptions([]); return; }
    setLoadingCities(true);
    try {
      const result = await masterService.getCities(provinceId, { limit: 100 });
      const list = Array.isArray(result) ? result : result?.data || [];
      setCityOptions(list.map(c => ({ id: c.id, name: c.name })));
    } catch {
      setCityOptions([]);
    } finally {
      setLoadingCities(false);
    }
  };

  /** Fetch kecamatan dari API */
  const fetchDistricts = async (cityId) => {
    if (!cityId) { setDistrictOptions([]); return; }
    setLoadingDistricts(true);
    try {
      const result = await masterService.getDistricts(cityId, { limit: 100 });
      const list = Array.isArray(result) ? result : result?.data || [];
      setDistrictOptions(list.map(d => ({ id: d.id, name: d.name })));
    } catch {
      setDistrictOptions([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  /** Fetch desa/kelurahan dari API */
  const fetchVillages = async (districtId) => {
    if (!districtId) { setDesaOptions([]); return; }
    setLoadingDesa(true);
    try {
      const result = await masterService.getVillages(districtId, { limit: 100 });
      const list = Array.isArray(result) ? result : result?.data || [];
      setDesaOptions(list.map(v => ({ id: v.id, name: v.name })));
    } catch {
      setDesaOptions([]);
    } finally {
      setLoadingDesa(false);
    }
  };

  const handleProvinceChange = async (provinceId) => {
    editForm.setFieldsValue({
      cityId: null,
      districtId: null,
      villageRegionId: null,
    });
    setCityOptions([]);
    setDistrictOptions([]);
    setDesaOptions([]);
    if (provinceId) {
      await fetchCities(provinceId);
    }
  };

  const handleCityChange = async (cityId) => {
    editForm.setFieldsValue({
      districtId: null,
      villageRegionId: null,
    });
    setDistrictOptions([]);
    setDesaOptions([]);
    if (cityId) {
      await fetchDistricts(cityId);
    }
  };

  const handleDistrictChange = async (districtId) => {
    editForm.setFieldsValue({
      villageRegionId: null,
    });
    setDesaOptions([]);
    if (districtId) {
      await fetchVillages(districtId);
    }
  };

  useEffect(() => {
    fetchPillars();
    // Fetch astra groups
    masterService.getAstraGroups().then(result => {
      setAstraGroupOptions(Array.isArray(result) ? result.map(g => ({ id: g.id, name: g.name })) : []);
    }).catch(() => {});
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
      setSelectedPesertaRaw(detail);
    } catch (error) {
      message.error('Gagal memuat detail peserta');
      setSelectedPeserta(record);
      setSelectedPesertaRaw(null);
    } finally {
      setDetailLoading(false);
    }
  };

  /** Buka modal edit */
  const showEditModal = async (record) => {
    setEditLoading(true);
    setEditModalVisible(true);
    try {
      const detail = await adminService.getRegistrationDetail(record.id);
      setEditRecord(detail);
      const pilarId = detail.pillar?.id || detail.pillarId;

      // Ensure pilar options are loaded (re-fetch if empty)
      if (pilarOptions.length === 0) {
        await fetchPillars();
      }

      // Load kategori based on selected pilar
      if (pilarId) await fetchKategoriByPilar(pilarId);

      // Load region options
      await fetchProvinces();
      if (detail.provinceId) await fetchCities(detail.provinceId);
      if (detail.cityId) await fetchDistricts(detail.cityId);
      if (detail.districtId) await fetchVillages(detail.districtId);

      // Ensure astra group options are loaded
      if (astraGroupOptions.length === 0) {
        try {
          const result = await masterService.getAstraGroups();
          setAstraGroupOptions(Array.isArray(result) ? result.map(g => ({ id: g.id, name: g.name })) : []);
        } catch { /* ignore */ }
      }

      // Use setTimeout to ensure Select options are rendered before setting values
      setTimeout(() => {
        editForm.setFieldsValue({
          status: detail.status,
          pillarId: pilarId || undefined,
          categoryId: detail.category?.id || detail.categoryId || undefined,
          villageName: detail.villageName,
          groupName: detail.groupName,
          phoneNumber: detail.phoneNumber,
          dsaType: detail.dsaType,
          astraGroupId: detail.astraGroup?.id || null,
          astraGroupCustom: detail.astraGroupCustom || '',
          address: detail.address,
          background: detail.background,
          programImpact: detail.programImpact,
          programImpactAfter: detail.programImpactAfter || '',
          documentLink: detail.documentLink || '',
          developmentPlan: detail.developmentPlan,
          implementationMethod: detail.implementationMethod || '',
          sustainabilityPlan: detail.sustainabilityPlan || '',
          programEvaluation: detail.programEvaluation || '',
          programDuration: detail.programDuration,
          emergencyContactName: detail.emergencyContactName,
          emergencyContactPhone: detail.emergencyContactPhone,
          provinceId: detail.provinceId || null,
          cityId: detail.cityId || null,
          districtId: detail.districtId || null,
          villageRegionId: detail.villageRegionId || null,
          socialMedia: detail.socialMedia || '',
        });
        if (Array.isArray(detail.photos) && detail.photos.length > 0) {
          setEditPhotos(detail.photos.map(p => ({ url: p.photoUrl, originalName: p.originalName, generatedName: p.generatedName })));
        } else {
          setEditPhotos([]);
        }
      }, 100);
    } catch (error) {
      message.error('Gagal memuat data');
      setEditModalVisible(false);
    } finally {
      setEditLoading(false);
    }
  };

  /** Submit edit */
  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setEditSubmitting(true);

      // Update data registrasi (tanpa status)
      const payload = {
        pillarId: values.pillarId,
        categoryId: values.categoryId,
        villageName: values.villageName,
        groupName: values.groupName,
        phoneNumber: values.phoneNumber,
        address: values.address,
        background: values.background,
        programImpact: values.programImpact,
        programImpactAfter: values.programImpactAfter || '',
        documentLink: values.documentLink || '',
        developmentPlan: values.developmentPlan,
        implementationMethod: values.implementationMethod || '',
        sustainabilityPlan: values.sustainabilityPlan || '',
        programEvaluation: values.programEvaluation || '',
        programDuration: values.programDuration,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        provinceId: values.provinceId || null,
        cityId: values.cityId || null,
        districtId: values.districtId || null,
        villageRegionId: values.villageRegionId || null,
      };
      if (values.astraGroupId === 'others') {
        payload.astraGroupCustom = values.astraGroupCustom || '';
      } else if (values.astraGroupId) {
        payload.astraGroupId = values.astraGroupId;
      } else {
        payload.astraGroupId = null;
        payload.astraGroupCustom = '';
      }
      if (values.socialMedia) payload.socialMedia = values.socialMedia;
      if (editPhotos.length > 0) {
        payload.photos = editPhotos.map(p => ({ url: p.url, originalName: p.originalName, generatedName: p.generatedName }));
      }
      await adminService.updateRegistrationByAdmin(editRecord.id, payload);

      // Update status jika berubah (endpoint terpisah)
      if (values.status && values.status !== editRecord.status) {
        await adminService.updateRegistrationStatus(editRecord.id, { status: values.status });
      }

      message.success('Data berhasil diperbarui');
      setEditModalVisible(false);
      editForm.resetFields();
      setEditRecord(null);
      setEditPhotos([]);
      fetchRegistrations(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.response?.data?.message || 'Gagal memperbarui data');
    } finally {
      setEditSubmitting(false);
    }
  };

  /** Upload foto untuk edit */
  const handleEditPhotoUpload = async (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Format foto harus JPEG, PNG, atau WEBP');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('Ukuran foto maksimal 5 MB');
      return false;
    }
    if (editPhotos.length >= 2) {
      message.error('Maksimal 2 foto');
      return false;
    }
    setUploadingEditPhoto(true);
    try {
      const result = await registrationService.uploadPhoto(file);
      setEditPhotos(prev => [...prev, result]);
      message.success('Foto berhasil diunggah');
    } catch {
      message.error('Gagal mengunggah foto');
    } finally {
      setUploadingEditPhoto(false);
    }
    return false;
  };

  /** Hapus foto edit */
  const handleEditPhotoDelete = async (index) => {
    const photo = editPhotos[index];
    try {
      if (photo.generatedName) {
        await registrationService.deletePhoto(photo.generatedName);
      }
    } catch { /* ignore */ }
    setEditPhotos(prev => prev.filter((_, i) => i !== index));
    message.success('Foto dihapus');
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
    setDurasiFilter(null);
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
      logger.error('Export error:', error);
    }
  };

  const columns = [
    {
      title: 'Nama DSA/Nama Desa',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'nama_desa',
      key: 'nama_desa',
      render: (text, record) => (
        <Button type="link" onClick={() => showDetail(record)} style={{ padding: 0 }}>
          {text}
        </Button>
      ),
    },
    { 
      title: 'Nama Ketua Kelompok', 
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'nama_kelompok', 
      key: 'nama_kelompok' },
    { 
      title: 'Pilar', 
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'pilar', 
      key: 'pilar' },
    { 
      title: 'Kategori', 
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'kategori', 
      key: 'kategori' },
    { 
      title: 'Wilayah', 
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'wilayah', 
      key: 'wilayah' },
    {
      title: 'Status',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let val = status;
        val = status === 'Finalis' && 'Lolos'  
        val = status === 'rejected' && 'Tidak Lolos'  
        
        return (<Tag color={STATUS_MAP[status]?.color || 'default'}>
          {STATUS_MAP[status]?.label || status}
        </Tag>)
      },
    },
    { 
      title: 'Tanggal', 
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      dataIndex: 'tanggal_daftar', 
      key: 'tanggal_daftar' },
    {
      title: 'Aksi',
      onHeaderCell: () => ({
        style: { whiteSpace: 'nowrap' },
      }),
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)} style={{ padding: '0 4px' }}>
            Detail
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => showEditModal(record)} style={{ padding: '0 4px' }}>
            Edit
          </Button>
        </Space>
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
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Cari Nama DSA atau Nama Ketua Kelompok..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ flex: '1 1 200px', minWidth: 180 }}
          />
          <Select
            placeholder="Status"
            style={{ flex: '1 1 140px', minWidth: 130 }}
            allowClear
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
          >
            {Object.entries(STATUS_MAP).map(([key, val]) => (
              <Option key={key} value={key}>{val.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Pilar"
            style={{ flex: '1 1 140px', minWidth: 130 }}
            allowClear
            value={pilarFilter}
            onChange={(value) => setPilarFilter(value)}
          >
            {pilarOptions.map((pilar) => (
              <Option key={pilar.id} value={pilar.id}>{pilar.name}</Option>
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
          <Button onClick={handleReset} style={{ flexShrink: 0 }}>Reset</Button>
        </div>
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
      <RegistrationDetailModal
        open={detailModalVisible}
        onClose={() => { setDetailModalVisible(false); setSelectedPeserta(null); }}
        registration={selectedPesertaRaw}
        title="Detail Peserta"
      />

      {/* Edit Modal — admin bisa edit semua field */}
      <Modal
        title="Edit Data Peserta"
        open={editModalVisible}
        onOk={handleEditSubmit}
        confirmLoading={editSubmitting}
        onCancel={() => { setEditModalVisible(false); editForm.resetFields(); setEditRecord(null); setEditPhotos([]); }}
        okText="Simpan"
        cancelText="Batal"
        width={680}
      >
        <Spin spinning={editLoading}>
          {editRecord && (
            <Form form={editForm} layout="vertical">
              {/* Status */}
              {/* <Form.Item name="status" label="Status Pendaftaran" rules={[{ required: true, message: 'Pilih status' }]}>
                <Select placeholder="Pilih status">
                  <Option value="draft">Draft</Option>
                  <Option value="waiting_screening">Menunggu Screening</Option>
                  <Option value="being_assessed">Sedang Dinilai</Option>
                  <Option value="assessed">Selesai Dinilai</Option>
                  <Option value="finalist">Finalis</Option>
                  <Option value="rejected">Ditolak</Option>
                </Select>
              </Form.Item> */}

              {/* Pilar & Kategori */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="pillarId" label="Pilar">
                    <Select
                      placeholder="Pilih Pilar"
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={pilarOptions.map(p => ({ value: p.id, label: p.name }))}
                      onChange={(val) => { fetchKategoriByPilar(val); editForm.setFieldsValue({ categoryId: null }); }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="categoryId" label="Kategori">
                    <Select
                      placeholder="Pilih Kategori"
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={kategoriOptions.map(c => ({ value: c.id, label: c.name }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Data DSA */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="villageName" label="Nama DSA/Nama Desa" rules={[{ required: true, message: 'Wajib diisi' }]}>
                    <Input placeholder="Contoh: Desa Suka Maju" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="groupName" label="Nama Ketua Kelompok">
                    <Input placeholder="Masukan Nama Ketua Kelompok" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="phoneNumber" label="Nomor HP Ketua Kelompok">
                    <Input placeholder="Contoh: 08123456789" maxLength={15} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="astraGroupId" label="Perusahaan/Yayasan Pembina">
                    <Select placeholder="Pilih Perusahaan/Yayasan Pembina" allowClear>
                      {astraGroupOptions.map(g => (
                        <Option key={g.id} value={g.id}>{g.name}</Option>
                      ))}
                      <Option value="others">Lainnya...</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.astraGroupId !== cur.astraGroupId}>
                {({ getFieldValue }) => getFieldValue('astraGroupId') === 'others' && (
                  <Form.Item name="astraGroupCustom" label="Nama Binaan Lainnya">
                    <Input placeholder="Masukkan nama Perusahaan/Yayasan Pembina lainnya" />
                  </Form.Item>
                )}
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="emergencyContactName" label="Nama Kontak Lainnya">
                    <Input placeholder="Contoh: Siti Aminah" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="emergencyContactPhone" label="Nomor Kontak Lainnya">
                    <Input placeholder="Contoh: 08123456789" maxLength={15} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="address" label="Alamat Lengkap">
                <Input.TextArea rows={3} placeholder="Detail jalan, RW/RT..." style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              {/* Wilayah Administratif */}
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const provinceId = getFieldValue('provinceId');
                  const cityId = getFieldValue('cityId');
                  const districtId = getFieldValue('districtId');
                  return (
                    <>
                      <div style={{ marginTop: 12, marginBottom: 12, fontWeight: 600 }}>Wilayah Administratif</div>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="provinceId" label="Provinsi">
                            <Select
                              placeholder="Pilih Provinsi"
                              allowClear
                              showSearch
                              optionFilterProp="children"
                              onChange={handleProvinceChange}
                              loading={loadingProvinces}
                            >
                              {provinceOptions.map(p => (
                                <Option key={p.id} value={p.id}>{p.name}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="cityId" label="Kabupaten / Kota">
                            <Select
                              placeholder="Pilih Kabupaten / Kota"
                              allowClear
                              showSearch
                              optionFilterProp="children"
                              onChange={handleCityChange}
                              loading={loadingCities}
                              disabled={!provinceId}
                            >
                              {cityOptions.map(c => (
                                <Option key={c.id} value={c.id}>{c.name}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="districtId" label="Kecamatan">
                            <Select
                              placeholder="Pilih Kecamatan"
                              allowClear
                              showSearch
                              optionFilterProp="children"
                              onChange={handleDistrictChange}
                              loading={loadingDistricts}
                              disabled={!cityId}
                            >
                              {districtOptions.map(d => (
                                <Option key={d.id} value={d.id}>{d.name}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="villageRegionId" label="Desa / Kelurahan">
                            <Select
                              placeholder="Pilih Desa / Kelurahan"
                              allowClear
                              showSearch
                              optionFilterProp="children"
                              loading={loadingDesa}
                              disabled={!districtId}
                            >
                              {desaOptions.map(v => (
                                <Option key={v.id} value={v.id}>{v.name}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  );
                }}
              </Form.Item>

              <Form.Item name="programDuration" label="Durasi Program">
                <Select placeholder="Pilih durasi program..." allowClear>
                  <Option value="<1 Tahun">&lt;1 Tahun</Option>
                  <Option value="1-3 Tahun">1-3 Tahun</Option>
                  <Option value="3-5 Tahun">3-5 Tahun</Option>
                  <Option value=">5 Tahun">&gt;5 Tahun</Option>
                </Select>
              </Form.Item>

              <Form.Item name="background" label="Latar Belakang / Rasionalisasi">
                <Input.TextArea rows={5} placeholder="Jelaskan alasan dan latar belakang inisiatif program ini..." style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="programImpact" label="Kondisi Sebelum Program">
                <Input.TextArea rows={5} placeholder="Jelaskan Kondisi Sebelum Program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="programImpactAfter" label="Kondisi Setelah Program">
                <Input.TextArea rows={5} placeholder="Jelaskan Kondisi Setelah Program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="developmentPlan" label="Rencana dan Potensi Untuk Keberlanjutan Program">
                <Input.TextArea rows={5} placeholder="Jelaskan Rencana dan Potensi Untuk Keberlanjutan Program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="implementationMethod" label="Metode Pelaksanaan Program">
                <Input.TextArea rows={5} placeholder="Jelaskan metode pelaksanaan program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="sustainabilityPlan" label="Keberlanjutan Program">
                <Input.TextArea rows={5} placeholder="Jelaskan rencana keberlanjutan program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="programEvaluation" label="Evaluasi Program">
                <Input.TextArea rows={5} placeholder="Jelaskan mekanisme evaluasi program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="socialMedia" label="Media Sosial">
                <Input.TextArea rows={2} placeholder="Contoh: https://instagram.com/akun, https://facebook.com/akun" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="documentLink" label="link dokumentasi foto/video/publikasi lainnya">
                <Input placeholder="https://drive.google.com/drive/folders/..." style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13 }} />
              </Form.Item>

              {/* Foto Dokumentasi */}
              <div style={{ marginBottom: 24 }}>
                <Text style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Foto Dokumentasi (Maks. 2 foto, 5 MB per foto)</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {editPhotos.map((photo, index) => (
                    <div key={index} style={{ width: 100, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                      <img
                        src={photo.url?.startsWith('http') ? photo.url : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.url}`}
                        alt={photo.originalName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined style={{ fontSize: 12, color: '#fff' }} />}
                        onClick={() => handleEditPhotoDelete(index)}
                        style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, minWidth: 24, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      />
                    </div>
                  ))}
                  {editPhotos.length < 2 && (
                    <Upload accept=".jpg,.jpeg,.png,.webp" showUploadList={false} beforeUpload={handleEditPhotoUpload} disabled={uploadingEditPhoto}>
                      <div style={{ width: 100, height: 100, borderRadius: 8, border: '1.5px dashed #d1d5db', background: '#fafbfc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploadingEditPhoto ? 'not-allowed' : 'pointer', opacity: uploadingEditPhoto ? 0.6 : 1 }}>
                        {uploadingEditPhoto ? <Spin size="small" /> : <><PlusOutlined style={{ fontSize: 20, color: '#9ca3af', marginBottom: 4 }} /><Text style={{ fontSize: 11, color: '#9ca3af' }}>Tambah</Text></>}
                      </div>
                    </Upload>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default AdminPesertaList;