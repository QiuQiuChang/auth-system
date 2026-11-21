#!/bin/bash

# MySQL 连接测试脚本
MYSQL_BIN="/Users/qiuchang/mysql-final/mysql/bin/mysql"
PASSWORD="Qc201314."

echo "=== MySQL 连接测试 ==="
echo ""

# 测试1: 尝试用配置文件中的密码连接
echo "测试1: 使用密码 'Qc201314.' 连接..."
$MYSQL_BIN -u root -p"$PASSWORD" -e "SELECT 1 AS test;" 2>&1

if [ $? -eq 0 ]; then
    echo "✓ 密码正确！"
    echo ""
    echo "检查 auth_system 数据库..."
    $MYSQL_BIN -u root -p"$PASSWORD" -e "SHOW DATABASES LIKE 'auth_system';"

    echo ""
    echo "如果数据库不存在，创建它..."
    $MYSQL_BIN -u root -p"$PASSWORD" -e "CREATE DATABASE IF NOT EXISTS auth_system; SHOW DATABASES LIKE 'auth_system';"

    echo ""
    echo "✓ MySQL 配置正确，可以启动 Spring Boot 应用了"
else
    echo "✗ 密码错误"
    echo ""
    echo "请尝试以下步骤："
    echo "1. 尝试无密码连接:"
    echo "   $MYSQL_BIN -u root"
    echo ""
    echo "2. 或者手动输入密码:"
    echo "   $MYSQL_BIN -u root -p"
    echo ""
    echo "3. 连接成功后，执行以下 SQL 重置密码:"
    echo "   ALTER USER 'root'@'localhost' IDENTIFIED BY 'Qc201314.';"
    echo "   FLUSH PRIVILEGES;"
    echo "   CREATE DATABASE IF NOT EXISTS auth_system;"
fi
