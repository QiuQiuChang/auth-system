# 视频生成功能修复方案

## 问题诊断

视频生成功能返回 **404 错误**，原因是：

1. **SiliconFlow 不支持视频生成 API**
   - 当前代码使用的 API 端点：`https://api.siliconflow.cn/v1/videos/generations`
   - 该端点不存在（404 Not Found）
   - SiliconFlow 只提供：文本对话、图片识别、图片生成

2. **配置混乱**
   - `AiVideoService.java` 注释说使用 SiliconFlow，但实际上 SiliconFlow 没有视频 API
   - `VIDEO_API_SETUP.md` 文档说应该使用 Agnes AI

## 解决方案

### 方案 1：禁用视频生成功能（推荐 - 快速解决）

如果不需要视频生成功能，可以临时禁用：

#### 1. 修改 ToolService.java

在视频生成调用处添加友好的错误提示：

```java
if ("video".equals(config.getOutputType())) {
    throw new RuntimeException("视频生成功能暂未开放，敬请期待！");
}
```

#### 2. 或者在数据库中禁用视频工具

```sql
UPDATE tool_config SET status = 0 WHERE output_type = 'video';
```

### 方案 2：使用 Replicate API（免费额度）

Replicate 提供视频生成 API，支持多种模型：

#### 修改 AiVideoService.java

```java
@Service
public class AiVideoService {
    
    private final String apiKey;
    private static final String VIDEO_API = "https://api.replicate.com/v1/predictions";
    
    public AiVideoService(@Value("${app.replicate.api-key}") String apiKey) {
        this.apiKey = apiKey;
    }
    
    public String generateVideo(String prompt, Integer durationSeconds) {
        // 使用 Replicate 的 CogVideoX 或其他视频模型
        // 参考：https://replicate.com/models?query=video
    }
}
```

#### 配置 application.yml

```yaml
app:
  replicate:
    api-key: ${REPLICATE_API_KEY:your-replicate-api-key}
```

**获取 API Key**：https://replicate.com/account/api-tokens

### 方案 3：使用 Hugging Face Inference API（免费）

Hugging Face 提供免费的推理 API：

```java
private static final String VIDEO_API = "https://api-inference.huggingface.co/models/ali-vilab/text-to-video-ms-1.7b";
```

**获取 API Key**：https://huggingface.co/settings/tokens

### 方案 4：使用 Agnes AI（需付费）

如果愿意付费，按照 `VIDEO_API_SETUP.md` 的说明：

1. 访问 https://apihub.agnes-ai.com/
2. 注册并获取 API Key
3. 配置到应用中

## 当前建议

**立即采用方案 1**：禁用视频功能，因为：

1. ✅ 不需要额外配置
2. ✅ 不需要新的 API Key
3. ✅ 用户看到明确的提示而不是 404 错误
4. ✅ 其他功能（文本对话、图片识别、图片生成）都正常工作

## 实施步骤（方案 1）

### 修改 ToolService.java

位置：`src/main/java/com/auth/service/ToolService.java:97-98`

```java
// 调用 AI（根据输出类型选择服务）
String result;
if ("video".equals(config.getOutputType())) {
    // 视频生成功能暂未开放
    throw new RuntimeException("视频生成功能暂时不可用。当前支持的功能：文本对话、图片识别、图片生成。");
} else if ("image".equals(config.getOutputType())) {
    String size = inputs != null && inputs.containsKey("size")
            ? inputs.get("size").toString() : "1024x768";
    result = aiImageService.generateImage(prompt, size);
} else {
    result = aiClientService.chat(prompt);
}
```

### 或者在前端隐藏视频工具

如果数据库中有视频工具，在前端过滤掉：

```javascript
// 过滤掉视频类型的工具
const availableTools = tools.filter(tool => tool.outputType !== 'video');
```

## 未来扩展

如果以后要支持视频生成，推荐：

1. **Replicate**：最简单，支持多种视频模型
2. **Hugging Face**：免费但有速率限制
3. **本地部署**：使用 CogVideoX 等开源模型（需要 GPU）

## 总结

当前状态：
- ✅ 文本对话 - 正常
- ✅ 图片识别 - 已修复
- ✅ 图片生成 - 已修复  
- ❌ 视频生成 - **需要禁用或更换 API**

建议：先禁用视频功能，让其他功能稳定运行。
