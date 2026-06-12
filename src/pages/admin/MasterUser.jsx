import React, { useState, useEffect, useCallback } from 'react';
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
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';
import masterService from '../../services/masterService';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Mapping data user dari API ke format UI.
 */
const mapFromApi = (item) => ({
  id: item.id,
  username: item.email,
  nama: item.name,
  role: item.role,
  pillarId: item.pillarId,
  status: item.isActive ? 'active' : 'inactive',
});

/**
 * Mapping form values ke payload API untuk create.
 */
const mapToCreateApi = (values) => ({
  name: values.nama,
  email: values.username,
  password: values.password,
  role: values.role,
  ...(values.role === 'juri' && values.pillarId ? { pillarId: values.pillarId } : {}),
});

/**
 * Mapping form values ke payload API untuk update.
 */
const mapToUpdateApi = (values) => {
  const dto = {
    name: values.nama,
    email: values.username,
    role: values.role,
  };
  if (values.role === 'juri' && values.pillarId) {
    dto.pillarId = values.pillarId;
  }
  return dto;
};

const MasterUser = () => {
  const [data, setData] = useState([]);
  const [pilarOptions, setPilarOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  /** Fetch users dari API */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getUsers();
      const list = Array.isArray(result) ? result : result?.data || [];
      setData(list.map(mapFromApi));
    } catch (error) {
      message.error('Gagal memuat data user');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Fetch pilar untuk dropdown juri */
  const fetchPillars = useCallback(async () => {
    try {
      const result = await masterService.getPillars();
      const list = Array.isArray(result) ? result : [];
      setPilarOptions(list.map((item) => ({ id: item.id, name: item.name })));
    } catch (error) {
      console.error('Fetch pilar error:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPillars();
  }, [fetchUsers, fetchPillars]);

  /** Buka modal tambah/edit */
  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        username: record.username,
        nama: record.nama,
        role: record.role,
        pillarId: record.pillarId,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  /** Submit form (create / update) */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingRecord) {
        await adminService.updateUser(editingRecord.id, mapToUpdateApi(values));
        message.success('Data berhasil diperbarui');
      } else {
        await adminService.createUser(mapToCreateApi(values));
        message.success('Data berhasil ditambahkan');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      fetchUsers();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || 'Gagal menyimpan data');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /** Nonaktifkan user (soft delete) */
  const handleDelete = async (id) => {
    try {
      await adminService.deleteUser(id);
      message.success('User berhasil dinonaktifkan');
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Gagal menonaktifkan user');
    }
  };

  /** Pantau perubahan role di form untuk show/hide pillar field */
  const selectedRole = Form.useWatch('role', form);

  const columns = [
    {
      title: 'No',
      key: 'no',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Email',
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
      width: 180,
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
            title="Yakin ingin menonaktifkan user ini?"
            description="User yang dinonaktifkan tidak dapat login."
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Nonaktifkan
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
          <Title level={3} style={{ margin: 0 }}>Master User</Title>
          <Text type="secondary">Kelola data admin dan juri</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Tambah User
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={false}
            scroll={{ x: 500 }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingRecord ? 'Edit User' : 'Tambah User'}
        open={modalVisible}
        onOk={handleOk}
        confirmLoading={submitting}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingRecord(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Email"
            rules={[
              { required: true, message: 'Masukkan email' },
              { type: 'email', message: 'Format email tidak valid' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Masukkan email" />
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

          {selectedRole === 'juri' && (
            <Form.Item
              name="pillarId"
              label="Pilar"
              rules={[{ required: true, message: 'Pilih pilar untuk juri' }]}
            >
              <Select placeholder="Pilih Pilar">
                {pilarOptions.map((pilar) => (
                  <Option key={pilar.id} value={pilar.id}>
                    {pilar.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {!editingRecord && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Masukkan password' },
                { min: 6, message: 'Password minimal 6 karakter' },
              ]}
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
