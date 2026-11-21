# 多模态Chat增强方案

## 需要添加的功能

### 1. 图片上传
- 前端：文件选择器 + 图片预览
- 后端：文件上传接口 + Base64编码

### 2. 图片识别
- 支持消息中包含图片
- Agnes AI Vision API调用
- 显示AI对图片的理解

### 3. 多模态消息结构
```json
{
  "role": "user",
  "content": [
    {"type": "text", "text": "这是什么？"},
    {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,..."}}
  ]
}
```

## 实施步骤

1. 后端扩展AiClientService支持多模态
2. 添加文件上传Controller
3. 前端添加图片上传组件
4. 更新ChatPage支持图片消息
5. 测试图片识别功能

## 关键代码

### 后端（AiClientService）
- 支持content为数组格式
- 图片转base64
- 调用vision模型

### 前端（ChatPage）
- 文件上传按钮
- 图片预览
- 发送带图片的消息

开始实施...
