import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Typography,
  Descriptions,
  Tag,
  Row,
  Col,
  Divider,
  message,
  Result,
  Progress,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Dummy data - will be replaced with API calls
const pesertaDetail = {
  id: '1',
  nama_desa: 'Desa Sukamaju',
  nama_kelompok: 'Kelompok Tani Makmur',
  pilar: 'Pilar Ekonomi',
  kategori: 'UMKM',
  wilayah: 'Jawa Barat - Bandung - Cidadap - Desa Sukamaju',
  alamat: 'Jl. Raya Sukamaju No. 123, RT 01/RW 02',
  grup_astra: 'Grup Astra 1',
  latar_belakang: 'Program ini bertujuan untuk meningkatkan kapasitas UMKM di Desa Sukamaju melalui pelatihan dan pendampingan usaha. Desa memiliki potensi besar dalam sektor pertanian dan kerajinan yang perlu dikembangkan.',
  dampak_program: 'Diharapkan dapat meningkatkan pendapatan UMKM sebesar 30% dalam 2 tahun, menciptakan 50 lapangan kerja baru, dan mengembangkan produk unggulan desa yang dapat bersaing di pasar regional.',
};

const kriteriaPenilaian = [
  {
    key: 'kriteria1',
    label: 'Kriteria 1: Inovasi & Kreativitas',
    description: 'Penilaian terhadap tingkat inovasi dan kreativitas dalam program yang diajukan',
  },
  {
    key: 'kriteria2',
    label: 'Kriteria 2: Dampak & Keberlanjutan',
    description: 'Penilaian terhadap dampak program dan aspek keberlanjutan jangka panjang',
  },
  {
    key: 'kriteria3',
    label: 'Kriteria 3: Kelayakan & Implementasi',
    description: 'Penilaian terhadap kelayakan teknis dan rencana implementasi program',
  },
];

const JuriFormPenilaian = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const handleValuesChange = (changedValues, allValues) => {
    const total = (allValues.kriteria1 || 0) + (allValues.kriteria2 || 0) + (allValues.kriteria3 || 0);
    setTotalScore(total);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const total = values.kriteria1 + values.kriteria2 + values.kriteria3;
      console.log('Penilaian submitted:', { peserta_id: id, ...values, total });
      // TODO: Send to API
      message.success('Penilaian berhasil disubmit!');
      setSubmitted(true);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  if (submitted) {
    return (
      <Result
        status="success"
        title="Penilaian Berhasil Disubmit!"
        subTitle={`Total Nilai: ${totalScore}/300. Status peserta telah berubah menjadi 'Selesai Dinilai'.`}
        extra={[
          <Button type="primary" key="list" onClick={() => navigate('/juri/peserta')}>
            Kembali ke Daftar Peserta
          </Button>,
          <Button key="history" onClick={() => navigate('/juri/riwayat')}>
            Lihat Riwayat
          </Button>,
        ]}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/juri/peserta')}
          style={{ marginBottom: 16 }}
        >
          Kembali
        </Button>
        <Title level={3} style={{ margin: 0 }}>Form Penilaian</Title>
        <Text type="secondary">Beri nilai untuk peserta berikut</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Peserta Info */}
        <Col xs={24} lg={10}>
          <Card title="Informasi Peserta" style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Nama Desa">{pesertaDetail.nama_desa}</Descriptions.Item>
              <Descriptions.Item label="Kelompok">{pesertaDetail.nama_kelompok}</Descriptions.Item>
              <Descriptions.Item label="Pilar">
                <Tag color="blue">{pesertaDetail.pilar}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kategori">{pesertaDetail.kategori}</Descriptions.Item>
              <Descriptions.Item label="Wilayah">{pesertaDetail.wilayah}</Descriptions.Item>
              <Descriptions.Item label="Grup Astra">{pesertaDetail.grup_astra}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Latar Belakang Program" style={{ marginBottom: 24 }}>
            <Paragraph>{pesertaDetail.latar_belakang}</Paragraph>
          </Card>

          <Card title="Dampak Program">
            <Paragraph>{pesertaDetail.dampak_program}</Paragraph>
          </Card>
        </Col>

        {/* Scoring Form */}
        <Col xs={24} lg={14}>
          <Card title="Form Penilaian">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                {totalScore}
              </Title>
              <Text type="secondary">Total Nilai (Maksimal 300)</Text>
              <Progress
                percent={Math.round((totalScore / 300) * 100)}
                status={totalScore > 300 ? 'exception' : 'active'}
                style={{ marginTop: 8 }}
              />
            </div>

            <Divider />

            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleValuesChange}
            >
              {kriteriaPenilaian.map((kriteria, index) => (
                <Card
                  key={kriteria.key}
                  type="inner"
                  title={kriteria.label}
                  style={{ marginBottom: 16 }}
                >
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    {kriteria.description}
                  </Text>
                  <Form.Item
                    name={kriteria.key}
                    rules={[
                      { required: true, message: 'Masukkan nilai' },
                      { type: 'number', min: 0, max: 100, message: 'Nilai 0-100' },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="Masukkan nilai (0-100)"
                      addonAfter="/ 100"
                    />
                  </Form.Item>
                </Card>
              ))}

              <Card type="inner" title="Catatan Juri" style={{ marginBottom: 16 }}>
                <Form.Item name="catatan">
                  <TextArea
                    rows={4}
                    placeholder="Tambahkan catatan atau komentar untuk peserta (opsional)"
                  />
                </Form.Item>
              </Card>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => navigate('/juri/peserta')}>
                  Batal
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  disabled={totalScore === 0}
                >
                  Submit Penilaian
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JuriFormPenilaian;