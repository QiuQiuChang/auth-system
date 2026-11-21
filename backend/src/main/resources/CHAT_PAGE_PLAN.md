# 多模态Chat页面改造计划

## 目标
将当前简单的HomePage改造成类似Cursor的多模态聊天界面

## 核心功能
1. ✅ 多轮对话
2. ✅ 文本输入
3. 🔄 文件上传（图片、文档）
4. 🔄 流式输出
5. ✅ 对话历史
6. ✅ Markdown渲染
7. ✅ 代码高亮

## 技术架构

### 后端（Spring Boot）
- 新增 ChatController
- 新增 ChatService（多轮对话管理）
- 扩展 AiClientService（支持流式、多模态）
- 新增 FileUploadController

### 前端（React）
- 改造 HomePage → ChatPage
- 新增组件：
  - ChatInterface（主容器）
  - MessageList（消息列表）
  - MessageItem（单条消息）
  - InputArea（输入区域）
  - FileUpload（文件上传）

### 数据模型
```java
Message {
  id, role(user/assistant), content, 
  attachments[], timestamp
}

Conversation {
  id, userId, messages[], createdAt
}
```

## 实施阶段

### Phase 1: 基础聊天（优先）
- [x] 规划方案
- [ ] 后端基础API
- [ ] 前端基础UI
- [ ] 文本对话功能

### Phase 2: 增强功能
- [ ] Markdown + 代码高亮
- [ ] 对话历史保存
- [ ] 流式输出

### Phase 3: 多模态
- [ ] 文件上传
- [ ] 图片识别
- [ ] 文档解析

等待planner详细方案...
