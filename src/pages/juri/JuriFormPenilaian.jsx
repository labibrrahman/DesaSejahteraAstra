import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, InputNumber, Button, Typography, Tag, Row, Col, message, Result, Spin, Modal } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, FileTextOutlined, BulbOutlined, ThunderboltOutlined, ToolOutlined, CheckCircleFilled, CameraOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import adminService from '../../services/adminService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const KRITERIA = [
  { key: 'criteria1', label: 'Inovasi & Kreativitas', desc: 'Penilaian terhadap tingkat inovasi dan kreativitas dalam program yang diajukan.', icon: <BulbOutlined />, color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'criteria2', label: 'Dampak Program', desc: 'Penilaian terhadap dampak nyata program bagi masyarakat.', icon: <ThunderboltOutlined />, color: '#10b981', bg: '#ecfdf5' },
  { key: 'criteria3', label: 'Potensi Keberlanjutan Program', desc: 'Penilaian terhadap potensi keberlanjutan dan pengembangan program ke depan.', icon: <ToolOutlined />, color: '#f59e0b', bg: '#fffbeb' },
];

const mapFromApi = (i) => ({
  id: i.id, nama_desa: i.villageName || '-', nama_kelompok: i.groupName || '-',
  pilar: i.pillar?.name || '-', kategori: i.category?.name || '-',
  wilayah: [i.province?.name, i.city?.name, i.district?.name, i.villageRegion?.name].filter(Boolean).join(' - ') || '-',
  grup_astra: i.astraGroupCustom || i.astraGroup?.name || '-', durasi_program: i.programDuration || '-', latar_belakang: i.background || '-', dampak_program: i.programImpact || '-',
  rencana_pengembangan: i.developmentPlan || '-',
  social_media: i.socialMedia || '',
  foto: Array.isArray(i.photos) ? i.photos : [],
  jenis_dsa: i.dsaType || '-', phone_number: i.phoneNumber || '-',
  nama_kontak_darurat: i.emergencyContactName || '-', no_hp_kontak_darurat: i.emergencyContactPhone || '-',
});

