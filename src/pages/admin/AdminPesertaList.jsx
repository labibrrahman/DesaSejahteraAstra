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
  Collapse,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  ExportOutlined,
  CloseOutlined,
  PlusOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';
import masterService from '../../services/masterService';
import registrationService from '../../services/registrationService';
import logger from '../../lib/logger';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

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
 * Mapping data grouped participant dari API ke format UI.
 * Response: { userId, user, villageName, groupName, ..., programText, programs[] }
 */
const mapGroupedFromApi = (item) => ({
  userId: item.userId,
  user: item.user,
  nama_desa: item.villageName || '-',
  nama_kelompok: item.groupName || '-',
  wilayah: [
    item.villageRegion?.name,
    item.district?.name,
    item.city?.name,
    item.province?.name,
  ].filter(Boolean).join(' - ') || '-',
  programText: item.programText || '-',
  programs: item.programs || [],
  // Raw data untuk detail & edit
  _raw: item,
});

const AdminPesertaList = () => {
  const [data, setData] = useState([]);
  const [pilarOptions, setPilarOptions] = useState([]);
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [astraGroupOptions, setAstraGroupOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pilarFilter, setPilarFilter] = useState(null);
  const [kategoriFilter, setKategoriFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Detail modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // Edit Info Peserta modal
  const [editParticipantModalVisible, setEditParticipantModalVisible] = useState(false);
  const [editParticipantRecord, setEditParticipantRecord] = useState(null);
  const [editParticipantLoading, setEditParticipantLoading] = useState(false);
  const [editParticipantSubmitting, setEditParticipantSubmitting] = useState(false);
  const [editParticipantForm] = Form.useForm();

  // Edit Program Lomba modal
  const [editProgramModalVisible, setEditProgramModalVisible] = useState(false);
  const [editProgramRecord, setEditProgramRecord] = useState(null);
  const [editProgramLoading, setEditProgramLoading] = useState(false);
  const [editProgramSubmitting, setEditProgramSubmitting] = useState(false);
  const [editProgramForm] = Form.useForm();
  const [editPhotos, setEditPhotos] = useState([]);
  const [uploadingEditPhoto, setUploadingEditPhoto] = useState(false);

  // Region options & loading for Edit Participant Modal
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [desaOptions, setDesaOptions] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingDesa, setLoadingDesa] = useState(false);

  // ─── Data Fetching ──────────────────────────────────────────

  /** Fetch grouped participants dari API */
  const fetchParticipants = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (searchText) params.search = searchText;
      if (pilarFilter) params.pillar_id = pilarFilter;
      if (kategoriFilter) params.category_id = kategoriFilter;

      const result = await adminService.getGroupedParticipants(params);

      const list = Array.isArray(result) ? result : result?.data || [];
      const meta = result?.meta || {};

      setData(list.map(mapGroupedFromApi));
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

      logger.error('Fetch grouped participants error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [searchText, pilarFilter, kategoriFilter]);

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
    editParticipantForm.setFieldsValue({
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
    editParticipantForm.setFieldsValue({
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
    editParticipantForm.setFieldsValue({
      villageRegionId: null,
    });
    setDesaOptions([]);
    if (districtId) {
      await fetchVillages(districtId);
    }
  };

  useEffect(() => {
    fetchPillars();
    masterService.getAstraGroups().then(result => {
      setAstraGroupOptions(Array.isArray(result) ? result.map(g => ({ id: g.id, name: g.name })) : []);
    }).catch(() => {});
  }, [fetchPillars]);

  useEffect(() => {
    fetchParticipants(1, pagination.pageSize);
  }, [fetchParticipants, pagination.pageSize]);

  // ─── Detail Modal ──────────────────────────────────────────

  const showDetail = (record) => {
    setSelectedParticipant(record);
    setDetailModalVisible(true);
  };

  // ─── Edit Info Peserta Modal ────────────────────────────────

  const showEditParticipantModal = async (record) => {
    setEditParticipantLoading(true);
    setEditParticipantModalVisible(true);
    setEditParticipantRecord(record);
    const raw = record._raw;

    try {
      // Load region options
      await fetchProvinces();
      if (raw.province?.id) await fetchCities(raw.province.id);
      if (raw.city?.id) await fetchDistricts(raw.city.id);
      if (raw.district?.id) await fetchVillages(raw.district.id);

      // Ensure astra group options are loaded
      if (astraGroupOptions.length === 0) {
        try {
          const result = await masterService.getAstraGroups();
          setAstraGroupOptions(Array.isArray(result) ? result.map(g => ({ id: g.id, name: g.name })) : []);
        } catch { /* ignore */ }
      }

      setTimeout(() => {
        editParticipantForm.setFieldsValue({
          villageName: raw.villageName,
          groupName: raw.groupName,
          phoneNumber: raw.phoneNumber,
          dsaType: raw.dsaType,
          astraGroupId: raw.astraGroup?.id || null,
          astraGroupCustom: raw.astraGroupCustom || '',
          address: raw.address,
          emergencyContactName: raw.emergencyContactName,
          emergencyContactPhone: raw.emergencyContactPhone,
          provinceId: raw.province?.id || null,
          cityId: raw.city?.id || null,
          districtId: raw.district?.id || null,
          villageRegionId: raw.villageRegion?.id || null,
          socialMedia: raw.socialMedia || '',
        });
      }, 100);
    } catch (error) {
      message.error('Gagal memuat data');
      setEditParticipantModalVisible(false);
    } finally {
      setEditParticipantLoading(false);
    }
  };

  /** Submit edit info peserta */
  const handleEditParticipantSubmit = async () => {
    try {
      const values = await editParticipantForm.validateFields();
      setEditParticipantSubmitting(true);

      const payload = {
        villageName: values.villageName,
        groupName: values.groupName,
        phoneNumber: values.phoneNumber,
        address: values.address,
        dsaType: values.dsaType,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        provinceId: values.provinceId || null,
        cityId: values.cityId || null,
        districtId: values.districtId || null,
        villageRegionId: values.villageRegionId || null,
      };

      if (values.astraGroupId === 'others') {
        payload.astraGroupCustom = values.astraGroupCustom || '';
        payload.astraGroupId = null;
      } else if (values.astraGroupId) {
        payload.astraGroupId = values.astraGroupId;
        payload.astraGroupCustom = null;
      } else {
        payload.astraGroupId = null;
        payload.astraGroupCustom = null;
      }

      if (values.socialMedia) payload.socialMedia = values.socialMedia;

      await adminService.updateParticipantInfo(editParticipantRecord.userId, payload);

      message.success('Informasi peserta berhasil diperbarui');
      setEditParticipantModalVisible(false);
      editParticipantForm.resetFields();
      setEditParticipantRecord(null);
      fetchParticipants(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.response?.data?.message || 'Gagal memperbarui data');
    } finally {
      setEditParticipantSubmitting(false);
    }
  };

  // ─── Edit Program Lomba Modal ───────────────────────────────

  const showEditProgramModal = async (program) => {
    setEditProgramLoading(true);
    setEditProgramModalVisible(true);
    setEditProgramRecord(program);

    try {
      // Ensure pilar options are loaded
      if (pilarOptions.length === 0) {
        await fetchPillars();
      }

      // Load kategori based on selected pilar
      if (program.pillar?.id) {
        await fetchKategoriByPilar(program.pillar.id);
      }

      setTimeout(() => {
        editProgramForm.setFieldsValue({
          pillarId: program.pillar?.id || undefined,
          categoryId: program.category?.id || undefined,
          background: program.background,
          programImpact: program.programImpact,
          programImpactAfter: program.programImpactAfter || '',
          documentLink: program.documentLink || '',
          developmentPlan: program.developmentPlan,
          implementationMethod: program.implementationMethod || '',
          sustainabilityPlan: program.sustainabilityPlan || '',
          programEvaluation: program.programEvaluation || '',
          programDuration: program.programDuration,
        });

        if (Array.isArray(program.photos) && program.photos.length > 0) {
          setEditPhotos(program.photos.map(p => ({
            url: p.photoUrl,
            originalName: p.originalName,
            generatedName: p.generatedName,
          })));
        } else {
          setEditPhotos([]);
        }
      }, 100);
    } catch (error) {
      message.error('Gagal memuat data program');
      setEditProgramModalVisible(false);
    } finally {
      setEditProgramLoading(false);
    }
  };

  /** Submit edit program lomba */
  const handleEditProgramSubmit = async () => {
    try {
      const values = await editProgramForm.validateFields();
      setEditProgramSubmitting(true);

      const payload = {
        pillarId: values.pillarId,
        categoryId: values.categoryId,
        background: values.background,
        programImpact: values.programImpact,
        programImpactAfter: values.programImpactAfter || '',
        documentLink: values.documentLink || '',
        developmentPlan: values.developmentPlan,
        implementationMethod: values.implementationMethod || '',
        sustainabilityPlan: values.sustainabilityPlan || '',
        programEvaluation: values.programEvaluation || '',
        programDuration: values.programDuration,
      };

      if (editPhotos.length > 0) {
        payload.photos = editPhotos.map(p => ({
          url: p.url,
          originalName: p.originalName,
          generatedName: p.generatedName,
        }));
      }

      await adminService.updateProgramInfo(editProgramRecord.id, payload);

      message.success('Data program lomba berhasil diperbarui');
      setEditProgramModalVisible(false);
      editProgramForm.resetFields();
      setEditProgramRecord(null);
      setEditPhotos([]);
      fetchParticipants(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.response?.data?.message || 'Gagal memperbarui data program');
    } finally {
      setEditProgramSubmitting(false);
    }
  };

  /** Upload foto untuk edit program */
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

  /** Hapus foto edit program */
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

  // ─── Table & Filter Handlers ────────────────────────────────

  const handleTableChange = (pag) => {
    fetchParticipants(pag.current, pag.pageSize);
  };

  const handleReset = () => {
    setSearchText('');
    setPilarFilter(null);
    setKategoriFilter(null);
  };

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

  /** Export data peserta terkelompok ke Excel */
  const handleExport = async () => {
    try {
      const filters = {};
      if (pilarFilter) filters.pillar_id = pilarFilter;
      if (kategoriFilter) filters.category_id = kategoriFilter;
      if (searchText) filters.search = searchText;

      const blob = await adminService.exportGroupedParticipants(filters);
      const today = new Date().toISOString().split('T')[0];
      downloadBlob(blob, `export-peserta-grouped-${today}.xlsx`);
      message.success('Berhasil mengunduh file export');
    } catch (error) {
      message.error('Gagal mengexport data');
      logger.error('Export error:', error);
    }
  };

  // ─── Table Columns ──────────────────────────────────────────

  const columns = [
    {
      title: 'Nama Desa/DSA',
      dataIndex: 'nama_desa',
      key: 'nama_desa',
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text, record) => (
        <Button type="link" onClick={() => showDetail(record)} style={{ padding: 0 }}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Nama Ketua Kelompok / PJ',
      dataIndex: 'nama_kelompok',
      key: 'nama_kelompok',
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
    },
    {
      title: 'Wilayah',
      dataIndex: 'wilayah',
      key: 'wilayah',
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      ellipsis: true,
    },
    {
      title: 'Program Lomba',
      dataIndex: 'programText',
      key: 'programText',
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text) => (
        <Text style={{ fontSize: 13 }} ellipsis={{ tooltip: text }}>{text}</Text>
      ),
    },
    {
      title: 'Jumlah Program',
      key: 'programCount',
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record.programs.length} Program</Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 200,
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)} style={{ padding: '0 4px' }}>
            Detail
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => showEditParticipantModal(record)} style={{ padding: '0 4px' }}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Daftar Peserta</Title>
          <Text type="secondary">Kelola data peserta pendaftaran (terkelompok per peserta)</Text>
        </div>
        <Button icon={<ExportOutlined />} onClick={handleExport}>Export Data</Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Cari Nama DSA, Kelompok, User, atau Email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ flex: '1 1 250px', minWidth: 200 }}
          />
          <Select
            placeholder="Pilar"
            style={{ flex: '1 1 160px', minWidth: 140 }}
            allowClear
            value={pilarFilter}
            onChange={(value) => { setPilarFilter(value); setKategoriFilter(null); if (value) fetchKategoriByPilar(value); else setKategoriOptions([]); }}
          >
            {pilarOptions.map((pilar) => (
              <Option key={pilar.id} value={pilar.id}>{pilar.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="Kategori"
            style={{ flex: '1 1 160px', minWidth: 140 }}
            allowClear
            value={kategoriFilter}
            onChange={(value) => setKategoriFilter(value)}
            disabled={!pilarFilter}
          >
            {kategoriOptions.map((cat) => (
              <Option key={cat.id} value={cat.id}>{cat.name}</Option>
            ))}
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
            rowKey="userId"
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

      {/* ─── Detail Modal (Grouped) ─────────────────────────── */}
      <Modal
        title={null}
        open={detailModalVisible}
        closable={false}
        onCancel={() => { setDetailModalVisible(false); setSelectedParticipant(null); }}
        footer={[<Button key="close" onClick={() => { setDetailModalVisible(false); setSelectedParticipant(null); }}>Tutup</Button>]}
        width={800}
        styles={{ body: { padding: 0 } }}
      >
        {selectedParticipant && (() => {
          const raw = selectedParticipant._raw;
          return (
            <div>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                padding: '24px 28px',
                borderRadius: '12px 12px 0 0',
                position: 'relative',
              }}>
                <Button
                  type="text"
                  icon={<CloseOutlined style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }} />}
                  onClick={() => { setDetailModalVisible(false); setSelectedParticipant(null); }}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                />
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Detail Peserta
                </Text>
                <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: 20 }}>
                  {raw.villageName || '-'}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 6, display: 'block' }}>
                  {raw.groupName || '-'} &bull; {raw.user?.name || '-'}
                </Text>
              </div>

              {/* Content */}
              <div style={{ padding: '24px 28px 28px' }}>
                {/* Section: Info Peserta */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      <UserOutlined style={{ marginRight: 6 }} /> Informasi Peserta
                    </Text>
                    <Button
                      type="primary"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => { setDetailModalVisible(false); showEditParticipantModal(selectedParticipant); }}
                    >
                      Edit Info Peserta
                    </Button>
                  </div>
                  <Row gutter={[20, 16]}>
                    <Col xs={12} sm={8}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nama User</Text><Text strong style={{ fontSize: 13 }}>{raw.user?.name || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Email</Text><Text strong style={{ fontSize: 13 }}>{raw.user?.email || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Jenis DSA</Text><Text strong style={{ fontSize: 13 }}>{raw.dsaType || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nomor HP</Text><Text strong style={{ fontSize: 13 }}>{raw.phoneNumber || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nama Kontak Lainnya</Text><Text strong style={{ fontSize: 13 }}>{raw.emergencyContactName || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>No HP Kontak Lainnya</Text><Text strong style={{ fontSize: 13 }}>{raw.emergencyContactPhone || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Perusahaan/Yayasan Pembina</Text><Text strong style={{ fontSize: 13 }}>{raw.astraGroup?.name || raw.astraGroupCustom || '-'}</Text></div>
                    </Col>
                    {raw.socialMedia && (
                      <Col xs={24}>
                        <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Media Sosial</Text><Text style={{ fontSize: 13 }}>{raw.socialMedia}</Text></div>
                      </Col>
                    )}
                  </Row>
                </div>

                {/* Section: Lokasi & Wilayah */}
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    📍 Lokasi & Wilayah
                  </Text>
                  <Row gutter={[20, 16]}>
                    <Col xs={12} sm={6}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Provinsi</Text><Text strong style={{ fontSize: 13 }}>{raw.province?.name || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Kabupaten/Kota</Text><Text strong style={{ fontSize: 13 }}>{raw.city?.name || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Kecamatan</Text><Text strong style={{ fontSize: 13 }}>{raw.district?.name || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Desa/Kelurahan</Text><Text strong style={{ fontSize: 13 }}>{raw.villageRegion?.name || '-'}</Text></div>
                    </Col>
                    <Col span={24}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Alamat Lengkap</Text>
                      <Text style={{ fontSize: 13, lineHeight: 1.6 }}>{raw.address || '-'}</Text>
                    </Col>
                  </Row>
                </div>

                {/* Section: Program Lomba */}
                <div>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    <FileTextOutlined style={{ marginRight: 6 }} /> Program Lomba ({raw.programs?.length || 0})
                  </Text>
                  {raw.programs && raw.programs.length > 0 ? (
                    <Collapse accordion>
                      {raw.programs.map((prog, idx) => (
                        <Panel
                          key={prog.id || idx}
                          header={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <Text strong>{prog.pillar?.name || 'Unknown'} - {prog.category?.name || 'Unknown'}</Text>
                              <Tag color={STATUS_MAP[prog.status]?.color || 'default'}>
                                {STATUS_MAP[prog.status]?.label || prog.status}
                              </Tag>
                            </div>
                          }
                          extra={
                            <Button
                              type="link"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailModalVisible(false);
                                showEditProgramModal(prog);
                              }}
                            >
                              Edit Program
                            </Button>
                          }
                        >
                          <Row gutter={[16, 12]}>
                            <Col xs={12} sm={8}>
                              <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Durasi Program</Text><Text strong style={{ fontSize: 13 }}>{prog.programDuration || '-'}</Text></div>
                            </Col>
                            <Col xs={12} sm={8}>
                              <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Status</Text><Tag color={STATUS_MAP[prog.status]?.color || 'default'}>{STATUS_MAP[prog.status]?.label || prog.status}</Tag></div>
                            </Col>
                            {prog.documentLink && (
                              <Col xs={24}>
                                <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Link Dokumen</Text><a href={prog.documentLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, wordBreak: 'break-all' }}>{prog.documentLink}</a></div>
                              </Col>
                            )}
                          </Row>

                          {/* Deskripsi blocks */}
                          {prog.background && (
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Latar Belakang</Text>
                              <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #1890ff' }}>
                                <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{prog.background}</Text>
                              </div>
                            </div>
                          )}
                          {prog.programImpact && (
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Kondisi Sebelum Program</Text>
                              <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #52c41a' }}>
                                <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{prog.programImpact}</Text>
                              </div>
                            </div>
                          )}
                          {prog.programImpactAfter && (
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Kondisi Setelah Program</Text>
                              <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #16a34a' }}>
                                <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{prog.programImpactAfter}</Text>
                              </div>
                            </div>
                          )}
                          {prog.developmentPlan && (
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Rencana Pengembangan</Text>
                              <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #722ed1' }}>
                                <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{prog.developmentPlan}</Text>
                              </div>
                            </div>
                          )}
                          {prog.implementationMethod && (
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Metode Pelaksanaan</Text>
                              <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #0ea5e9' }}>
                                <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{prog.implementationMethod}</Text>
                              </div>
                            </div>
                          )}
                          {prog.sustainabilityPlan && (
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Keberlanjutan Program</Text>
                              <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #10b981' }}>
                                <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{prog.sustainabilityPlan}</Text>
                              </div>
                            </div>
                          )}
                          {prog.programEvaluation && (
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Evaluasi Program</Text>
                              <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #f59e0b' }}>
                                <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{prog.programEvaluation}</Text>
                              </div>
                            </div>
                          )}

                          {/* Foto */}
                          {Array.isArray(prog.photos) && prog.photos.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 8 }}>Foto Dokumentasi</Text>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {prog.photos.map((photo, i) => (
                                  <div key={i} style={{ width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    <img
                                      src={photo.photoUrl?.startsWith('http') ? photo.photoUrl : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.photoUrl}`}
                                      alt={photo.originalName || `Foto ${i + 1}`}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </Panel>
                      ))}
                    </Collapse>
                  ) : (
                    <Text type="secondary">Tidak ada program terdaftar</Text>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ─── Edit Info Peserta Modal ─────────────────────────── */}
      <Modal
        title="Edit Informasi Peserta"
        open={editParticipantModalVisible}
        onOk={handleEditParticipantSubmit}
        confirmLoading={editParticipantSubmitting}
        onCancel={() => { setEditParticipantModalVisible(false); editParticipantForm.resetFields(); setEditParticipantRecord(null); }}
        okText="Simpan"
        cancelText="Batal"
        width={680}
      >
        <Spin spinning={editParticipantLoading}>
          {editParticipantRecord && (
            <Form form={editParticipantForm} layout="vertical">
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Perubahan akan berlaku untuk <strong>semua program lomba</strong> yang diikuti peserta ini.
              </Text>

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
                  <Form.Item name="dsaType" label="Jenis DSA">
                    <Select placeholder="Pilih Jenis DSA" allowClear>
                      <Option value="Kelompok">Kelompok</Option>
                      <Option value="Individu">Individu</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phoneNumber" label="Nomor HP Ketua Kelompok">
                    <Input placeholder="Contoh: 08123456789" maxLength={15} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
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
                <Col span={12}>
                  <Form.Item noStyle shouldUpdate={(prev, cur) => prev.astraGroupId !== cur.astraGroupId}>
                    {({ getFieldValue }) => getFieldValue('astraGroupId') === 'others' && (
                      <Form.Item name="astraGroupCustom" label="Nama Binaan Lainnya">
                        <Input placeholder="Masukkan nama Perusahaan/Yayasan Pembina lainnya" />
                      </Form.Item>
                    )}
                  </Form.Item>
                </Col>
              </Row>

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
                            <Select placeholder="Pilih Provinsi" allowClear showSearch optionFilterProp="children" onChange={handleProvinceChange} loading={loadingProvinces}>
                              {provinceOptions.map(p => (<Option key={p.id} value={p.id}>{p.name}</Option>))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="cityId" label="Kabupaten / Kota">
                            <Select placeholder="Pilih Kabupaten / Kota" allowClear showSearch optionFilterProp="children" onChange={handleCityChange} loading={loadingCities} disabled={!provinceId}>
                              {cityOptions.map(c => (<Option key={c.id} value={c.id}>{c.name}</Option>))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="districtId" label="Kecamatan">
                            <Select placeholder="Pilih Kecamatan" allowClear showSearch optionFilterProp="children" onChange={handleDistrictChange} loading={loadingDistricts} disabled={!cityId}>
                              {districtOptions.map(d => (<Option key={d.id} value={d.id}>{d.name}</Option>))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="villageRegionId" label="Desa / Kelurahan">
                            <Select placeholder="Pilih Desa / Kelurahan" allowClear showSearch optionFilterProp="children" loading={loadingDesa} disabled={!districtId}>
                              {desaOptions.map(v => (<Option key={v.id} value={v.id}>{v.name}</Option>))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  );
                }}
              </Form.Item>

              <Form.Item name="socialMedia" label="Media Sosial">
                <Input.TextArea rows={2} placeholder="Contoh: https://instagram.com/akun" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>
            </Form>
          )}
        </Spin>
      </Modal>

      {/* ─── Edit Program Lomba Modal ────────────────────────── */}
      <Modal
        title="Edit Informasi Program Lomba"
        open={editProgramModalVisible}
        onOk={handleEditProgramSubmit}
        confirmLoading={editProgramSubmitting}
        onCancel={() => { setEditProgramModalVisible(false); editProgramForm.resetFields(); setEditProgramRecord(null); setEditPhotos([]); }}
        okText="Simpan"
        cancelText="Batal"
        width={680}
      >
        <Spin spinning={editProgramLoading}>
          {editProgramRecord && (
            <Form form={editProgramForm} layout="vertical">
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Edit program: <strong>{editProgramRecord.pillar?.name} - {editProgramRecord.category?.name}</strong>
              </Text>

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
                      onChange={(val) => { fetchKategoriByPilar(val); editProgramForm.setFieldsValue({ categoryId: null }); }}
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

              <Form.Item name="documentLink" label="Link dokumentasi foto/video/publikasi lainnya">
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
