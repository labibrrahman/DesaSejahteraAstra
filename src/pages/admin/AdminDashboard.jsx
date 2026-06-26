import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Typography, Statistic, Table, Tag, Progress, Spin, message } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';
import masterService from '../../services/masterService';

const { Title, Text } = Typography;

/** Mapping status dari backend ke label & warna */
const STATUS_MAP = {
  draft: { label: 'Draft', color: 'default' },
  waiting_screening: { label: 'Menunggu Screening', color: 'processing' },
  being_assessed: { label: 'Sedang Dinilai', color: 'warning' },
  assessed: { label: 'Selesai Dinilai', color: 'success' },
  finalist: { label: 'Finalis', color: 'purple' },
};

/** Warna default untuk progress bar pilar */
const PILAR_COLORS = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#13c2c2'];

/**
 * Mapping data dashboard dari API ke format UI.
 */
const mapDashboardFromApi = (data) => {
  const byStatus = data.by_status || {};

  return {
    statistics: {
      total_pendaftar: data.total_registrants || 0,
      menunggu_screening: byStatus.waiting_screening || 0,
      sedang_dinilai: byStatus.being_assessed || 0,
      selesai_dinilai: byStatus.assessed || 0,
      lolos: data.total_finalist || 0,
      tidak_lolos: data.total_rejected || 0,
    },
    pilarStats: (data.by_pillar || []).map((item, index) => ({
      name: item.pillar || `Pilar ${index + 1}`,
      count: item.count || 0,
      color: PILAR_COLORS[index % PILAR_COLORS.length],
    })),
    recentRegistrations: (data.recent_registrations || []).map((item) => ({
      key: item.id,
      nama_desa: item.villageName || '-',
      pilar: item.pillar?.name || '-',
      kategori: item.category?.name || '-',
      status: item.status,
      tanggal: item.submittedAt
        ? new Date(item.submittedAt).toLocaleDateString('id-ID')
        : '-',
    })),
  };
};

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState({
    total_pendaftar: 0,
    menunggu_screening: 0,
    sedang_dinilai: 0,
    selesai_dinilai: 0,
  });
  const [pilarStats, setPilarStats] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getDashboard();
      const mapped = mapDashboardFromApi(result);

      // Fetch master pilar (independen, tidak block dashboard)
      let pillarsData = [];
      try {
        pillarsData = await masterService.getPillars();
      } catch {
        // Gagal fetch pilar, gunakan data dari dashboard saja
      }

      // Merge: semua pilar dari master data, count dari dashboard
      const allPillars = Array.isArray(pillarsData) && pillarsData.length > 0
        ? pillarsData.map((p, index) => {
            const found = mapped.pilarStats.find(s => s.name === p.name);
            return {
              name: p.name,
              count: found ? found.count : 0,
              color: PILAR_COLORS[index % PILAR_COLORS.length],
            };
          })
        : mapped.pilarStats; // fallback ke data dari dashboard

      setStatistics(mapped.statistics);
      setPilarStats(allPillars);
      setRecentRegistrations(mapped.recentRegistrations);
    } catch (error) {
      message.error('Gagal memuat data dashboard');
      console.error('Fetch dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const columns = [
    { title: 'Nama DSA/Nama Desa', dataIndex: 'nama_desa', key: 'nama_desa' },
    { title: 'Pilar', dataIndex: 'pilar', key: 'pilar' },
    { title: 'Kategori', dataIndex: 'kategori', key: 'kategori' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={STATUS_MAP[status]?.color || 'default'}>
          {STATUS_MAP[status]?.label || status}
        </Tag>
      ),
    },
    { title: 'Tanggal', dataIndex: 'tanggal', key: 'tanggal' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard Admin</Title>
        <Text type="secondary">Ringkasan data pendaftaran Desa Sejahtera Astra</Text>
      </div>

      <Spin spinning={loading}>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: "Total Pendaftar", value: statistics.total_pendaftar, icon: <TeamOutlined />, color: '#1890ff' },
          { title: "Menunggu Screening", value: statistics.menunggu_screening, icon: <ClockCircleOutlined />, color: '#faad14' },
          { title: "Sedang Dinilai", value: statistics.sedang_dinilai, icon: <FileTextOutlined />, color: '#1890ff' },
          { title: "Lolos", value: statistics.lolos, icon: <CheckCircleOutlined />, color: '#10b981' },
          { title: "Tidak Lolos", value: statistics.tidak_lolos, icon: <CloseCircleOutlined />, color: '#ef4444' }
        ].map((item, index) => (
          <Col key={index} xs={index === 0 ? 24 : 12} sm={{ flex: '1 0 20%' }}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.icon}
                valueStyle={{ color: item.color }}
              />
            </Card>
          </Col>
        ))}
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
                  <Progress
                    percent={
                      statistics.total_pendaftar > 0
                        ? Math.round((pilar.count / statistics.total_pendaftar) * 100)
                        : 0
                    }
                    strokeColor={pilar.color}
                    showInfo={false}
                  />
                </div>
              ))}
              {pilarStats.length === 0 && !loading && (
                <Text type="secondary">Belum ada data pilar</Text>
              )}
            </Card>
            <Card title="Distribusi Status">
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={
                    statistics.total_pendaftar > 0
                      ? Math.round((statistics.selesai_dinilai / statistics.total_pendaftar) * 100)
                      : 0
                  }
                  format={(percent) => `${percent}%`}
                  strokeColor="#52c41a"
                />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Pendaftaran Selesai Dinilai</Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Recent Registrations */}
          <Col xs={24} lg={16}>
            <Card title="Pendaftaran Terbaru">
              <Table
                columns={columns}
                dataSource={recentRegistrations}
                pagination={false}
                size="middle"
                scroll={{ x: 600 }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AdminDashboard;
