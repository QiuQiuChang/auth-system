# 数据库设计文档

## 1. 数据库信息

- **数据库名称**: auth_system
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci

---

## 2. 表结构

### 2.1 user 表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 用户名 |
| email | VARCHAR(100) | NOT NULL, UNIQUE | 邮箱 |
| password | VARCHAR(255) | NOT NULL | 密码(BCrypt加密) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

---

## 3. DDL 建表语句

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS auth_system 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE auth_system;

-- 创建用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. 索引设计

| 索引名称 | 索引类型 | 字段 | 说明 |
|----------|----------|------|------|
| PRIMARY | 主键索引 | id | 唯一标识 |
| uk_username | 唯一索引 | username | 用户名唯一性 |
| uk_email | 唯一索引 | email | 邮箱唯一性 |

---

## 5. 注意事项

1. **密码字段**: 存储 BCrypt 加密后的哈希值，长度固定 60 字符，VARCHAR(255) 预留足够空间
2. **时间字段**: 使用 TIMESTAMP 类型，自动维护创建和更新时间
3. **字符集**: 使用 utf8mb4 支持完整的 Unicode 字符