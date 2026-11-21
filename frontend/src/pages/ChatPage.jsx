import { useState, useRef, useEffect } from 'react'
import { Input, Button, Card, Avatar, Space, Typography, message as antMessage } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined, DeleteOutlined, PictureOutlined, StopOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import chatApi from '../api/chat'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './ChatPage.modern.css'

const { TextArea } = Input
const { Text } = Typography

const ChatPage = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, refreshUser } = useAuth()
  const messagesEndRef = useRef(null)
  const isComposingRef = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chatApi.sendMessage([...messages, userMessage])
      const aiMessage = {
        role: 'assistant',
        content: response.data.data.content
      }
      setMessages(prev => [...prev, aiMessage])
      refreshUser()
    } catch (error) {
      // 如果是请求被取消（发送了新消息）
      if (error.code === 'ERR_CANCELED') {
        setMessages(prev => prev.slice(0, -1))  // 移除被取消的用户消息
        antMessage.info('已取消上一个请求')
      } else {
        antMessage.error(error.response?.data?.message || '发送失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStop = () => {
    chatApi.cancelCurrentRequest()
    setLoading(false)
    antMessage.info('已停止生成')
  }

  const handleClear = () => {
    setMessages([])
    antMessage.success('对话已清空')
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
      if (!loading) {
        handleSend()
      }
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>✨ AI 助手</h2>
        <Space>
          {loading && (
            <Button
              danger
              icon={<StopOutlined />}
              onClick={handleStop}
            >
              停止生成
            </Button>
          )}
          <Button
            icon={<DeleteOutlined />}
            onClick={handleClear}
            disabled={messages.length === 0}
          >
            清空对话
          </Button>
        </Space>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <RobotOutlined style={{ fontSize: 48, color: '#10B981' }} />
            <h3>你好！我是 AI 助手</h3>
            <p style={{ marginBottom: 32 }}>我可以帮你解答问题、编写代码、分析数据</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              maxWidth: '600px',
              width: '100%'
            }}>
              {[
                { icon: '💡', text: '解释一个编程概念' },
                { icon: '🔍', text: '帮我 debug 代码' },
                { icon: '✨', text: '生成创意文案' },
                { icon: '📊', text: '分析数据趋势' }
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
          <div key={index} className={`chat-message ${msg.role}`}>
            <Avatar
              icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              style={{
                backgroundColor: msg.role === 'user' ? '#5B7FFF' : '#10B981',
                color: '#FFFFFF'
              }}
            />
            <Card className="message-content">
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="chat-input-wrapper">
          <Button
            shape="circle"
            icon={<PictureOutlined />}
            className="upload-btn"
            disabled={loading}
            title="上传图片"
          />
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={loading ? "AI 正在思考中..." : "输入消息..."}
            autoSize={{ minRows: 1, maxRows: 6 }}
            disabled={loading}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            disabled={!input.trim() || loading}
            className="send-btn"
          />
        </div>
      </div>
    </div>
  )
}

export default ChatPage
