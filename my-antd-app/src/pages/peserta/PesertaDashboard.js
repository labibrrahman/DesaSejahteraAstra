import React from 'react';
import { Card, Row, Col, Typography, Steps, Tag, Descriptions, Timeline, Button } from 'antd';
import {
  ClockCircleOutlined,
  FileTextOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

// Dummy data - will be replaced with API calls
const pesertaData = {
  nama_desa: 'Desa Sukamaju',
  nama_kelompok: 'Kelompok Tani Makmur',
  pilar: 'Pilar Ekonomi',
  kategori: 'UMKM',
  status: 2, // Menunggu Screening
  status_label: 'Menunggu Screening',
  tanggal_daftar: '15 Januari 2026',
  wilayah: 'Jawa Barat - Bandung - Cidadap - Desa Sukamaju',
};

const statusSteps = [
  { title: 'Draft', description: 'Form diisi' },
  { title: 'Menunggu Screening', description: 'Submit berhasil' },
  { title: 'Sedang Dinilai', description: 'Dinilai juri' },
  { title: 'Selesai Dinilai', description: 'Penilaian selesai' },
  { title: 'Finalis', description: 'Tahap final' },
];

const timelineData = [
  {
    color: 'green',
    children: (
      <>
        <Text strong>Pendaftaran Dikirim</Text>
        <br />
        <Text type="secondary">15 Januari 2026, 10:30 WIB</Text>
      </>
    ),
  },
  {
    color: 'blue',
    children: (
      <>
        <Text strong>Menunggu Screening oleh Admin</Text>
        <br />
        <Text type="secondary">Status saat ini</Text>
      </>
    ),
  },
];

const PesertaDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Dashboard Peserta</Title>
          <Paragraph type="secondary">Selamat datang kembali, {pesertaData.nama_desa}</Paragraph>
        </div>
        <Tag color="processing" icon={<ClockCircleOutlined />} style={{ fontSize: 14, padding: '4px 12px' }}>
          {pesertaData.status_label}
        </Tag>
      </div>

      {/* Status Progress */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={5}>Progress Pendaftaran</Title>
        <Steps
          current={pesertaData.status - 1}
          items={statusSteps.map((step, index) => ({
            title: step.title,
            description: step.description,
            status: index < pesertaData.status - 1 ? 'finish' : index === pesertaData.status - 1 ? 'process' : 'wait',
          }))}
        />
      </Card>

      <Row gutter={24}>
        {/* Data Pendaftaran */}
        <Col span={16}>
          <Card title="Data Pendaftaran" style={{ marginBottom: 24 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Nama Desa">{pesertaData.nama_desa}</Descriptions.Item>
              <Descriptions.Item label="Nama Kelompok">{pesertaData.nama_kelompok}</Descriptions.Item>
              <Descriptions.Item label="Pilar Program">{pesertaData.pilar}</Descriptions.Item>
              <Descriptions.Item label="Kategori">{pesertaData.kategori}</Descriptions.Item>
              <Descriptions.Item label="Wilayah" span={2}>{pesertaData.wilayah}</Descriptions.Item>
              <Descriptions.Item label="Tanggal Daftar">{pesertaData.tanggal_daftar}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="processing">{pesertaData.status_label}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Informasi Program">
            <Paragraph>
              Program ini merupakan bagian dari inisiatif Desa Sejahtera Astra dalam pemberdayaan
              ekonomi masyarakat desa melalui sektor UMKM. Program bertujuan untuk meningkatkan
              kapasitas dan daya saing usaha kecil menengah di pedesaan.
            </Paragraph>
            <Paragraph>
              Saat ini, pendaftaran Anda sedang dalam proses screening oleh tim admin. Proses ini
              biasanya memakan waktu 3-5 hari kerja. Anda akan mendapat notifikasi ketika status
              pendaftaran Anda berubah.
            </Paragraph>
          </Card>
        </Col>

        {/* Timeline */}
        <Col span={8}>
          <Card title="Aktivitas Terbaru">
            <Timeline items={timelineData} />
          </Card>

          <Card title="Aksi Cepat" style={{ marginTop: 24 }}>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              block
              style={{ marginBottom: 12 }}
              onClick={() => navigate('/peserta/pendaftaran')}
            >
              Lihat Formulir
            </Button>
            <Button
              icon={<EditOutlined />}
              block
            >
              Edit Pendaftaran
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PesertaDashboard;