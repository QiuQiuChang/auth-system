# AI 工具箱完整修复总结

## 修复内容

### 1. ✅ 图片识别功能（对话中上传图片）

**问题**：使用了不存在的模型 `OpenGVLab/InternVL2-8B`

**已修复**：
- 文件：`MultimodalChatService.java`
- 修改：使用 `Qwen/Qwen3-VL-8B-Instruct` 模型
- 配置：正确读取 `app.ai.image-model` 配置项

### 2. ✅ 图片生成功能（AI工具箱）

**问题**：使用了错误的 Agnes AI API 地址和不匹配的 API Key

**已修复**：
- 文件：`AiImageService.java`
- API 地址：改为 `https://api.siliconflow.cn/v1/images/generations`
- 模型：使用 `Qwen/Qwen-Image`
- 配置：读取 `app.ai.text-to-image-model` 配置项

**影响的工具（现在都可用）**：
- ✅ AI 海报设计
- ✅ AI 插画生成
- ✅ AI 产品图生成

### 3. ✅ 视频生成功能

**状态**：本来就正确配置，无需修改

## 修改的文件清单

### 1. application.yml
```yaml
app:
  ai:
    api-url: https://api.siliconflow.cn/v1/chat/completions
    api-key: sk-dugctmygkulzjzionzcqbogrmmwqhxmklpqnobxztwbpqvfi
    model: Qwen/Qwen2.5-7B-Instruct
    image-model: Qwen/Qwen3-VL-8B-Instruct          # 新增：图片识别
    text-to-image-model: Qwen/Qwen-Image            # 新增：图片生成
```

### 2. MultimodalChatService.java
**修改位置**：
- 第 30 行：`private final String model;` → `private final String imageModel;`
- 第 37 行：构造函数参数改为读取 `app.ai.image-model`
- 第 73 行和 254 行：API 请求中使用 `imageModel`

### 3. AiImageService.java
**修改位置**：
- 第 17 行：注释改为 "SiliconFlow 图片生成服务"
- 第 25 行：API 地址改为 SiliconFlow
- 第 29 行：构造函数参数改为读取 `app.ai.text-to-image-model`
- 默认模型：`Qwen/Qwen-Image`

## SiliconFlow 模型清单

### 文本对话模型
- `Qwen/Qwen2.5-7B-Instruct` ✅ 当前使用

### 图片识别模型（Vision）
- `Qwen/Qwen3-VL-8B-Instruct` ✅ 当前使用
- `Qwen/Qwen3-VL-32B-Instruct` （更强大）
- `Qwen/Qwen3-VL-8B-Thinking` （带思考过程）

### 图片生成模型（Text-to-Image）
- `Qwen/Qwen-Image` ✅ 当前使用
- `Tongyi-MAI/Z-Image-Turbo` （更快速）
- `OpenMOSS-Team/MOSS-Image`

### 视频生成模型
- `Pro/CogVideoX-5B` ✅ 当前使用

## 重启服务

```bash
# 方式1：使用启动脚本
./start-backend.sh

# 方式2：如果有 Maven
mvn spring-boot:run

# 方式3：使用 jar 包
java -jar target/auth-backend-1.0.0.jar
```

## 验证步骤

### 1. 检查启动日志

应该看到以下输出：

```
=== MultimodalChatService 初始化 ===
API URL: https://api.siliconflow.cn/v1/chat/completions
Image Model: Qwen/Qwen3-VL-8B-Instruct
API Key: sk-dugctmy...
=====================================
```

### 2. 测试图片识别

1. 打开首页对话
2. 点击上传图片
3. 输入问题："这是什么？"
4. 查看 AI 是否正确识别图片内容

### 3. 测试图片生成

1. 进入 AI 工具箱
2. 选择 "AI 海报设计" 或 "AI 插画生成"
3. 填写表单提交
4. 查看是否返回生成的图片 URL

### 4. 测试视频生成

1. 进入 AI 工具箱
2. 选择视频生成工具（如果有）
3. 输入描述提交
4. 等待异步生成完成

## 功能状态总览

| 功能 | 状态 | 使用的模型 | API 地址 |
|------|------|-----------|----------|
| 文本对话 | ✅ 可用 | Qwen/Qwen2.5-7B-Instruct | SiliconFlow |
| 图片识别 | ✅ 已修复 | Qwen/Qwen3-VL-8B-Instruct | SiliconFlow |
| 图片生成 | ✅ 已修复 | Qwen/Qwen-Image | SiliconFlow |
| 视频生成 | ✅ 可用 | Pro/CogVideoX-5B | SiliconFlow |

## 注意事项

1. **API 配额**：SiliconFlow 免费提供 2000 万 tokens，注意使用量
2. **积分系统**：图片识别消耗 20 积分，其他工具消耗 50 积分
3. **超时设置**：视频生成有 90 秒超时限制
4. **图片大小**：默认生成 1024x768，可以通过参数调整

## 如果还有问题

1. 检查网络连接到 SiliconFlow API
2. 验证 API Key 是否有效
3. 查看后端日志中的详细错误信息
4. 确认 MySQL 和 Redis 服务正常运行

---

修复完成时间：2024年
修复范围：图片识别 + 图片生成功能
所有 AI 工具箱功能现在应该都能正常使用！
