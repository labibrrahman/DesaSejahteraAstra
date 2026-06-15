import React, { useState, useEffect } from 'react';
import { Typography, Button, Select, Input, Row, Col, message, Modal, Spin, Radio, Card } from 'antd';
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
} from '@ant-design/icons';
import useAuthStore from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import masterService from '../../services/masterService';
import registrationService from '../../services/registrationService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ─── Static Config ───────────────────────────────────────────────────────────

const STEPS = ['Pilar', 'Identitas', 'Program', 'Review'];

const STEP_TITLES = [
  'Pilih Pilar & Kategori Lomba',
  'Identitas Pendaftar',
  'Detail Program Inisiatif',
  'Review & Konfirmasi',
];

const STEP_SUBTITLES = [
  'Silakan pilih pilar program yang akan didaftarkan.',
  'Lengkapi data identitas desa dan penanggung jawab program.',
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
const labelStyle = { display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#002444' };
const fieldWrapper = { marginBottom: 20 };

// ─── Component ───────────────────────────────────────────────────────────────

const FormPendaftaran = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const DRAFT_KEY = 'form_pendaftaran_draft';

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
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);

  const updateField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  // Hanya izinkan angka untuk nomor HP
  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    updateField('phone_number', onlyNums);
  };

  // ── Auto-save draft ke localStorage ────────────────────────────────────────
  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        currentStep,
        selectedPilarId,
        selectedKategoriId,
        formData,
      }));
    } catch { /* quota exceeded, ignore */ }
  };

  // Save setiap kali step atau formData berubah
  useEffect(() => {
    saveDraft();
  }, [currentStep, selectedPilarId, selectedKategoriId, formData]);

  // ── Fetch master data + existing registration on mount ──────────────────────

  // ── Fetch provinces dari API ────────────────────────────────────────────────
  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const result = await masterService.getProvinces();
      setProvinceOptions(Array.isArray(result) ? result.map(p => ({ id: p.id, name: p.name })) : []);
    } catch {
      console.error('Gagal memuat provinsi');
    } finally {
      setLoadingProvinces(false);
    }
  };

  // ── Fetch kota/kabupaten dari API ──────────────────────────────────────────
  const fetchCities = async (provinceId) => {
    if (!provinceId) { setCityOptions([]); return; }
    setLoadingCities(true);
    try {
      const result = await masterService.getCities(provinceId);
      setCityOptions(Array.isArray(result) ? result.map(c => ({ id: c.id, name: c.name })) : []);
    } catch {
      setCityOptions([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // ── Fetch kecamatan dari API ───────────────────────────────────────────────
  const fetchDistricts = async (cityId) => {
    if (!cityId) { setDistrictOptions([]); return; }
    setLoadingDistricts(true);
    try {
      const result = await masterService.getDistricts(cityId);
      setDistrictOptions(Array.isArray(result) ? result.map(d => ({ id: d.id, name: d.name })) : []);
    } catch {
      setDistrictOptions([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // ── Fetch desa dari API ────────────────────────────────────────────────────
  const fetchVillages = async (districtId) => {
    if (!districtId) { setDesaOptions([]); return; }
    setLoadingDesa(true);
    try {
      const result = await masterService.getVillages(districtId);
      setDesaOptions(Array.isArray(result) ? result.map(v => ({ id: v.id, name: v.name })) : []);
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
        try {
          const { data } = await api.get('/registrations/my');
          const reg = data?.data ?? data;
          if (reg && reg.id) {
            // Sudah punya registrasi, hapus draft lama
            localStorage.removeItem(DRAFT_KEY);
            setRegistrationId(reg.id);
            setSelectedPilarId(reg.pillarId || null);

            // Load wilayah dependent options untuk existing registration
            if (reg.provinceId) {
              await fetchCities(reg.provinceId);
            }
            if (reg.cityId) {
              await fetchDistricts(reg.cityId);
            }
            if (reg.districtId) {
              await fetchVillages(reg.districtId);
            }

            setFormData({
              nama_desa: reg.villageName || '',
              nama_kelompok: reg.groupName || '',
              alamat: reg.address || '',
              latar_belakang: reg.background || '',
              dampak_program: reg.programImpact || '',
              grup_astra_id: reg.astraGroup?.id || null,
              jenis_dsa: reg.dsaType ? reg.dsaType.toLowerCase() : null,
              nama_ketua: reg.leaderName || '',
              phone_number: reg.phoneNumber || '',
              provinceId: reg.provinceId || null,
              cityId: reg.cityId || null,
              districtId: reg.districtId || null,
              villageRegionId: reg.villageRegionId || null,
              provinceName: reg.province?.name || '',
              cityName: reg.city?.name || '',
              districtName: reg.district?.name || '',
              villageRegionName: reg.villageRegion?.name || '',
            });
            if (reg.categoryId) setSelectedKategoriId(reg.categoryId);
          }
        } catch {
          // Belum ada registrasi dari API — jika ada draft, restore dependent dropdowns
          if (savedDraft?.formData) {
            const d = savedDraft.formData;
            if (d.provinceId) await fetchCities(d.provinceId);
            if (d.cityId) await fetchDistricts(d.cityId);
            if (d.districtId) await fetchVillages(d.districtId);
          }
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
    switch (step) {
      case 1:
        if (!selectedKategoriId) {
          message.warning('Silakan pilih kategori terlebih dahulu');
          return false;
        }
        return true;

      case 2: {
        const missing = [];
        if (!formData.nama_desa) missing.push('Nama DSA');
        if (!formData.jenis_dsa) missing.push('Jenis DSA');
        if (!formData.nama_kelompok) missing.push('Nama Kelompok/Individu');
        if (formData.jenis_dsa === 'kelompok' && !formData.nama_ketua) missing.push('Nama Ketua');
        if (!formData.phone_number) {
          missing.push('Nomor HP');
        } else if (formData.phone_number.length < 8) {
          message.warning('Nomor HP minimal 8 digit');
          return false;
        }
        if (!formData.alamat) missing.push('Alamat Lengkap');
        if (!formData.provinceId) missing.push('Provinsi');
        if (!formData.cityId) missing.push('Kabupaten / Kota');
        if (!formData.districtId) missing.push('Kecamatan');
        if (!formData.villageRegionId) missing.push('Desa / Kelurahan');
        if (missing.length > 0) {
          message.warning(`Harap isi: ${missing.join(', ')}`);
          return false;
        }
        return true;
      }

      case 3: {
        const missing = [];
        if (!formData.latar_belakang) missing.push('Latar Belakang');
        if (!formData.dampak_program) missing.push('Dampak Program');
        if (missing.length > 0) {
          message.warning(`Harap isi: ${missing.join(', ')}`);
          return false;
        }
        return true;
      }

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // ── Handle pemilihan kategori — otomatis set pilar parent ──────────────────

  const handleKategoriSelect = (categoryId) => {
    setSelectedKategoriId(categoryId);
    // Cari kategori → pillar id
    const cat = allCategories.find(c => c.id === categoryId);
    if (cat) {
      const pilarId = cat.pillarId || cat.pillar?.id;
      if (pilarId) setSelectedPilarId(pilarId);
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
      };
      if (formData.jenis_dsa) payload.dsaType = formData.jenis_dsa.charAt(0).toUpperCase() + formData.jenis_dsa.slice(1);
      if (formData.nama_ketua) payload.leaderName = formData.nama_ketua;
      if (formData.phone_number) payload.phoneNumber = formData.phone_number;
      if (formData.provinceId) payload.provinceId = formData.provinceId;
      if (formData.cityId) payload.cityId = formData.cityId;
      if (formData.districtId) payload.districtId = formData.districtId;
      if (formData.villageRegionId) payload.villageRegionId = formData.villageRegionId;
      if (formData.grup_astra_id) payload.astraGroupId = formData.grup_astra_id;

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
      const msg = err.response?.data?.message || err.response?.data?.data?.message || 'Gagal mengirim pendaftaran';
      message.error(msg);
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
        <Row gutter={[20, 20]}>
          {pillars.map((pilar) => {
            const pk = getPilarKey(pilar.name);
            const { color, desc } = PILAR_CONFIG[pk];
            const pilarCategories = allCategories.filter(
              c => c.pillarId === pilar.id || c.pillar?.id === pilar.id
            );
            const hasSelected = pilarCategories.some(c => c.id === selectedKategoriId);

            return (
              <Col xs={24} sm={12} key={pilar.id}>
                <div
                  style={{
                    border: `1.5px solid ${hasSelected ? color : '#e2e8f0'}`,
                    borderRadius: 12,
                    background: hasSelected ? `${color}08` : '#fff',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
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
        <div style={{ marginBottom: 24 }}>
          <Text style={{ ...labelStyle, fontSize: 15 }}>Data Desa & Kelompok</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>Isi informasi identitas desa dan kelompok yang mendaftar</Text>
        </div>

        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={labelStyle}>Nama DSA (Desa Sejahtera Astra) *</Text>
              <Input placeholder="Contoh: Desa Suka Maju" style={inputStyle} value={formData.nama_desa} onChange={e => updateField('nama_desa', e.target.value)} />
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={labelStyle}>Jenis DSA *</Text>
              <Select placeholder="Pilih jenis DSA" style={{ width: '100%' }} size="large"
                value={formData.jenis_dsa} onChange={val => updateField('jenis_dsa', val)}>
                <Option value="kelompok">Kelompok</Option>
                <Option value="individu">Individu</Option>
              </Select>
            </div>
          </Col>
        </Row>

        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={labelStyle}>Nama Kelompok/Individu *</Text>
              <Input placeholder="Contoh: Koperasi Tani Makmur" style={inputStyle} value={formData.nama_kelompok} onChange={e => updateField('nama_kelompok', e.target.value)} />
            </div>
          </Col>
          {formData.jenis_dsa === 'kelompok' ? (
            <Col xs={24} sm={12}>
              <div style={fieldWrapper}>
                <Text style={labelStyle}>Nama Ketua *</Text>
                <Input placeholder="Contoh: Budi Santoso" style={inputStyle} value={formData.nama_ketua} onChange={e => updateField('nama_ketua', e.target.value)} />
              </div>
            </Col>
          ) : (
            <Col xs={24} sm={12}>
              <div style={fieldWrapper}>
                <Text style={labelStyle}>Nomor HP (WhatsApp) *</Text>
                <Input placeholder="Contoh: 08123456789" style={inputStyle} value={formData.phone_number} onChange={handlePhoneChange} maxLength={15} />
              </div>
            </Col>
          )}
        </Row>

        {formData.jenis_dsa === 'kelompok' && (
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={12}>
              <div style={fieldWrapper}>
                <Text style={labelStyle}>Nomor HP (WhatsApp) *</Text>
                <Input placeholder="Contoh: 08123456789" style={inputStyle} value={formData.phone_number} onChange={handlePhoneChange} maxLength={15} />
              </div>
            </Col>
          </Row>
        )}

        <div style={fieldWrapper}>
          <Text style={labelStyle}>Alamat Lengkap *</Text>
          <TextArea rows={3} placeholder="Detail jalan, RW/RT..." style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} value={formData.alamat} onChange={e => updateField('alamat', e.target.value)} />
        </div>

        <div style={{ marginTop: 28, marginBottom: 20 }}>
          <Text style={{ ...labelStyle, fontSize: 15 }}>Wilayah Administratif</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>Pilih lokasi wilayah administratif desa</Text>
        </div>

        <Row gutter={[24, 0]}>
          {/* Provinsi */}
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={labelStyle}>Provinsi *</Text>
              <Select
                placeholder="Pilih Provinsi"
                style={{ width: '100%' }}
                size="large"
                showSearch
                optionFilterProp="children"
                value={formData.provinceId}
                onChange={handleProvinceChange}
                loading={loadingProvinces}
                notFoundContent="Memuat data..."
              >
                {provinceOptions.map(p => (
                  <Option key={p.id} value={p.id}>{p.name}</Option>
                ))}
              </Select>
            </div>
          </Col>
          {/* Kabupaten */}
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={labelStyle}>Kabupaten / Kota *</Text>
              <Select
                placeholder="Pilih Kabupaten"
                style={{ width: '100%' }}
                size="large"
                showSearch
                optionFilterProp="children"
                value={formData.cityId}
                onChange={handleCityChange}
                disabled={!formData.provinceId}
                loading={loadingCities}
                notFoundContent={loadingCities ? 'Memuat data...' : 'Tidak ada data'}
              >
                {cityOptions.map(c => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </div>
          </Col>
          {/* Kecamatan */}
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={labelStyle}>Kecamatan *</Text>
              <Select
                placeholder="Pilih Kecamatan"
                style={{ width: '100%' }}
                size="large"
                showSearch
                optionFilterProp="children"
                value={formData.districtId}
                onChange={handleDistrictChange}
                disabled={!formData.cityId}
                loading={loadingDistricts}
                notFoundContent={loadingDistricts ? 'Memuat data...' : 'Tidak ada data'}
              >
                {districtOptions.map(d => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>
            </div>
          </Col>
          {/* Desa */}
          <Col xs={24} sm={12}>
            <div style={fieldWrapper}>
              <Text style={labelStyle}>Desa / Kelurahan *</Text>
              <Select
                placeholder="Pilih Desa / Kelurahan"
                style={{ width: '100%' }}
                size="large"
                showSearch
                optionFilterProp="children"
                value={formData.villageRegionId}
                onChange={handleVillageChange}
                disabled={!formData.districtId}
                loading={loadingDesa}
                notFoundContent={loadingDesa ? 'Memuat data...' : 'Tidak ada data desa'}
              >
                {desaOptions.map(d => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  // ── Step 3: Program Details ─────────────────────────────────────────────────

  const renderStep3 = () => (
    <div style={{ width: '100%', maxWidth: 800, marginBottom: 32, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <Text style={{ ...labelStyle, fontSize: 15 }}>Informasi Program</Text>
        <Text type="secondary" style={{ fontSize: 13 }}>Jelaskan detail program inisiatif yang akan dijalankan</Text>
      </div>

      <div style={fieldWrapper}>
        <Text style={labelStyle}>Group Astra (Pembina)</Text>
        <Select placeholder="Pilih perusahaan/grup Group Astra (Pembina) jika ada..." style={{ width: '100%' }} size="large" allowClear showSearch optionFilterProp="children"
          value={formData.grup_astra_id} onChange={val => updateField('grup_astra_id', val)}>
          {astraGroups.map(g => <Option key={g.id} value={g.id}>{g.name}</Option>)}
        </Select>
      </div>

      <div style={fieldWrapper}>
        <Text style={labelStyle}>Latar Belakang / Rasionalisasi *</Text>
        <TextArea rows={5} placeholder="Jelaskan alasan dan latar belakang inisiatif program ini..." style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} value={formData.latar_belakang} onChange={e => updateField('latar_belakang', e.target.value)} />
        <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Untuk menjelaskan latar belakang program</Text>
      </div>

      <div>
        <Text style={labelStyle}>Dampak Program *</Text>
        <TextArea rows={5} placeholder="Ceritakan dampak positif yang dihasilkan program secara bebas" style={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} value={formData.dampak_program} onChange={e => updateField('dampak_program', e.target.value)} />
        <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Jelaskan target dampak yang ingin dicapai</Text>
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

  const grupLabel = astraGroups.find(g => g.id === formData.grup_astra_id)?.name;
  const kategoriLabel = allCategories.find(c => c.id === selectedKategoriId)?.name;

  const renderStep4 = () => (
    <div style={{ width: '100%', maxWidth: 800, marginBottom: 32 }}>
      <ReviewCard title="Pilar & Kategori" icon={<CheckCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />}>
        <Row gutter={[16, 12]}>
          <ReviewField label="Pilar Terpilih" value={selectedPilar?.name} />
          <ReviewField label="Sub-kategori" value={kategoriLabel} />
        </Row>
      </ReviewCard>

      <ReviewCard title="Data Peserta" icon={<MedicineBoxOutlined style={{ color: '#1890ff', fontSize: 16 }} />}>
        <Row gutter={[16, 12]}>
          <ReviewField label="Nama DSA (Desa Sejahtera Astra)" value={formData.nama_desa} />
          <ReviewField label="Jenis DSA" value={formData.jenis_dsa === 'kelompok' ? 'Kelompok' : formData.jenis_dsa === 'individu' ? 'Individu' : '-'} />
          <ReviewField label="Nama Kelompok / Individu" value={formData.nama_kelompok} />
          {formData.jenis_dsa === 'kelompok' && (
            <ReviewField label="Nama Ketua" value={formData.nama_ketua} />
          )}
          <ReviewField label="Nomor HP (WhatsApp)" value={formData.phone_number} />
          <ReviewField label="Alamat Lengkap" value={formData.alamat} span={24} />
          <ReviewField label="Provinsi" value={formData.provinceName} />
          <ReviewField label="Kabupaten / Kota" value={formData.cityName} />
          <ReviewField label="Kecamatan" value={formData.districtName} />
          <ReviewField label="Desa / Kelurahan" value={formData.villageRegionName} />
        </Row>
      </ReviewCard>

      <ReviewCard title="Detail Program" icon={<EnvironmentOutlined style={{ color: '#1890ff', fontSize: 16 }} />}>
        <Row gutter={[16, 12]}>
          <ReviewField label="Group Astra (Pembina)" value={grupLabel || 'Belum dipilih'} span={24} />
          <ReviewField label="Latar Belakang / Rasionalisasi" value={formData.latar_belakang} span={24} />
          <ReviewField label="Dampak Program yang Diharapkan" value={formData.dampak_program} span={24} />
        </Row>
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
            <div style={{ position: 'absolute', top: 16, left: 40, width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}%)`, height: 2, background: '#002444', zIndex: 0, transition: 'width 0.3s ease' }} />
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
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 20 }} /><span>Konfirmasi Pendaftaran</span></div>}
        open={showConfirmModal}
        onOk={confirmSubmit}
        onCancel={() => setShowConfirmModal(false)}
        okText="Ya, Kirim"
        cancelText="Batal"
        confirmLoading={submitting}
        okButtonProps={{ style: { background: '#0051d5', borderColor: '#0051d5', fontWeight: 600 } }}
        cancelButtonProps={{ style: { fontWeight: 600 } }}
      >
        <div style={{ padding: '8px 0' }}>
          <Paragraph style={{ marginBottom: 16, fontSize: 14 }}>
            Pastikan semua data yang Anda isi sudah benar. Setelah dikirim, pendaftaran akan masuk ke tahap <Text strong>Screening</Text> oleh tim admin.
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
    </>
  );
};

export default FormPendaftaran;
