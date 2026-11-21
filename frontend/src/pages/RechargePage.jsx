import { useEffect, useState } from 'react'
import { Button, Card, Spin, Typography, Modal, Tag, Row, Col } from 'antd'
import { CrownOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { App } from 'antd'
import paymentApi from '../api/payment'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text } = Typography

const planIcons = {
  plan_50: <ThunderboltOutlined />,
  plan_200: <CrownOutlined />,
  plan_unlimited: <CheckCircleOutlined />,
}

const planColors = {
  plan_50: '#4ecdc4',
  plan_200: '#667eea',
  plan_unlimited: '#f59e0b',
}

const RechargePage = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [recharging, setRecharging] = useState(false)
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { user, refreshUser } = useAuth()

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await paymentApi.getPlans()
        setPlans(res.data.data || [])
      } catch {
        message.error('获取充值套餐失败')
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [message])

  const handleRecharge = (plan) => {
    const times = plan.points === 9999 ? '月度无限使用' : `${Math.floor(plan.points / 50)} 次使用`;
    Modal.confirm({
      title: `确认充值`,
      content: `你将支付 ¥${plan.price} 购买「${plan.name}」，获得 ${times}。`,
      okText: `确认支付 ¥${plan.price}`,
      cancelText: '再想想',
      onOk: async () => {
        setRecharging(true)
        try {
          await paymentApi.recharge(plan.id)
          await refreshUser() // 刷新上下文中的用户积分
          message.success(`充值成功！`)
          navigate('/tools')
        } catch {
          message.error('充值失败，请稍后重试')
        } finally {
          setRecharging(false)
        }
      },
    })
  }

  if (loading) {
    return (
      <div className="page-loading">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <main className="recharge-page">
      <div className="recharge-content">
        <div className="recharge-header">
          <Title level={2}>充值中心</Title>
          <Text type="secondary">
            当前积分：<Text strong style={{ color: '#2563eb', fontSize: 18 }}>{user?.points ?? 0}</Text>
          </Text>
        </div>

        <Row gutter={[20, 20]}>
          {plans.map((plan) => (
            <Col xs={24} sm={8} key={plan.id}>
              <Card
                className={`recharge-card ${plan.badge === '超值' ? 'recharge-card-popular' : ''}`}
                hoverable
              >
                {plan.badge && (
                  <Tag
                    color={planColors[plan.id]}
                    className="recharge-badge"
                  >
                    {plan.badge}
                  </Tag>
                )}
                <div className="recharge-plan-header">
                  <div
                    className="recharge-plan-icon"
                    style={{ background: planColors[plan.id] }}
                  >
                    {planIcons[plan.id] || <ThunderboltOutlined />}
                  </div>
                  <Title level={4} className="recharge-plan-name">{plan.name}</Title>
                </div>
                <div className="recharge-plan-price">
                  <span className="recharge-plan-currency">¥</span>
                  <span className="recharge-plan-amount">{plan.price}</span>
                </div>
                <div className="recharge-plan-detail">
                  {plan.points === 9999 ? '30 天内无限使用' : `${Math.floor(plan.points / 50)} 次调用`}
                  {plan.points !== 9999 && (
                    <span className="recharge-plan-unit-price">
                      约 ¥{(parseFloat(plan.price) / Math.floor(plan.points / 50)).toFixed(2)}/次
                    </span>
                  )}
                </div>
                <Button
                  type={plan.badge === '超值' ? 'primary' : 'default'}
                  block
                  size="large"
                  onClick={() => handleRecharge(plan)}
                  loading={recharging}
                  className="recharge-btn"
                >
                  立即充值
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </main>
  )
}

export default RechargePage
