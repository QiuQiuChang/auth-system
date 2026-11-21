import client from './client'

const chatApi = {
  // 存储当前的请求取消函数
  currentAbortController: null,

  sendMessage: (messages) => {
    // 取消上一个请求（如果存在）
    if (chatApi.currentAbortController) {
      chatApi.currentAbortController.abort()
    }

    // 创建新的 AbortController
    const abortController = new AbortController()
    chatApi.currentAbortController = abortController

    return client.post('/api/chat/message', { messages }, {
      signal: abortController.signal
    })
  },

  sendVisionMessage: (messages) => {
    // 取消上一个请求（如果存在）
    if (chatApi.currentAbortController) {
      chatApi.currentAbortController.abort()
    }

    // 创建新的 AbortController
    const abortController = new AbortController()
    chatApi.currentAbortController = abortController

    return client.post('/api/chat/vision', { messages }, {
      signal: abortController.signal
    })
  },

  // 手动取消当前请求（用于停止按钮）
  cancelCurrentRequest: () => {
    if (chatApi.currentAbortController) {
      chatApi.currentAbortController.abort()
      chatApi.currentAbortController = null
    }
  }
}

export default chatApi
