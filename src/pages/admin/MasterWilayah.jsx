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
  Tabs,
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
const { Option } = Select;

/** Mapping tab key ke tipe region di backend */
const TAB_TYPE_MAP = {
  provinsi: 'province',
  kabupaten: 'city',
  kecamatan: 'district',
  desa: 'village',
};

/** Mapping tab key ke label */
const TAB_LABEL_MAP = {
  provinsi: 'Provinsi',
  kabupaten: 'Kabupaten/Kota',
  kecamatan: 'Kecamatan',
  desa: 'Desa/Kelurahan',
};

/** Mapping tab key ke tab parent */
const TAB_PARENT_MAP = {
  kabupaten: 'provinsi',
  kecamatan: 'kabupaten',
  desa: 'kecamatan',
};

/**
 * Mapping data region dari API ke format UI.
 */
const mapFromApi = (item, parentName) => ({
  id: item.id,
  kode: item.code || '-',
  nama: item.name,
  parentId: item.parentId,
  parentNama: parentName || '-',
});

const MasterWilayah = () => {
  const [activeTab, setActiveTab] = useState('provinsi');
  const [searchText, setSearchText] = useState('');
  const [dataByTab, setDataByTab] = useState({
    provinsi: [],
    kabupaten: [],
    kecamatan: [],
    desa: [],
  });
  const [parentOptions, setParentOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  /** Fetch data wilayah per tab */
  const fetchRegions = useCallback(async (tabKey) => {
    setLoading(true);
    try {
      const type = TAB_TYPE_MAP[tabKey];
      const result = await masterService.getRegions({ type });
      const list = Array.isArray(result) ? result : [];

      // Untuk tab selain provinsi, kita perlu nama parent
      let parentMap = {};
      if (TAB_PARENT_MAP[tabKey]) {
        const parentType = TAB_TYPE_MAP[TAB_PARENT_MAP[tabKey]];
        const parentResult = await masterService.getRegions({ type: parentType });
        const parentList = Array.isArray(parentResult) ? parentResult : [];
        parentMap = parentList.reduce((acc, item) => {
          acc[item.id] = item.name;
          return acc;
        }, {});
      }

      const mapped = list.map((item) =>
        mapFromApi(item, item.parentId ? parentMap[item.parentId] : null)
      );

      setDataByTab((prev) => ({ ...prev, [tabKey]: mapped }));
    } catch (error) {
      message.error(`Gagal memuat data ${TAB_LABEL_MAP[tabKey]}`);
      console.error('Fetch regions error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Fetch parent options untuk dropdown */
  const fetchParentOptions = useCallback(async (tabKey) => {
    const parentTab = TAB_PARENT_MAP[tabKey];
    if (!parentTab) {
      setParentOptions([]);
      return;
    }
    try {
      const parentType = TAB_TYPE_MAP[parentTab];
      const result = await masterService.getRegions({ type: parentType });
      const list = Array.isArray(result) ? result : [];
      setParentOptions(list.map((item) => ({ id: item.id, name: item.name })));
    } catch (error) {
      console.error('Fetch parent options error:', error);
    }
  }, []);

  useEffect(() => {
    fetchRegions(activeTab);
  }, [activeTab, fetchRegions]);

  /** Buka modal tambah/edit */
  const showModal = (record = null) => {
    setEditingRecord(record);
    fetchParentOptions(activeTab);
    if (record) {
      form.setFieldsValue({
        kode: record.kode === '-' ? '' : record.kode,
        nama: record.nama,
        parentId: record.parentId,
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

      const payload = {
        name: values.nama,
        type: TAB_TYPE_MAP[activeTab],
      };
      if (values.kode) payload.code = values.kode;
      if (values.parentId) payload.parentId = values.parentId;

      if (editingRecord) {
        await masterService.updateRegion(editingRecord.id, payload);
        message.success('Data berhasil diperbarui');
      } else {
        await masterService.createRegion(payload);
        message.success('Data berhasil ditambahkan');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      fetchRegions(activeTab);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || 'Gagal menyimpan data');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /** Hapus wilayah */
  const handleDelete = async (id) => {
    try {
      await masterService.deleteRegion(id);
      message.success('Data berhasil dihapus');
      fetchRegions(activeTab);
    } catch (error) {
      message.error(error.response?.data?.message || 'Gagal menghapus data');
    }
  };

  /** Kolom tabel berdasarkan tab aktif */
  const getColumns = () => {
    const baseColumns = [
      { title: 'No', key: 'no', render: (_, __, index) => index + 1, width: 60 },
      { title: 'Kode', dataIndex: 'kode', key: 'kode', width: 120 },
      { title: 'Nama', dataIndex: 'nama', key: 'nama' },
    ];

    if (activeTab !== 'provinsi') {
      const parentLabel = TAB_LABEL_MAP[TAB_PARENT_MAP[activeTab]];
      baseColumns.push({
        title: parentLabel,
        dataIndex: 'parentNama',
        key: 'parentNama',
      });
    }

    baseColumns.push({
      title: 'Aksi',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Yakin ingin menghapus?"
            description="Data child juga akan terhapus."
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    });

    return baseColumns;
  };

  /** Form fields berdasarkan tab aktif */
  const getFormFields = () => {
    const parentTab = TAB_PARENT_MAP[activeTab];
    const parentLabel = parentTab ? TAB_LABEL_MAP[parentTab] : null;

    return (
      <>
        {parentLabel && (
          <Form.Item
            name="parentId"
            label={parentLabel}
            rules={[{ required: true, message: `Pilih ${parentLabel}` }]}
          >
            <Select placeholder={`Pilih ${parentLabel}`} showSearch optionFilterProp="children">
              {parentOptions.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item
          name="kode"
          label={`Kode ${TAB_LABEL_MAP[activeTab]}`}
        >
          <Input placeholder={`Masukkan kode (opsional)`} />
        </Form.Item>
        <Form.Item
          name="nama"
          label={`Nama ${TAB_LABEL_MAP[activeTab]}`}
          rules={[{ required: true, message: 'Masukkan nama' }]}
        >
          <Input placeholder={`Masukkan nama ${TAB_LABEL_MAP[activeTab].toLowerCase()}`} />
        </Form.Item>
      </>
    );
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
          Tambah {TAB_LABEL_MAP[activeTab]}
        </Button>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={(tab) => { setActiveTab(tab); setSearchText(''); }} items={tabItems} />
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Cari kode atau nama..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 300 }}
          />
        </div>
        <Spin spinning={loading}>
          <Table
            columns={getColumns()}
            dataSource={(dataByTab[activeTab] || []).filter((item) =>
              !searchText ||
              item.kode?.toLowerCase().includes(searchText.toLowerCase()) ||
              item.nama?.toLowerCase().includes(searchText.toLowerCase()) ||
              item.parentNama?.toLowerCase().includes(searchText.toLowerCase())
            )}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], showTotal: (total) => `Total ${total} data` }}
            scroll={{ x: 500 }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingRecord ? `Edit ${TAB_LABEL_MAP[activeTab]}` : `Tambah ${TAB_LABEL_MAP[activeTab]}`}
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
          {getFormFields()}
        </Form>
      </Modal>
    </div>
  );
};

export default MasterWilayah;
