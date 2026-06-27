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
  KeyOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';
import masterService from '../../services/masterService';
import logger from '../../lib/logger';

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
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [passwordForm] = Form.useForm();

  /** Fetch users dari API */
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const result = await adminService.getUsers({
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        search: params.search || undefined,
      });
      const list = Array.isArray(result?.data) ? result.data : [];
      const meta = result?.meta || {};
      setData(list.map(mapFromApi));
      setPagination(prev => ({ ...prev, total: meta.total || list.length }));
    } catch (error) {
      message.error('Gagal memuat data user');
      logger.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  /** Fetch pilar untuk dropdown juri */
  const fetchPillars = useCallback(async () => {
    try {
      const result = await masterService.getPillars();
      const list = Array.isArray(result) ? result : [];
      setPilarOptions(list.map((item) => ({ id: item.id, name: item.name })));
    } catch (error) {
      logger.error('Fetch pilar error:', error);
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

  /** Buka modal ganti password */
  const showPasswordModal = (record) => {
    setSelectedUserForPassword(record);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  /** Submit ganti password */
  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      setPasswordSubmitting(true);

      await adminService.updateUser(selectedUserForPassword.id, {
        password: values.newPassword,
      });

      message.success(`Password ${selectedUserForPassword.nama} berhasil diubah`);
      setPasswordModalVisible(false);
      passwordForm.resetFields();
      setSelectedUserForPassword(null);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || 'Gagal mengubah password');
      }
    } finally {
      setPasswordSubmitting(false);
    }
  };

  /** Pantau perubahan role di form untuk show/hide pillar field */
  const selectedRole = Form.useWatch('role', form);

  const columns = [
    {
      title: 'No',
      key: 'no',
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
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
        <Tag color={role === 'admin' ? 'blue' : role === 'juri' ? 'green' : 'orange'}>
          {role === 'admin' ? 'Admin' : role === 'juri' ? 'Juri' : 'Peserta'}
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
      width: 260,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Button
            disabled={record.role === 'peserta'}
            type="link"
            icon={<KeyOutlined />}
            onClick={() => showPasswordModal(record)}
          >
            Password
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
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Cari nama, email, atau role..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(val) => fetchUsers({ page: 1, search: val })}
            allowClear
            style={{ maxWidth: 300 }}
          />
        </div>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} data`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
                fetchUsers({ page, limit: pageSize, search: searchText });
              },
            }}
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
              <Option value="peserta">Peserta</Option>
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

      {/* Modal Ganti Password */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyOutlined />
            <span>Ganti Password</span>
          </div>
        }
        open={passwordModalVisible}
        onOk={handlePasswordSubmit}
        confirmLoading={passwordSubmitting}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
          setSelectedUserForPassword(null);
        }}
        okText="Simpan Password"
        cancelText="Batal"
      >
        {selectedUserForPassword && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f6f8fa', borderRadius: 8 }}>
            <Text type="secondary">Mengubah password untuk:</Text>
            <br />
            <Text strong>{selectedUserForPassword.nama}</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>({selectedUserForPassword.username})</Text>
          </div>
        )}
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="Password Baru"
            rules={[
              { required: true, message: 'Masukkan password baru' },
              { min: 6, message: 'Password minimal 6 karakter' },
            ]}
          >
            <Input.Password placeholder="Masukkan password baru" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Konfirmasi Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Konfirmasi password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Password tidak cocok'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Ulangi password baru" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MasterUser;
