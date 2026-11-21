#!/bin/bash
set -e

echo "=========================================="
echo "AI工具箱增强 - 数据库导入"
echo "=========================================="
echo ""

# 数据库配置（从application.yml读取）
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="auth_system"
DB_USER="root"

echo "数据库配置:"
echo "  主机: $DB_HOST:$DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 检查MySQL连接
echo "步骤1: 测试数据库连接..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p -e "USE $DB_NAME; SELECT 1;" 2>&1 | grep -q "ERROR" && {
    echo "✗ 数据库连接失败，请检查配置"
    exit 1
}
echo "✓ 数据库连接成功"
echo ""

# 查询当前工具数量
echo "步骤2: 查询当前工具数量..."
CURRENT_COUNT=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p -N -e "USE $DB_NAME; SELECT COUNT(*) FROM tool_config WHERE status = 1;" 2>/dev/null)
echo "✓ 当前启用工具数: $CURRENT_COUNT"
echo ""

# 导入新工具
echo "步骤3: 导入13个新工具..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME < seed-enhanced-tools.sql
echo "✓ 导入完成"
echo ""

# 验证导入结果
echo "步骤4: 验证导入结果..."
NEW_COUNT=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p -N -e "USE $DB_NAME; SELECT COUNT(*) FROM tool_config WHERE status = 1;" 2>/dev/null)
ADDED_COUNT=$((NEW_COUNT - CURRENT_COUNT))
echo "✓ 当前启用工具数: $NEW_COUNT"
echo "✓ 新增工具数: $ADDED_COUNT"
echo ""

# 按分类统计
echo "步骤5: 按分类统计..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p -t -e "USE $DB_NAME;
SELECT category AS '分类', COUNT(*) AS '数量'
FROM tool_config
WHERE status = 1
GROUP BY category
ORDER BY category;"

echo ""
echo "=========================================="
echo "导入完成！预期新增13个工具"
echo "=========================================="
echo ""
echo "后续步骤:"
echo "1. 重启后端服务: cd ../../../.. && mvn spring-boot:run"
echo "2. 访问测试: http://localhost:3000/tools"
echo ""
