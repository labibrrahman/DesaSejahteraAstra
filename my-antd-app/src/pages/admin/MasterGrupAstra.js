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
  { key: '1', nama: 'Grup Astra 1', deskripsi: 'Grup Astra wilayah Jawa', status: 'active' },
  { key: '2', nama: 'Grup Astra 2', deskripsi: 'Grup Astra wilayah Sumatera', status: 'active' },
  { key: '3', nama: 'Grup Astra 3', deskripsi: 'Grup Astra wilayah Kalimantan', status: 'active' },
  { key: '4', nama: 'Grup Astra 4', deskripsi: 'Grup Astra wilayah Sulawesi', status: 'inactive' },
];

const MasterGrupAstra = () => {
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
        setData(data.map((item) =>
          item.key === editingRecord.key ? { ...item, ...values } : item
        ));
        message.success('Data berhasil diperbarui');
      } else {
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
      title: 'Nama Grup',
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
          <Title level={3} style={{ margin: 0 }}>Master Grup Astra</Title>
          <Text type="secondary">Kelola data grup astra</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Tambah Grup
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Grup Astra' : 'Tambah Grup Astra'}
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
            label="Nama Grup"
            rules={[{ required: true, message: 'Masukkan nama grup' }]}
          >
            <Input placeholder="Masukkan nama grup astra" />
          </Form.Item>
          <Form.Item
            name="deskripsi"
            label="Deskripsi"
            rules={[{ required: true, message: 'Masukkan deskripsi' }]}
          >
            <Input.TextArea rows={3} placeholder="Masukkan deskripsi grup" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MasterGrupAstra;