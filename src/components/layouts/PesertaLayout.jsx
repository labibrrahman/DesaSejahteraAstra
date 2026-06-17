import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, ConfigProvider, Badge, Tooltip, Drawer } from 'antd';
import {
  DashboardOutlined,
  FormOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useIsMobile from '../../hooks/useIsMobile';
import useAuthStore from '../../stores/authStore';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const PesertaLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const isFormPage = location.pathname.includes('/pendaftaran');

  const menuItems = [
    { key: '/peserta/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    // { key: '/peserta/pendaftaran', icon: <FormOutlined />, label: 'Pendaftaran' },
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profil Saya' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Pengaturan' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Keluar', danger: true },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const { logout, user, role } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
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
    transition: 'all 0.2s ease',
  };

  const sidebarContent = (
    <>
      <div style={{ height: 64, padding: collapsed ? '16px 17px' : '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(30,41,59,0.3)' }}>
          <AppstoreOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', lineHeight: 1.3 }}>DSA Platform</div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>Desa Sejahtera Astra</div>
          </div>
        )}
      </div>
      <div style={{ position: isMobile ? 'relative' : 'absolute', top: isMobile ? 0 : 64, bottom: isMobile ? 0 : 100, left: 0, right: 0, overflowY: 'auto', overflowX: 'hidden', padding: '12px 8px' }}>
        <ConfigProvider theme={{ components: { Menu: { itemSelectedBg: '#2563eb', itemSelectedColor: '#ffffff', itemHoverBg: '#eff6ff', itemBorderRadius: 8, itemMarginBlock: 2 } } }}>
          <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={(e) => { handleMenuClick(e); if (isMobile) setDrawerOpen(false); }} style={{ border: 'none', background: 'transparent' }} />
        </ConfigProvider>
      </div>
      {/* {!isMobile && ( */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 8px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
          <div style={{ ...bottomItemStyle, marginBottom: 4, cursor: 'pointer' }} onClick={() => window.open('https://wa.me/6281234567890', '_blank')} onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}>
            <QuestionCircleOutlined style={{ fontSize: 16 }} />{!collapsed && <span>Support</span>}
          </div>
          <div style={{ ...bottomItemStyle, color: '#dc2626' }} onClick={handleLogout} onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#dc2626'; }}>
            <LogoutOutlined style={{ fontSize: 16 }} />{!collapsed && <span>Keluar</span>}
          </div>
        </div>
      {/* )} */}
    </>
  );
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={240} closable={false} bodyStyle={{ padding: 0 }} headerStyle={{ display: 'none' }}>
          {sidebarContent}
        </Drawer>
      ) : (
        <Sider trigger={null} collapsible collapsed={collapsed} width={240} collapsedWidth={72} style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, background: '#fff', borderRight: '1px solid #f0f0f0', overflow: 'hidden', zIndex: 100 }}>
          {sidebarContent}
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 72 : 240), transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)' }}>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 99, height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div onClick={() => isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)} style={{ cursor: 'pointer', fontSize: 18, color: '#64748b', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
              {isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            {!isMobile && <div style={{ height: 24, width: 1, background: '#e2e8f0' }} />}
            {!isMobile && <Text style={{ fontSize: 14, color: '#64748b' }}>{isFormPage ? 'Formulir Pendaftaran' : 'Dashboard'}</Text>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* {!isMobile && ( */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', lineHeight: 1.3 }}>{user?.name || 'Peserta'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize', lineHeight: 1.3 }}>{role || 'peserta'}</div>
              </div>
            {/* )} */}
            {/* <Dropdown menu={{ items: userMenuItems, onClick: handleLogout }} placement="bottomRight"> */}
              <Avatar icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', cursor: 'pointer' }} />
            {/* </Dropdown> */}
          </div>
        </Header>
        <Content style={{ margin: 0, minHeight: 'calc(100vh - 64px)', background: isFormPage ? 'transparent' : '#f1f5f9' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PesertaLayout;
