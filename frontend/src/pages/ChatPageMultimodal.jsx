import { useState, useRef, useEffect } from 'react'
import { Input, Button, Card, Avatar, Upload, Image, message as antMessage, Drawer, Slider, Switch, Space, Typography } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined, DeleteOutlined, PictureOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import chatApi from '../api/chat'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './ChatPage.modern.css'

const { TextArea } = Input
const { Text } = Typography

const ChatPageMultimodal = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [chatOptions, setChatOptions] = useState({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    stream: true,
    enableThinking: false,
    thinkingBudget: 2048
  })
  const [showSettings, setShowSettings] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const { user, refreshUser } = useAuth()
  const messagesEndRef = useRef(null)
  const isComposingRef = useRef(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageUpload = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      })
      const result = await response.json()
      if (result.code === 200) {
        setUploadedImages(prev => [...prev, result.data])
        antMessage.success('图片上传成功')
      }
    } catch (error) {
      antMessage.error('图片上传失败')
    }
    return false
  }

  const handleCompositionStart = () => {
    isComposingRef.current = true
  }

  const handleCompositionEnd = () => {
    isComposingRef.current = false
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault()
      chatOptions.stream ? handleSendStream() : handleSend()
    }
  }

  const handleSend = async () => {
    if (!input.trim() && uploadedImages.length === 0) return

    const messageContent = []
    if (input.trim()) {
      messageContent.push({ type: 'text', text: input.trim() })
    }
    uploadedImages.forEach(img => {
      messageContent.push({ 
        type: 'image_url', 
        image_url: { url: img.url } 
      })
    })

    const userMessage = {
      role: 'user',
      content: messageContent,
      images: uploadedImages.map(img => img.url)
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setUploadedImages([])
    setLoading(true)

    // 添加加载动画
    const loadingMsg = { role: 'assistant', content: [{ type: 'text', text: '' }], loading: true }
    setMessages(prev => [...prev, loadingMsg])

    try {
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await chatApi.sendVisionMessage(apiMessages)

      // 移除加载消息并添加真实响应
      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { role: 'assistant', content: [{ type: 'text', text: response.data.data.content }] }
      ])
      refreshUser()
    } catch (error) {
      setMessages(prev => prev.filter(m => !m.loading))
      antMessage.error(error.response?.data?.message || '发送失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSendStream = async () => {
    console.log('🚀 流式请求开始')
    if (!input.trim() && uploadedImages.length === 0) return

    const messageContent = []
    if (input.trim()) {
      messageContent.push({ type: 'text', text: input.trim() })
    }
    uploadedImages.forEach(img => {
      messageContent.push({
        type: 'image_url',
        image_url: { url: img.url }
      })
    })

    const userMessage = {
      role: 'user',
      content: messageContent,
      images: uploadedImages.map(img => img.url)
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setUploadedImages([])
    setStreaming(true)

    // 添加加载中的 assistant 消息
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: [{ type: 'text', text: '' }],
      loading: true
    }])

    try {
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await fetch('/api/chat/vision/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          messages: apiMessages,
          options: chatOptions
        })
      })

      console.log('📡 收到响应，状态:', response.status)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEvent = 'message'

      console.log('📖 开始读取流...')

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('✅ 流读取完成')
          break
        }

        console.log('📦 收到数据块，大小:', value.length)

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.substring(6).trim()
            continue
          }

          if (line.startsWith('data:')) {
            const data = line.substring(5).trim()

            if (currentEvent === 'error') {
              console.error('❌ 错误:', data)
              setMessages(prev => {
                const updated = [...prev]
                const lastIndex = updated.length - 1
                if (updated[lastIndex]?.loading) {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    loading: false,
                    content: [{ type: 'text', text: 'AI 响应超时，请稍后重试' }]
                  }
                }
                return updated
              })
              antMessage.error('AI 响应超时')
              setStreaming(false)
              return
            }

            if (currentEvent === 'done') {
              refreshUser()
              continue
            }

            if (data === '[DONE]') continue

            try {
              const chunk = JSON.parse(data)
              const delta = chunk.choices?.[0]?.delta?.content || ''
              if (delta) {
                setMessages(prev => {
                  const updated = [...prev]
                  const lastIndex = updated.length - 1
                  if (updated[lastIndex]?.role === 'assistant') {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      loading: false,
                      content: [{ type: 'text', text: (updated[lastIndex].content[0]?.text || '') + delta }]
                    }
                  }
                  return updated
                })
              }
            } catch (e) {
              console.error('解析失败:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('流式请求失败:', error)

      // 移除加载状态，显示错误提示
      setMessages(prev => {
        const updated = [...prev]
        const lastIndex = updated.length - 1
        if (updated[lastIndex]?.role === 'assistant' && updated[lastIndex]?.loading) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            loading: false,
            content: [{
              type: 'text',
              text: '抱歉，AI 响应超时，请稍后重试'
            }]
          }
        }
        return updated
      })

      antMessage.error('AI 响应超时，请稍后重试')
    } finally {
      setStreaming(false)
    }
  }

  const renderMessageContent = (content) => {
    if (typeof content === 'string') return <p>{content}</p>

    return content.map((item, idx) => {
      if (item.type === 'text') {
        return <ReactMarkdown key={idx} components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : <code className={className} {...props}>{children}</code>
          }
        }}>{item.text}</ReactMarkdown>
      }
      if (item.type === 'image_url') {
        return <Image key={idx} src={item.image_url.url} style={{ maxWidth: 300, marginTop: 8 }} />
      }
      return null
    })
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>AI 助手（多模态）</h2>
        <Space>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setShowSettings(true)}
          >
            设置
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => { setMessages([]); setUploadedImages([]) }}
          >
            清空
          </Button>
        </Space>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <RobotOutlined style={{ fontSize: 48, color: '#10A37F' }} />
            <h3>多模态 AI 助手</h3>
            <p style={{ marginBottom: 32 }}>支持文字对话和图片识别，可上传图片进行分析</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              maxWidth: '600px',
              width: '100%'
            }}>
              {[
                { icon: '🖼️', text: '识别图片内容' },
                { icon: '📝', text: '提取图片文字' },
                { icon: '🎨', text: '分析设计元素' },
                { icon: '🔢', text: '读取图表数据' }
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => setInput(item.text)}
                  style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-user)'
                    e.currentTarget.style.borderColor = 'var(--accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)'
                    e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role} ${msg.loading ? 'loading' : ''}`}>
            <Avatar
              icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              style={{
                backgroundColor: msg.role === 'user' ? '#2B2B2B' : '#10A37F',
                color: msg.role === 'user' ? '#E8E8E8' : '#FFFFFF'
              }}
            />
            <Card className="message-content">
              {msg.loading ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                renderMessageContent(msg.content)
              )}
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="chat-input-box">
          {uploadedImages.length > 0 && (
            <div className="chat-input-previews">
              {uploadedImages.map((img, i) => (
                <div key={i} className="chat-input-preview-item">
                  <Image src={img.url} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  <button
                    type="button"
                    className="chat-input-preview-remove"
                    onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                    aria-label="移除图片"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <TextArea
            className="chat-input-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="向 AI 助手 发消息（Shift + Enter 换行）"
            autoSize={{ minRows: 2, maxRows: 8 }}
            variant="borderless"
            disabled={loading}
          />

          <div className="chat-input-toolbar">
            <div className="chat-input-tools">
              <Upload beforeUpload={handleImageUpload} showUploadList={false} accept="image/*">
                <button type="button" className="chat-tool-btn" disabled={loading} aria-label="添加附件">
                  <PlusOutlined />
                </button>
              </Upload>
              <Upload beforeUpload={handleImageUpload} showUploadList={false} accept="image/*">
                <button type="button" className="chat-tool-btn" disabled={loading} aria-label="上传图片">
                  <PictureOutlined />
                </button>
              </Upload>
            </div>
            <button
              type="button"
              className="chat-send-btn"
              onClick={chatOptions.stream ? handleSendStream : handleSend}
              disabled={(streaming || loading) || (!input.trim() && uploadedImages.length === 0)}
              aria-label="发送"
            >
              <SendOutlined />
            </button>
          </div>
        </div>
      </div>

      <Drawer
        title="聊天设置"
        placement="right"
        open={showSettings}
        onClose={() => setShowSettings(false)}
        width={380}
        className="chat-settings-drawer"
      >
        <Space direction="vertical" style={{ width: '100%' }} size={0}>
          <div className="settings-section">
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 14 }}>Temperature</Text>
                <Text style={{ fontSize: 14, color: 'var(--accent)' }}>{chatOptions.temperature}</Text>
              </div>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={chatOptions.temperature}
                onChange={(v) => setChatOptions({...chatOptions, temperature: v})}
              />
              <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
                控制输出随机性。较低的值使输出更加确定和一致,较高的值增加创造性和多样性
              </Text>
            </Space>
          </div>

          <div className="settings-section">
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 14 }}>Top P</Text>
                <Text style={{ fontSize: 14, color: 'var(--accent)' }}>{chatOptions.topP}</Text>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={chatOptions.topP}
                onChange={(v) => setChatOptions({...chatOptions, topP: v})}
              />
              <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
                控制核采样范围。值越低输出越聚焦于高概率词汇
              </Text>
            </Space>
          </div>

          <div className="settings-section">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Switch
                    checked={chatOptions.stream}
                    onChange={(checked) => setChatOptions({...chatOptions, stream: checked})}
                  />
                  <Text strong style={{ fontSize: 14 }}>流式输出</Text>
                </div>
                <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {chatOptions.stream ? '已启用' : '已关闭'}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5, marginLeft: 40 }}>
                实时逐字显示 AI 回复,提升响应体验
              </Text>
            </Space>
          </div>

          <div className="settings-section">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Switch
                    checked={chatOptions.enableThinking}
                    onChange={(checked) => setChatOptions({...chatOptions, enableThinking: checked})}
                  />
                  <Text strong style={{ fontSize: 14 }}>思维链模式</Text>
                </div>
                <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {chatOptions.enableThinking ? '已启用' : '已关闭'}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5, marginLeft: 40 }}>
                展示 AI 推理过程,适合复杂任务和深度分析
              </Text>
            </Space>
          </div>

          <div className="settings-section">
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 14 }}>最大 Token 数</Text>
                <Text style={{ fontSize: 14, color: 'var(--accent)' }}>{chatOptions.maxTokens}</Text>
              </div>
              <Slider
                min={512}
                max={4096}
                step={256}
                value={chatOptions.maxTokens}
                onChange={(v) => setChatOptions({...chatOptions, maxTokens: v})}
              />
              <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
                控制单次回复的最大长度。建议:简短回复 512-1024,详细回复 2048+
              </Text>
            </Space>
          </div>
        </Space>
      </Drawer>
    </div>
  )
}

export default ChatPageMultimodal
