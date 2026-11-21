# API 接口设计文档

## 1. 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "参数校验失败",
  "errors": [
    {
      "field": "username",
      "message": "用户名长度必须在3-20之间"
    }
  ]
}
```

---

## 2. 接口列表

### 2.1 用户注册

**POST** `/api/auth/register`

#### 请求体
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123"
}
```

#### 校验规则
| 字段 | 类型 | 必填 | 规则 |
|------|------|------|------|
| username | string | 是 | 3-20字符，字母数字下划线 |
| email | string | 是 | 合法邮箱格式 |
| password | string | 是 | 8位以上，含大小写字母和数字 |

#### 成功响应 (201)
```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

#### 失败响应
- **400**: 参数校验失败
- **409**: 用户名或邮箱已存在

---

### 2.2 用户登录

**POST** `/api/auth/login`

#### 请求体
```json
{
  "username": "testuser",
  "password": "Password123"
}
```

#### 成功响应 (200)
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    }
  }
}
```

#### 失败响应
- **401**: 用户名或密码错误

---

### 2.3 获取当前用户信息

**GET** `/api/auth/me`

#### 请求头
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

#### 成功响应 (200)
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

#### 失败响应
- **401**: Token 无效或过期

---

## 3. 错误码定义

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 参数校验失败 |
| 401 | 未授权/Token无效 |
| 409 | 资源冲突(已存在) |
| 500 | 服务器内部错误 |