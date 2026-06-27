import React, { useState, useEffect, useCallback } from 'react';
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
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import masterService from '../../services/masterService';
import logger from '../../lib/logger';

const { Title, Text } = Typography;

/**
 * Mapping data dari API (name, description) ke format UI (nama, deskripsi).
 * @param {object} item - data dari backend
 * @returns {object} - data untuk UI
 */
const mapFromApi = (item) => ({
  id: item.id,
  nama: item.name,
  deskripsi: item.description || '',
});

/**
 * Mapping data dari form UI ke format API.
 * @param {object} values - form values
 * @returns {object} - payload untuk backend
 */
const mapToApi = (values) => ({
  name: values.nama,
  description: values.deskripsi,
});

const MasterPilar = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [tablePage, setTablePage] = useState({ current: 1, pageSize: 10 });
  const [form] = Form.useForm();

  /** Fetch semua pilar dari API */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await masterService.getPillars();
      const list = Array.isArray(result) ? result : [];
      setData(list.map(mapFromApi));
    } catch (error) {
      message.error('Gagal memuat data pilar');
      logger.error('Fetch pilar error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Buka modal tambah/edit */
  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue(record);
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
        await masterService.updatePillar(editingRecord.id, mapToApi(values));
        message.success('Data berhasil diperbarui');
      } else {
        await masterService.createPillar(mapToApi(values));
        message.success('Data berhasil ditambahkan');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || 'Gagal menyimpan data');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /** Hapus pilar */
  const handleDelete = async (id) => {
    try {
      await masterService.deletePillar(id);
      message.success('Data berhasil dihapus');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Gagal menghapus data');
    }
  };

  const columns = [
    {
      title: 'No',
      key: 'no',
      render: (_, __, index) => (tablePage.current - 1) * tablePage.pageSize + index + 1,
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
          <Title level={3} style={{ margin: 0 }}>Master Pilar</Title>
          <Text type="secondary">Kelola data pilar program</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Tambah Pilar
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Cari nama pilar atau deskripsi..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 300 }}
          />
        </div>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data.filter((item) =>
              !searchText ||
              item.nama?.toLowerCase().includes(searchText.toLowerCase()) ||
              item.deskripsi?.toLowerCase().includes(searchText.toLowerCase())
            )}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], showTotal: (total) => `Total ${total} data`, onChange: (page, pageSize) => setTablePage({ current: page, pageSize }) }}
            scroll={{ x: 500 }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingRecord ? 'Edit Pilar' : 'Tambah Pilar'}
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
