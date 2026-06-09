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
  UserOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Dummy data - will be replaced with API calls
const initialData = [
  { key: '1', username: 'admin1', nama: 'Administrator', role: 'admin', status: 'active' },
  { key: '2', username: 'juri1', nama: 'Juri Satu', role: 'juri', status: 'active' },
  { key: '3', username: 'juri2', nama: 'Juri Dua', role: 'juri', status: 'active' },
  { key: '4', username: 'juri3', nama: 'Juri Tiga', role: 'juri', status: 'inactive' },
];

const MasterUser = () => {
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
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Nama',
      dataIndex: 'nama',
      key: 'nama',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'blue' : 'green'}>
          {role === 'admin' ? 'Admin' : 'Juri'}
        </Tag>
      ),
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
          <Title level={3} style={{ margin: 0 }}>Master User</Title>
          <Text type="secondary">Kelola data admin dan juri</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Tambah User
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit User' : 'Tambah User'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Masukkan username' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Masukkan username" />
          </Form.Item>
          <Form.Item
            name="nama"
            label="Nama Lengkap"
            rules={[{ required: true, message: 'Masukkan nama lengkap' }]}
          >
            <Input placeholder="Masukkan nama lengkap" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Pilih role' }]}
          >
            <Select placeholder="Pilih Role">
              <Option value="admin">Admin</Option>
              <Option value="juri">Juri</Option>
            </Select>
          </Form.Item>
          {!editingRecord && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Masukkan password' }]}
            >
              <Input.Password placeholder="Masukkan password" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default MasterUser;