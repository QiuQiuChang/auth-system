import { useState } from 'react'
import { Avatar, Button, Tag } from 'antd'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import RechargeModal from '../components/RechargeModal'

const formatDateTime = (value) => {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString('zh-CN')
}

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [rechargeOpen, setRechargeOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-logo">
            <SafetyCertificateOutlined />
          </div>
          <div>
            <div className="dashboard-header-logo">Auth System</div>
            <div className="dashboard-header-subtitle">认证管理工作台</div>
          </div>
        </div>
        <div className="dashboard-header-right">
          <Button
            type="text"
            icon={<ThunderboltOutlined />}
            onClick={() => navigate('/tools')}
          >
            AI 工具箱
          </Button>
          <Button
            type="text"
            onClick={() => setRechargeOpen(true)}
            className="dashboard-points-btn"
          >
            积分：{user?.points ?? 0}
          </Button>
          <Avatar icon={<UserOutlined />} />
          <span className="dashboard-username">{user?.username}</span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出
          </Button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-hero">
          <div>
            <Tag color="blue" icon={<CheckCircleOutlined />}>已登录</Tag>
            <h1>欢迎回来，{user?.username}</h1>
            <p>你的认证会话正在安全运行，可以继续查看和管理当前账户信息。</p>
          </div>
          <div className="session-card">
            <span>当前状态</span>
            <strong>安全在线</strong>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="profile-card">
            <div className="section-heading">
              <h2>账户资料</h2>
              <p>后端实时返回的当前登录用户信息</p>
            </div>

            <div className="profile-list">
              <div className="info-row">
                <span className="info-icon"><UserOutlined /></span>
                <span className="info-label">用户名</span>
                <span className="info-value">{user?.username}</span>
              </div>
              <div className="info-row">
                <span className="info-icon"><MailOutlined /></span>
                <span className="info-label">邮箱</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-row">
                <span className="info-icon"><CalendarOutlined /></span>
                <span className="info-label">注册时间</span>
                <span className="info-value">{formatDateTime(user?.createdAt)}</span>
              </div>
              <div className="info-row">
                <span className="info-icon"><ClockCircleOutlined /></span>
                <span className="info-label">更新时间</span>
                <span className="info-value">{formatDateTime(user?.updatedAt)}</span>
              </div>
            </div>
          </section>

          <aside className="security-card">
            <div className="section-heading">
              <h2>安全配置</h2>
              <p>当前认证链路关键能力</p>
            </div>
            <div className="security-list">
              <div>
                <CheckCircleOutlined />
                <span>JWT 无状态访问令牌</span>
              </div>
              <div>
                <CheckCircleOutlined />
                <span>BCrypt 密码加密</span>
              </div>
              <div>
                <CheckCircleOutlined />
                <span>受保护接口自动鉴权</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} />
    </main>
  )
}

export default DashboardPage
