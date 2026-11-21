# Redis 集成完成指南

## ✅ 已完成的工作

### 1. 代码集成
- ✅ 添加 Redis 依赖到 pom.xml
- ✅ 配置 Redis 连接 (application.yml)
- ✅ 创建 RedisConfig.java
- ✅ 创建 LoginAttemptService.java (登录限流)
- ✅ 创建 TokenBlacklistService.java (Token黑名单)
- ✅ 修改 AuthService.java (集成Redis限流)
- ✅ 修改 JwtUtil.java (添加过期时间方法)
- ✅ 修改 JwtAuthenticationFilter.java (黑名单检查)
- ✅ 修改 AuthController.java (添加/logout接口)

### 2. 项目编译
- ✅ 编译成功，无错误

## 🚀 启动步骤

### 方式1: 使用 Docker (推荐)

1. **启动 Redis 容器**
```bash
cd /Users/qiuchang/Desktop/agents-project
docker-compose up -d redis

# 验证 Redis 启动
docker ps | grep redis
docker exec auth-redis redis-cli ping
# 应返回: PONG
```

### 方式2: 手动安装 Redis

如果没有 Docker，可以下载 Redis：

```bash
# 下载 Redis
cd /tmp
curl -O https://download.redis.io/releases/redis-7.2.4.tar.gz
tar xzf redis-7.2.4.tar.gz
cd redis-7.2.4

# 编译安装
make
make test  # 可选

# 启动 Redis
src/redis-server &

# 验证
src/redis-cli ping
# 应返回: PONG
```

### 启动后端服务

```bash
cd /Users/qiuchang/Desktop/agents-project/backend
mvn spring-boot:run
```

## 📝 测试功能

### 1. 测试登录限流

```bash
# 故意输入错误密码5次
for i in {1..5}; do
  echo "尝试 $i:"
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"wrong"}' \
    | jq '.'
  echo ""
done

# 第6次应该返回账户锁定
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"correct"}' \
  | jq '.'
```

### 2. 测试退出登录

```bash
# 先登录获取 token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username":"youruser",
    "password":"yourencryptedpassword"
  }' > login_response.json

TOKEN=$(cat login_response.json | jq -r '.data.token')
echo "Token: $TOKEN"

# 使用 token 访问受保护接口 (成功)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 退出登录
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 再次使用 token (应该失败)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

### 3. 查看 Redis 数据

```bash
# 使用 Docker
docker exec -it auth-redis redis-cli

# 或使用本地 redis-cli
redis-cli

# 在 Redis CLI 中执行:
KEYS *                          # 查看所有 key
GET login:attempt:testuser      # 查看失败次数
GET login:lock:testuser         # 查看锁定状态
KEYS token:blacklist:*          # 查看黑名单 token
TTL login:attempt:testuser      # 查看过期时间
```

## 🔧 配置参数

### LoginAttemptService.java
```java
MAX_ATTEMPTS = 5              // 最大失败次数
ATTEMPT_TTL_MINUTES = 15      // 失败记录过期时间
LOCK_DURATION_MINUTES = 15    // 账户锁定时长
```

### application.yml
```yaml
spring:
  data:
    redis:
      host: localhost           # Redis 地址
      port: 6379                # Redis 端口
      password:                 # Redis 密码 (默认无)
      database: 0               # 数据库编号
```

## 📊 Redis Key 设计

| Key 模式 | 说明 | TTL | 值类型 |
|---------|------|-----|-------|
| `login:attempt:{username}` | 登录失败次数 | 15分钟 | Integer |
| `login:lock:{username}` | 账户锁定标记 | 15分钟 | Boolean |
| `token:blacklist:{token}` | Token 黑名单 | Token剩余有效期 | Boolean |

## 🎯 功能说明

### 1. 登录限流
- 连续失败5次后锁定账户
- 锁定15分钟后自动解锁
- 登录成功后清除失败记录
- 使用 Redis 记录，不依赖数据库

### 2. Token 黑名单
- 用户退出登录时，Token 加入黑名单
- 黑名单中的 Token 无法继续使用
- Token 过期后自动从黑名单移除
- 支持强制踢出用户

### 3. 退出登录接口
- POST `/api/auth/logout`
- Header: `Authorization: Bearer {token}`
- 将 Token 加入黑名单
- 返回退出成功消息

## ⚠️ 注意事项

### 开发环境
- Redis 使用默认配置即可
- 无需密码
- 数据存储在 Docker Volume 中

### 生产环境
1. **设置 Redis 密码**
   ```yaml
   spring:
     data:
       redis:
         password: ${REDIS_PASSWORD}
   ```

2. **启用 Redis 持久化**
   ```bash
   docker run -d --name redis \
     -p 6379:6379 \
     -v redis-data:/data \
     redis:7-alpine redis-server --appendonly yes --requirepass yourpassword
   ```

3. **使用 Redis Sentinel 或 Cluster**
   - 提高可用性
   - 防止单点故障

4. **监控 Redis**
   - 内存使用率
   - 连接数
   - 命中率

## 🐛 故障排查

### Redis 无法连接
```bash
# 检查 Redis 是否运行
docker ps | grep redis
# 或
ps aux | grep redis

# 检查端口
lsof -i :6379
netstat -an | grep 6379

# 查看 Redis 日志
docker logs auth-redis
```

### 后端无法连接 Redis
```bash
# 查看后端日志
tail -f backend/app.log

# 测试 Redis 连接
redis-cli -h localhost -p 6379 ping
```

### Token 黑名单不生效
```bash
# 查看 Redis 中的黑名单
redis-cli KEYS "token:blacklist:*"

# 检查 TTL
redis-cli TTL token:blacklist:your-token-here
```

## 📚 API 文档

### 1. 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "encrypted_password"
}
```

### 2. 退出登录
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### 3. 获取当前用户
```http
GET /api/auth/me
Authorization: Bearer {token}
```

## ✨ 后续优化建议

1. **添加图形验证码**
   - 在登录失败3次后显示验证码
   - 防止自动化攻击

2. **短信验证码**
   - 支持手机号登录
   - 验证码存储在 Redis，5分钟过期

3. **Session 管理**
   - 限制同一用户最多登录设备数
   - 支持踢出其他设备

4. **登录日志**
   - 记录登录 IP、时间、设备
   - 异常登录告警

5. **Redis 缓存**
   - 缓存用户信息
   - 缓存权限数据

## 🎉 总结

现在你的系统已经拥有：
✅ 高性能的登录限流 (Redis)
✅ 实时的 Token 黑名单机制
✅ 完整的退出登录功能
✅ 自动过期的失败记录
✅ 生产级的安全防护

启动 Redis 后即可测试所有功能！
