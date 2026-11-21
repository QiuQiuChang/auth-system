#!/bin/bash

echo "=== 启动所有服务 ==="

# 1. 检查并启动 MySQL
echo ""
echo "1️⃣  检查 MySQL..."
if pgrep -f mysqld > /dev/null; then
    echo "   ✅ MySQL 已运行"
else
    echo "   🚀 启动 MySQL..."
    /Users/qiuchang/mysql-final/start-mysql.sh
fi

# 2. 检查并启动 Redis
echo ""
echo "2️⃣  检查 Redis..."
if pgrep -f redis-server > /dev/null; then
    echo "   ✅ Redis 已运行"
else
    echo "   🚀 启动 Redis..."
    ~/redis/start-redis.sh
fi

# 3. 提示启动后端
echo ""
echo "3️⃣  后端服务"
echo "   请手动启动后端："
echo "   cd /Users/qiuchang/Desktop/agents-project/backend"
echo "   mvn spring-boot:run"
echo ""
echo "=== 服务状态 ==="
echo "MySQL: $(pgrep -f mysqld > /dev/null && echo '✅ 运行中' || echo '❌ 未运行')"
echo "Redis: $(pgrep -f redis-server > /dev/null && echo '✅ 运行中' || echo '❌ 未运行')"
echo ""
