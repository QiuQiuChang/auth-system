# AI 模型调用错误修复说明

## 🔍 问题诊断

**错误信息**：
```json
{
  "error": {
    "code": "get_channel_failed",
    "message": "Model agnes-2.0-flash is temporarily unavailable",
    "type": "AgnesAI_error"
  }
}
```

**根本原因**：配置文件中使用的模型 `agnes-2.0-flash` 已经下线或不再可用

## ✅ 已实施的修复

### 更新了模型配置

**文件**: `src/main/resources/application-local.yml`

**修改内容**：
- ❌ 旧模型: `agnes-2.0-flash` → ✅ 新模型: `agnes-3.0-flash`
- ❌ 旧图像模型: `agnes-image-2.1-flash` → ✅ 新图像模型: `agnes-image-2.5-flash`

### 可用的模型列表

从 Agnes AI API 获取的当前可用模型：

| 模型 ID | 类型 | 推荐用途 |
|---------|------|---------|
| `agnes-3.0-flash` | 文本对话 | ⭐ 最新快速模型（推荐） |
| `agnes-2.5-flash` | 文本对话 | 快速响应 |
| `agnes-2.5-pro-alpha` | 文本对话 | 高质量输出（测试版） |
| `agnes-2.5-pro-beta` | 文本对话 | 高质量输出（Beta版） |
| `agnes-image-2.5-flash` | 图像生成 | 快速图像生成 |
| `agnes-image-2.1-flash` | 图像生成 | 图像生成 |
| `agnes-video-2.5` | 视频生成 | 视频生成 |
| `agnes-video-2.5-flash` | 视频生成 | 快速视频生成 |

## 🚀 重启后端服务

**必须重启后端才能加载新配置**

### 方法 1: 通过 IntelliJ IDEA（推荐）

1. 在 IntelliJ IDEA 中找到 `AuthApplication` 运行配置
2. 点击停止按钮 🟥
3. 点击运行按钮 ▶️ 重新启动
4. 查看控制台日志，确认显示：
   ```
   === MultimodalChatService 初始化 ===
   Model: agnes-3.0-flash
   ```

### 方法 2: 命令行重启

```bash
# 1. 停止当前后端
kill -15 21312

# 2. 等待几秒确保进程完全停止
sleep 3

# 3. 重新启动
cd /Users/qiuchang/Desktop/agents-project/backend
./start-backend.sh
```

## 🧪 验证修复

### 1. 检查启动日志

重启后查看日志，应该看到：
```
=== MultimodalChatService 初始化 ===
API URL: https://apihub.agnes-ai.com/v1/chat/completions
Model: agnes-3.0-flash
API Key: sk-ROhLExt...
=====================================

=== AiClientService 初始化 ===
API URL: https://apihub.agnes-ai.com/v1/chat/completions
Model: agnes-3.0-flash
==================================
```

### 2. 测试 API 调用

使用 curl 测试（需要有效的 JWT token）：

```bash
# 先登录获取 token
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"encrypted_password"}' \
  | jq -r '.token')

# 测试聊天接口
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'
```

**预期结果**：
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "content": "你好！我是 AI 助手...",
    "pointsUsed": 0,
    "remainingPoints": 100
  }
}
```

### 3. 测试 Vision 接口

```bash
curl -X POST http://localhost:8080/api/chat/vision \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "这张图片里有什么？"},
          {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
        ]
      }
    ]
  }'
```

## 📊 相关文件

以下文件使用了 AI 模型配置：

1. **配置文件**:
   - `src/main/resources/application.yml` - 默认配置
   - `src/main/resources/application-local.yml` - 本地覆盖配置 ✅ 已修复

2. **服务类**:
   - `com.auth.service.AiClientService` - 通用 AI 聊天服务
   - `com.auth.service.MultimodalChatService` - 多模态聊天（支持图片）
   - `com.auth.service.AiImageService` - 图像生成服务
   - `com.auth.service.AiVideoService` - 视频生成服务

3. **控制器**:
   - `com.auth.controller.ChatController` - 聊天接口

## ⚠️ 注意事项

### 模型版本变更

如果未来需要更换模型版本：

1. 先查询可用模型列表：
   ```bash
   curl -X GET https://apihub.agnes-ai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. 更新 `application-local.yml` 中的模型配置

3. 重启后端服务

### API Key 管理

- ⚠️ **生产环境**: 使用环境变量 `AI_API_KEY`，不要硬编码在配置文件中
- ✅ **开发环境**: `application-local.yml` 已在 `.gitignore` 中，不会提交到版本控制

### 成本控制

当前配置：
- 聊天接口：不扣积分 (`pointsUsed = 0`)
- Vision 接口：不扣积分
- 如需启用积分消耗，修改 `ChatService` 和 `MultimodalChatService` 中的积分逻辑

## 📝 总结

✅ **问题已修复**: 模型配置已更新为可用版本 `agnes-3.0-flash`  
🔄 **需要操作**: 重启后端服务以加载新配置  
✨ **预期结果**: AI 接口调用正常，不再返回 "Model unavailable" 错误

## 🔗 相关文档

- Agnes AI API 文档: https://apihub.agnes-ai.com/docs
- 模型列表: GET https://apihub.agnes-ai.com/v1/models
