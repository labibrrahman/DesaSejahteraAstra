import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, ConfigProvider, Drawer } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  TagsOutlined,
  AppstoreOutlined,
  QuestionCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useIsMobile from '../../hooks/useIsMobile';
import useAuthStore from '../../stores/authStore';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/peserta',
      icon: <TeamOutlined />,
      label: 'Daftar Peserta',
    },
    {
      key: '/admin/penilaian',
      icon: <FileTextOutlined />,
      label: 'Riwayat Penilaian',
    },
    {
      key: 'master-data',
      icon: <DatabaseOutlined />,
      label: 'Data Master',
      children: [
        { key: '/admin/master/pilar', icon: <TrophyOutlined />, label: 'Pilar' },
        { key: '/admin/master/kategori', icon: <TagsOutlined />, label: 'Kategori' },
        { key: '/admin/master/user', icon: <UserOutlined />, label: 'User (Admin/Juri)' },
        { key: '/admin/master/wilayah', icon: <EnvironmentOutlined />, label: 'Wilayah' },
        { key: '/admin/master/grup-astra', icon: <ShopOutlined />, label: 'Grup Astra' },
      ],
    },
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profil' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Pengaturan' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Keluar', danger: true },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login/admin');
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') handleLogout();
  };

  const bottomItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: collapsed ? '10px 0' : '10px 12px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    borderRadius: 8,
    cursor: 'pointer',
    color: '#64748b',
    fontSize: 14,
    transition: 'background 0.2s',
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        style={{
          height: 72,
          padding: collapsed ? '16px 13px' : '16px 20px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            background: '#1e293b',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AppstoreOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', lineHeight: 1.3 }}>
              Astra CSR
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>
              Rural Development
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div
        style={{
          position: isMobile ? 'relative' : 'absolute',
          top: isMobile ? 0 : 72,
          bottom: isMobile ? 0 : 104,
          left: 0,
          right: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '8px',
        }}
      >
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemSelectedBg: '#2563eb',
                itemSelectedColor: '#ffffff',
                itemHoverBg: '#eff6ff',
                itemBorderRadius: 8,
              },
            },
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['master-data']}
            items={menuItems}
            onClick={(e) => { handleMenuClick(e); if (isMobile) setDrawerOpen(false); }}
            style={{ border: 'none', background: 'transparent' }}
          />
        </ConfigProvider>
      </div>

      {/* Bottom Items */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px',
            borderTop: '1px solid #f0f0f0',
            background: '#fff',
          }}
        >
          <div
            style={{ ...bottomItemStyle, marginBottom: 4, cursor: 'pointer' }}
            onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
            onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <QuestionCircleOutlined style={{ fontSize: 16 }} />
            {!collapsed && <span>Support</span>}
          </div>
          <div
            style={{ ...bottomItemStyle, color: '#dc2626' }}
            onClick={handleLogout}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#dc2626'; }}
          >
            <LogoutOutlined style={{ fontSize: 16 }} />
            {!collapsed && <span>Keluar</span>}
          </div>
        </div>
      )}
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={220}
          closable={false}
          bodyStyle={{ padding: 0 }}
          headerStyle={{ display: 'none' }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={220}
          collapsedWidth={64}
          style={{
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            overflow: 'hidden',
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 64 : 220), transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            onClick={() => isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)}
            style={{ cursor: 'pointer', fontSize: 18, color: '#64748b' }}
          >
            {isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Space size={16}>
            {/* <BellOutlined style={{ fontSize: 18, color: '#64748b', cursor: 'pointer' }} />
            {!isMobile && <QuestionCircleOutlined style={{ fontSize: 18, color: '#64748b', cursor: 'pointer' }} />}
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1e293b', cursor: 'pointer' }}
              />
            </Dropdown> */}
          </Space>
        </Header>
        <Content
          style={{
            margin: isMobile ? 12 : 24,
            padding: isMobile ? 12 : 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;