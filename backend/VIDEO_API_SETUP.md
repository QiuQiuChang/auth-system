# 视频生成 API 配置说明

## 问题说明

应用使用 **Agnes AI** 提供视频生成服务，这与文本生成使用的硅基流动 API 是不同的服务。

**错误原因：**
- 硅基流动只提供文本和图像模型，不支持视频生成
- Agnes AI 需要单独的 API key

## 解决方案

### 选项 1: 获取 Agnes AI API Key（推荐）

1. **访问 Agnes AI 官网**
   ```
   https://apihub.agnes-ai.com/
   或
   https://www.agnes-ai.com/
   ```

2. **注册账号并获取 API Key**
   - 注册账号
   - 进入控制台
   - 创建 API Key

3. **配置 API Key**
   
   在 `application-local.yml` 中添加：
   ```yaml
   app:
     ai:
       video-api-key: your-agnes-ai-api-key-here
   ```

4. **重启应用**
   ```bash
   # 重启 Spring Boot 应用即可
   ```

### 选项 2: 使用其他视频生成服务

如果不想使用 Agnes AI，可以考虑：

1. **Runway ML** - https://runwayml.com/
2. **Stability AI Video** - https://stability.ai/
3. **Pika Labs** - https://pika.art/

需要修改 `AiVideoService.java` 来适配新的 API。

### 选项 3: 禁用视频生成功能

如果暂时不需要视频生成功能，可以：

1. 在前端禁用视频生成按钮
2. 或在后端添加功能开关

## 当前配置状态

✅ MySQL 已配置并连接成功  
✅ 硅基流动 API (文本生成) 已配置  
✅ RSA 密钥已生成  
❌ Agnes AI 视频 API 需要配置  

## 配置文件位置

- **主配置**: `src/main/resources/application.yml`
- **本地配置**: `src/main/resources/application-local.yml`（不会提交到 Git）
- **视频服务**: `src/main/java/com/auth/service/AiVideoService.java`

## 测试视频生成

配置完成后，可以通过以下方式测试：

```bash
curl -X POST http://localhost:8080/api/ai/generate-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "一只可爱的小猫在草地上玩耍",
    "durationSeconds": 5
  }'
```

## 注意事项

1. **API 费用**: Agnes AI 可能是付费服务，使用前请确认价格
2. **生成时间**: 视频生成通常需要较长时间（几分钟到十几分钟）
3. **并发限制**: 注意 API 的并发请求限制
4. **视频时长**: 当前支持 5-18 秒的视频生成

## 相关文件

- `application.yml` - 主配置文件（已添加 video-api-key 配置项）
- `application-local.yml` - 本地配置（需要添加实际的 API key）
- `AiVideoService.java` - 视频生成服务（已更新使用 video-api-key）
