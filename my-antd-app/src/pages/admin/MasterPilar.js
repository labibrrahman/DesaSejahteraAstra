import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
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

// Dummy data - will be replaced with API calls
const initialData = [
  { key: '1', nama: 'Pilar Ekonomi', deskripsi: 'Program pemberdayaan ekonomi masyarakat desa', status: 'active' },
  { key: '2', nama: 'Pilar Sosial', deskripsi: 'Program peningkatan kualitas hidup masyarakat', status: 'active' },
  { key: '3', nama: 'Pilar Lingkungan', deskripsi: 'Program pelestarian lingkungan hidup', status: 'active' },
  { key: '4', nama: 'Pilar Infrastruktur', deskripsi: 'Program pembangunan infrastruktur dasar desa', status: 'active' },
];

const MasterPilar = () => {
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
      if (editingRecord) {
        // Update
        setData(data.map((item) =>
          item.key === editingRecord.key ? { ...item, ...values } : item
        ));
        message.success('Data berhasil diperbarui');
      } else {
        // Add new
        const newItem = {
          key: String(data.length + 1),
          ...values,
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
      title: 'Nama Pilar',
      dataIndex: 'nama',
      key: 'nama',
    },
    {
      title: 'Deskripsi',
      dataIndex: 'deskripsi',
      key: 'deskripsi',
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
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Master Pilar</Title>
          <Text type="secondary">Kelola data pilar program</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Tambah Pilar
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Pilar' : 'Tambah Pilar'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nama"
            label="Nama Pilar"
            rules={[{ required: true, message: 'Masukkan nama pilar' }]}
          >
            <Input placeholder="Masukkan nama pilar" />
          </Form.Item>
          <Form.Item
            name="deskripsi"
            label="Deskripsi"
            rules={[{ required: true, message: 'Masukkan deskripsi' }]}
          >
            <Input.TextArea rows={3} placeholder="Masukkan deskripsi pilar" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MasterPilar;