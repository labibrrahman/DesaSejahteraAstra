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
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import masterService from '../../services/masterService';

const { Title, Text } = Typography;

/**
 * Mapping data dari API ke format UI.
 */
const mapFromApi = (item) => ({
  id: item.id,
  nama: item.name,
});

/**
 * Mapping form values ke payload API.
 */
const mapToApi = (values) => ({
  name: values.nama,
});

const MasterGrupAstra = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [tablePage, setTablePage] = useState({ current: 1, pageSize: 10 });

  /** Fetch semua Binaan dari API */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await masterService.getAstraGroups();
      const list = Array.isArray(result) ? result : [];
      setData(list.map(mapFromApi));
    } catch (error) {
      message.error('Gagal memuat data Perusahaan/Yayasan Pembina');
      console.error('Fetch astra groups error:', error);
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
        await masterService.updateAstraGroup(editingRecord.id, mapToApi(values));
        message.success('Data berhasil diperbarui');
      } else {
        await masterService.createAstraGroup(mapToApi(values));
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

  /** Hapus Binaan */
  const handleDelete = async (id) => {
    try {
      await masterService.deleteAstraGroup(id);
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
      title: 'Nama Perusahaan/Yayasan Pembina',
      dataIndex: 'nama',
      key: 'nama',
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

  const filteredData = data.filter((item) =>
    !searchText || item.nama?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Master Perusahaan/Yayasan Pembina</Title>
          <Text type="secondary">Kelola data Perusahaan/Yayasan Pembina</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Tambah Perusahaan/Yayasan Pembina
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Cari Nama Perusahaan/Yayasan Pembina..."
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
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], showTotal: (total) => `Total ${total} data`, onChange: (page, pageSize) => setTablePage({ current: page, pageSize }) }}
            scroll={{ x: 500 }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingRecord ? 'Edit Perusahaan/Yayasan Pembina' : 'Tambah Perusahaan/Yayasan Pembina'}
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
            label="Nama Perusahaan/Yayasan Pembina"
            rules={[{ required: true, message: 'Masukkan Nama Perusahaan/Yayasan Pembina' }]}
          >
            <Input placeholder="Masukkan Nama Perusahaan/Yayasan Pembina" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MasterGrupAstra;