const JuriFormPenilaian = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [peserta, setPeserta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminService.getRegistrationDetail(id);
      setPeserta(mapFromApi(r));

      // Update status ke being_assessed jika masih waiting_screening
      if (r.status === 'waiting_screening') {
        try {
          await adminService.updateRegistrationStatus(id, { status: 'being_assessed' });
        } catch { /* ignore — mungkin sudah diupdate juri lain */ }
      }
    } catch { message.error('Gagal memuat data peserta'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const onValuesChange = (_, v) => {
    const c1 = v.criteria1 || 0, c2 = v.criteria2 || 0, c3 = v.criteria3 || 0;
    const hasAny = v.criteria1 != null || v.criteria2 != null || v.criteria3 != null;
    setTotalScore(hasAny ? Math.round((c1 + c2 + c3) / 3) : 0);
  };

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields(); setSubmitting(true);
      await adminService.createAssessment({ registrationId: id, criteria1: v.criteria1, criteria2: v.criteria2, criteria3: v.criteria3, notes: v.notes || undefined });
      message.success('Penilaian berhasil disubmit!'); setSubmitted(true);
    } catch (e) { if (e.response) message.error(e.response.data?.message || 'Gagal menyimpan'); }
    finally { setSubmitting(false); }
  };

  const scoreColor = totalScore >= 90 ? '#2563eb' : totalScore >= 75 ? '#22c55e' : totalScore >= 60 ? '#f59e0b' : totalScore > 0 ? '#ef4444' : '#94a3b8';
  const grade = totalScore >= 90 ? 'Sangat Baik' : totalScore >= 75 ? 'Baik' : totalScore >= 60 ? 'Cukup' : totalScore > 0 ? 'Rendah' : 'Belum Dinilai';

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" /></div>;

  if (submitted) return (
    <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
        <CheckCircleFilled style={{ fontSize: 40, color: '#fff' }} />
      </div>
      <Title level={3}>Penilaian Berhasil Disubmit!</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Rata-rata: <Text strong style={{ color: scoreColor, fontSize: 18 }}>{totalScore}</Text>/100</Text>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <Button type="primary" onClick={() => navigate('/juri/peserta')}>Kembali ke Daftar Peserta</Button>
        <Button onClick={() => navigate('/juri/riwayat')}>Lihat Riwayat</Button>
      </div>
    </div>
  );

  if (!peserta) return <Result status="404" title="Peserta Tidak Ditemukan" extra={<Button type="primary" onClick={() => navigate('/juri/peserta')}>Kembali</Button>} />;

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 16, padding: 32, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/juri/peserta')} style={{ marginBottom: 16, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>Kembali</Button>
        <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 700 }}>Form Penilaian</Title>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 4, display: 'block' }}>Beri nilai untuk peserta: <Text strong style={{ color: '#fff' }}>{peserta.nama_desa}</Text></Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left */}
        <Col xs={24} lg={10}>
          {/* Latar Belakang */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 15, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BulbOutlined style={{ color: '#8b5cf6', fontSize: 14 }} /></div>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Latar Belakang Program</Text>
            </div>
            <div style={{ padding: 20 }}><div style={{ background: '#f8fafc', borderRadius: 8, padding: '14px 16px', borderLeft: '3px solid #8b5cf6' }}><Paragraph style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{peserta.latar_belakang}</Paragraph></div></div>
          </div>

          {/* Dampak */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',marginBottom: 15, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ThunderboltOutlined style={{ color: '#10b981', fontSize: 14 }} /></div>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Dampak Yang Sudah Terealisasi</Text>
            </div>
            <div style={{ padding: 20 }}><div style={{ background: '#f8fafc', borderRadius: 8, padding: '14px 16px', borderLeft: '3px solid #10b981' }}><Paragraph style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{peserta.dampak_program}</Paragraph></div></div>
          </div>

          {/* Rencana Pengembangan */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',marginBottom: 15, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ToolOutlined style={{ color: '#722ed1', fontSize: 14 }} /></div>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Rencana Pengembangan</Text>
            </div>
            <div style={{ padding: 20 }}><div style={{ background: '#f8fafc', borderRadius: 8, padding: '14px 16px', borderLeft: '3px solid #722ed1' }}><Paragraph style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{peserta.rencana_pengembangan}</Paragraph></div></div>
          </div>

          {/* Foto Dokumentasi */}
          {peserta.foto.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CameraOutlined style={{ color: '#f59e0b', fontSize: 14 }} /></div>
                <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Foto Dokumentasi</Text>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {peserta.foto.map((photo, i) => (
                    <div key={i} onClick={() => setPreviewPhoto(photo.photoUrl?.startsWith('http') ? photo.photoUrl : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.photoUrl}`)} style={{ width: 100, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                      <img src={photo.photoUrl?.startsWith('http') ? photo.photoUrl : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.photoUrl}`} alt={photo.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

                    {/* Info Peserta */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextOutlined style={{ color: '#2563eb', fontSize: 14 }} /></div>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Informasi Peserta</Text>
            </div>
            <div style={{ padding: 20 }}>
              {[
                { l: 'Nama DSA (Desa Sejahtera Astra)', v: peserta.nama_desa },
                { l: 'Jenis DSA', v: peserta.jenis_dsa },
                { l: peserta.jenis_dsa === 'Individu' ? 'Nama Peserta' : 'Nama Penanggung Jawab', v: peserta.nama_kelompok },
                { l: 'Nomor HP (WhatsApp)', v: peserta.phone_number },
                { l: 'Nama Kontak Darurat', v: peserta.nama_kontak_darurat },
                { l: 'Nomor HP Kontak Darurat', v: peserta.no_hp_kontak_darurat },
                { l: 'Pilar', v: peserta.pilar, tag: true },
                { l: 'Kategori', v: peserta.kategori },
                { l: 'Wilayah', v: peserta.wilayah },
                { l: 'Binaan', v: peserta.grup_astra },
                { l: 'Durasi Program', v: peserta.durasi_program },
                ...(peserta.social_media ? [{ l: 'Media Sosial', v: peserta.social_media }] : []),
              ].map((item, idx, arr) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', padding: '10px 0', borderBottom: idx < arr.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                  <Text  className='pr-5' style={{ fontSize: 13, color: '#64748b', width: '40%', flexShrink: 0 }}>{item.l}</Text>
                  {item.tag ? <Tag color="blue" style={{ margin: 0 }}>{item.v}</Tag> : <Text strong style={{ fontSize: 13, color: '#1e293b', flex: 1 }}>{item.v}</Text>}
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* Right: Form */}
        <Col xs={24} lg={14}>
          <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
            {KRITERIA.map((k) => (
              <div key={k.key} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color, fontSize: 18 }}>{k.icon}</div>
                  <div><Text strong style={{ fontSize: 14, color: '#1a1a2e', display: 'block' }}>{k.label}</Text><Text style={{ fontSize: 12, color: '#94a3b8' }}>Maksimal 100 poin</Text></div>
                </div>
                <div style={{ padding: 20 }}>
                  <Text style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 16, lineHeight: 1.6 }}>{k.desc}</Text>
                  <Form.Item name={k.key} rules={[{ required: true, message: 'Masukkan nilai' }, { type: 'number', min: 0, max: 100, message: 'Nilai 0-100' }]} style={{ marginBottom: 0 }}>
                    <InputNumber min={0} max={100} controls={false} keyboard={true} style={{ width: '100%', height: 48, borderRadius: 10, fontSize: 16, fontWeight: 600 }} placeholder="Masukkan nilai (0-100)" addonAfter={<span style={{ color: '#94a3b8' }}>/ 100</span>} />
                  </Form.Item>
                </div>
              </div>
            ))}

            {/* Catatan */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextOutlined style={{ color: '#64748b', fontSize: 14 }} /></div>
                <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Catatan Juri</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>(Opsional)</Text>
              </div>
              <div style={{ padding: 20 }}>
                <Form.Item name="notes" style={{ marginBottom: 0 }}>
                  <TextArea rows={4} placeholder="Tambahkan catatan atau komentar untuk peserta..." style={{ borderRadius: 10, borderColor: '#e2e8f0', fontSize: 13, resize: 'none' }} />
                </Form.Item>
              </div>
            </div>

            {/* Score */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 20, textAlign: 'center' }}>
              <Text style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 12 }}>Rata-rata Nilai Sementara</Text>
              <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: scoreColor, lineHeight: 1, marginBottom: 4, transition: 'color 0.3s' }}>{totalScore}</div>
              <Text style={{ fontSize: 14, color: '#94a3b8' }}>/ 100</Text>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ height: 6, flex: 1, maxWidth: 300, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalScore}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}dd)`, borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
                {/* <Text style={{ fontSize: 13, fontWeight: 600, color: scoreColor, minWidth: 40 }}>{totalScore}%</Text> */}
              </div>
              {totalScore > 0 && <Tag color={totalScore >= 90 ? 'blue' : totalScore >= 75 ? 'success' : totalScore >= 60 ? 'warning' : 'error'} style={{ marginTop: 12, fontSize: 12, padding: '2px 12px', borderRadius: 12 }}>{grade}</Tag>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={() => navigate('/juri/peserta')} style={{ height: 44, borderRadius: 8 }}>Batal</Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={submitting} disabled={totalScore === 0} style={{ height: 44, borderRadius: 8, fontWeight: 600 }}>Submit Penilaian</Button>
            </div>
          </Form>
        </Col>
      </Row>

      {/* Modal Preview Foto */}
      <Modal
        open={!!previewPhoto}
        onCancel={() => setPreviewPhoto(null)}
        footer={null}
        centered
        width={600}
        styles={{ body: { padding: 0, background: 'transparent' } }}
      >
        {previewPhoto && (
          <img src={previewPhoto} alt="Preview" style={{ width: '100%', borderRadius: 8 }} />
        )}
      </Modal>
    </div>
  );
};

export default JuriFormPenilaian;
