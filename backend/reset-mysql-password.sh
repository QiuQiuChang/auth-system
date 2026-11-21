#!/bin/bash

NEW_PASSWORD="Qc5201314."
MYSQL_DIR="/Users/qiuchang/mysql-final/mysql"

echo "=== MySQL 密码重置脚本 ==="
echo ""

# 步骤 1: 停止 MySQL
echo "步骤 1: 停止 MySQL..."
killall mysqld 2>/dev/null
sleep 3

# 检查 MySQL 是否已停止
if pgrep -x mysqld > /dev/null; then
    echo "✗ MySQL 仍在运行，尝试强制停止..."
    killall -9 mysqld 2>/dev/null
    sleep 2
fi

echo "✓ MySQL 已停止"
echo ""

# 步骤 2: 创建初始化文件
echo "步骤 2: 创建密码重置文件..."
INIT_FILE="/tmp/mysql-init-password.sql"
cat > $INIT_FILE << EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
EOF

echo "✓ 重置文件已创建"
echo ""

# 步骤 3: 使用初始化文件启动 MySQL
echo "步骤 3: 使用初始化文件启动 MySQL..."
$MYSQL_DIR/bin/mysqld --init-file=$INIT_FILE --datadir=$MYSQL_DIR/data --user=qiuchang &
MYSQL_PID=$!
sleep 5

# 检查 MySQL 是否启动
if ps -p $MYSQL_PID > /dev/null; then
    echo "✓ MySQL 已启动"
else
    echo "✗ MySQL 启动失败"
    exit 1
fi

echo ""

# 步骤 4: 停止 MySQL（初始化完成）
echo "步骤 4: 停止 MySQL（重置完成）..."
kill $MYSQL_PID
sleep 3

# 清理初始化文件
rm -f $INIT_FILE

echo "✓ 密码重置完成"
echo ""

# 步骤 5: 正常启动 MySQL
echo "步骤 5: 正常启动 MySQL..."
$MYSQL_DIR/bin/mysqld_safe --datadir=$MYSQL_DIR/data &
sleep 5

echo "✓ MySQL 已重新启动"
echo ""

# 步骤 6: 测试新密码
echo "步骤 6: 测试新密码..."
$MYSQL_DIR/bin/mysql -u root -p"$NEW_PASSWORD" -e "SELECT 1 AS test;" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✓✓✓ 密码重置成功！新密码为: $NEW_PASSWORD"
    echo ""

    # 创建数据库
    echo "步骤 7: 创建 auth_system 数据库..."
    $MYSQL_DIR/bin/mysql -u root -p"$NEW_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS auth_system;" 2>&1

    if [ $? -eq 0 ]; then
        echo "✓ 数据库创建成功"
        echo ""
        echo "=== 配置完成 ==="
        echo "现在可以启动 Spring Boot 应用了"
    else
        echo "✗ 数据库创建失败"
    fi
else
    echo ""
    echo "✗ 密码重置失败，请手动重置"
fi
