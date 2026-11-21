# 混合视频生成配置指南

## 🎉 已完成实现

你的系统现在使用：
- **SiliconFlow**：文本对话、图片识别、图片生成
- **Replicate（主）+ Hugging Face（备用）**：视频生成

## 配置步骤

### 1. 填写 Replicate API Key

打开文件：`src/main/resources/application-local.yml`

找到这一行：
```yaml
replicate:
  api-key: your-replicate-api-key-here
```

替换为你的真实 API Key：
```yaml
replicate:
  api-key: r8_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. 重启服务

```bash
# 停止旧服务
pkill -f "java.*auth-backend"

# 启动新服务
./start-backend.sh
```

### 3. 检查启动日志

应该看到：
```
=== AiVideoService 初始化 ===
Replicate API Key: 已配置
Hugging Face API Key: 不需要(可选)
===============================
```

## 工作原理

### 视频生成流程

```
用户请求视频生成
    ↓
尝试 Replicate API (主方案)
    ├─ 成功 → 返回视频 URL ✅
    └─ 失败 → 降级到 Hugging Face
              ├─ 成功 → 返回视频 ✅
              └─ 失败 → 返回错误 ❌
```

### 各服务职责

| 服务 | 负责的功能 | API Key 配置位置 |
|------|-----------|----------------|
| SiliconFlow | 文本对话<br>图片识别<br>图片生成 | `app.ai.api-key` |
| Replicate | 视频生成（主） | `app.replicate.api-key` ⚠️ **需要你填写** |
| Hugging Face | 视频生成（备用） | `app.huggingface.api-key`（可选） |

### 配置文件说明

```yaml
# application-local.yml（本地配置，不会提交到 Git）

spring:
  datasource:
    password: Qc5201314.

app:
  # SiliconFlow（已配置 ✅）
  ai:
    api-key: sk-dugctmygkulzjzionzcqbogrmmwqhxmklpqnobxztwbpqvfi

  # Replicate（需要你填写 ⚠️）
  replicate:
    api-key: r8_xxxxxxxxxx  # 替换为你的 API Key

  # Hugging Face（可选，留空也能用）
  huggingface:
    api-key:  # 不填也可以，但有速率限制
```

## API Key 不冲突说明

✅ **完全独立，不会冲突！**

每个服务使用不同的配置项：
- `app.ai.api-key` → 给 SiliconFlow 用
- `app.replicate.api-key` → 给 Replicate 用
- `app.huggingface.api-key` → 给 Hugging Face 用

代码中会自动根据功能选择对应的 API：
```java
// 文本对话、图片 → 使用 SiliconFlow
aiClientService.chat(prompt);  // 用 app.ai.api-key

// 视频生成 → 使用 Replicate
aiVideoService.generateVideo(prompt);  // 用 app.replicate.api-key
```

## 功能对比

### Replicate（主方案）

**优势**：
- ✅ 速度快（30-60 秒）
- ✅ 质量高（CogVideoX-5B 模型）
- ✅ 稳定性好
- ✅ $25 免费额度

**劣势**：
- ⚠️ 需要注册获取 API Key

**适用场景**：
- 正常的视频生成请求
- 对质量和速度有要求

### Hugging Face（备用降级）

**优势**：
- ✅ 完全免费
- ✅ 不需要 API Key（可选）

**劣势**：
- ⚠️ 速度慢（2-5 分钟）
- ⚠️ 可能排队
- ⚠️ 质量一般

**适用场景**：
- Replicate 失败时自动降级
- Replicate 额度用完时

## 测试视频生成

### 通过前端测试

1. 进入 AI 工具箱
2. 找到视频生成工具
3. 输入描述，例如：
   ```
   一只可爱的小猫在草地上玩耍，阳光明媚
   ```
4. 选择时长：5 秒
5. 点击生成

### 通过 API 测试

```bash
curl -X POST http://localhost:8080/api/tools/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "slug": "video-gen",
    "inputs": {
      "prompt": "一只猫在玩耍",
      "duration": 5
    }
  }'
```

### 预期响应时间

| 方案 | 响应时间 |
|------|---------|
| Replicate | 30-60 秒 |
| Hugging Face | 2-5 分钟 |

## 成本估算

### Replicate 免费额度

- 免费：$25
- 约可生成：50-100 个视频
- 超出后：按量计费（~$0.50/视频）

### 每月 100 个视频的成本

| 方案 | 成本 |
|------|------|
| 纯 Replicate | $25 免费额度 → $0 |
| Replicate + HF 降级 | $0（先用免费额度，用完降级到 HF）|
| 纯 Hugging Face | $0（完全免费但慢）|

## 常见问题

### Q1: Replicate API Key 在哪里填？

**答**：在 `src/main/resources/application-local.yml` 文件中：

```yaml
app:
  replicate:
    api-key: r8_你的APIKey
```

### Q2: 不填 Hugging Face API Key 能用吗？

**答**：可以！Hugging Face API Key 是可选的。不填也能用，只是有速率限制。

### Q3: 视频生成失败怎么办？

**答**：系统会自动降级：
1. 先尝试 Replicate
2. 失败后自动切换到 Hugging Face
3. 两者都失败才报错

查看后端日志可以看到详细过程。

### Q4: 如何查看使用了哪个服务？

**答**：查看后端日志：
```
尝试使用 Replicate 生成视频...
→ 使用的是 Replicate

Replicate 生成失败，降级到 Hugging Face...
→ 降级到了 Hugging Face
```

### Q5: 可以只用 Hugging Face 吗？

**答**：可以！不填 Replicate API Key，系统会直接使用 Hugging Face。但建议填写 Replicate，体验更好。

## 监控和日志

### 查看生成状态

后端会输出详细日志：

```bash
# 成功的情况
尝试使用 Replicate 生成视频...
发送 Replicate 请求: 一只猫在玩耍
Replicate 任务ID: abc123, 状态: starting
Replicate 状态: processing
Replicate 状态: succeeded
视频URL: https://replicate.delivery/pbxt/...

# 降级的情况
尝试使用 Replicate 生成视频...
Replicate 生成失败，降级到 Hugging Face: Timeout
发送 Hugging Face 请求: 一只猫在玩耍
注意: Hugging Face 可能需要 2-5 分钟...
Hugging Face 生成成功，视频大小: 1024576 bytes
```

### 监控 API 使用量

- **Replicate**：访问 https://replicate.com/account
- **Hugging Face**：访问 https://huggingface.co/settings/billing

## 总结

✅ **配置简单**：只需填写一个 Replicate API Key

✅ **不会冲突**：所有服务独立配置，互不干扰

✅ **自动降级**：Replicate 失败自动切换到 Hugging Face

✅ **成本低廉**：$25 免费额度 + 无限免费降级

---

**下一步**：填写你的 Replicate API Key，然后重启服务！

配置文件位置：`src/main/resources/application-local.yml`
