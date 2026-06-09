import React from 'react';
import { Card, Row, Col, Typography, Statistic, Table, Tag, Progress } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Dummy data - will be replaced with API calls
const statisticsData = {
  total_pendaftar: 156,
  menunggu_screening: 23,
  sedang_dinilai: 45,
  selesai_dinilai: 88,
};

const pilarStats = [
  { name: 'Pilar Ekonomi', count: 45, color: '#1890ff' },
  { name: 'Pilar Sosial', count: 38, color: '#52c41a' },
  { name: 'Pilar Lingkungan', count: 35, color: '#faad14' },
  { name: 'Pilar Infrastruktur', count: 38, color: '#722ed1' },
];

const recentRegistrations = [
  {
    key: '1',
    nama_desa: 'Desa Sukamaju',
    pilar: 'Pilar Ekonomi',
    kategori: 'UMKM',
    status: 2,
    tanggal: '2026-01-15',
  },
  {
    key: '2',
    nama_desa: 'Desa Makmur',
    pilar: 'Pilar Sosial',
    kategori: 'Pendidikan',
    status: 3,
    tanggal: '2026-01-14',
  },
  {
    key: '3',
    nama_desa: 'Desa Sejahtera',
    pilar: 'Pilar Lingkungan',
    kategori: 'Konservasi',
    status: 4,
    tanggal: '2026-01-13',
  },
  {
    key: '4',
    nama_desa: 'Desa Damai',
    pilar: 'Pilar Infrastruktur',
    kategori: 'Jalan & Jembatan',
    status: 2,
    tanggal: '2026-01-12',
  },
  {
    key: '5',
    nama_desa: 'Desa Sentosa',
    pilar: 'Pilar Ekonomi',
    kategori: 'Koperasi',
    status: 3,
    tanggal: '2026-01-11',
  },
];

const statusMap = {
  1: { label: 'Draft', color: 'default' },
  2: { label: 'Menunggu Screening', color: 'processing' },
  3: { label: 'Sedang Dinilai', color: 'warning' },
  4: { label: 'Selesai Dinilai', color: 'success' },
  5: { label: 'Finalis', color: 'purple' },
};

const columns = [
  {
    title: 'Nama Desa',
    dataIndex: 'nama_desa',
    key: 'nama_desa',
  },
  {
    title: 'Pilar',
    dataIndex: 'pilar',
    key: 'pilar',
  },
  {
    title: 'Kategori',
    dataIndex: 'kategori',
    key: 'kategori',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={statusMap[status]?.color}>
        {statusMap[status]?.label}
      </Tag>
    ),
  },
  {
    title: 'Tanggal',
    dataIndex: 'tanggal',
    key: 'tanggal',
  },
];

const AdminDashboard = () => {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard Admin</Title>
        <Text type="secondary">Ringkasan data pendaftaran Desa Sejahtera Astra</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Total Pendaftar" value={statisticsData.total_pendaftar} prefix={<TeamOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Menunggu Screening" value={statisticsData.menunggu_screening} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Sedang Dinilai" value={statisticsData.sedang_dinilai} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Selesai Dinilai" value={statisticsData.selesai_dinilai} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Pilar Statistics */}
        <Col xs={24} lg={8}>
          <Card title="Statistik per Pilar" style={{ marginBottom: 24 }}>
            {pilarStats.map((pilar, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>{pilar.name}</Text>
                  <Text strong>{pilar.count}</Text>
                </div>
                <Progress percent={Math.round((pilar.count / statisticsData.total_pendaftar) * 100)} strokeColor={pilar.color} showInfo={false} />
              </div>
            ))}
          </Card>
          <Card title="Distribusi Status">
            <div style={{ textAlign: 'center' }}>
              <Progress type="circle" percent={Math.round((statisticsData.selesai_dinilai / statisticsData.total_pendaftar) * 100)} format={(percent) => `${percent}%`} strokeColor="#52c41a" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Pendaftaran Selesai Dinilai</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Recent Registrations */}
        <Col xs={24} lg={16}>
          <Card title="Pendaftaran Terbaru">
            <Table columns={columns} dataSource={recentRegistrations} pagination={false} size="middle" scroll={{ x: 600 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;