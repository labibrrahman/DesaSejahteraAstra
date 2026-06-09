import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Popconfirm,
  message,
  Tag,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Dummy data - will be replaced with API calls
const provinsiData = [
  { key: '1', kode: '33', nama: 'Jawa Tengah', status: 'active' },
  { key: '2', kode: '32', nama: 'Jawa Barat', status: 'active' },
  { key: '3', kode: '35', nama: 'Jawa Timur', status: 'active' },
  { key: '4', kode: '51', nama: 'Bali', status: 'active' },
];

const kabupatenData = [
  { key: '1', kode: '33.01', nama: 'Cilacap', provinsi: 'Jawa Tengah', status: 'active' },
  { key: '2', kode: '33.02', nama: 'Banyumas', provinsi: 'Jawa Tengah', status: 'active' },
  { key: '3', kode: '32.01', nama: 'Bandung', provinsi: 'Jawa Barat', status: 'active' },
];

const kecamatanData = [
  { key: '1', kode: '33.01.01', nama: 'Kedungreja', kabupaten: 'Cilacap', status: 'active' },
  { key: '2', kode: '33.01.02', nama: 'Cilacap Selatan', kabupaten: 'Cilacap', status: 'active' },
];

const desaData = [
  { key: '1', kode: '33.01.01.2001', nama: 'Desa Sukamaju', kecamatan: 'Kedungreja', status: 'active' },
  { key: '2', kode: '33.01.01.2002', nama: 'Desa Makmur', kecamatan: 'Kedungreja', status: 'active' },
];

const MasterWilayah = () => {
  const [activeTab, setActiveTab] = useState('provinsi');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      message.success(editingRecord ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const handleDelete = (key) => {
    message.success('Data berhasil dihapus');
  };

  const getColumns = () => {
    const baseColumns = [
      {
        title: 'No',
        key: 'no',
        render: (_, __, index) => index + 1,
        width: 60,
      },
      {
        title: 'Kode',
        dataIndex: 'kode',
        key: 'kode',
      },
      {
        title: 'Nama',
        dataIndex: 'nama',
        key: 'nama',
      },
    ];

    if (activeTab === 'kabupaten') {
      baseColumns.push({
        title: 'Provinsi',
        dataIndex: 'provinsi',
        key: 'provinsi',
      });
    } else if (activeTab === 'kecamatan') {
      baseColumns.push({
        title: 'Kabupaten',
        dataIndex: 'kabupaten',
        key: 'kabupaten',
      });
    } else if (activeTab === 'desa') {
      baseColumns.push({
        title: 'Kecamatan',
        dataIndex: 'kecamatan',
        key: 'kecamatan',
      });
    }

    baseColumns.push(
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? 'Aktif' : 'Nonaktif'}
          </Tag>
        ),
      },
      {
        title: 'Aksi',
        key: 'action',
        render: (_, record) => (
          <Space>
            <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
              Edit
            </Button>
            <Popconfirm title="Yakin ingin menghapus?" onConfirm={() => handleDelete(record.key)}>
              <Button type="link" danger icon={<DeleteOutlined />}>
                Hapus
              </Button>
            </Popconfirm>
          </Space>
        ),
      }
    );

    return baseColumns;
  };

  const getData = () => {
    switch (activeTab) {
      case 'provinsi': return provinsiData;
      case 'kabupaten': return kabupatenData;
      case 'kecamatan': return kecamatanData;
      case 'desa': return desaData;
      default: return [];
    }
  };

  const getFormFields = () => {
    switch (activeTab) {
      case 'provinsi':
        return (
          <>
            <Form.Item name="kode" label="Kode Provinsi" rules={[{ required: true }]}>
              <Input placeholder="Masukkan kode provinsi" />
            </Form.Item>
            <Form.Item name="nama" label="Nama Provinsi" rules={[{ required: true }]}>
              <Input placeholder="Masukkan nama provinsi" />
            </Form.Item>
          </>
        );
      case 'kabupaten':
        return (
          <>
            <Form.Item name="provinsi" label="Provinsi" rules={[{ required: true }]}>
              <Select placeholder="Pilih Provinsi">
                {provinsiData.map((item) => (
                  <Option key={item.key} value={item.nama}>{item.nama}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="kode" label="Kode Kabupaten" rules={[{ required: true }]}>
              <Input placeholder="Masukkan kode kabupaten" />
            </Form.Item>
            <Form.Item name="nama" label="Nama Kabupaten" rules={[{ required: true }]}>
              <Input placeholder="Masukkan nama kabupaten" />
            </Form.Item>
          </>
        );
      case 'kecamatan':
        return (
          <>
            <Form.Item name="kabupaten" label="Kabupaten" rules={[{ required: true }]}>
              <Select placeholder="Pilih Kabupaten">
                {kabupatenData.map((item) => (
                  <Option key={item.key} value={item.nama}>{item.nama}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="kode" label="Kode Kecamatan" rules={[{ required: true }]}>
              <Input placeholder="Masukkan kode kecamatan" />
            </Form.Item>
            <Form.Item name="nama" label="Nama Kecamatan" rules={[{ required: true }]}>
              <Input placeholder="Masukkan nama kecamatan" />
            </Form.Item>
          </>
        );
      case 'desa':
        return (
          <>
            <Form.Item name="kecamatan" label="Kecamatan" rules={[{ required: true }]}>
              <Select placeholder="Pilih Kecamatan">
                {kecamatanData.map((item) => (
                  <Option key={item.key} value={item.nama}>{item.nama}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="kode" label="Kode Desa" rules={[{ required: true }]}>
              <Input placeholder="Masukkan kode desa" />
            </Form.Item>
            <Form.Item name="nama" label="Nama Desa" rules={[{ required: true }]}>
              <Input placeholder="Masukkan nama desa" />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  const tabItems = [
    { key: 'provinsi', label: 'Provinsi' },
    { key: 'kabupaten', label: 'Kabupaten/Kota' },
    { key: 'kecamatan', label: 'Kecamatan' },
    { key: 'desa', label: 'Desa/Kelurahan' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Master Wilayah</Title>
          <Text type="secondary">Kelola data wilayah administratif</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Tambah {activeTab === 'provinsi' ? 'Provinsi' : activeTab === 'kabupaten' ? 'Kabupaten' : activeTab === 'kecamatan' ? 'Kecamatan' : 'Desa'}
        </Button>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        <Table columns={getColumns()} dataSource={getData()} pagination={false} scroll={{ x: 500 }} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit' : 'Tambah'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          {getFormFields()}
        </Form>
      </Modal>
    </div>
  );
};

export default MasterWilayah;