import { useEffect, useRef, useState } from 'react'
import { Modal, Button, Spin, Tag, Row, Col } from 'antd'
import { CrownOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { App } from 'antd'
import paymentApi from '../api/payment'
import { useAuth } from '../contexts/AuthContext'

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

const QR_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <rect width="160" height="160" fill="#fff" rx="8"/>
    <rect x="20" y="20" width="40" height="40" fill="#000" rx="4"/>
    <rect x="100" y="20" width="40" height="40" fill="#000" rx="4"/>
    <rect x="20" y="100" width="40" height="40" fill="#000" rx="4"/>
    <rect x="60" y="30" width="40" height="4" fill="#000"/>
    <rect x="30" y="60" width="4" height="40" fill="#000"/>
    <rect x="126" y="60" width="4" height="40" fill="#000"/>
    <rect x="60" y="110" width="4" height="20" fill="#000"/>
    <rect x="60" y="126" width="40" height="4" fill="#000"/>
    <rect x="100" y="80" width="40" height="4" fill="#000"/>
    <rect x="100" y="96" width="4" height="24" fill="#000"/>
    <rect x="70" y="70" width="20" height="20" fill="#000" rx="2"/>
    <rect x="70" y="95" width="10" height="10" fill="#000"/>
    <rect x="85" y="95" width="5" height="5" fill="#000"/>
  </svg>`
)}`

const RechargeModal = ({ open, onClose }) => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('select')       // 'select' | 'pay'
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [paying, setPaying] = useState(false)
  const { message } = App.useApp()
  const { user, refreshUser } = useAuth()
  const messageRef = useRef(message)
  useEffect(() => { messageRef.current = message }, [message])

  useEffect(() => {
    if (open) {
      setLoading(true)
      setStep('select')
      setSelectedPlan(null)
      refreshUser()  // 打开弹窗时同步最新积分
      paymentApi.getPlans()
        .then((res) => {
          const list = res.data.data || []
          setPlans(list)
          const mid = list.find(p => p.badge === '超值') || list[1] || list[0] || null
          setSelectedPlan(mid)
        })
        .catch(() => messageRef.current.error('获取充值套餐失败'))
        .finally(() => setLoading(false))
    }
  }, [open])

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    setStep('pay')
  }

  const handlePay = async () => {
    if (!selectedPlan) return
    setPaying(true)
    try {
      await paymentApi.recharge(selectedPlan.id)
      await refreshUser()
      const times = selectedPlan.points === 9999 ? '月度无限' : `${Math.floor(selectedPlan.points / 50)} 次`;
      message.success(`充值成功！+${times}已到账`)
      onClose()
    } catch {
      message.error('充值失败，请稍后重试')
    } finally {
      setPaying(false)
    }
  }

  const handleBack = () => {
    setStep('select')
  }

  return (
    <Modal
      title={step === 'pay' ? '扫码支付' : '充值中心'}
      open={open}
      onCancel={() => { setStep('select'); onClose() }}
      footer={null}
      width={step === 'pay' ? 420 : 720}
      destroyOnHidden
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : step === 'pay' && selectedPlan ? (
        /* 第二步：支付二维码 */
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 16, color: '#64748b', fontSize: 14 }}>
            套餐：<strong style={{ color: '#0f172a' }}>{selectedPlan.name}</strong>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
            ¥{selectedPlan.price}
          </div>
          <img
            src={QR_PLACEHOLDER}
            alt="支付二维码"
            style={{ width: 160, height: 160, margin: '0 auto 16px', display: 'block', border: '1px solid #e2e8f0', borderRadius: 8 }}
          />
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 24 }}>
            请使用微信或支付宝扫码支付
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button onClick={handleBack} size="large">返回</Button>
            <Button type="primary" size="large" onClick={handlePay} loading={paying}>
              确认已支付
            </Button>
          </div>
        </div>
      ) : (
        /* 第一步：套餐选择 */
        <>
          <div style={{ textAlign: 'center', marginBottom: 20, color: '#64748b' }}>
            当前积分：<strong style={{ color: '#2563eb', fontSize: 18 }}>{user?.points ?? 0}</strong>
            　{selectedPlan && <Tag color="blue">已选：{selectedPlan.name}</Tag>}
          </div>
          <Row gutter={[16, 16]} align="stretch" style={{ alignItems: 'stretch' }}>
            {plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id
              return (
                <Col xs={24} sm={8} key={plan.id} style={{ display: 'flex' }}>
                  <div
                    className={`recharge-plan-card ${plan.badge === '超值' ? 'recharge-plan-popular' : ''} ${isSelected ? 'recharge-plan-selected' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                    style={{ cursor: 'pointer' }}
                  >
                    {plan.badge && (
                      <Tag color={planColors[plan.id]} className="recharge-plan-badge">
                        {plan.badge}
                      </Tag>
                    )}
                    <div
                      className="recharge-plan-card-icon"
                      style={{ background: planColors[plan.id] }}
                    >
                      {planIcons[plan.id] || <ThunderboltOutlined />}
                    </div>
                    <div className="recharge-plan-card-name">{plan.name}</div>
                    <div className="recharge-plan-card-price">
                      <span className="recharge-plan-card-currency">¥</span>
                      {plan.price}
                    </div>
                    <div className="recharge-plan-card-desc">
                      {plan.points === 9999 ? '30 天无限使用' : `${Math.floor(plan.points / 50)} 次调用`}
                      {plan.points !== 9999 && (
                        <div className="recharge-plan-card-unit">
                          约 ¥{(parseFloat(plan.price) / Math.floor(plan.points / 50)).toFixed(2)}/次
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              )
            })}
          </Row>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              disabled={!selectedPlan}
              onClick={() => selectedPlan && handleSelectPlan(selectedPlan)}
            >
              {selectedPlan ? `确认支付 ¥${selectedPlan.price}` : '请先选择套餐'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}

export default RechargeModal
