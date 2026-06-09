import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Steps,
  Row,
  Col,
  Typography,
  Divider,
  message,
  Result,
} from 'antd';
import {
  TrophyOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const steps = [
  { title: 'Pilar & Kategori', icon: <TrophyOutlined /> },
  { title: 'Identitas', icon: <TeamOutlined /> },
  { title: 'Data Program', icon: <EnvironmentOutlined /> },
  { title: 'Review & Submit', icon: <FileTextOutlined /> },
];

// Dummy data - will be replaced with API calls
const pilarOptions = [
  { id: 1, name: 'Pilar Ekonomi' },
  { id: 2, name: 'Pilar Sosial' },
  { id: 3, name: 'Pilar Lingkungan' },
  { id: 4, name: 'Pilar Infrastruktur' },
];

const kategoriOptions = {
  1: [
    { id: 1, name: 'UMKM' },
    { id: 2, name: 'Koperasi' },
    { id: 3, name: 'Kewirausahaan' },
  ],
  2: [
    { id: 4, name: 'Pendidikan' },
    { id: 5, name: 'Kesehatan' },
    { id: 6, name: 'Sosial Budaya' },
  ],
  3: [
    { id: 7, name: 'Konservasi' },
    { id: 8, name: 'Pertanian Berkelanjutan' },
    { id: 9, name: 'Energi Terbarukan' },
  ],
  4: [
    { id: 10, name: 'Jalan & Jembatan' },
    { id: 11, name: 'Irigasi' },
    { id: 12, name: 'Fasilitas Umum' },
  ],
};

const wilayahOptions = {
  provinsi: ['Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali', 'Sumatera Utara'],
  kabupaten: ['Bandung', 'Semarang', 'Surabaya', 'Denpasar', 'Medan'],
  kecamatan: ['Cidadap', 'Tembalang', 'Tandes', 'Denpasar Selatan', 'Medan Baru'],
  desa: ['Desa Sukamaju', 'Desa Makmur', 'Desa Sejahtera', 'Desa Damai', 'Desa Sentosa'],
};

const grupAstraOptions = [
  { id: 1, name: 'Grup Astra 1' },
  { id: 2, name: 'Grup Astra 2' },
  { id: 3, name: 'Grup Astra 3' },
];

const FormPendaftaran = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const next = async () => {
    try {
      const values = await form.validateFields();
      setFormData({ ...formData, ...values });
      setCurrent(current + 1);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const allData = { ...formData, ...values };
      console.log('Form submitted:', allData);
      // TODO: Send to API
      message.success('Pendaftaran berhasil dikirim!');
      setSubmitted(true);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <>
            <Title level={4}>Pilih Pilar dan Kategori</Title>
            <Paragraph type="secondary">
              Pilih pilar program dan kategori yang sesuai dengan program desa Anda
            </Paragraph>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="pilar_id"
                  label="Pilar Program"
                  rules={[{ required: true, message: 'Pilih pilar program' }]}
                >
                  <Select placeholder="Pilih Pilar">
                    {pilarOptions.map((pilar) => (
                      <Option key={pilar.id} value={pilar.id}>
                        {pilar.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="kategori_id"
                  label="Kategori"
                  rules={[{ required: true, message: 'Pilih kategori' }]}
                >
                  <Select placeholder="Pilih Kategori">
                    {kategoriOptions[formData.pilar_id]?.map((kat) => (
                      <Option key={kat.id} value={kat.id}>
                        {kat.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      case 1:
        return (
          <>
            <Title level={4}>Identitas Desa/Kelompok</Title>
            <Paragraph type="secondary">
              Isi identitas lengkap desa atau kelompok yang mendaftar
            </Paragraph>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nama_desa"
                  label="Nama Desa"
                  rules={[{ required: true, message: 'Masukkan nama desa' }]}
                >
                  <Input placeholder="Masukkan nama desa" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="nama_kelompok"
                  label="Nama Kelompok/Individu"
                  rules={[{ required: true, message: 'Masukkan nama kelompok/individu' }]}
                >
                  <Input placeholder="Masukkan nama kelompok atau individu" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="alamat"
              label="Alamat Lengkap"
              rules={[{ required: true, message: 'Masukkan alamat lengkap' }]}
            >
              <TextArea rows={3} placeholder="Masukkan alamat lengkap" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  name="provinsi"
                  label="Provinsi"
                  rules={[{ required: true, message: 'Pilih provinsi' }]}
                >
                  <Select placeholder="Pilih Provinsi">
                    {wilayahOptions.provinsi.map((item) => (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="kabupaten"
                  label="Kabupaten/Kota"
                  rules={[{ required: true, message: 'Pilih kabupaten' }]}
                >
                  <Select placeholder="Pilih Kabupaten">
                    {wilayahOptions.kabupaten.map((item) => (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="kecamatan"
                  label="Kecamatan"
                  rules={[{ required: true, message: 'Pilih kecamatan' }]}
                >
                  <Select placeholder="Pilih Kecamatan">
                    {wilayahOptions.kecamatan.map((item) => (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="desa"
                  label="Desa/Kelurahan"
                  rules={[{ required: true, message: 'Pilih desa' }]}
                >
                  <Select placeholder="Pilih Desa">
                    {wilayahOptions.desa.map((item) => (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      case 2:
        return (
          <>
            <Title level={4}>Data Program</Title>
            <Paragraph type="secondary">
              Isi informasi detail tentang program yang didaftarkan
            </Paragraph>
            <Form.Item
              name="grup_astra_id"
              label="Grup Astra"
              rules={[{ required: true, message: 'Pilih grup astra' }]}
            >
              <Select placeholder="Pilih Grup Astra">
                {grupAstraOptions.map((grup) => (
                  <Option key={grup.id} value={grup.id}>
                    {grup.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="latar_belakang"
              label="Latar Belakang Program"
              rules={[{ required: true, message: 'Masukkan latar belakang program' }]}
            >
              <TextArea
                rows={4}
                placeholder="Jelaskan latar belakang dan alasan program ini dijalankan"
              />
            </Form.Item>
            <Form.Item
              name="dampak_program"
              label="Dampak Program"
              rules={[{ required: true, message: 'Masukkan dampak program' }]}
            >
              <TextArea
                rows={4}
                placeholder="Jelaskan dampak positif yang diharapkan dari program ini"
              />
            </Form.Item>
          </>
        );

      case 3:
        return (
          <>
            <Title level={4}>Review Data Pendaftaran</Title>
            <Paragraph type="secondary">
              Periksa kembali data yang telah diisi sebelum mengirimkan pendaftaran
            </Paragraph>
            <Card title="Pilar & Kategori" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Pilar Program:</Text>
                  <br />
                  <Text strong>
                    {pilarOptions.find((p) => p.id === formData.pilar_id)?.name || '-'}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Kategori:</Text>
                  <br />
                  <Text strong>
                    {kategoriOptions[formData.pilar_id]?.find((k) => k.id === formData.kategori_id)
                      ?.name || '-'}
                  </Text>
                </Col>
              </Row>
            </Card>
            <Card title="Identitas" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Nama Desa:</Text>
                  <br />
                  <Text strong>{formData.nama_desa || '-'}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Nama Kelompok/Individu:</Text>
                  <br />
                  <Text strong>{formData.nama_kelompok || '-'}</Text>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Alamat:</Text>
                  <br />
                  <Text strong>{formData.alamat || '-'}</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Provinsi:</Text>
                  <br />
                  <Text strong>{formData.provinsi || '-'}</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Kabupaten:</Text>
                  <br />
                  <Text strong>{formData.kabupaten || '-'}</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Kecamatan:</Text>
                  <br />
                  <Text strong>{formData.kecamatan || '-'}</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Desa:</Text>
                  <br />
                  <Text strong>{formData.desa || '-'}</Text>
                </Col>
              </Row>
            </Card>
            <Card title="Data Program">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text type="secondary">Grup Astra:</Text>
                  <br />
                  <Text strong>
                    {grupAstraOptions.find((g) => g.id === formData.grup_astra_id)?.name || '-'}
                  </Text>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Latar Belakang:</Text>
                  <br />
                  <Text>{formData.latar_belakang || '-'}</Text>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Dampak Program:</Text>
                  <br />
                  <Text>{formData.dampak_program || '-'}</Text>
                </Col>
              </Row>
            </Card>
          </>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <Result
        status="success"
        title="Pendaftaran Berhasil Dikirim!"
        subTitle="Status pendaftaran Anda: Menunggu Screening. Anda dapat melihat progress di dashboard."
        extra={[
          <Button type="primary" key="dashboard" onClick={() => navigate('/peserta/dashboard')}>
            Ke Dashboard
          </Button>,
        ]}
      />
    );
  }

  return (
    <div>
      <Title level={3}>Formulir Pendaftaran</Title>
      <Paragraph type="secondary">
        Lengkapi formulir pendaftaran berikut untuk mendaftar program Desa Sejahtera Astra
      </Paragraph>

      <Steps current={current} items={steps} style={{ marginBottom: 32 }} />

      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
        onValuesChange={(changedValues, allValues) => {
          setFormData({ ...formData, ...changedValues });
        }}
      >
        {renderStepContent()}

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {current > 0 && (
            <Button onClick={prev}>
              Kembali
            </Button>
          )}
          <div style={{ marginLeft: 'auto' }}>
            {current < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Selanjutnya
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" onClick={handleSubmit} icon={<CheckCircleOutlined />}>
                Kirim Pendaftaran
              </Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default FormPendaftaran;