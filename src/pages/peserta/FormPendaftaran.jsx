import React, { useState, useEffect } from 'react';
import { Typography, Button, Input, Row, Col, message, Modal, Spin, Radio, Card, Upload } from 'antd';
import SearchSelect from '../../components/SearchSelect';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  ReadOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import masterService from '../../services/masterService';
import registrationService from '../../services/registrationService';
import logger from '../../lib/logger';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ─── Static Config ───────────────────────────────────────────────────────────

const STEPS = ['Pilar', 'Identitas', 'Program', 'Review'];

const STEP_TITLES = [
  'Pilih Pilar & Kategori Lomba',
  'Identitas Pendaftar',
  'Detail Program Berjalan',
  'Review & Konfirmasi',
];

const STEP_SUBTITLES = [
  'Silakan pilih pilar program yang akan didaftarkan.',
  'Lengkapi data identitas desa dan Ketua Kelompok program.',
  'Jelaskan detail program, latar belakang, dan dampaknya.',
  'Periksa kembali data yang telah Anda isi sebelum mengirimkan pendaftaran.',
];

// Warna & ikon untuk pilar
const PILAR_CONFIG = {
  kesehatan:     { Icon: MedicineBoxOutlined, color: '#10b981', bgLight: '#ecfdf5', bgActive: '#d1fae5', desc: 'Peningkatan fasilitas & akses kesehatan desa.' },
  pendidikan:    { Icon: ReadOutlined,        color: '#8b5cf6', bgLight: '#f5f3ff', bgActive: '#ede9fe', desc: 'Pengembangan kualitas SDM & literasi.' },
  lingkungan:    { Icon: EnvironmentOutlined, color: '#22c55e', bgLight: '#f0fdf4', bgActive: '#dcfce7', desc: 'Pelestarian alam & ekonomi sirkular.' },
  kewirausahaan: { Icon: ShopOutlined,        color: '#f59e0b', bgLight: '#fffbeb', bgActive: '#fef3c7', desc: 'Pemberdayaan UMKM & potensi ekonomi lokal.' },
};

// ─── Shared Styles ───────────────────────────────────────────────────────────

