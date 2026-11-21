# Redis 连接失败 500 错误修复说明

## 问题诊断

**症状**: 前端调用后端 API 返回 500 错误

**根本原因**: 后端依赖 Redis 进行以下功能：
1. 登录失败次数统计和账户锁定（`LoginAttemptService`）
2. Token 黑名单管理（`TokenBlacklistService`）
3. 但是 Redis 服务未运行，导致连接失败

**错误信息**: `{"code":500,"message":"Unable to connect to Redis"}`

## 已实施的修复

### 1. LoginAttemptService 优雅降级

修改了 `/src/main/java/com/auth/service/LoginAttemptService.java`：

- ✅ 捕获 `RedisConnectionFailureException`
- ✅ Redis 不可用时记录警告日志
- ✅ 跳过账户锁定检查（允许登录继续）
- ✅ 跳过失败次数统计

### 2. TokenBlacklistService 优雅降级

修改了 `/src/main/java/com/auth/service/TokenBlacklistService.java`：

- ✅ 捕获 `RedisConnectionFailureException`
- ✅ Redis 不可用时记录警告日志
- ✅ 跳过 Token 黑名单检查（允许访问继续）

## 重启后端服务

### 方法 1: 通过 IntelliJ IDEA 重启（推荐）

1. 在 IntelliJ IDEA 中找到运行配置
2. 点击停止按钮（红色方块）
3. 点击运行按钮（绿色三角）重新启动

### 方法 2: 手动重启

```bash
# 1. 停止当前进程
ps aux | grep AuthApplication | grep -v grep | awk '{print $2}' | xargs kill -15

# 2. 重新启动
cd /Users/qiuchang/Desktop/agents-project/backend
java -jar target/auth-backend-1.0.0.jar --spring.profiles.active=local
```

## 验证修复

重启后端后，测试登录接口：

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

**预期结果**: 
- 如果用户存在且密码正确：返回 token 和用户信息
- 如果用户不存在或密码错误：返回 `{"code":400,"message":"用户名或密码错误"}`
- **不再返回** `{"code":500,"message":"Unable to connect to Redis"}`

## 功能影响

Redis 不可用时的降级行为：

| 功能 | 正常行为 | 降级行为 |
|------|---------|---------|
| 登录失败统计 | 记录失败次数，5次后锁定15分钟 | ⚠️ 不统计，不锁定 |
| 账户锁定检查 | 检查是否被锁定 | ⚠️ 跳过检查，允许登录 |
| Token 黑名单 | 退出登录时加入黑名单 | ⚠️ 不加入黑名单 |
| Token 验证 | 检查是否在黑名单 | ⚠️ 跳过检查，允许访问 |

## 后续建议

### 选项 1: 安装并启动 Redis（生产环境推荐）

```bash
# macOS
brew install redis
brew services start redis

# 验证 Redis 运行
redis-cli ping  # 应该返回 PONG
```

### 选项 2: 使用 Docker 运行 Redis

```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

### 选项 3: 完全移除 Redis 依赖（开发环境）

如果不需要速率限制和 Token 黑名单功能：

1. 从 `pom.xml` 移除 `spring-boot-starter-data-redis` 依赖
2. 移除或注释掉 `RedisConfig.java`
3. 使用内存实现替代 Redis 服务

## 日志监控

修复后，查看日志中的 Redis 警告：

```bash
tail -f app.log | grep -i redis
```

如果看到 "Redis 不可用" 警告，说明降级逻辑正在工作。

## 总结

✅ **问题已修复**: 后端现在可以在 Redis 不可用的情况下正常处理请求
⚠️ **功能降级**: 登录保护和 Token 黑名单功能暂时不可用
🔧 **建议**: 生产环境应该安装并运行 Redis 以获得完整功能
