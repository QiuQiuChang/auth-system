import { useEffect, useState } from 'react'
import { Button, Form, Input, Modal, Select, Spin, Typography, Card, Breadcrumb, Tooltip } from 'antd'
import {
  ArrowLeftOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { App } from 'antd'
import toolApi from '../api/tool'
import { useAuth } from '../contexts/AuthContext'
import { useRecharge } from '../contexts/RechargeContext'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input
const TOOL_COST_POINTS = 50
const VIDEO_DURATION_FIELD = {
  name: 'duration',
  label: '视频时长',
  type: 'select',
  required: false,
  placeholder: '默认 10 秒',
  options: [
    { value: '5', label: '5 秒' },
    { value: '10', label: '10 秒（推荐）' },
    { value: '15', label: '15 秒' },
    { value: '18', label: '18 秒（最长）' },
  ],
}

const ToolExecutePage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { refreshUser } = useAuth()
  const { openRecharge } = useRecharge()
  const [form] = Form.useForm()

  const [tool, setTool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const res = await toolApi.getBySlug(slug)
        setTool(res.data.data)
      } catch {
        message.error('获取工具信息失败')
        navigate('/tools')
      } finally {
        setLoading(false)
      }
    }
    fetchTool()
  }, [slug, message, navigate])

  const onFinish = async (values) => {
    setExecuting(true)
    setResult(null)
    try {
      const inputs = { ...values }
      const res = await toolApi.execute(slug, inputs)
      const data = res.data.data
      setResult(data)
      await refreshUser()
      message.success(`生成成功！消耗 ${TOOL_COST_POINTS} 积分，剩余 ${data.remainingPoints} 积分`)
    } catch (error) {
      const status = error.response?.status
      if (status === 402) {
        const msg = error.response?.data?.message || '积分不足'
        Modal.warning({
          title: '提示',
          content: msg,
          okText: '去充值',
          onOk: () => openRecharge(),
        })
      } else if (status === 401 || status === 403) {
        message.error('登录已过期或 token 无效，请重新登录')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        // 尝试提取后端错误消息
        let msg = '执行失败，请稍后重试'
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            // JSON 解析失败，原始字符串
            try {
              const parsed = JSON.parse(error.response.data)
              msg = parsed.message || msg
            } catch {
              msg = '服务器响应异常 (状态码: ' + status + ')'
            }
          } else {
            msg = error.response.data.message || msg
          }
        } else if (error.message) {
          msg = '网络错误: ' + error.message
        }
        message.error(msg)
      }
    } finally {
      setExecuting(false)
    }
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.result)
      message.success('已复制到剪贴板')
    }
  }

  const handleClear = () => {
    setResult(null)
    form.resetFields()
  }

  const renderField = (field) => {
    const { name, label, type, required, placeholder, options } = field
    const rules = required ? [{ required: true, message: `请输入${label}` }] : []
    // textarea 和 select 占满整行
    const fullRow = type === 'textarea' || type === 'select'
    const className = fullRow ? 'ant-form-item-full-row' : ''

    switch (type) {
      case 'textarea':
        return (
          <Form.Item key={name} name={name} label={label} rules={rules} className={className}>
            <TextArea rows={4} placeholder={placeholder || `请输入${label}`} />
          </Form.Item>
        )
      case 'select':
        return (
          <Form.Item key={name} name={name} label={label} rules={rules} className={className}>
            <Select placeholder={placeholder || `请选择${label}`}>
              {(options || []).map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )
      default:
        return (
          <Form.Item key={name} name={name} label={label} rules={rules}>
            <Input placeholder={placeholder || `请输入${label}`} />
          </Form.Item>
        )
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <Spin size="large" />
      </div>
    )
  }

  if (!tool) return null

  const rawInputFields = tool.inputFields || []
  const hasDurationField = rawInputFields.some((field) => field.name === 'duration')
  const inputFields = tool.outputType === 'video' && !hasDurationField
    ? [...rawInputFields, VIDEO_DURATION_FIELD]
    : rawInputFields

  return (
    <main className="tool-execute-page">
      <div className="tool-execute-content">
        <Breadcrumb
          className="tool-execute-breadcrumb"
          items={[
            { title: <Link to="/tools">AI 工具箱</Link> },
            { title: tool.name },
          ]}
        />

        {/* 表单区域 */}
        <Card className="tool-execute-card">
          <div className="tool-execute-header">
            <div className="tool-execute-title-row">
              <ThunderboltOutlined className="tool-execute-icon" />
              <div>
                <Title level={4} className="tool-execute-name">{tool.name}</Title>
                <Paragraph className="tool-execute-desc">{tool.description}</Paragraph>
              </div>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="tool-execute-form"
          >
            <div className="tool-execute-fields">
              {inputFields.map(renderField)}
            </div>

            <div className="tool-execute-actions">
              <Button
                type="primary"
                htmlType="submit"
                loading={executing}
                icon={<SendOutlined />}
                size="large"
              >
                {executing ? '正在生成...' : '开始生成'}
              </Button>
              <Tooltip title="清空表单和结果">
                <Button
                  icon={<DeleteOutlined />}
                  size="large"
                  onClick={handleClear}
                  disabled={executing}
                >
                  清空
                </Button>
              </Tooltip>
              <Text type="secondary" className="tool-execute-cost">
                每次生成消耗 {TOOL_COST_POINTS} 积分
              </Text>
            </div>
          </Form>
        </Card>

        {/* 结果区域 — 有结果时才显示 */}
        {result && (
          <Card className="tool-execute-result-card">
            <div className="tool-execute-result-header">
              <div className="tool-execute-result-title">
                <Title level={5}>生成结果</Title>
                <Text type="secondary" className="tool-execute-result-word-count">
                  约 {result.result?.length || 0} 字
                </Text>
              </div>
              <div className="tool-execute-result-toolbar">
                <Tooltip title="复制全部内容">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                  >
                    复制
                  </Button>
                </Tooltip>
                <Tooltip title="重新生成">
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={() => form.submit()}
                    loading={executing}
                  >
                    重新生成
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div className="tool-execute-result-body">
              <div className="tool-execute-result-content">
                {result.outputType === 'video' ? (
                  <div className="video-result-wrapper">
                    <div className="video-container">
                      <video
                        controls
                        controlsList="nodownload"
                        style={{ width: '100%', display: 'block', borderRadius: '8px 8px 0 0' }}
                        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect fill='%23111' width='640' height='360'/%3E%3Ctext fill='%23666' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48'%3E▶%3C/text%3E%3C/svg%3E"
                      >
                        <source src={result.result} type="video/mp4" />
                        您的浏览器不支持视频播放
                      </video>
                    </div>
                    <div className="video-result-actions">
                      <Text type="secondary" style={{ fontSize: 12, flex: 1 }}>
                        <ThunderboltOutlined /> AI 生成 · 视频链接 24 小时内有效
                      </Text>
                      <Button
                        type="primary"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(result.result, '_blank')}
                      >
                        下载视频
                      </Button>
                    </div>
                  </div>
                ) : result.outputType === 'image' ? (
                  <div className="image-result-wrapper">
                    <div style={{ background: '#f5f5f5', borderRadius: 8, textAlign: 'center', padding: 16 }}>
                      <img
                        src={result.result}
                        alt="AI 生成图片"
                        style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 4, cursor: 'pointer' }}
                        onClick={() => window.open(result.result, '_blank')}
                      />
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12, flex: 1 }}>
                        点击图片查看大图 · 1 小时内有效
                      </Text>
                      <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(result.result, '_blank')}
                      >
                        保存图片
                      </Button>
                    </div>
                  </div>
                ) : (
                  <pre className="text-content">{result.result}</pre>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="tool-execute-back">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/tools')}
            type="link"
          >
            返回工具列表
          </Button>
        </div>

      </div>
    </main>
  )
}

export default ToolExecutePage
