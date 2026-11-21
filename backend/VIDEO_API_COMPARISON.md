# 视频生成 API 方案对比

## 方案对比表

| API 服务 | 免费额度 | 速度 | 模型质量 | 稳定性 | 推荐度 |
|---------|---------|------|---------|--------|--------|
| SiliconFlow | ❌ 无视频 API | - | - | - | ❌ |
| Agnes AI | 未知 | ⚠️ 慢 | 好 | 未知 | ⚠️ |
| Replicate | $25 免费 | 快 | 优秀 | ✅ 高 | ⭐⭐⭐⭐⭐ |
| Hugging Face | 完全免费 | ⚠️ 慢 | 一般 | ⚠️ 不稳定 | ⭐⭐⭐ |
| FAL.AI | $5 免费 | ✅ 很快 | 优秀 | ✅ 高 | ⭐⭐⭐⭐⭐ |
| Stability AI | $3 免费 | 快 | 优秀 | ✅ 高 | ⭐⭐⭐⭐ |

## 推荐方案

### 🏆 最佳方案：Replicate + FAL.AI

#### 方案 1: Replicate（推荐）

**优势**：
- ✅ $25 免费额度（约可生成 50-100 个视频）
- ✅ 速度快（30-60 秒生成一个视频）
- ✅ 支持多种模型：CogVideoX、Zeroscope、AnimateDiff
- ✅ API 简单易用
- ✅ 国内可访问

**注册**：https://replicate.com/signin

**支持的视频模型**：
- `lucataco/cogvideox-5b` - 5 秒高质量视频
- `anotherjesse/zeroscope-v2-xl` - 3 秒视频
- `stability-ai/stable-video-diffusion` - 图生视频

#### 方案 2: FAL.AI（备选）

**优势**：
- ✅ $5 免费额度
- ✅ 速度最快（20-40 秒）
- ✅ 支持最新的 CogVideoX、KLING、Runway 模型
- ✅ 专注于媒体生成

**注册**：https://fal.ai/

#### 方案 3: Hugging Face（完全免费但慢）

**优势**：
- ✅ 完全免费，无限制
- ✅ 不需要信用卡

**劣势**：
- ⚠️ 速度很慢（2-5 分钟）
- ⚠️ 经常排队
- ⚠️ 模型质量一般

## 实现建议

### 推荐架构

```yaml
app:
  ai:
    # SiliconFlow - 用于文本、图片识别、图片生成
    api-key: sk-dugctmygkulzjzionzcqbogrmmwqhxmklpqnobxztwbpqvfi
    model: Qwen/Qwen2.5-7B-Instruct
    image-model: Qwen/Qwen3-VL-8B-Instruct
    text-to-image-model: Qwen/Qwen-Image
    
  # Replicate - 用于视频生成
  replicate:
    api-key: ${REPLICATE_API_KEY:your-key}
    video-model: lucataco/cogvideox-5b
    
  # FAL.AI - 备用视频服务
  fal:
    api-key: ${FAL_API_KEY:your-key}
    video-model: fal-ai/cogvideox-5b
```

### 代码结构

```
AiVideoService.java
├── ReplicateVideoProvider   # 主要使用
├── FalAiVideoProvider       # 备用
└── HuggingFaceVideoProvider # 降级方案
```

## 详细对比

### Replicate API

**API 端点**：
```bash
POST https://api.replicate.com/v1/predictions
```

**定价**：
- 免费：$25 额度
- 付费：按使用量计费（~$0.50/视频）

**示例代码**：
```java
{
  "version": "cogvideox-5b-model-id",
  "input": {
    "prompt": "一只小猫在草地上玩耍",
    "num_frames": 50,
    "fps": 10
  }
}
```

### FAL.AI API

**API 端点**：
```bash
POST https://fal.run/fal-ai/cogvideox-5b
```

**定价**：
- 免费：$5 额度
- 付费：按使用量计费（~$0.30/视频）

**优势**：速度最快，国内访问友好

### Hugging Face API

**API 端点**：
```bash
POST https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b
```

**定价**：完全免费

**劣势**：
- 速度慢（2-5 分钟）
- 经常排队等待
- 模型质量一般

## 功能分配建议

### 最终方案：混合使用

| 功能 | 使用的服务 | 原因 |
|------|-----------|------|
| 文本对话 | SiliconFlow | 免费、快速、稳定 |
| 图片识别 | SiliconFlow | 免费、质量好 |
| 图片生成 | SiliconFlow | 免费、质量好 |
| 视频生成 | Replicate | 质量好、速度快、免费额度充足 |

### 降级策略

```
Replicate (主)
    ↓ 如果失败
FAL.AI (备)
    ↓ 如果失败
Hugging Face (降级)
    ↓ 如果失败
返回错误提示
```

## 快速开始

### 1. 注册 Replicate

1. 访问：https://replicate.com/signin
2. 使用 GitHub 账号登录
3. 进入：https://replicate.com/account/api-tokens
4. 创建 API Token
5. 免费获得 $25 额度

### 2. 修改配置

```yaml
# application-local.yml
app:
  replicate:
    api-key: r8_xxxxxxxxxxxxxxxxxxxxx  # 你的 Replicate API Key
```

### 3. 测试 API

```bash
curl -s -X POST "https://api.replicate.com/v1/predictions" \
  -H "Authorization: Bearer r8_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "cogvideox-5b-version-id",
    "input": {
      "prompt": "一只猫在玩耍"
    }
  }'
```

## 成本估算

### 每月 1000 个视频生成

| 方案 | 成本 | 说明 |
|------|------|------|
| Replicate | $500 | 免费 $25 后按量付费 |
| FAL.AI | $300 | 免费 $5 后按量付费 |
| Hugging Face | $0 | 完全免费但慢 |
| 混合方案 | $0-100 | 合理使用免费额度 |

### 建议

1. **小规模使用**（<50 视频/月）：用 Replicate 免费额度
2. **中等规模**（50-500 视频/月）：Replicate + FAL.AI 组合
3. **大规模**（>500 视频/月）：考虑付费或自建

## 下一步

请告诉我你的选择：

1. **快速启用**：使用 Replicate（推荐，注册即用）
2. **完全免费**：使用 Hugging Face（慢但免费）
3. **最快速度**：使用 FAL.AI（需注册）
4. **混合方案**：Replicate + Hugging Face 降级

我可以立即帮你实现任何一个方案！
