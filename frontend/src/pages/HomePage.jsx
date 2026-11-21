import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Col, Row, Statistic, Typography } from 'antd'
import {
  ThunderboltOutlined,
  DollarOutlined,
  ToolOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useRecharge } from '../contexts/RechargeContext'
import toolApi from '../api/tool'

const { Title, Text, Paragraph } = Typography

const HomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openRecharge } = useRecharge()
  const [tools, setTools] = useState([])
  const [totalTools, setTotalTools] = useState(0)

  useEffect(() => {
    toolApi.list().then((res) => {
      const list = res.data?.data || []
      setTotalTools(list.length)
      setTools(list.slice(0, 6))
    }).catch(() => {})
  }, [])

  const today = new Date()
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`

  return (
    <div className="home-page">
      {/* 欢迎横幅 */}
      <div className="home-hero">
        <div className="home-hero-content">
          <Title level={3} style={{ margin: 0, color: '#fff' }}>
            你好，{user?.username || '用户'} 👋
          </Title>
          <Paragraph style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            {dateStr} · 今天想做点什么？
          </Paragraph>
        </div>
        <ThunderboltOutlined className="home-hero-decor" />
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="home-stats">
        <Col xs={12} sm={8}>
          <Card className="home-stat-card" onClick={() => navigate('/recharge')}>
            <Statistic
              title="剩余积分"
              value={user?.points ?? 0}
              prefix={<DollarOutlined />}
              suffix="点"
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card className="home-stat-card">
            <Statistic
              title="可用工具"
              value={totalTools}
              prefix={<ToolOutlined />}
              suffix="个"
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="home-stat-card home-stat-cta"
            onClick={() => openRecharge()}
          >
            <div className="home-cta-content">
              <Text strong>积分不够用？</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>点击充值 →</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 快捷工具 */}
      <div className="home-section">
        <div className="home-section-header">
          <Title level={5} style={{ margin: 0 }}>⚡ 快捷工具</Title>
          <Text
            type="link"
            style={{ cursor: 'pointer', fontSize: 14 }}
            onClick={() => navigate('/tools')}
          >
            查看全部 <ArrowRightOutlined />
          </Text>
        </div>
        <Row gutter={[12, 12]}>
          {tools.map((tool) => (
            <Col key={tool.slug} xs={12} sm={8} md={6}>
              <Card
                hoverable
                className="home-tool-card"
                onClick={() => navigate(`/tools/${tool.slug}`)}
              >
                <div className="home-tool-icon">
                  <ThunderboltOutlined />
                </div>
                <Text strong className="home-tool-name">{tool.name}</Text>
                <Text type="secondary" className="home-tool-desc">{tool.category}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

    </div>
  )
}

export default HomePage
