import { useState } from 'react'
import { App, Button, Form, Input } from 'antd'
import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { encryptPassword } from '../utils/crypto'

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { message } = App.useApp()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const encryptedPassword = await encryptPassword(values.password)
      const response = await authApi.login({ ...values, password: encryptedPassword })
      const { token, user } = response.data.data
      login(token, user)
      message.success('登录成功')
      navigate('/home')
    } catch (error) {
      const msg = error.response?.data?.message || '登录失败，请稍后重试'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="系统概览">
        <div className="brand-mark">
          <SafetyCertificateOutlined />
        </div>
        <div>
          <p className="auth-eyebrow">身份认证平台</p>
          <h1 className="auth-hero-title">安全、清爽地管理你的登录会话</h1>
          <p className="auth-hero-copy">
            基于 Spring Boot 与 React 的认证系统，支持账户登录、注册与用户信息查看。
          </p>
        </div>
        <div className="auth-metrics">
          <div>
            <strong>24h</strong>
            <span>访问令牌</span>
          </div>
          <div>
            <strong>BCrypt</strong>
            <span>密码加密</span>
          </div>
          <div>
            <strong>JWT</strong>
            <span>无状态认证</span>
          </div>
        </div>
      </section>

      <section className="auth-panel" aria-label="登录表单">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">欢迎回来</h2>
            <p className="auth-subtitle">登录账号后进入个人工作台</p>
          </div>

          <Form
            name="login"
            className="auth-form"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-footer">
            还没有账号？ <Link to="/register">立即注册</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
