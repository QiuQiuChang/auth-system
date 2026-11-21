# 🚀 完整部署操作手册（零基础版）

> 本文档手把手教你从零开始部署前后端,每一步都有说明和验证方法。

---

## 📋 部署前准备清单

在开始之前,确认你有以下账号和工具:

- [ ] GitHub 账号（用于托管代码）
- [ ] Railway 账号（后端部署,用 GitHub 登录即可）
- [ ] Cloudflare 账号（前端部署,免费注册）
- [ ] 本地已安装 Git 命令行工具
- [ ] 你的 AI API Key（如果需要 AI 功能）

---

## 第一阶段:本地准备（5 分钟）

### 1.1 初始化 Git 仓库

在项目根目录(`D:\WorkSpaceCode\test`)打开命令行:

```bash
# 初始化 Git（如果还没有）
git init

# 添加 .gitignore（如果没有）
```

确保 `.gitignore` 包含:
```
backend/target/
backend/.env.local
frontend/node_modules/
frontend/dist/
.DS_Store
*.log
```

### 1.2 提交代码到本地仓库

```bash
git add .
git commit -m "feat: 初始化项目,包含安全防护机制

- 添加登录/注册频率限制
- 添加账户锁定机制
- 清理敏感信息占位符
- 配置 Railway 和 Cloudflare 部署文件

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### 1.3 推送到 GitHub

**步骤 A: 在 GitHub 创建新仓库**

1. 打开 https://github.com/new
2. Repository name: 填 `auth-system`（或你喜欢的名字）
3. ✅ 勾选 **Private**（建议私有,因为有配置文件）
4. ❌ **不要**勾选 "Add a README file"（我们已有代码）
5. 点击 **Create repository**

**步骤 B: 推送本地代码**

GitHub 会显示推送命令,复制执行:

```bash
git remote add origin https://github.com/你的用户名/auth-system.git
git branch -M main
git push -u origin main
```

如果需要登录,输入 GitHub 用户名和 Personal Access Token（不是密码）。

**验证**: 刷新 GitHub 页面,应该能看到 `backend/`、`frontend/` 等文件夹。

---

## 第二阶段:部署后端到 Railway（15 分钟）

### 2.1 注册 Railway

1. 打开 https://railway.com
2. 点击右上角 **Login → Sign in with GitHub**
3. 授权后自动跳转到 Railway 控制台

### 2.2 创建 MySQL 数据库

1. 点击 **New Project**
2. 选择 **Provision MySQL**
3. 等待数据库创建完成（约 30 秒）
4. 点进 MySQL 服务 → **Variables** 标签
5. **记下以下变量**（待会要用）:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

### 2.3 部署后端服务

**步骤 A: 连接 GitHub 仓库**

1. 在同一个 Project 里,点击 **New → GitHub Repo**
2. 如果第一次使用,需要点 **Configure GitHub App** 授权
3. 选中你刚推送的 `auth-system` 仓库
4. Railway 会自动开始构建,**但会失败**（因为还没配置）

**步骤 B: 配置 Root Directory**

1. 点进后端服务 → **Settings** 标签
2. 找到 **Root Directory**,填入 `backend`
3. 点击 **Save**,Railway 会自动重新构建

**步骤 C: 配置环境变量**

点击 **Variables** 标签,逐个添加以下变量:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DB_URL` | `jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true` | 数据库连接 |
| `DB_USERNAME` | `${{MySQL.MYSQLUSER}}` | 数据库用户名 |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` | 数据库密码 |
| `JWT_SECRET` | **见下方生成方法** | JWT 签名密钥 |
| `RSA_KEYSTORE_PASSWORD` | `你设置的强密码` | RSA 密钥库密码 |
| `RSA_KEY_PASSWORD` | `同上` | RSA 密钥密码 |
| `AI_API_KEY` | `你的 AI API Key` | AI 服务密钥 |
| `CORS_ALLOWED_ORIGINS` | **等前端部署后回填** | 先留空或填 `http://localhost:5173` |

**生成强 JWT_SECRET 的方法**（任选一种）:

```bash
# 方法 1: 使用 PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))

# 方法 2: 在线生成
# 访问 https://generate-random.org/api-token-generator 生成 64 位随机字符串
```

复制生成的长字符串,粘贴到 `JWT_SECRET`。

**注意**: `MySQL` 是你的数据库服务名,如果你创建时名字不同,请替换 `${{}}` 中的服务名。

### 2.4 获取后端域名

1. 后端服务 → **Settings** → **Networking** 部分
2. 点击 **Generate Domain**
3. 会生成类似 `https://auth-backend-production.up.railway.app` 的域名
4. **复制这个域名**（下一阶段要用）

### 2.5 验证后端部署

