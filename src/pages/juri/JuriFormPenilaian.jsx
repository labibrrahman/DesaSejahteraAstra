import React, { useState, useEffect, useCallback } from 'react';
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
  Spin,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import adminService from '../../services/adminService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/** Kriteria penilaian yang ditampilkan di form */
const KRITERIA_PENILAIAN = [
  {
    key: 'criteria1',
    label: 'Kriteria 1: Inovasi & Kreativitas',
    description: 'Penilaian terhadap tingkat inovasi dan kreativitas dalam program yang diajukan',
  },
  {
    key: 'criteria2',
    label: 'Kriteria 2: Dampak & Keberlanjutan',
    description: 'Penilaian terhadap dampak program dan aspek keberlanjutan jangka panjang',
  },
  {
    key: 'criteria3',
    label: 'Kriteria 3: Kelayakan & Implementasi',
    description: 'Penilaian terhadap kelayakan teknis dan rencana implementasi program',
  },
];

/**
 * Mapping data registration dari API ke format UI.
 */
const mapRegistrationFromApi = (item) => ({
  id: item.id,
  nama_desa: item.villageName || '-',
  nama_kelompok: item.groupName || '-',
  pilar: item.pillar?.name || '-',
  kategori: item.category?.name || '-',
  wilayah: [
    item.province?.name,
    item.city?.name,
    item.district?.name,
    item.villageRegion?.name,
  ].filter(Boolean).join(' - ') || '-',
  alamat: item.address || '-',
  grup_astra: item.astraGroup?.name || '-',
  latar_belakang: item.background || '-',
  dampak_program: item.programImpact || '-',
});

const JuriFormPenilaian = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [peserta, setPeserta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  /** Fetch detail peserta dari API */
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getRegistrationDetail(id);
      setPeserta(mapRegistrationFromApi(result));
    } catch (error) {
      message.error('Gagal memuat data peserta');
      console.error('Fetch registration detail error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  /** Update total score saat nilai berubah */
  const handleValuesChange = (_, allValues) => {
    const total =
      (allValues.criteria1 || 0) +
      (allValues.criteria2 || 0) +
      (allValues.criteria3 || 0);
    setTotalScore(total);
  };

  /** Submit penilaian ke API */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await adminService.createAssessment({
        registrationId: id,
        criteria1: values.criteria1,
        criteria2: values.criteria2,
        criteria3: values.criteria3,
        notes: values.notes || undefined,
      });

      message.success('Penilaian berhasil disubmit!');
      setSubmitted(true);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || 'Gagal menyimpan penilaian');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

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

  if (!peserta) {
    return (
      <Result
        status="404"
        title="Peserta Tidak Ditemukan"
        extra={
          <Button type="primary" onClick={() => navigate('/juri/peserta')}>
            Kembali ke Daftar Peserta
          </Button>
        }
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
              <Descriptions.Item label="Nama Desa">{peserta.nama_desa}</Descriptions.Item>
              <Descriptions.Item label="Kelompok">{peserta.nama_kelompok}</Descriptions.Item>
              <Descriptions.Item label="Pilar">
                <Tag color="blue">{peserta.pilar}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kategori">{peserta.kategori}</Descriptions.Item>
              <Descriptions.Item label="Wilayah">{peserta.wilayah}</Descriptions.Item>
              <Descriptions.Item label="Grup Astra">{peserta.grup_astra}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Latar Belakang Program" style={{ marginBottom: 24 }}>
            <Paragraph>{peserta.latar_belakang}</Paragraph>
          </Card>

          <Card title="Dampak Program">
            <Paragraph>{peserta.dampak_program}</Paragraph>
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
              {KRITERIA_PENILAIAN.map((kriteria) => (
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
                <Form.Item name="notes">
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
                  loading={submitting}
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
