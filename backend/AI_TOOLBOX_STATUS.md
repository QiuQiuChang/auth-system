# AI 工具箱状态分析

## 工具列表

根据 `insert_image_tools.py`，工具箱包含以下工具：

1. **AI 海报设计** (`poster-gen`) - 输出类型: `image`
2. **AI 插画生成** (`illustration-gen`) - 输出类型: `image`
3. **AI 产品图生成** (`product-gen`) - 输出类型: `image`

## 当前问题分析

### ❌ 图片生成工具 - 存在严重问题

**问题**：`AiImageService.java` 使用了**错误的 API 地址**

```java
// 当前配置（错误）
private static final String IMAGE_API = "https://apihub.agnes-ai.com/v1/images/generations";
```

**问题详情**：
1. 使用的是 Agnes AI 的 API 地址，而不是 SiliconFlow
2. 配置注入使用了 `@Value("${app.ai.image-model:agnes-image-2.1-flash}")`，默认值是 Agnes 的模型
3. 但实际的 API Key 是 SiliconFlow 的，**两者不匹配**
4. Agnes AI 可能需要单独的 API Key

**影响的工具**：
- ✗ AI 海报设计（无法使用）
- ✗ AI 插画生成（无法使用）
- ✗ AI 产品图生成（无法使用）

### ✅ 视频生成工具 - 配置正确

**配置**：
```java
private static final String VIDEO_API = "https://api.siliconflow.cn/v1/videos/generations";
```

- 使用 SiliconFlow 的视频生成 API
- API Key 配置正确
- 支持异步提交和轮询查询

**影响的工具**：
- ✓ 视频生成工具（可以使用）

## 解决方案

### 方案 1：使用 SiliconFlow 的图片生成 API（推荐）

修改 `AiImageService.java`：

```java
// 修改 API 地址
private static final String IMAGE_API = "https://api.siliconflow.cn/v1/images/generations";

// 修改模型配置
public AiImageService(
    @Value("${app.ai.api-key}") String apiKey,
    @Value("${app.ai.text-to-image-model:black-forest-labs/FLUX.1-schnell}") String imageModel
) {
    // ...
}
```

**SiliconFlow 支持的图片生成模型**：
- `black-forest-labs/FLUX.1-schnell` ✅ 推荐（快速、免费）
- `black-forest-labs/FLUX.1-dev`
- `stabilityai/stable-diffusion-3-5-large`
- `stabilityai/stable-diffusion-xl-base-1.0`

### 方案 2：使用 Agnes AI（需要额外配置）

如果要继续使用 Agnes AI，需要：
1. 获取 Agnes AI 的 API Key
2. 在 `application.yml` 中添加单独的配置：
```yaml
app:
  agnes:
    api-key: ${AGNES_API_KEY:your-agnes-key}
    image-model: agnes-image-2.1-flash
```

## 配置文件需要更新

### application.yml

```yaml
app:
  ai:
    api-url: ${AI_API_URL:https://api.siliconflow.cn/v1/chat/completions}
    api-key: ${AI_API_KEY:your-siliconflow-api-key-here}
    model: ${AI_MODEL:Qwen/Qwen2.5-7B-Instruct}
    image-model: ${AI_IMAGE_MODEL:Qwen/Qwen3-VL-8B-Instruct}
    # 新增：文生图模型配置
    text-to-image-model: ${AI_TEXT_TO_IMAGE_MODEL:black-forest-labs/FLUX.1-schnell}
    video-model: ${AI_VIDEO_MODEL:Pro/CogVideoX-5B}
```

## 测试建议

### 1. 测试 SiliconFlow 图片生成 API

```bash
curl -X POST "https://api.siliconflow.cn/v1/images/generations" \
  -H "Authorization: Bearer sk-dugctmygkulzjzionzcqbogrmmwqhxmklpqnobxztwbpqvfi" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "black-forest-labs/FLUX.1-schnell",
    "prompt": "一只可爱的小猫",
    "image_size": "1024x1024",
    "num_inference_steps": 20
  }'
```

### 2. 查询 SiliconFlow 支持的图片模型

```bash
curl "https://api.siliconflow.cn/v1/models" \
  -H "Authorization: Bearer sk-dugctmygkulzjzionzcqbogrmmwqhxmklpqnobxztwbpqvfi" | \
  jq '.data[] | select(.type == "image") | {id: .id, type: .type}'
```

## 总结

| 功能 | 状态 | 问题 | 优先级 |
|------|------|------|--------|
| 图片识别（对话） | ✅ 已修复 | 模型配置错误 | 已完成 |
| 图片生成（工具箱） | ❌ 无法使用 | API 地址和 Key 不匹配 | **高** |
| 视频生成 | ✅ 可用 | 无 | - |
| 文本对话 | ✅ 可用 | 无 | - |

## 下一步操作

1. **立即修复**：修改 `AiImageService.java` 使用 SiliconFlow API
2. **测试验证**：重启服务后测试所有图片生成工具
3. **更新配置**：在 `application.yml` 中添加 `text-to-image-model` 配置
4. **文档更新**：更新用户文档说明支持的图片生成功能