1. 点击 **Deployments** 标签,查看最新部署状态
2. 等待状态变为 **Active**（绿色）
3. 打开生成的域名 + `/api/auth/public-key`,例如:
   ```
   https://auth-backend-production.up.railway.app/api/auth/public-key
   ```
4. **如果看到 JSON 返回 `publicKey`,部署成功！**

---

## 第三阶段:部署前端到 Cloudflare Pages（10 分钟）

### 3.1 配置前端后端地址

回到本地项目,编辑 `frontend/.env.production`:

```bash
# 把 REPLACE_WITH_YOUR_RAILWAY_DOMAIN 替换成你上一步的 Railway 域名
VITE_API_BASE_URL=https://auth-backend-production.up.railway.app
```

**注意**: 
- 域名不要以 `/` 结尾
- 保存后重新 commit + push:

```bash
git add frontend/.env.production
git commit -m "chore: 配置生产环境后端地址"
git push
```

### 3.2 在 Cloudflare 创建 Pages 项目

1. 登录 https://dash.cloudflare.com
2. 左侧菜单 → **Workers & Pages**
3. 点击 **Create → Pages → Connect to Git**
4. 选择 **GitHub**,授权后选中你的 `auth-system` 仓库

### 3.3 配置构建设置

| 设置项 | 值 |
|--------|-----|
| **Project name** | `auth-system-frontend` |
| **Production branch** | `main` |
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `frontend` |

点击 **Save and Deploy**,等待构建完成（2~3 分钟）。

### 3.4 获取前端域名

构建成功后,会显示类似 `https://auth-system-frontend.pages.dev` 的域名。

**验证前端部署**:
1. 打开该域名
2. 应该能看到登录/注册页面
3. 打开浏览器 F12 → Network,尝试登录
4. 如果看到请求发到 Railway 域名且返回数据,部署成功！

---

## 第四阶段:回填 CORS 配置（2 分钟）

### 4.1 更新后端 CORS

1. 回到 Railway → 后端服务 → **Variables**
2. 找到 `CORS_ALLOWED_ORIGINS`,改为你的 Cloudflare Pages 域名:
   ```
   https://auth-system-frontend.pages.dev
   ```
3. 保存后 Railway 会自动重启服务（约 30 秒）

### 4.2 最终验证

打开前端域名:
1. 注册一个新账户
2. 登录
3. F12 → Console,**不应该有 CORS 报错**
4. 刷新页面,仍能保持登录状态

**✅ 如果以上都正常,恭喜部署完成！**

---

## 第五阶段:安全检查清单

部署完成后,务必确认:

- [ ] **GitHub 仓库是 Private**
- [ ] **Railway 环境变量已全部填写**,无默认占位符
- [ ] **测试频率限制**: 连续登录 6 次错误密码,第 6 次应返回锁定提示
- [ ] **测试注册限制**: 短时间注册 4 次,第 4 次应返回 429
- [ ] **Railway Logs 可见**: 后端服务 → Logs,应该能看到日志

---

## 🛠️ 常见问题排查

### Q1: Railway 构建失败,显示 "No Dockerfile found"
**解决**: Settings → Root Directory → 填 `backend` → Save

### Q2: 前端能打开,但登录报 CORS 错误
**解决**: 
1. 检查 Railway Variables,确认 `CORS_ALLOWED_ORIGINS` 是前端完整域名（含 `https://`）
2. 域名必须完全匹配,不能有尾部 `/`

### Q3: 数据库连接失败
**解决**: 
1. 确认 MySQL 服务在同一个 Project 里
2. Variables 里的 `${{MySQL.XXX}}` 引用,`MySQL` 必须是你的数据库服务名

### Q4: Railway 费用超出预期
**解决**:
1. 立即 Settings → Sleep Mode → Enable（暂停服务）
2. 查看 Logs 和 Metrics,找到异常来源

---

## 📊 部署后监控建议

### 每周检查一次

1. **Railway Metrics** → CPU/内存使用率
2. **Railway Logs** → 搜索 `频率超限`、`账户锁定`
3. **Railway Billing** → 查看本月消费金额

### 紧急情况应对

如果发现异常:
1. **立即暂停服务**: Settings → Sleep Mode
2. **导出日志**: Logs → 复制保存
3. **检查数据库**: MySQL 服务 → Data

---

## 🎉 部署完成！

现在你有了:
- ✅ 安全的生产环境（频率限制 + 账户锁定）
- ✅ 全球 CDN 加速的前端（Cloudflare Pages）
- ✅ 自动扩容的后端（Railway）
- ✅ 完整的日志监控

**推荐优化**（可选）:
1. 绑定自定义域名（Cloudflare Pages 支持免费 HTTPS）
2. 开启 Railway 自动备份（MySQL 服务 → Backups）
3. 接入告警服务（Railway 可配 Webhook）
