// 在 handleSend 方法后添加这个新方法

const handleSendStream = async () => {
  if (!input.trim() && uploadedImages.length === 0) return

  const userMessage = {
    role: 'user',
    content: []
  }

  if (input.trim()) {
    userMessage.content.push({ type: 'text', text: input.trim() })
  }

  uploadedImages.forEach(img => {
    userMessage.content.push({
      type: 'image_url',
      image_url: { url: img.url }
    })
  })

  setMessages(prev => [...prev, userMessage])
  setInput('')
  setUploadedImages([])
  setStreaming(true)

  try {
    const response = await fetch('http://localhost:8080/api/chat/vision/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        options: chatOptions
      })
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    
    let assistantMessage = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMessage])
    
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6)
          if (data === '[DONE]') continue
          
          try {
            const chunk = JSON.parse(data)
            const delta = chunk.choices?.[0]?.delta?.content || ''
            
            if (delta) {
              setMessages(prev => {
                const newMessages = [...prev]
                const lastMsg = newMessages[newMessages.length - 1]
                lastMsg.content += delta
                return newMessages
              })
            }
          } catch (e) {}
        } else if (line.startsWith('event: done')) {
          refreshUser()
        }
      }
    }
  } catch (error) {
    antMessage.error('发送失败')
  } finally {
    setStreaming(false)
  }
}
