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
} from '@ant-design/icons';
import masterService from '../../services/masterService';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Mapping data dari API ke format UI.
 */
const mapFromApi = (item) => ({
  id: item.id,
  nama: item.name,
  pilar_id: item.pillarId || item.pillar?.id || '',
  pilar_nama: item.pillar?.name || '',
});

/**
 * Mapping form values ke payload API.
 */
const mapToApi = (values) => ({
  name: values.nama,
  pillarId: values.pilar_id,
});

const MasterKategori = () => {
  const [data, setData] = useState([]);
  const [pilarOptions, setPilarOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  /** Fetch kategori dari API */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await masterService.getCategories();
      const list = Array.isArray(result) ? result : [];
      setData(list.map(mapFromApi));
    } catch (error) {
      message.error('Gagal memuat data kategori');
      console.error('Fetch kategori error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Fetch pilar untuk dropdown */
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
    fetchCategories();
    fetchPillars();
  }, [fetchCategories, fetchPillars]);

  /** Buka modal tambah/edit */
  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        nama: record.nama,
        pilar_id: record.pilar_id,
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
        await masterService.updateCategory(editingRecord.id, mapToApi(values));
        message.success('Data berhasil diperbarui');
      } else {
        await masterService.createCategory(mapToApi(values));
        message.success('Data berhasil ditambahkan');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      fetchCategories();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || 'Gagal menyimpan data');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /** Hapus kategori */
  const handleDelete = async (id) => {
    try {
      await masterService.deleteCategory(id);
      message.success('Data berhasil dihapus');
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data?.message || 'Gagal menghapus data');
    }
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
      render: (text) => text || '-',
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
            title="Yakin ingin menghapus?"
            description="Data yang dihapus tidak dapat dikembalikan."
            onConfirm={() => handleDelete(record.id)}
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Tambah Kategori
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
        title={editingRecord ? 'Edit Kategori' : 'Tambah Kategori'}
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
            name="pilar_id"
            label="Pilar"
            rules={[{ required: true, message: 'Pilih pilar' }]}
          >
            <Select placeholder="Pilih Pilar">
              {pilarOptions.map((pilar) => (
                <Option key={pilar.id} value={pilar.id}>
                  {pilar.name}
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
