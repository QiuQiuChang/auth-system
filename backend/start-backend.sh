#!/bin/bash

# Backend 启动脚本
# 使用方法: ./start-backend.sh

cd "$(dirname "$0")"

echo "================================"
echo "启动后端服务..."
echo "================================"

# 检查 jar 文件是否存在
if [ ! -f "target/auth-backend-1.0.0.jar" ]; then
    echo "❌ 未找到 JAR 文件，请先在 IntelliJ IDEA 中构建项目"
    exit 1
fi

# 启动服务
java -jar target/auth-backend-1.0.0.jar --spring.profiles.active=local

echo ""
echo "后端服务已停止"
