import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, ConfigProvider } from 'antd';
import {
  TeamOutlined,
  HistoryOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  QuestionCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const JuriLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/juri/peserta',
      icon: <TeamOutlined />,
      label: 'Daftar Peserta',
    },
    {
      key: '/juri/riwayat',
      icon: <HistoryOutlined />,
      label: 'Riwayat Penilaian',
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

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    navigate('/login/juri');
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
          {!collapsed && (
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
            position: 'absolute',
            top: 72,
            bottom: 104,
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
              items={menuItems}
              onClick={handleMenuClick}
              style={{ border: 'none', background: 'transparent' }}
            />
          </ConfigProvider>
        </div>

        {/* Bottom Items */}
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
            style={{ ...bottomItemStyle, marginBottom: 4 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <QuestionCircleOutlined style={{ fontSize: 16 }} />
            {!collapsed && <span>Support</span>}
          </div>
          <div
            style={bottomItemStyle}
            onClick={handleLogout}
            onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogoutOutlined style={{ fontSize: 16 }} />
            {!collapsed && <span>Sign Out</span>}
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
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
            onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: 'pointer', fontSize: 18, color: '#64748b' }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Space size={16}>
            <BellOutlined style={{ fontSize: 18, color: '#64748b', cursor: 'pointer' }} />
            <QuestionCircleOutlined style={{ fontSize: 18, color: '#64748b', cursor: 'pointer' }} />
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1e293b', cursor: 'pointer' }}
              />
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default JuriLayout;