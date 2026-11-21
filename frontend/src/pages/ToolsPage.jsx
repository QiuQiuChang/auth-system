import { useEffect, useState } from 'react'
import { Button, Card, Tag, Row, Col, Typography, Spin } from 'antd'
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  EditOutlined,
  FileProtectOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
  CodeOutlined,
  BugOutlined,
  ExperimentOutlined,
  ReconciliationOutlined,
  MailOutlined,
  FileWordOutlined,
  FormOutlined,
  ReadOutlined,
  BgColorsOutlined,
  PictureOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { App } from 'antd'
import toolApi from '../api/tool'

const { Title, Paragraph } = Typography

// 图标映射表
const iconMap = {
  FileTextOutlined: <FileTextOutlined />,
  EditOutlined: <EditOutlined />,
  FileProtectOutlined: <FileProtectOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  VideoCameraOutlined: <VideoCameraOutlined />,
  CodeOutlined: <CodeOutlined />,
  BugOutlined: <BugOutlined />,
  ExperimentOutlined: <ExperimentOutlined />,
  ReconciliationOutlined: <ReconciliationOutlined />,
  MailOutlined: <MailOutlined />,
  FileWordOutlined: <FileWordOutlined />,
  FormOutlined: <FormOutlined />,
  ReadOutlined: <ReadOutlined />,
  BgColorsOutlined: <BgColorsOutlined />,
  PictureOutlined: <PictureOutlined />,
  LineChartOutlined: <LineChartOutlined />,
}

const getIcon = (iconName) => {
  return iconMap[iconName] || <ThunderboltOutlined />
}

// 分类颜色映射
const categoryColors = {
  '内容创作': '#ff6b6b',
  '办公效率': '#4ecdc4',
  '法律服务': '#45b7d1',
  '创意设计': '#f39c12',
  '视频创作': '#9b59b6',
  '开发工具': '#2ecc71',
  '智能分析': '#f7b731',
}

const ToolsPage = () => {
  const [tools, setTools] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const navigate = useNavigate()
  const { message } = App.useApp()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toolsRes, catRes] = await Promise.all([
          toolApi.list(),
          toolApi.categories(),
        ])
        setTools(toolsRes.data.data || [])
        setCategories(catRes.data.data || [])
      } catch {
        message.error('获取工具列表失败')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [message])

  const filteredTools = activeCategory
    ? tools.filter((t) => t.category === activeCategory)
    : tools

  if (loading) {
    return (
      <div className="page-loading">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <main className="tools-page">
      <div className="tools-content">
        <header className="tools-header">
          <Title level={2} className="tools-page-title">AI 工具箱</Title>
          <Paragraph className="tools-page-subtitle">
            选择一个工具开始使用，输入信息即可生成内容
          </Paragraph>
        </header>

        {categories.length > 0 && (
          <div className="tools-categories">
            <Tag
              color={activeCategory === null ? 'blue' : 'default'}
              className="tools-category-tag"
              onClick={() => setActiveCategory(null)}
              style={{ cursor: 'pointer' }}
            >
              全部
            </Tag>
            {categories.map((cat) => (
              <Tag
                key={cat}
                color={activeCategory === cat ? 'blue' : 'default'}
                className="tools-category-tag"
                onClick={() => setActiveCategory(cat)}
                style={{ cursor: 'pointer' }}
              >
                {cat}
              </Tag>
            ))}
          </div>
        )}

        <Row gutter={[20, 20]} className="tools-grid">
          {filteredTools.map((tool) => (
            <Col xs={24} sm={12} lg={8} key={tool.id}>
              <Card
                hoverable
                className="tool-card"
                onClick={() => navigate(`/tools/${tool.slug}`)}
              >
                <div className="tool-card-inner">
                  <div className="tool-card-icon" style={{ background: categoryColors[tool.category] || '#667eea' }}>
                    {getIcon(tool.icon)}
                  </div>
                  <div className="tool-card-body">
                    <Title level={5} className="tool-card-name">{tool.name}</Title>
                    <Paragraph className="tool-card-desc" ellipsis={{ rows: 2 }}>
                      {tool.description}
                    </Paragraph>
                    {tool.category && (
                      <Tag color={categoryColors[tool.category] || 'blue'}>
                        {tool.category}
                      </Tag>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredTools.length === 0 && (
          <div className="tools-empty">
            <Paragraph type="secondary">暂无可用工具</Paragraph>
          </div>
        )}

        <div className="tools-back">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/home')}
            type="link"
          >
            返回主页
          </Button>
        </div>
      </div>
    </main>
  )
}

export default ToolsPage
