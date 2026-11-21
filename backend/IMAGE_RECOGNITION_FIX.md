# 图片识别报错修复说明

## 问题原因

1. **模型不存在**：配置文件中使用的图片识别模型 `OpenGVLab/InternVL2-8B` 在 SiliconFlow API 中不存在
2. **配置错误**：`MultimodalChatService` 使用了错误的配置项 `app.ai.model` 而不是 `app.ai.image-model`

## SiliconFlow 支持的视觉模型

经过测试，SiliconFlow 当前支持的视觉模型包括：
- `Qwen/Qwen3-VL-8B-Instruct` ✅ 推荐（速度快、效果好）
- `Qwen/Qwen3-VL-32B-Instruct` （更强但更慢）
- `Qwen/Qwen3-VL-8B-Thinking` （带思考过程）
- `Qwen/Qwen3-VL-32B-Thinking`
- `PaddlePaddle/PaddleOCR-VL-1.5` （OCR专用）

## 已修复的文件

### 1. application.yml
**位置**: `src/main/resources/application.yml:62`

**修改**:
```yaml
# 修改前
image-model: ${AI_IMAGE_MODEL:OpenGVLab/InternVL2-8B}

# 修改后
image-model: ${AI_IMAGE_MODEL:Qwen/Qwen3-VL-8B-Instruct}
```

### 2. MultimodalChatService.java
**位置**: `src/main/java/com/auth/service/MultimodalChatService.java`

**修改内容**:
1. 字段名从 `model` 改为 `imageModel`
2. 构造函数参数从 `@Value("${app.ai.model}")` 改为 `@Value("${app.ai.image-model}")`
3. 默认值从 `agnes-2.0-flash` 改为 `Qwen/Qwen3-VL-8B-Instruct`
4. 所有使用 `model` 变量的地方改为 `imageModel`（共 3 处）

**关键代码**:
```java
// 修改前
private final String model;
@Value("${app.ai.model:agnes-2.0-flash}") String model

// 修改后
private final String imageModel;
@Value("${app.ai.image-model:Qwen/Qwen3-VL-8B-Instruct}") String imageModel
```

## 下一步操作

1. **重新编译项目**:
   ```bash
   mvn clean package -DskipTests
   ```

2. **重启后端服务**:
   ```bash
   ./start-backend.sh
   ```

3. **测试图片识别功能**:
   - 在首页对话中上传图片
   - 发送包含图片的消息
   - 验证 AI 是否正确识别图片内容

## 验证方法

启动后检查日志中是否显示：
```
=== MultimodalChatService 初始化 ===
API URL: https://api.siliconflow.cn/v1/chat/completions
Image Model: Qwen/Qwen3-VL-8B-Instruct
API Key: sk-dugctmy...
=====================================
```

如果看到 `Image Model: Qwen/Qwen3-VL-8B-Instruct`，说明配置正确。

## 相关文档

- SiliconFlow API 文档: https://docs.siliconflow.cn/
- Qwen3-VL 模型说明: https://github.com/QwenLM/Qwen3-VL
