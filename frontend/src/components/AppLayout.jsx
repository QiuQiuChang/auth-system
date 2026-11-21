import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from 'antd'
import {
  ThunderboltOutlined,
  LogoutOutlined,
  DollarOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useRecharge } from '../contexts/RechargeContext'
import menuConfig from '../config/menuConfig'

const { Sider, Content } = Layout
const { Text } = Typography

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { openRecharge } = useRecharge()

  // 根据当前路径计算选中的菜单 key
  const selectedKey = menuConfig.find(
    (item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  )?.key || 'home'

  // 菜单项
  const menuItems = menuConfig.map((item) => ({
    key: item.key,
    icon: <item.icon />,
    label: item.label,
  }))

  const handleMenuClick = ({ key }) => {
    const item = menuConfig.find((m) => m.key === key)
    if (item) navigate(item.path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenu = {
    items: [
      { key: 'recharge', icon: <DollarOutlined />, label: '充值中心', onClick: () => openRecharge() },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
    ],
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={64}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo */}
        <div className="sidebar-logo" onClick={() => navigate('/home')}>
          <ThunderboltOutlined className="sidebar-logo-icon" />
          {!collapsed && <span className="sidebar-logo-text">AI Platform</span>}
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 8 }}
        />

        {/* 底部用户信息 */}
        <div className={`sidebar-user ${collapsed ? 'collapsed' : ''}`}>
          <Dropdown menu={userMenu} placement="topRight" trigger={['click']}>
            <div className="sidebar-user-inner">
              <Avatar
                size={collapsed ? 28 : 32}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#2563eb', flexShrink: 0 }}
              />
              {!collapsed && (
                <div className="sidebar-user-info">
                  <Text className="sidebar-user-name" ellipsis>
                    {user?.username || '用户'}
                  </Text>
                  <Text className="sidebar-user-points">
                    积分: {user?.points ?? 0}
                  </Text>
                </div>
              )}
            </div>
          </Dropdown>
          {!collapsed && (
            <Button
              type="text"
              size="small"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="sidebar-logout-btn"
            >
              退出
            </Button>
          )}
        </div>
      </Sider>

      {/* 内容区 */}
      <Layout style={{ marginLeft: collapsed ? 64 : 200, transition: 'margin-left 0.2s' }}>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