const inputStyle = { borderRadius: 8, height: 44, borderColor: '#e2e8f0', fontSize: 13, transition: 'all 0.2s' };
const inputErrorStyle = { borderRadius: 8, height: 44, borderColor: '#ef4444', fontSize: 13, transition: 'all 0.2s', boxShadow: '0 0 0 2px rgba(239,68,68,0.1)' };
const labelStyle = { display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#002444' };
const labelErrorStyle = { display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#ef4444' };
const fieldWrapper = { marginBottom: 20 };
const errorTextStyle = { fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' };

// ─── Component ───────────────────────────────────────────────────────────────

const FormPendaftaran = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const DRAFT_KEY = 'form_pendaftaran_draft';

  // ── Popup Konfirmasi Astra Grup ─────────────────────────────────────────────
  const [showAstraPopup, setShowAstraPopup] = useState(false);
  const [showDeniedPopup, setShowDeniedPopup] = useState(false);
  const [astraChecked, setAstraChecked] = useState(false);

  useEffect(() => {
    // Cek apakah sudah pernah dicek sebelumnya di session ini
    const alreadyChecked = sessionStorage.getItem('astra_group_checked');
    if (alreadyChecked) {
      setAstraChecked(true);
      return;
    }
    // Tampilkan popup konfirmasi saat pertama kali mount
    setShowAstraPopup(true);
  }, []);

  const handleAstraYes = () => {
    setShowAstraPopup(false);
    setAstraChecked(true);
    sessionStorage.setItem('astra_group_checked', 'true');
  };

  const handleAstraNo = () => {
    setShowAstraPopup(false);
    setShowDeniedPopup(true);
  };

  const handleDeniedClose = async () => {
    setShowDeniedPopup(false);
    await handleLogout();
  };

  // ── Load draft dari localStorage ───────────────────────────────────────────
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore corrupt data */ }
    return null;
  };

  const savedDraft = loadDraft();

  const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep || 1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPilarId, setSelectedPilarId] = useState(savedDraft?.selectedPilarId || null);
  const [selectedKategoriId, setSelectedKategoriId] = useState(savedDraft?.selectedKategoriId || null);
  const [formData, setFormData] = useState(savedDraft?.formData || {});
  const [pillars, setPillars] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [astraGroups, setAstraGroups] = useState([]);
  const [desaOptions, setDesaOptions] = useState([]);
  const [loadingDesa, setLoadingDesa] = useState(false);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [provincePage, setProvincePage] = useState(1);
  const [cityPage, setCityPage] = useState(1);
  const [districtPage, setDistrictPage] = useState(1);
  const [desaPage, setDesaPage] = useState(1);
  const [provinceHasMore, setProvinceHasMore] = useState(false);
  const [cityHasMore, setCityHasMore] = useState(false);
  const [districtHasMore, setDistrictHasMore] = useState(false);
  const [desaHasMore, setDesaHasMore] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [desaSearch, setDesaSearch] = useState('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [photos, setPhotos] = useState(savedDraft?.photos || []);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [errors, setErrors] = useState({});

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  // Hanya izinkan angka untuk nomor HP
  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    updateField('phone_number', onlyNums);
  };

  // Hanya izinkan huruf, spasi, titik, dan strip untuk nama
  const handleNameChange = (key, e) => {
    const cleaned = e.target.value.replace(/[^a-zA-Z\s.\-]/g, '');
    updateField(key, cleaned);
  };

  // ── Upload foto ────────────────────────────────────────────────────────────
  const handlePhotoUpload = async (file) => {
    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Format foto harus JPEG, PNG, atau WEBP');
      return false;
    }
    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Ukuran foto maksimal 5 MB');
      return false;
    }
    // Validasi jumlah foto (max 2)
    if (photos.length >= 2) {
      message.error('Maksimal 2 foto');
      return false;
    }

    setUploadingPhoto(true);
    try {
      const result = await registrationService.uploadPhoto(file);
      setPhotos(prev => [...prev, result]);
      message.success('Foto berhasil diunggah');
    } catch (err) {
      message.error('Gagal mengunggah foto');
    } finally {
      setUploadingPhoto(false);
    }
    return false; // Prevent Ant Design default upload
  };

  const handlePhotoDelete = async (index) => {
    const photo = photos[index];
    try {
      if (photo.generatedName) {
        await registrationService.deletePhoto(photo.generatedName);
      }
    } catch {
      // ignore delete error, still remove from state
    }
    setPhotos(prev => prev.filter((_, i) => i !== index));
    message.success('Foto dihapus');
  };

  // ── Auto-save draft ke localStorage ────────────────────────────────────────
  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        currentStep,
        selectedPilarId,
        selectedKategoriId,
        formData,
        photos,
      }));
    } catch { /* quota exceeded, ignore */ }
  };

  // Save setiap kali step, formData, atau photos berubah
  useEffect(() => {
    saveDraft();
  }, [currentStep, selectedPilarId, selectedKategoriId, formData, photos]);

  // ── Fetch master data + existing registration on mount ──────────────────────

  // ── Debounce helper ────────────────────────────────────────────────────────
  const debounceTimers = React.useRef({});
  const debounce = (key, fn, delay = 500) => {
    clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(fn, delay);
  };

  // ── Fetch provinces dari API ────────────────────────────────────────────────
  const PAGE_SIZE = 10;

  const fetchProvinces = async (search, page = 1, append = false) => {
    setLoadingProvinces(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      const result = await masterService.getProvinces(params);
      const list = Array.isArray(result) ? result.map(p => ({ id: p.id, name: p.name })) : [];
      setProvinceOptions(prev => append ? [...prev, ...list] : list);
      setProvinceHasMore(list.length >= PAGE_SIZE);
      setProvincePage(page);
      if (search !== undefined) setProvinceSearch(search);
    } catch {
      logger.error('Gagal memuat provinsi');
    } finally {
      setLoadingProvinces(false);
    }
  };

  // ── Fetch kota/kabupaten dari API ──────────────────────────────────────────
  const fetchCities = async (provinceId, search, page = 1, append = false) => {
    if (!provinceId) { setCityOptions([]); return; }
    setLoadingCities(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      const result = await masterService.getCities(provinceId, params);
      const list = Array.isArray(result) ? result.map(c => ({ id: c.id, name: c.name })) : [];
      setCityOptions(prev => append ? [...prev, ...list] : list);
      setCityHasMore(list.length >= PAGE_SIZE);
      setCityPage(page);
      if (search !== undefined) setCitySearch(search);
    } catch {
      setCityOptions([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // ── Fetch kecamatan dari API ───────────────────────────────────────────────
  const fetchDistricts = async (cityId, search, page = 1, append = false) => {
    if (!cityId) { setDistrictOptions([]); return; }
    setLoadingDistricts(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      const result = await masterService.getDistricts(cityId, params);
      const list = Array.isArray(result) ? result.map(d => ({ id: d.id, name: d.name })) : [];
      setDistrictOptions(prev => append ? [...prev, ...list] : list);
      setDistrictHasMore(list.length >= PAGE_SIZE);
      setDistrictPage(page);
      if (search !== undefined) setDistrictSearch(search);
    } catch {
      setDistrictOptions([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // ── Fetch desa dari API ────────────────────────────────────────────────────
  const fetchVillages = async (districtId, search, page = 1, append = false) => {
    if (!districtId) { setDesaOptions([]); return; }
    setLoadingDesa(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      const result = await masterService.getVillages(districtId, params);
      const list = Array.isArray(result) ? result.map(v => ({ id: v.id, name: v.name })) : [];
      setDesaOptions(prev => append ? [...prev, ...list] : list);
      setDesaHasMore(list.length >= PAGE_SIZE);
      setDesaPage(page);
      if (search !== undefined) setDesaSearch(search);
    } catch {
      setDesaOptions([]);
    } finally {
      setLoadingDesa(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [pillarsData, groupsData] = await Promise.all([
          masterService.getPillars(),
          masterService.getAstraGroups(),
        ]);
        setPillars(pillarsData || []);
        setAstraGroups(groupsData || []);

        // Fetch provinsi
        await fetchProvinces();

        // Fetch semua kategori dari semua pilar
        const allCats = [];
        for (const pilar of (pillarsData || [])) {
          try {
            const cats = await masterService.getCategories(pilar.id);
            if (Array.isArray(cats)) {
              allCats.push(...cats);
            }
          } catch {
            // skip pilar yang gagal fetch
          }
        }
        setAllCategories(allCats);

        // Cek apakah sudah punya registrasi
        let hasExistingReg = false;
        try {
          const { data } = await api.get('/registrations/my');
          const reg = data?.data ?? data;
          if (reg && reg.id) {
            hasExistingReg = true;
            // Sudah punya registrasi, hapus draft lama
            localStorage.removeItem(DRAFT_KEY);
            setRegistrationId(reg.id);
            setSelectedPilarId(reg.pillarId || null);

            // Load wilayah dependent options untuk existing registration
            if (reg.provinceId) await fetchCities(reg.provinceId);
            if (reg.cityId) await fetchDistricts(reg.cityId);
            if (reg.districtId) await fetchVillages(reg.districtId);

            setFormData({
              nama_desa: reg.villageName || '',
              nama_kelompok: reg.groupName || '',
              alamat: reg.address || '',
              latar_belakang: reg.background || '',
              dampak_program: reg.programImpact || '',
              rencana_pengembangan: reg.developmentPlan || '',
              durasi_program: reg.programDuration || '',
              implementation_method: reg.implementationMethod || '',
              sustainability_plan: reg.sustainabilityPlan || '',
              program_evaluation: reg.programEvaluation || '',
              grup_astra_id: reg.astraGroupCustom ? 'others' : (reg.astraGroup?.id || null),
              binaan_custom: reg.astraGroupCustom || '',
              jenis_dsa: reg.dsaType ? reg.dsaType.toLowerCase() : null,
              nama_ketua: reg.leaderName || '',
              phone_number: reg.phoneNumber || '',
              nama_kontak_darurat: reg.emergencyContactName || '',
              no_hp_kontak_darurat: reg.emergencyContactPhone || '',
              provinceId: reg.provinceId || null,
              cityId: reg.cityId || null,
              districtId: reg.districtId || null,
              villageRegionId: reg.villageRegionId || null,
              provinceName: reg.province?.name || '',
              cityName: reg.city?.name || '',
              districtName: reg.district?.name || '',
              villageRegionName: reg.villageRegion?.name || '',
              social_media: reg.socialMedia || '',
            });
            if (reg.categoryId) setSelectedKategoriId(reg.categoryId);
            if (Array.isArray(reg.photos) && reg.photos.length > 0) {
              setPhotos(reg.photos.map(p => ({ url: p.photoUrl, originalName: p.originalName, generatedName: p.generatedName })));
            }
          }
        } catch {
          // ignore — belum ada registrasi
        }

        // Jika tidak ada registrasi dan ada draft, restore wilayah dropdowns
        if (!hasExistingReg && savedDraft?.formData) {
          const d = savedDraft.formData;
          // Load semua options secara paralel agar Select segera punya data
          await Promise.all([
            d.provinceId ? fetchCities(d.provinceId) : Promise.resolve(),
            d.cityId ? fetchDistricts(d.cityId) : Promise.resolve(),
            d.districtId ? fetchVillages(d.districtId) : Promise.resolve(),
          ]);
        }
      } catch {
        message.error('Gagal memuat data master');
      } finally {
        setLoadingMaster(false);
      }
    };
    loadAll();
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────────────

  // ── Validasi per step sebelum lanjut ───────────────────────────────────────

  const validateStep = (step) => {
    const e = {};
    switch (step) {
      case 1:
        if (!selectedKategoriId) e.kategori = 'Silakan pilih kategori terlebih dahulu';
        break;

      case 2:
        if (!formData.nama_desa) e.nama_desa = 'Nama DSA wajib diisi';
        if (!formData.nama_kelompok) e.nama_kelompok = 'Nama Ketua Kelompok wajib diisi';
        if (!formData.phone_number) {
          e.phone_number = 'Nomor HP wajib diisi';
        } else if (formData.phone_number.length < 8) {
          e.phone_number = 'Nomor HP minimal 8 digit';
        }
        if (!formData.nama_kontak_darurat) {
          e.nama_kontak_darurat = 'Nama Kontak Lainnya wajib diisi';
        } else if (formData.nama_kontak_darurat === formData.nama_kelompok) {
          e.nama_kontak_darurat = 'Tidak boleh sama dengan Nama Ketua Kelompok';
        }
        if (!formData.no_hp_kontak_darurat) {
          e.no_hp_kontak_darurat = 'Nomor Kontak Lainnya wajib diisi';
        } else if (formData.no_hp_kontak_darurat.length < 8) {
          e.no_hp_kontak_darurat = 'Minimal 8 digit';
        } else if (formData.no_hp_kontak_darurat === formData.phone_number) {
          e.no_hp_kontak_darurat = 'Tidak boleh sama dengan Nomor HP';
        }
        if (!formData.alamat) e.alamat = 'Alamat wajib diisi';
        if (!formData.provinceId) e.provinceId = 'Provinsi wajib dipilih';
        if (!formData.cityId) e.cityId = 'Kabupaten/Kota wajib dipilih';
        if (!formData.districtId) e.districtId = 'Kecamatan wajib dipilih';
        if (!formData.villageRegionId) e.villageRegionId = 'Desa/Kelurahan wajib dipilih';
        break;

      case 3:
        if (!formData.durasi_program) e.durasi_program = 'Wajib diisi';
        if (!formData.latar_belakang) e.latar_belakang = 'Wajib diisi';
        if (!formData.implementation_method) e.implementation_method = 'Wajib diisi';
        if (!formData.dampak_program) e.dampak_program = 'Wajib diisi';
        if (!formData.rencana_pengembangan) e.rencana_pengembangan = 'Wajib diisi';
        if (!formData.sustainability_plan) e.sustainability_plan = 'Wajib diisi';
        if (!formData.program_evaluation) e.program_evaluation = 'Wajib diisi';
        if (photos.length === 0) e.photos = 'Minimal 1 foto wajib diunggah';
        break;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Handle pemilihan kategori — otomatis set pilar parent ──────────────────

  const handleKategoriSelect = (categoryId) => {
    setSelectedKategoriId(categoryId);
    // Cari kategori → pillar id
    const cat = allCategories.find(c => c.id === categoryId);
    if (cat) {
      const pilarId = cat.pillarId || cat.pillar?.id;
      if (pilarId) setSelectedPilarId(pilarId);

      // Auto-set jenis DSA dari dsaType master kategori
      const dsaType = cat.dsaType || '';
      if (dsaType) {
        updateField('jenis_dsa', dsaType.toLowerCase());
        updateField('nama_kelompok', '');
      }
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = () => setShowConfirmModal(true);

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      const payload = {
        pillarId: selectedPilarId,
        categoryId: selectedKategoriId,
        villageName: formData.nama_desa,
        groupName: formData.nama_kelompok,
        address: formData.alamat,
        background: formData.latar_belakang,
        programImpact: formData.dampak_program,
        programDuration: formData.durasi_program,
        developmentPlan: formData.rencana_pengembangan,
        implementationMethod: formData.implementation_method || '',
        sustainabilityPlan: formData.sustainability_plan || '',
        programEvaluation: formData.program_evaluation || '',
      };
      if (formData.jenis_dsa) payload.dsaType = formData.jenis_dsa.charAt(0).toUpperCase() + formData.jenis_dsa.slice(1);
      if (formData.nama_ketua) payload.leaderName = formData.nama_ketua;
      if (formData.phone_number) payload.phoneNumber = formData.phone_number;
      if (formData.nama_kontak_darurat) payload.emergencyContactName = formData.nama_kontak_darurat;
      if (formData.no_hp_kontak_darurat) payload.emergencyContactPhone = formData.no_hp_kontak_darurat;
      if (formData.provinceId) payload.provinceId = formData.provinceId;
      if (formData.cityId) payload.cityId = formData.cityId;
      if (formData.districtId) payload.districtId = formData.districtId;
      if (formData.villageRegionId) payload.villageRegionId = formData.villageRegionId;
      if (formData.grup_astra_id === 'others') {
        payload.astraGroupCustom = formData.binaan_custom || '';
      } else if (formData.grup_astra_id) {
        payload.astraGroupId = formData.grup_astra_id;
      }
      if (formData.social_media) payload.socialMedia = formData.social_media;
      if (photos.length > 0) {
        payload.photos = photos.map(p => ({ url: p.url, originalName: p.originalName, generatedName: p.generatedName }));
      }

      if (registrationId) {
        // Update registrasi yang sudah ada
        await registrationService.updateRegistration(registrationId, payload);
        await registrationService.submitRegistration(registrationId);
        message.success('Pendaftaran berhasil diupdate!');
      } else {
        // Buat baru + submit
        const reg = await registrationService.createRegistration(payload);
        await registrationService.submitRegistration(reg.id);
        message.success('Pendaftaran berhasil dikirim!');
      }
      localStorage.removeItem(DRAFT_KEY);
      navigate('/peserta/dashboard');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        errors.forEach(e => message.error(e));
      } else {
        const msg = err.response?.data?.message || err.response?.data?.data?.message || 'Gagal mengirim pendaftaran';
        message.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const selectedPilar = pillars.find(p => p.id === selectedPilarId);

  const getPilarKey = (name) => {
    if (!name) return 'kewirausahaan';
    const lower = name.toLowerCase();
    if (lower.includes('kesehatan')) return 'kesehatan';
    if (lower.includes('pendidikan')) return 'pendidikan';
    if (lower.includes('lingkungan')) return 'lingkungan';
    return 'kewirausahaan';
  };

  // ── Loading ─────────────────────────────────────────────────────────────────

  // Blokir render form sampai popup konfirmasi Astra Grup dijawab
  if (!astraChecked) {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8faff' }}>
          <Spin size="large" description="Memeriksa akses..." />
        </div>

        {/* Popup 1: Konfirmasi Astra Grup */}
        <Modal
          open={showAstraPopup}
          closable={false}
          maskClosable={false}
          footer={null}
          centered
          width={440}
        >
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
            }}>
              <QuestionCircleOutlined style={{ fontSize: 36, color: '#fff' }} />
            </div>
            <Title level={4} style={{ marginBottom: 8, color: '#1e293b' }}>
              Konfirmasi Akses
            </Title>
            <Text style={{ fontSize: 14, color: '#64748b', display: 'block', marginBottom: 28, lineHeight: 1.7 }}>
              Silahkan dipilih apakah anda merupakan Binaan <Text strong style={{ color: '#1e293b' }}>Grup Astra atau Yayasan Astra </Text> atau tidak?
            </Text>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button
                size="large"
                onClick={handleAstraNo}
                style={{ fontWeight: 600, height: 44, paddingInline: 28, borderRadius: 8 }}
              >
                Bukan
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleAstraYes}
                style={{ fontWeight: 600, height: 44, paddingInline: 28, borderRadius: 8, background: '#2563eb', borderColor: '#2563eb' }}
              >
                Ya, Saya Adalah Binaan
              </Button>
            </div>
          </div>
        </Modal>

        {/* Popup 2: Informasi Ditolak */}
        <Modal
          open={showDeniedPopup}
          closable={false}
          maskClosable={false}
          footer={null}
          centered
          width={440}
        >
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
            }}>
              <ExclamationCircleOutlined style={{ fontSize: 36, color: '#fff' }} />
            </div>
            <Title level={4} style={{ marginBottom: 8, color: '#1e293b' }}>
              Akses Ditolak
            </Title>
            <Text style={{ fontSize: 14, color: '#64748b', display: 'block', marginBottom: 28, lineHeight: 1.7 }}>
              Maaf, Anda <Text strong style={{ color: '#ef4444' }}>tidak berhak</Text> untuk mengisi pendaftaran ini. program ini khusus untuk binaan Astra Grup.
            </Text>
            <Button
              type="primary"
              danger
              size="large"
              onClick={handleDeniedClose}
              icon={<LogoutOutlined />}
              style={{ fontWeight: 600, height: 44, paddingInline: 28, borderRadius: 8 }}
            >
              Keluar
            </Button>
          </div>
        </Modal>
      </>
    );
  }

  if (loadingMaster) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" description="Memuat data..." />
      </div>
    );
  }

  // ── Step 1: Pilih Kategori dari Pilar ──────────────────────────────────────

  const renderStep1 = () => {
    return (
      <div style={{ width: '100%', maxWidth: 800, marginBottom: 32 }}>
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-[11px] text-red-500 italic">Catatan: Bidang yang bertanda (*) wajib diisi.</span>
          <span className="text-[11px] text-gray-400 italic" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckOutlined style={{ fontSize: '10px', color: '#94a3b8' }} /> Draft tersimpan otomatis
          </span>
        </div>
        <Row gutter={[20, 20]}>
          {pillars.map((pilar) => {
            const pk = getPilarKey(pilar.name);
            const { color, desc } = PILAR_CONFIG[pk];
            const pilarCategories = allCategories.filter(
              c => c.pillarId === pilar.id || c.pillar?.id === pilar.id
            );
            const hasSelected = pilarCategories.some(c => c.id === selectedKategoriId);

            return (
              <Col xs={24} sm={12} key={pilar.id} style={{ display: 'flex' }}>
                <div
                  style={{
                    border: `1.5px solid ${hasSelected ? color : '#e2e8f0'}`,
                    borderRadius: 12,
                    background: hasSelected ? `${color}08` : '#fff',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    width: '100%',
                  }}
                >
                  {/* Pilar Header */}
                  <div style={{ padding: '20px 20px 12px' }}>
                    <Text strong style={{ fontSize: 16, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      {pilar.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                      {pilar.description || desc}
                    </Text>
                  </div>

                  {/* Kategori Radio Buttons */}
                  <div style={{ padding: '0 20px 20px' }}>
                    <Radio.Group
                      value={selectedKategoriId}
                      onChange={(e) => handleKategoriSelect(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {pilarCategories.map((cat) => {
                          const isSelected = selectedKategoriId === cat.id;
                          return (
                            <div
                              key={cat.id}
                              style={{
                                border: `1px solid ${isSelected ? `${color}60` : '#e2e8f0'}`,
                                borderRadius: 8,
                                padding: '10px 14px',
                                background: isSelected ? `${color}10` : '#fafbfc',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onClick={() => handleKategoriSelect(cat.id)}
                              onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = `${color}40`; } }}
                              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#e2e8f0'; } }}
                            >
                              <Radio value={cat.id} style={{ width: '100%' }}>
                                <Text style={{ fontSize: 14, color: '#1e293b' }}>{cat.name}</Text>
                              </Radio>
                            </div>
                          );
                        })}
                        {pilarCategories.length === 0 && (
                          <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic' }}>
                            Belum ada kategori tersedia
                          </Text>
                        )}
                      </div>
                    </Radio.Group>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  // ── Step 2: Identitas ───────────────────────────────────────────────────────

  const renderStep2 = () => {
    /** Handle provinsi berubah → fetch kota, reset semua child */
    const handleProvinceChange = async (provinceId) => {
      const selected = provinceOptions.find(p => p.id === provinceId);
      setFormData(prev => ({
        ...prev,
        provinceId,
        provinceName: selected?.name || '',
        cityId: null, cityName: '',
        districtId: null, districtName: '',
        villageRegionId: null, villageRegionName: '',
      }));
      setCityOptions([]);
      setDistrictOptions([]);
      setDesaOptions([]);
      if (provinceId) await fetchCities(provinceId);
    };

    /** Handle kota berubah → fetch kecamatan, reset child */
    const handleCityChange = async (cityId) => {
      const selected = cityOptions.find(c => c.id === cityId);
      setFormData(prev => ({
        ...prev,
        cityId,
        cityName: selected?.name || '',
        districtId: null, districtName: '',
        villageRegionId: null, villageRegionName: '',
      }));
      setDistrictOptions([]);
      setDesaOptions([]);
      if (cityId) await fetchDistricts(cityId);
    };

    /** Handle kecamatan berubah → fetch desa, reset child */
    const handleDistrictChange = async (districtId) => {
      const selected = districtOptions.find(d => d.id === districtId);
      setFormData(prev => ({
        ...prev,
        districtId,
        districtName: selected?.name || '',
        villageRegionId: null, villageRegionName: '',
      }));
      setDesaOptions([]);
      if (districtId) await fetchVillages(districtId);
    };

    /** Handle desa berubah → simpan ID & nama */
    const handleVillageChange = (villageId) => {
      const selected = desaOptions.find(v => v.id === villageId);
      setFormData(prev => ({
        ...prev,
        villageRegionId: villageId,
        villageRegionName: selected?.name || '',
      }));
    };

    return (
      <div style={{ width: '100%', maxWidth: 800, marginBottom: 32, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 32 }}>
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-[11px] text-red-500 italic">Catatan: Bidang yang bertanda (*) wajib diisi.</span>
          <span className="text-[11px] text-gray-400 italic" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckOutlined style={{ fontSize: '10px', color: '#94a3b8' }} /> Draft tersimpan otomatis
          </span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text style={{ ...labelStyle, fontSize: 15 }}>Data Desa & Kelompok</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>Isi informasi identitas desa dan kelompok yang mendaftar</Text>
        </div>

        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.nama_desa ? labelErrorStyle : labelStyle}>Nama DSA/Nama Desa *</Text>
              <Input placeholder="Contoh: Desa Suka Maju" style={errors.nama_desa ? inputErrorStyle : inputStyle} value={formData.nama_desa} onChange={e => updateField('nama_desa', e.target.value)} />
              {errors.nama_desa && <Text style={errorTextStyle}>{errors.nama_desa}</Text>}
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={labelStyle}>Perusahaan/Yayasan Pembina (Opsional)</Text>
              <SearchSelect
                placeholder="Pilih Perusahaan/Yayasan Pembina..."
                value={formData.grup_astra_id}
                onChange={val => updateField('grup_astra_id', val)}
                allowClear
                showSearch
                options={[
                  ...astraGroups.map(g => ({ value: g.id, label: g.name })),
                  { value: 'others', label: 'Lainnya...' },
                ]}
              />
              {formData.grup_astra_id === 'others' && (
                <Input placeholder="Masukkan nama Perusahaan/Yayasan Pembina lainnya" style={{ ...inputStyle, marginTop: 8 }} value={formData.binaan_custom || ''} onChange={e => updateField('binaan_custom', e.target.value)} />
              )}
            </div>
          </Col>
        </Row>

        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.phone_number ? labelErrorStyle : labelStyle}>Nomor HP Ketua Kelompok *</Text>
              <Input placeholder="Contoh: 08123456789" style={errors.phone_number ? inputErrorStyle : inputStyle} value={formData.phone_number} onChange={handlePhoneChange} maxLength={15} inputMode="numeric" />
              {errors.phone_number && <Text style={errorTextStyle}>{errors.phone_number}</Text>}
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.nama_kelompok ? labelErrorStyle : labelStyle}>Nama Ketua Kelompok *</Text>
              <Input
                placeholder="Nama Ketua Kelompok"
                style={errors.nama_kelompok ? inputErrorStyle : inputStyle}
                value={formData.nama_kelompok}
                onChange={e => handleNameChange('nama_kelompok', e)}
              />
              {errors.nama_kelompok && <Text style={errorTextStyle}>{errors.nama_kelompok}</Text>}
            </div>
          </Col>
        </Row>

        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.nama_kelompok ? labelErrorStyle : labelStyle}>Nama Ketua Kelompok *</Text>
              <Input
                placeholder="Nama Ketua Kelompok"
                style={errors.nama_kelompok ? inputErrorStyle : inputStyle}
                value={formData.nama_kelompok}
                onChange={e => handleNameChange('nama_kelompok', e)}
              />
              {errors.nama_kelompok && <Text style={errorTextStyle}>{errors.nama_kelompok}</Text>}
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.phone_number ? labelErrorStyle : labelStyle}>Nomor HP Ketua Kelompok *</Text>
              <Input placeholder="Contoh: 08123456789" style={errors.phone_number ? inputErrorStyle : inputStyle} value={formData.phone_number} onChange={handlePhoneChange} maxLength={15} inputMode="numeric" />
              {errors.phone_number && <Text style={errorTextStyle}>{errors.phone_number}</Text>}
            </div>
          </Col>
        </Row>

        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.nama_kontak_darurat ? labelErrorStyle : labelStyle}>Nama Kontak Lainnya *</Text>
              <Input placeholder="Contoh: Siti Aminah" style={errors.nama_kontak_darurat ? inputErrorStyle : inputStyle} value={formData.nama_kontak_darurat} onChange={e => handleNameChange('nama_kontak_darurat', e)} />
              {errors.nama_kontak_darurat && <Text style={errorTextStyle}>{errors.nama_kontak_darurat}</Text>}
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.no_hp_kontak_darurat ? labelErrorStyle : labelStyle}>Nomor Kontak Lainnya *</Text>
              <Input placeholder="Contoh: 08123456789" style={errors.no_hp_kontak_darurat ? inputErrorStyle : inputStyle} value={formData.no_hp_kontak_darurat} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); updateField('no_hp_kontak_darurat', v); }} maxLength={15} inputMode="numeric" />
              {errors.no_hp_kontak_darurat && <Text style={errorTextStyle}>{errors.no_hp_kontak_darurat}</Text>}
            </div>
          </Col>
        </Row>

        <div style={fieldWrapper}>
          <Text style={errors.alamat ? labelErrorStyle : labelStyle}>Alamat Lengkap *</Text>
          <TextArea rows={3} placeholder="Detail jalan, RW/RT..." style={{ borderRadius: 8, borderColor: errors.alamat ? '#ef4444' : '#e2e8f0', fontSize: 13, resize: 'none', boxShadow: errors.alamat ? '0 0 0 2px rgba(239,68,68,0.1)' : 'none' }} value={formData.alamat} onChange={e => updateField('alamat', e.target.value)} />
          {errors.alamat && <Text style={errorTextStyle}>{errors.alamat}</Text>}
        </div>

        <div style={fieldWrapper}>
          <Text style={labelStyle}>Media Sosial (Opsional)</Text>
          <TextArea rows={2} placeholder="Contoh: https://instagram.com/akun, https://facebook.com/akun" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} value={formData.social_media || ''} onChange={e => updateField('social_media', e.target.value)} />
          <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Isi dengan tautan media sosial yang relevan (pisahkan dengan koma jika lebih dari satu)</Text>
        </div>

        <div style={{ marginTop: 28, marginBottom: 20 }}>
          <Text style={{ ...labelStyle, fontSize: 15 }}>Wilayah Administratif</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>Pilih lokasi wilayah administratif desa</Text>
        </div>

        <Row gutter={[24, 0]}>
          {/* Provinsi */}
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.provinceId ? labelErrorStyle : labelStyle}>Provinsi *</Text>
              {errors.provinceId && <Text style={errorTextStyle}>{errors.provinceId}</Text>}
              <SearchSelect
                placeholder="Ketik untuk cari provinsi..."
                value={formData.provinceId}
                onChange={(val) => {
                  if (!val) {
                    setFormData(prev => ({ ...prev, provinceId: null, provinceName: '', cityId: null, cityName: '', districtId: null, districtName: '', villageRegionId: null, villageRegionName: '' }));
                    setCityOptions([]); setDistrictOptions([]); setDesaOptions([]); setProvinceOptions([]);
                  } else {
                    handleProvinceChange(val);
                  }
                }}
                allowClear
                showSearch
                onSearch={(val) => debounce('province', () => { setProvinceOptions([]); fetchProvinces(val, 1); }, 500)}
                loading={loadingProvinces}
                notFoundContent={loadingProvinces ? 'Memuat data...' : 'Tidak ada data'}
                error={errors.provinceId}
                options={provinceOptions.map(p => ({ value: p.id, label: p.name }))}
                hasMore={provinceHasMore}
                loadingMore={loadingProvinces}
                onLoadMore={() => fetchProvinces(provinceSearch, provincePage + 1, true)}
              />
            </div>
          </Col>
          {/* Kabupaten */}
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.cityId ? labelErrorStyle : labelStyle}>Kabupaten / Kota *</Text>
              {errors.cityId && <Text style={errorTextStyle}>{errors.cityId}</Text>}
              <SearchSelect
                placeholder="Ketik untuk cari kabupaten..."
                value={formData.cityId}
                onChange={(val) => {
                  if (!val) {
                    setFormData(prev => ({ ...prev, cityId: null, cityName: '', districtId: null, districtName: '', villageRegionId: null, villageRegionName: '' }));
                    setDistrictOptions([]); setDesaOptions([]); setCityOptions([]);
                  } else {
                    handleCityChange(val);
                  }
                }}
                allowClear
                showSearch
                onSearch={(val) => debounce('city', () => formData.provinceId && fetchCities(formData.provinceId, val), 500)}
                disabled={!formData.provinceId}
                loading={loadingCities}
                notFoundContent={loadingCities ? 'Memuat data...' : 'Tidak ada data'}
                error={errors.cityId}
                options={cityOptions.map(c => ({ value: c.id, label: c.name }))}
                hasMore={cityHasMore}
                loadingMore={loadingCities}
                onLoadMore={() => fetchCities(formData.provinceId, citySearch, cityPage + 1, true)}
              />
            </div>
          </Col>
          {/* Kecamatan */}
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.districtId ? labelErrorStyle : labelStyle}>Kecamatan *</Text>
              {errors.districtId && <Text style={errorTextStyle}>{errors.districtId}</Text>}
              <SearchSelect
                placeholder="Ketik untuk cari kecamatan..."
                value={formData.districtId}
                onChange={(val) => {
                  if (!val) {
                    setFormData(prev => ({ ...prev, districtId: null, districtName: '', villageRegionId: null, villageRegionName: '' }));
                    setDesaOptions([]); setDistrictOptions([]);
                  } else {
                    handleDistrictChange(val);
                  }
                }}
                allowClear
                showSearch
                onSearch={(val) => debounce('district', () => formData.cityId && fetchDistricts(formData.cityId, val), 500)}
                disabled={!formData.cityId}
                loading={loadingDistricts}
                notFoundContent={loadingDistricts ? 'Memuat data...' : 'Tidak ada data'}
                error={errors.districtId}
                options={districtOptions.map(d => ({ value: d.id, label: d.name }))}
                hasMore={districtHasMore}
                loadingMore={loadingDistricts}
                onLoadMore={() => fetchDistricts(formData.cityId, districtSearch, districtPage + 1, true)}
              />
            </div>
          </Col>
          {/* Desa */}
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={errors.villageRegionId ? labelErrorStyle : labelStyle}>Desa / Kelurahan *</Text>
              {errors.villageRegionId && <Text style={errorTextStyle}>{errors.villageRegionId}</Text>}
              <SearchSelect
                placeholder="Ketik untuk cari desa..."
                value={formData.villageRegionId}
                onChange={(val) => {
                  if (!val) {
                    updateField('villageRegionId', null);
                    setDesaOptions([]);
                  } else {
                    handleVillageChange(val);
                  }
                }}
                allowClear
                showSearch
                onSearch={(val) => debounce('village', () => formData.districtId && fetchVillages(formData.districtId, val), 500)}
                disabled={!formData.districtId}
                loading={loadingDesa}
                notFoundContent={loadingDesa ? 'Memuat data...' : 'Tidak ada data desa'}
                error={errors.villageRegionId}
                options={desaOptions.map(d => ({ value: d.id, label: d.name }))}
                hasMore={desaHasMore}
                loadingMore={loadingDesa}
                onLoadMore={() => fetchVillages(formData.districtId, desaSearch, desaPage + 1, true)}
              />
            </div>
          </Col>
          <div style={{visibility :'hidden'}}>
            <Text>Jenis DSA *</Text>
            <Input value={formData.jenis_dsa} disabled />
          </div>
        </Row>
      </div>
    );
  };

  // ── Step 3: Program Details ─────────────────────────────────────────────────

  const renderStep3 = () => (
    <div style={{ width: '100%', maxWidth: 800, marginBottom: 32, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 32 }}>
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="text-[11px] text-red-500 italic">Catatan: Bidang yang bertanda (*) wajib diisi.</span>
        <span className="text-[11px] text-gray-400 italic" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckOutlined style={{ fontSize: '10px', color: '#94a3b8' }} /> Draft tersimpan otomatis
        </span>
      </div>

      <div style={fieldWrapper}>
        <Text style={errors.durasi_program ? labelErrorStyle : labelStyle}>Durasi Program *</Text>
        <SearchSelect
          placeholder="Pilih durasi program..."
          value={formData.durasi_program}
          onChange={val => updateField('durasi_program', val)}
          error={errors.durasi_program}
          options={[
            { value: '<1 Tahun', label: '< 1 Tahun' },
            { value: '1-3 Tahun', label: '1-3 Tahun' },
            { value: '3-5 Tahun', label: '3-5 Tahun' },
            { value: '>5 Tahun', label: '> 5 Tahun' },
          ]}
        />
      </div>

      <div style={fieldWrapper}>
        <Text style={errors.latar_belakang ? labelErrorStyle : labelStyle}>Latar Belakang / Rasionalisasi *</Text>
        <TextArea rows={5} placeholder="Contoh: Permintaan dari masyarakat dan kondisi X menyebabkan latar belakang program Y..." style={{ borderRadius: 8, borderColor: errors.latar_belakang ? '#ef4444' : '#e2e8f0', fontSize: 13, resize: 'none', boxShadow: errors.latar_belakang ? '0 0 0 2px rgba(239,68,68,0.1)' : 'none' }} value={formData.latar_belakang} onChange={e => updateField('latar_belakang', e.target.value)} />
        {errors.latar_belakang ? <Text style={errorTextStyle}>{errors.latar_belakang}</Text> : <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Jelaskan latar belakang program</Text>}
      </div>

      <div style={fieldWrapper}>
        <Text style={errors.implementation_method ? labelErrorStyle : labelStyle}>Metode Pelaksanaan Program *</Text>
        <TextArea rows={5} placeholder="Contoh: Penyuluhan (Counseling/Education), Pelatihan (Training), Studi Banding (Benchmarking), Pembinaan, Pengorganisasian Masyarakat (Community Organizing), Pengembangan Stimulan/Bantuan Sarana, Kemitraan dan Jejaring (Networking), Aksi Kolektif/Gotong Royong, Peer Learning (Belajar Sebaya), Sekolah Lapang, Aksi Kolektif" style={{ borderRadius: 8, borderColor: errors.implementation_method ? '#ef4444' : '#e2e8f0', fontSize: 13, resize: 'none', boxShadow: errors.implementation_method ? '0 0 0 2px rgba(239,68,68,0.1)' : 'none' }} value={formData.implementation_method || ''} onChange={e => updateField('implementation_method', e.target.value)} />
        {errors.implementation_method ? <Text style={errorTextStyle}>{errors.implementation_method}</Text> : <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Jelaskan bagaimana program ini dilaksanakan</Text>}
      </div>

      <div style={fieldWrapper}>
        <Text style={errors.dampak_program ? labelErrorStyle : labelStyle}>Dampak Yang Sudah Terealisasi *</Text>
        <TextArea rows={5} placeholder="Contoh: Peningkatan pendapatan sebesar Rp X, Peningkatan jumlah kunjungan wisata sebesar Y%, Penurunan emisi sebesar Y%" style={{ borderRadius: 8, borderColor: errors.dampak_program ? '#ef4444' : '#e2e8f0', fontSize: 13, resize: 'none', boxShadow: errors.dampak_program ? '0 0 0 2px rgba(239,68,68,0.1)' : 'none' }} value={formData.dampak_program} onChange={e => updateField('dampak_program', e.target.value)} />
        {errors.dampak_program ? <Text style={errorTextStyle}>{errors.dampak_program}</Text> : <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Jelaskan target dampak yang ingin dicapai</Text>}
      </div>

      <div style={fieldWrapper}>
        <Text style={errors.rencana_pengembangan ? labelErrorStyle : labelStyle}>Rencana dan Potensi Pengembangan *</Text>
        <TextArea rows={5} placeholder="Contoh: Program X akan terus dikembangkan dengan meningkatkan jumlah pelatihan dan memperluas jangkauan program" style={{ borderRadius: 8, borderColor: errors.rencana_pengembangan ? '#ef4444' : '#e2e8f0', fontSize: 13, resize: 'none', boxShadow: errors.rencana_pengembangan ? '0 0 0 2px rgba(239,68,68,0.1)' : 'none' }} value={formData.rencana_pengembangan} onChange={e => updateField('rencana_pengembangan', e.target.value)} />
        {errors.rencana_pengembangan ? <Text style={errorTextStyle}>{errors.rencana_pengembangan}</Text> : <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Jelaskan rencana pengembangan program satu tahun ke depan</Text>}
      </div>

      <div style={fieldWrapper}>
        <Text style={errors.sustainability_plan ? labelErrorStyle : labelStyle}>Keberlanjutan Program *</Text>
        <TextArea rows={5} placeholder={"Contoh:\n- 1.Kemitraan \n- 2.Kaderisasi \n- 3.Digitalisasi \n- 4. dll"} style={{ borderRadius: 8, borderColor: errors.sustainability_plan ? '#ef4444' : '#e2e8f0', fontSize: 13, resize: 'none', boxShadow: errors.sustainability_plan ? '0 0 0 2px rgba(239,68,68,0.1)' : 'none' }} value={formData.sustainability_plan || ''} onChange={e => updateField('sustainability_plan', e.target.value)} />
        {errors.sustainability_plan ? <Text style={errorTextStyle}>{errors.sustainability_plan}</Text> : <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Sebutkan & Jelaskan Strategi Keberlanjutan Program</Text>}
      </div>

      <div style={fieldWrapper}>
        <Text style={errors.program_evaluation ? labelErrorStyle : labelStyle}>Evaluasi Program *</Text>
        <TextArea rows={5} placeholder="Contoh: Evaluasi dilakukan melalui survei kepuasan peserta dan monitoring dampak program" style={{ borderRadius: 8, borderColor: errors.program_evaluation ? '#ef4444' : '#e2e8f0', fontSize: 13, resize: 'none', boxShadow: errors.program_evaluation ? '0 0 0 2px rgba(239,68,68,0.1)' : 'none' }} value={formData.program_evaluation || ''} onChange={e => updateField('program_evaluation', e.target.value)} />
        {errors.program_evaluation ? <Text style={errorTextStyle}>{errors.program_evaluation}</Text> : <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Jelaskan bagaimana program ini dievaluasi</Text>}
      </div>

      {/* Upload Foto Dokumentasi */}
      <div style={{ marginTop: 8 }}>
        <Text style={errors.photos ? labelErrorStyle : labelStyle}>Foto Dokumentasi *</Text>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
          Unggah foto kegiatan program (wajib minimal 1 foto, maks. 2 foto, format JPEG/PNG/WEBP, maks. 5 MB per foto)
        </Text>
        {errors.photos && <Text style={{ ...errorTextStyle, marginBottom: 12 }}>{errors.photos}</Text>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {photos.map((photo, index) => (
            <div
              key={index}
              onClick={() => setPreviewPhoto(photo.url?.startsWith('http') ? photo.url : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.url}`)}
              style={{
                width: 110, height: 110, borderRadius: 8, overflow: 'hidden',
                border: '1px solid #e2e8f0', position: 'relative', cursor: 'pointer',
              }}
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
                onClick={(e) => { e.stopPropagation(); handlePhotoDelete(index); }}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 24, height: 24, minWidth: 24,
                  background: 'rgba(0,0,0,0.5)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              />
            </div>
          ))}

          {photos.length < 2 && (
            <Upload
              accept=".jpg,.jpeg,.png,.webp"
              showUploadList={false}
              beforeUpload={handlePhotoUpload}
              disabled={uploadingPhoto}
            >
              <div
                style={{
                  width: 110, height: 110, borderRadius: 8,
                  border: '1.5px dashed #d1d5db', background: '#fafbfc',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: uploadingPhoto ? 0.6 : 1,
                }}
              >
                {uploadingPhoto ? (
                  <Spin size="small" />
                ) : (
                  <>
                    <PlusOutlined style={{ fontSize: 20, color: '#9ca3af', marginBottom: 4 }} />
                    <Text style={{ fontSize: 11, color: '#9ca3af' }}>Tambah Foto</Text>
                  </>
                )}
              </div>
            </Upload>
          )}
        </div>
      </div>
    </div>
  );

  // ── Step 4: Review ──────────────────────────────────────────────────────────

  const ReviewCard = ({ title, icon, children }) => (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <Text strong style={{ fontSize: 15, color: '#002444' }}>{title}</Text>
      </div>
      {children}
    </div>
  );

  const ReviewField = ({ label, value, span = 12 }) => (
    <Col xs={24} sm={span}>
      <div style={{ marginBottom: 12 }}>
        <Text style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
        <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
          {value || <Text type="secondary" style={{ fontWeight: 400 }}>—</Text>}
        </Text>
      </div>
    </Col>
  );

  const grupLabel = formData.grup_astra_id === 'others'
    ? formData.binaan_custom || 'Lainnya'
    : astraGroups.find(g => g.id === formData.grup_astra_id)?.name || null;
  const kategoriLabel = allCategories.find(c => c.id === selectedKategoriId)?.name;

  const renderStep4 = () => (
    <div style={{ width: '100%', maxWidth: 800, marginBottom: 32 }}>
      <ReviewCard title="Pilar & Kategori" icon={<CheckCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />}>
        <Row gutter={[16, 12]}>
          <ReviewField label="Pilar Terpilih" value={selectedPilar?.name} />
          <ReviewField label="kategori" value={kategoriLabel} />
        </Row>
      </ReviewCard>

      <ReviewCard title="Data Peserta" icon={<MedicineBoxOutlined style={{ color: '#1890ff', fontSize: 16 }} />}>
        <Row gutter={[16, 12]}>
          <ReviewField label="Nama DSA/Nama Desa" value={formData.nama_desa} />
          <ReviewField label="Jenis DSA" value={formData.jenis_dsa === 'kelompok' ? 'Kelompok' : formData.jenis_dsa === 'individu' ? 'Individu' : '-'} />
          <ReviewField label={formData.jenis_dsa === 'individu' ? 'Nama Peserta' : 'Nama Ketua Kelompok'} value={formData.nama_kelompok} />
          <ReviewField label="Nomor HP Ketua Kelompok" value={formData.phone_number} />
          <ReviewField label="Perusahaan/Yayasan Pembina" value={grupLabel || '-'} span={24} />
          <ReviewField label="Nama Kontak Lainnya" value={formData.nama_kontak_darurat} />
          <ReviewField label="Nomor HP Kontak Lainnya" value={formData.no_hp_kontak_darurat} />
          <ReviewField label="Alamat Lengkap" value={formData.alamat} span={24} />
          <ReviewField label="Media Sosial" value={formData.social_media || '-'} span={24} />
          <ReviewField label="Provinsi" value={formData.provinceName} />
          <ReviewField label="Kabupaten / Kota" value={formData.cityName} />
          <ReviewField label="Kecamatan" value={formData.districtName} />
          <ReviewField label="Desa / Kelurahan" value={formData.villageRegionName} />
        </Row>
      </ReviewCard>

      <ReviewCard title="Detail Program" icon={<EnvironmentOutlined style={{ color: '#1890ff', fontSize: 16 }} />}>
        <Row gutter={[16, 12]}>
          <ReviewField label="Durasi Program" value={formData.durasi_program || '-'} />
          <ReviewField label="Latar Belakang / Rasionalisasi" value={formData.latar_belakang} span={24} />
          <ReviewField label="Metode Pelaksanaan Program" value={formData.implementation_method} span={24} />
          <ReviewField label="Dampak Yang Sudah Terealisasi" value={formData.dampak_program} span={24} />
          <ReviewField label="Rencana dan Potensi Pengembangan" value={formData.rencana_pengembangan} span={24} />
          <ReviewField label="Keberlanjutan Program" value={formData.sustainability_plan} span={24} />
          <ReviewField label="Evaluasi Program" value={formData.program_evaluation} span={24} />
        </Row>
        {photos.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Text style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Foto Dokumentasi</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {photos.map((photo, i) => (
                <div key={i} onClick={() => setPreviewPhoto(photo.url?.startsWith('http') ? photo.url : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.url}`)} style={{ width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  <img src={photo.url?.startsWith('http') ? photo.url : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.url}`} alt={photo.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </ReviewCard>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  // ── Layout ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      {!registrationId && (
        <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ fontWeight: 600, color: '#64748b' }}>
              Kembali
            </Button>
            <div style={{ height: 20, width: 1, background: '#e2e8f0' }} />
            <Text strong style={{ fontSize: 14, color: '#1e293b' }}>Formulir Pendaftaran</Text>
          </div>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ fontWeight: 600, color: '#ef4444' }}
          >
            Keluar
          </Button>
        </div>
      )}

      <div style={{ background: '#f8faff', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ padding: '40px 24px 60px', maxWidth: 1000, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Stepper */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 520, marginBottom: 48 }}>
            <div style={{ position: 'absolute', top: 16, left: 40, right: 40, height: 2, background: '#e2e8f0', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 16, left: 40, width: `calc(${Math.min(((currentStep - 1) / (STEPS.length - 1)) * 100, 100)}% - 40px)`, height: 2, background: '#002444', zIndex: 0, transition: 'width 0.3s ease' }} />
            {STEPS.map((step, i) => {
              const stepNum = i + 1;
              const isActive = currentStep === stepNum;
              const isPast = currentStep > stepNum;
              return (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, background: '#f8faff', padding: '0 8px' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, marginBottom: 8,
                    background: isActive || isPast ? '#002444' : '#e5eeff',
                    color: isActive || isPast ? '#fff' : '#436084',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 0 0 4px rgba(0,36,68,0.15)' : 'none',
                  }}>
                    {isPast ? <CheckOutlined style={{ fontSize: 14 }} /> : stepNum}
                  </div>
                  <Text style={{ fontSize: 12, fontWeight: isActive ? 700 : 600, color: isActive || isPast ? '#002444' : '#94a3b8', transition: 'color 0.2s' }}>{step}</Text>
                </div>
              );
            })}
          </div>

          <Title level={2} style={{ color: '#002444', textAlign: 'center', marginBottom: 8, fontWeight: 700 }}>{STEP_TITLES[currentStep - 1]}</Title>
          <Paragraph style={{ color: '#64748b', textAlign: 'center', marginBottom: 40, maxWidth: 560, fontSize: 14 }}>{STEP_SUBTITLES[currentStep - 1]}</Paragraph>

          {renderStepContent()}

          {/* Navigation */}
          <div style={{ width: '100%', maxWidth: 800, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {currentStep > 1 ? (
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={prevStep} style={{ fontWeight: 600, color: '#64748b', height: 40 }}>Kembali</Button>
              ) : (
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ fontWeight: 600, color: '#64748b', height: 40 }}>Kembali ke Beranda</Button>
              )}
              {currentStep < 4 ? (
                <Button onClick={nextStep} style={{ background: '#002444', borderColor: '#002444', color: '#fff', fontWeight: 600, height: 40, paddingLeft: 24, paddingRight: 24, borderRadius: 8 }}>
                  Lanjut ke {STEPS[currentStep]} <ArrowRightOutlined />
                </Button>
              ) : (
                <Button onClick={handleSubmit} loading={submitting} style={{ background: '#0051d5', borderColor: '#0051d5', color: '#fff', fontWeight: 600, height: 40, paddingLeft: 24, paddingRight: 24, borderRadius: 8 }}>
                  Kirim Pendaftaran <CheckCircleOutlined />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 20 }} /><span>Konfirmasi Pengiriman Data</span></div>}
        open={showConfirmModal}
        onOk={confirmSubmit}
        onCancel={() => setShowConfirmModal(false)}
        okText="Ya, Kirim Data"
        cancelText="Kembali Periksa"
        confirmLoading={submitting}
        centered
        okButtonProps={{ style: { background: '#0051d5', borderColor: '#0051d5', fontWeight: 600 } }}
        cancelButtonProps={{ style: { fontWeight: 600 } }}
      >
        <div style={{ padding: '8px 0' }}>
          <Paragraph style={{ marginBottom: 16, fontSize: 14 }}>
            Mohon untuk diperiksa kembali seluruh data yang telah diisi. Apakah Anda sudah yakin ingin mengirimkan data ini?
          </Paragraph>
          {/* <div style={{ background: '#f6f8fa', borderRadius: 8, padding: 16, border: '1px solid #e8e8e8' }}>
            <Text style={{ fontSize: 13, color: '#64748b' }}>Ringkasan:</Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 13 }}><Text type="secondary">Pilar:</Text> <Text strong>{selectedPilar?.name}</Text></Text>
              {kategoriLabel && (
                <Text style={{ fontSize: 13, display: 'block', marginTop: 4 }}><Text type="secondary">Kategori:</Text> <Text strong>{kategoriLabel}</Text></Text>
              )}
              {formData.nama_desa && (
                <Text style={{ fontSize: 13, display: 'block', marginTop: 4 }}><Text type="secondary">Desa:</Text> <Text strong>{formData.nama_desa}</Text></Text>
              )}
            </div>
          </div> */}
        </div>
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
          <img
            src={previewPhoto}
            alt="Preview"
            style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
          />
        )}
      </Modal>
    </>
  );
};

export default FormPendaftaran;
