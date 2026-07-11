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
  const [previewPhoto, setPreviewPhoto] = useState(null);

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
        editParticipantForm.setFieldsValue({
          villageName: raw.villageName,
          groupName: raw.groupName,
          phoneNumber: raw.phoneNumber,
          astraGroupId: raw.astraGroupCustom ? 'others' : (raw.astraGroupId || raw.astraGroup?.id || null),
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

      // Cross-field validation (sama seperti FormPendaftaran Step 2)
      const crossErrors = [];
      if (values.emergencyContactName && values.groupName && values.emergencyContactName === values.groupName) {
        crossErrors.push('Nama Kontak Lainnya tidak boleh sama dengan Nama Ketua Kelompok');
      }
      if (values.emergencyContactPhone && values.phoneNumber && values.emergencyContactPhone === values.phoneNumber) {
        crossErrors.push('Nomor HP Kontak Lainnya tidak boleh sama dengan Nomor HP Ketua Kelompok');
      }
      if (crossErrors.length > 0) {
        crossErrors.forEach(msg => message.error(msg));
        setEditParticipantSubmitting(false);
        return;
      }

      const payload = {
        pillarId: values.pillarId,
        categoryId: values.categoryId,
        villageName: values.villageName,
        groupName: values.groupName,
        phoneNumber: values.phoneNumber,
        address: values.address,
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
      }
      if (values.socialMedia) payload.socialMedia = values.socialMedia;

      await adminService.updateParticipantInfo(editParticipantRecord.userId, payload);

      message.success('Informasi peserta berhasil diperbarui');
      setEditParticipantModalVisible(false);
      editParticipantForm.resetFields();
      setEditParticipantRecord(null);
      fetchParticipants(pagination.current, pagination.pageSize);
    } catch (error) {
      const errorData = error.response?.data;
      const errorMsg = errorData?.errors && Array.isArray(errorData.errors) ? (
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Validasi gagal:</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {errorData.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      ) : (
        errorData?.message || 'Gagal memperbarui data'
      );
      message.error(errorMsg);
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
          innovationTitle: program.innovationTitle || '',
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

      // Validasi foto minimal 1
      if (!editPhotos || editPhotos.length === 0) {
        message.error('Minimal 1 foto wajib diunggah');
        setEditProgramSubmitting(false);
        return;
      }

      const payload = {
        pillarId: values.pillarId,
        categoryId: values.categoryId,
        innovationTitle: values.innovationTitle,
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
      const errorData = error.response?.data;
      const errorMsg = errorData?.errors && Array.isArray(errorData.errors) ? (
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Validasi gagal:</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {errorData.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      ) : (
        errorData?.message || 'Gagal memperbarui data program'
      );
      message.error(errorMsg);
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
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nomor HP</Text><Text strong style={{ fontSize: 13 }}>{raw.phoneNumber || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Nama Kontak Lainnya</Text><Text strong style={{ fontSize: 13 }}>{raw.emergencyContactName || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>No HP Kontak Lainnya</Text><Text strong style={{ fontSize: 13 }}>{raw.emergencyContactPhone || '-'}</Text></div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Perusahaan/Yayasan Pembina</Text><Text strong style={{ fontSize: 13 }}>{raw.astraGroup?.name || astraGroupOptions.find(g => g.id === raw.astraGroupId)?.name || raw.astraGroupCustom || '-'}</Text></div>
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
                    <Collapse
                      accordion
                      items={raw.programs.map((prog, idx) => ({
                        key: prog.id || idx,
                        label: (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Text strong>{prog.pillar?.name || 'Unknown'} - {prog.category?.name || 'Unknown'}</Text>
                            <Tag color={STATUS_MAP[prog.status]?.color || 'default'}>
                              {STATUS_MAP[prog.status]?.label || prog.status}
                            </Tag>
                          </div>
                        ),
                        extra: (
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
                        ),
                        children: (
                          <>
                            <Row gutter={[16, 12]}>
                              {prog.innovationTitle && (
                                <Col xs={24} style={{ marginBottom: 4 }}>
                                  <div><Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Judul Inovasi</Text><Text strong style={{ fontSize: 13 }}>{prog.innovationTitle}</Text></div>
                                </Col>
                              )}
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
                                    <div
                                      key={i}
                                      onClick={() => setPreviewPhoto(photo.photoUrl?.startsWith('http') ? photo.photoUrl : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.photoUrl}`)}
                                      style={{ width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                    >
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
                          </>
                        )
                      }))}
                    />
                  ) : (
                    <Text type="secondary">Tidak ada program terdaftar</Text>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

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
                  <Form.Item name="villageName" label="Nama DSA/Nama Desa" rules={[{ required: true, message: 'Nama DSA wajib diisi' }]}>
                    <Input placeholder="Contoh: Desa Suka Maju" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="groupName" label="Nama Ketua Kelompok" rules={[{ required: true, message: 'Nama Ketua Kelompok wajib diisi' }]}>
                    <Input placeholder="Masukan Nama Ketua Kelompok" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="phoneNumber" label="Nomor HP Ketua Kelompok" rules={[{ required: true, message: 'Nomor HP wajib diisi' }, { min: 8, message: 'Nomor HP minimal 8 digit' }, { pattern: /^[0-9]+$/, message: 'Nomor HP hanya boleh angka' }]}>
                    <Input placeholder="Contoh: 08123456789" maxLength={15} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="astraGroupId" label="Perusahaan/Yayasan Pembina">
                    <Select
                      placeholder="Pilih Perusahaan/Yayasan Pembina"
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={[
                        ...astraGroupOptions.map(g => ({ value: g.id, label: g.name })),
                        { value: 'others', label: 'Lainnya...' },
                      ]}
                    />
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

              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.astraGroupId !== cur.astraGroupId}>
                {({ getFieldValue }) => getFieldValue('astraGroupId') === 'others' && (
                  <Form.Item name="astraGroupCustom" label="Nama Binaan Lainnya">
                    <Input placeholder="Masukkan nama Perusahaan/Yayasan Pembina lainnya" />
                  </Form.Item>
                )}
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="emergencyContactName" label="Nama Kontak Lainnya" rules={[{ required: true, message: 'Nama Kontak Lainnya wajib diisi' }, { pattern: /^[a-zA-Z\s.\-]+$/, message: 'Hanya boleh huruf, spasi, titik, dan tanda hubung' }]}>
                    <Input placeholder="Contoh: Siti Aminah" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="emergencyContactPhone" label="Nomor Kontak Lainnya" rules={[{ required: true, message: 'Nomor HP Kontak Lainnya wajib diisi' }, { min: 8, message: 'Minimal 8 digit' }, { pattern: /^[0-9]+$/, message: 'Hanya boleh angka' }]}>
                    <Input placeholder="Contoh: 08123456789" maxLength={15} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="address" label="Alamat Lengkap" rules={[{ required: true, message: 'Alamat wajib diisi' }]}>
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
                          <Form.Item name="provinceId" label="Provinsi" rules={[{ required: true, message: 'Provinsi wajib dipilih' }]}>
                            <Select placeholder="Pilih Provinsi" allowClear showSearch optionFilterProp="children" onChange={handleProvinceChange} loading={loadingProvinces}>
                              {provinceOptions.map(p => (<Option key={p.id} value={p.id}>{p.name}</Option>))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="cityId" label="Kabupaten / Kota" rules={[{ required: true, message: 'Kabupaten/Kota wajib dipilih' }]}>
                            <Select placeholder="Pilih Kabupaten / Kota" allowClear showSearch optionFilterProp="children" onChange={handleCityChange} loading={loadingCities} disabled={!provinceId}>
                              {cityOptions.map(c => (<Option key={c.id} value={c.id}>{c.name}</Option>))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="districtId" label="Kecamatan" rules={[{ required: true, message: 'Kecamatan wajib dipilih' }]}>
                            <Select placeholder="Pilih Kecamatan" allowClear showSearch optionFilterProp="children" onChange={handleDistrictChange} loading={loadingDistricts} disabled={!cityId}>
                              {districtOptions.map(d => (<Option key={d.id} value={d.id}>{d.name}</Option>))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="villageRegionId" label="Desa / Kelurahan" rules={[{ required: true, message: 'Desa/Kelurahan wajib dipilih' }]}>
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
                  <Form.Item name="pillarId" label="Pilar" rules={[{ required: true, message: 'Pilar wajib dipilih' }]}>
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
                  <Form.Item name="categoryId" label="Kategori" rules={[{ required: true, message: 'Kategori wajib dipilih' }]}>
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

              <Form.Item
                name="innovationTitle"
                label="Judul Inovasi"
                rules={[
                  { required: true, message: 'Judul inovasi wajib diisi' },
                  { max: 255, message: 'Maksimal 255 karakter' }
                ]}
              >
                <Input placeholder="Masukkan judul inovasi program..." style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13 }} />
              </Form.Item>

              <Form.Item name="programDuration" label="Durasi Program" rules={[{ required: true, message: 'Durasi program wajib diisi' }]}>
                <Select placeholder="Pilih durasi program..." allowClear>
                  <Option value="<1 Tahun">&lt;1 Tahun</Option>
                  <Option value="1-3 Tahun">1-3 Tahun</Option>
                  <Option value="3-5 Tahun">3-5 Tahun</Option>
                  <Option value=">5 Tahun">&gt;5 Tahun</Option>
                </Select>
              </Form.Item>

              <Form.Item name="background" label="Latar Belakang / Rasionalisasi" rules={[{ required: true, message: 'Latar belakang wajib diisi' }]}>
                <Input.TextArea rows={5} placeholder="Jelaskan alasan dan latar belakang inisiatif program ini..." style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="programImpact" label="Kondisi Sebelum Program" rules={[{ required: true, message: 'Kondisi sebelum program wajib diisi' }]}>
                <Input.TextArea rows={5} placeholder="Jelaskan Kondisi Sebelum Program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="programImpactAfter" label="Kondisi Setelah Program" rules={[{ required: true, message: 'Kondisi setelah program wajib diisi' }]}>
                <Input.TextArea rows={5} placeholder="Jelaskan Kondisi Setelah Program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="developmentPlan" label="Rencana dan Potensi Untuk Keberlanjutan Program" rules={[{ required: true, message: 'Rencana pengembangan wajib diisi' }]}>
                <Input.TextArea rows={5} placeholder="Jelaskan Rencana dan Potensi Untuk Keberlanjutan Program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="implementationMethod" label="Metode Pelaksanaan Program" rules={[{ required: true, message: 'Metode pelaksanaan wajib diisi' }]}>
                <Input.TextArea rows={5} placeholder="Jelaskan metode pelaksanaan program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="sustainabilityPlan" label="Keberlanjutan Program" rules={[{ required: true, message: 'Keberlanjutan program wajib diisi' }]}>
                <Input.TextArea rows={5} placeholder="Jelaskan rencana keberlanjutan program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="programEvaluation" label="Evaluasi Program" rules={[{ required: true, message: 'Evaluasi program wajib diisi' }]}>
                <Input.TextArea rows={5} placeholder="Jelaskan mekanisme evaluasi program" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
              </Form.Item>

              <Form.Item name="documentLink" label="Link dokumentasi foto/video/publikasi lainnya" rules={[{ required: true, message: 'Link dokumen wajib diisi' }, { pattern: /^https?:\/\/.+/i, message: 'Link harus berupa URL yang valid' }]}>
                <Input placeholder="https://drive.google.com/drive/folders/..." style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13 }} />
              </Form.Item>

              {/* Foto Dokumentasi */}
              <div style={{ marginBottom: 24 }}>
                <Text style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Foto Dokumentasi (Maks. 2 foto, 5 MB per foto)</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {editPhotos.map((photo, index) => (
                    <div
                      key={index}
                      onClick={() => setPreviewPhoto(photo.url?.startsWith('http') ? photo.url : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.url}`)}
                      style={{ width: 100, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', cursor: 'pointer' }}
                    >
                      <img
                        src={photo.url?.startsWith('http') ? photo.url : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.url}`}
                        alt={photo.originalName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined style={{ fontSize: 12, color: '#fff' }} />}
                        onClick={(e) => { e.stopPropagation(); handleEditPhotoDelete(index); }}
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

      {/* Modal Preview Foto */}
      <Modal
        open={!!previewPhoto}
        onCancel={() => setPreviewPhoto(null)}
        footer={null}
        centered
        width={'90vw'}
        style={{ maxWidth: 900 }}
        styles={{ body: { padding: 0, background: 'transparent' } }}
      >
        {previewPhoto && (
          <img src={previewPhoto} alt="Preview" style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }} />
        )}
      </Modal>
    </div>
  );
};

export default AdminPesertaList;