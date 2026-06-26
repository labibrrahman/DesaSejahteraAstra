import React, { useState } from 'react';
import { Layout, Menu, Avatar, ConfigProvider, Drawer, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  QuestionCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useIsMobile from '../../hooks/useIsMobile';
import useAuthStore from '../../stores/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// ─── Menu Config per Role ────────────────────────────────────────────
const MENU_CONFIG = {
  admin: [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/peserta', icon: <TeamOutlined />, label: 'Daftar Peserta' },
    { key: '/admin/penilaian', icon: <FileTextOutlined />, label: 'Riwayat Penilaian' },
    { key: '/admin/seleksi', icon: <CheckCircleOutlined />, label: 'Hasil Seleksi' },
    {
      key: 'master-data',
      icon: <DatabaseOutlined />,
      label: 'Data Master',
      children: [
        { key: '/admin/master/pilar', icon: <TrophyOutlined />, label: 'Pilar' },
        { key: '/admin/master/kategori', icon: <TagsOutlined />, label: 'Kategori' },
        { key: '/admin/master/user', icon: <UserOutlined />, label: 'User (Admin/Juri)' },
        { key: '/admin/master/wilayah', icon: <EnvironmentOutlined />, label: 'Wilayah' },
        { key: '/admin/master/grup-astra', icon: <ShopOutlined />, label: 'Perusahaan/Yayasan Pembina' },
      ],
    },
  ],
  juri: [
    { key: '/juri/peserta', icon: <TeamOutlined />, label: 'Daftar Peserta' },
    { key: '/juri/riwayat', icon: <HistoryOutlined />, label: 'Riwayat Penilaian' },
  ],
  peserta: [
    { key: '/peserta/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  ],
};

const LOGOUT_REDIRECT = {
  admin: '/login/admin',
  juri: '/login/admin',
  peserta: '/',
};

const AppLayout = ({ role = 'admin' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const menuItems = MENU_CONFIG[role] || MENU_CONFIG.admin;

  const handleLogout = async () => {
    await logout();
    navigate(LOGOUT_REDIRECT[role] || '/login');
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
    if (isMobile) setDrawerOpen(false);
  };

  // ── Sidebar styles ──────────────────────────────────────────────────
  const siderWidth = role === 'peserta' ? 240 : 220;
  const collapsedWidth = role === 'peserta' ? 72 : 64;

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

  // ── Sidebar Content ─────────────────────────────────────────────────
  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{
        height: role === 'peserta' ? 64 : 72,
        padding: collapsed ? (role === 'peserta' ? '16px 17px' : '16px 13px') : '16px 20px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: role === 'peserta' ? 36 : 38,
          height: role === 'peserta' ? 36 : 38,
          background: role === 'peserta' ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : '#1e293b',
          borderRadius: role === 'peserta' ? 10 : 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: role === 'peserta' ? '0 2px 8px rgba(30,41,59,0.3)' : 'none',
        }}>
          <AppstoreOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <div style={{ fontWeight: 700, fontSize: role === 'peserta' ? 15 : 14, color: '#1e293b', lineHeight: 1.3 }}>
              DSA Platform
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>
              Desa Sejahtera Astra
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div style={{
        position: isMobile ? 'relative' : 'absolute',
        top: isMobile ? 0 : (role === 'peserta' ? 64 : 72),
        bottom: isMobile ? 0 : 104,
        left: 0, right: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: role === 'peserta' ? '12px 8px' : '8px',
      }}>
        <ConfigProvider theme={{
          components: {
            Menu: {
              itemSelectedBg: '#2563eb',
              itemSelectedColor: '#ffffff',
              itemHoverBg: '#eff6ff',
              itemBorderRadius: 8,
              ...(role === 'peserta' ? { itemMarginBlock: 2 } : {}),
            },
          },
        }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={role === 'admin' ? ['master-data'] : []}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: 'none', background: 'transparent' }}
          />
        </ConfigProvider>
      </div>

      {/* Bottom Items */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: role === 'peserta' ? '12px 8px' : '8px',
        borderTop: '1px solid #f0f0f0',
        background: '#fff',
      }}>
        <div
          style={{ ...bottomItemStyle, marginBottom: 4, cursor: 'pointer' }}
          onClick={() => window.open('https://wa.me/6285713043230', '_blank')}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
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
    </>
  );

  // ── Header Content ──────────────────────────────────────────────────
  const defaultName = role === 'admin' ? 'Admin' : role === 'juri' ? 'Juri' : 'Peserta';
  const isFormPage = location.pathname.includes('/pendaftaran');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={siderWidth}
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
          width={siderWidth}
          collapsedWidth={collapsedWidth}
          style={{
            height: '100vh',
            position: 'fixed',
            left: 0, top: 0, bottom: 0,
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            overflow: 'hidden',
            ...(role === 'peserta' ? { zIndex: 100 } : {}),
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Main Area */}
      <Layout style={{
        marginLeft: isMobile ? 0 : (collapsed ? collapsedWidth : siderWidth),
        transition: `all ${role === 'peserta' ? '0.3s cubic-bezier(0.2, 0, 0, 1)' : '0.2s'}`,
      }}>
        <Header style={{
          padding: '0 16px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: role === 'peserta' ? 99 : 10,
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={() => isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)}
              style={{
                cursor: 'pointer',
                fontSize: 18,
                color: '#64748b',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
            >
              {isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            {role === 'peserta' && (
              <>
                {!isMobile && <div style={{ height: 24, width: 1, background: '#e2e8f0' }} />}
                {!isMobile && <Text style={{ fontSize: 14, color: '#64748b' }}>{isFormPage ? 'Formulir Pendaftaran' : 'Dashboard'}</Text>}
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', lineHeight: 1.3 }}>{user?.name || defaultName}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize', lineHeight: 1.3 }}>{role}</div>
              </div>
            <Avatar
              icon={<UserOutlined />}
              style={{
                background: role === 'peserta' ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : '#1e293b',
                cursor: 'pointer',
              }}
            />
          </div>
        </Header>

        <Content style={{
          margin: role === 'peserta' ? 0 : (isMobile ? 12 : 24),
          padding: role === 'peserta' ? 0 : (isMobile ? 12 : 24),
          background: role === 'peserta' ? (isFormPage ? 'transparent' : '#f1f5f9') : '#fff',
          borderRadius: role === 'peserta' ? 0 : 8,
          minHeight: role === 'peserta' ? 'calc(100vh - 64px)' : 280,
          overflow: 'auto',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
