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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Dummy data - will be replaced with API calls
const initialData = [
  { key: '1', nama: 'UMKM', pilar_id: '1', pilar_nama: 'Pilar Ekonomi', status: 'active' },
  { key: '2', nama: 'Koperasi', pilar_id: '1', pilar_nama: 'Pilar Ekonomi', status: 'active' },
  { key: '3', nama: 'Kewirausahaan', pilar_id: '1', pilar_nama: 'Pilar Ekonomi', status: 'active' },
  { key: '4', nama: 'Pendidikan', pilar_id: '2', pilar_nama: 'Pilar Sosial', status: 'active' },
  { key: '5', nama: 'Kesehatan', pilar_id: '2', pilar_nama: 'Pilar Sosial', status: 'active' },
  { key: '6', nama: 'Konservasi', pilar_id: '3', pilar_nama: 'Pilar Lingkungan', status: 'active' },
];

const pilarOptions = [
  { id: '1', nama: 'Pilar Ekonomi' },
  { id: '2', nama: 'Pilar Sosial' },
  { id: '3', nama: 'Pilar Lingkungan' },
  { id: '4', nama: 'Pilar Infrastruktur' },
];

const MasterKategori = () => {
  const [data, setData] = useState(initialData);
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
      const pilar = pilarOptions.find((p) => p.id === values.pilar_id);

      if (editingRecord) {
        setData(data.map((item) =>
          item.key === editingRecord.key
            ? { ...item, ...values, pilar_nama: pilar?.nama }
            : item
        ));
        message.success('Data berhasil diperbarui');
      } else {
        const newItem = {
          key: String(data.length + 1),
          ...values,
          pilar_nama: pilar?.nama,
          status: 'active',
        };
        setData([...data, newItem]);
        message.success('Data berhasil ditambahkan');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const handleDelete = (key) => {
    setData(data.filter((item) => item.key !== key));
    message.success('Data berhasil dihapus');
  };

  const columns = [
    {
      title: 'No',
      key: 'no',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Nama Kategori',
      dataIndex: 'nama',
      key: 'nama',
    },
    {
      title: 'Pilar',
      dataIndex: 'pilar_nama',
      key: 'pilar_nama',
    },
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
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Yakin ingin menghapus?"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Master Kategori</Title>
          <Text type="secondary">Kelola data kategori program</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Tambah Kategori</Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} pagination={false} scroll={{ x: 500 }} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Kategori' : 'Tambah Kategori'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="pilar_id"
            label="Pilar"
            rules={[{ required: true, message: 'Pilih pilar' }]}
          >
            <Select placeholder="Pilih Pilar">
              {pilarOptions.map((pilar) => (
                <Option key={pilar.id} value={pilar.id}>
                  {pilar.nama}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="nama"
            label="Nama Kategori"
            rules={[{ required: true, message: 'Masukkan nama kategori' }]}
          >
            <Input placeholder="Masukkan nama kategori" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MasterKategori;