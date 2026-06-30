import React, { useState } from 'react';
import { Typography, Button, Row, Col, Modal } from 'antd';
import {
  CloseOutlined,
  TagOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  EditOutlined,
  CameraOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Component reusable untuk menampilkan detail pendaftaran dalam modal.
 *
 * @param {object} props
 * @param {boolean} props.open - Status modal
 * @param {function} props.onClose - Handler saat modal ditutup
 * @param {object} props.registration - Data registrasi (objek dari API)
 * @param {string} props.title - Judul modal (default: "Detail Pendaftaran")
 * @param {React.ReactNode} props.extra - Konten tambahan di bawah footer
 * @param {React.ReactNode} props.footer - Custom footer
 */
const RegistrationDetailModal = ({
  open,
  onClose,
  registration: reg,
  title = 'Detail Pendaftaran',
  extra,
  footer,
}) => {
  const [previewPhoto, setPreviewPhoto] = useState(null);

  if (!reg) return null;

  const namaDesa = reg.villageName || reg.nama_desa || '—';
  const namaKelompok = reg.groupName || reg.nama_kelompok || '—';

  const defaultFooter = [
    <Button key="close" onClick={onClose}>Tutup</Button>,
  ];

  return (
    <>
      <Modal
        open={open}
        closable={false}
        onCancel={onClose}
        footer={footer || defaultFooter}
        width={720}
        styles={{ body: { padding: 0 } }}
      >
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
              onClick={onClose}
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              {title}
            </Text>
            <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: 20 }}>
              {namaDesa}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 6, display: 'block' }}>
              {namaKelompok}
            </Text>
          </div>

          {/* Content */}
          <div style={{ padding: '24px 28px 28px' }}>
            {/* Identitas Pendaftar */}
            <div style={{ marginBottom: 24 }}>
              <Text style={sectionTitleStyle}>
                <TagOutlined style={{ marginRight: 6 }} /> Identitas Pendaftar
              </Text>
              <Row gutter={[20, 16]}>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Jenis DSA" value={reg.dsaType} />
                </Col>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Nomor HP" value={reg.phoneNumber} />
                </Col>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Nama Kontak Lainnya" value={reg.emergencyContactName} />
                </Col>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Nomor Kontak Lainnya" value={reg.emergencyContactPhone} />
                </Col>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Perusahaan/Yayasan Pembina" value={reg.astraGroupCustom || reg.astraGroup?.name} />
                </Col>
                {reg.socialMedia && (
                  <Col xs={24}>
                    <FieldLabel label="Media Sosial" value={reg.socialMedia} />
                  </Col>
                )}
              </Row>
            </div>

            {/* Lokasi & Wilayah */}
            <div style={{ marginBottom: 24 }}>
              <Text style={sectionTitleStyle}>
                <EnvironmentOutlined style={{ marginRight: 6 }} /> Lokasi & Wilayah
              </Text>
              <Row gutter={[20, 16]}>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Provinsi" value={reg.province?.name} />
                </Col>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Kabupaten / Kota" value={reg.city?.name} />
                </Col>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Kecamatan" value={reg.district?.name} />
                </Col>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Desa / Kelurahan" value={reg.villageRegion?.name} />
                </Col>
                <Col span={24}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Alamat Lengkap</Text>
                  <Text style={{ fontSize: 13, lineHeight: 1.6 }}>{reg.address || '—'}</Text>
                </Col>
              </Row>
            </div>

            {/* Informasi Program */}
            <div style={{ marginBottom: 24 }}>
              <Text style={sectionTitleStyle}>
                <FileTextOutlined style={{ marginRight: 6 }} /> Informasi Program
              </Text>
              <Row gutter={[20, 16]}>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Pilar" value={reg.pillar?.name} />
                </Col>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Kategori" value={reg.category?.name} />
                </Col>
                <Col xs={12} sm={8}>
                  <FieldLabel label="Durasi Program" value={reg.programDuration} />
                </Col>
              </Row>
            </div>

            {/* Deskripsi Program */}
            <div style={{ marginBottom: 8 }}>
              <Text style={sectionTitleStyle}>
                <EditOutlined style={{ marginRight: 6 }} /> Deskripsi Program
              </Text>

              <DescriptionBlock label="Latar Belakang" value={reg.background} color="#1890ff" />
              <DescriptionBlock label="Metode Pelaksanaan Program" value={reg.implementationMethod} color="#0ea5e9" />
              <DescriptionBlock label="Dampak Sebelum Program" value={reg.programImpact} color="#52c41a" />
              <DescriptionBlock label="Dampak Setelah Program" value={reg.programImpactAfter} color="#16a34a" />
              <DescriptionBlock label="Rencana dan Potensi Pengembangan" value={reg.developmentPlan} color="#722ed1" />
              <DescriptionBlock label="Keberlanjutan Program" value={reg.sustainabilityPlan} color="#10b981" />
              <DescriptionBlock label="Evaluasi Program" value={reg.programEvaluation} color="#f59e0b" />
                {reg.documentLink && (
                  <div style={{ marginTop: 12 }}>
                    <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>Link Dokumen/Drive Pendukung</Text>
                    <a href={reg.documentLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, wordBreak: 'break-all' }}>{reg.documentLink}</a>
                  </div>
                )}
              {/* Foto Dokumentasi */}
              {Array.isArray(reg.photos) && reg.photos.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 8 }}>Foto Dokumentasi</Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {reg.photos.map((photo, i) => (
                      <div
                        key={i}
                        onClick={() => setPreviewPhoto(photo.photoUrl?.startsWith('http') ? photo.photoUrl : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.photoUrl}`)}
                        style={{ width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                      >
                        <img
                          src={photo.photoUrl?.startsWith('http') ? photo.photoUrl : `${import.meta.env.VITE_API_BASE_URL_MAIN}${photo.photoUrl}`}
                          alt={photo.originalName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {extra}
          </div>
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

/** Sub-component: Label field */
const FieldLabel = ({ label, value }) => (
  <div>
    <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>{label}</Text>
    <Text strong style={{ fontSize: 13 }}>{value || '—'}</Text>
  </div>
);

/** Sub-component: Deskripsi block dengan border kiri berwarna */
const DescriptionBlock = ({ label, value, color }) => (
  <div style={{ marginTop: 12 }}>
    <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>{label}</Text>
    <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', borderLeft: `3px solid ${color}` }}>
      <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{value || '—'}</Text>
    </div>
  </div>
);

/** Shared styles */
const sectionTitleStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#1a1a2e',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  display: 'block',
  marginBottom: 14,
  paddingBottom: 8,
  borderBottom: '1px solid #f0f0f0',
};

export default RegistrationDetailModal;
