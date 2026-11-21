# 部署指南（前端 Cloudflare Pages + 后端 Railway）

本项目已完成部署所需的代码/配置改动，本文档说明**你需要手动操作的步骤**。

## 一、改动了什么（已由代码完成）

| 文件 | 改动 |
|------|------|
| `backend/src/main/resources/application.yml` | 端口改为 `${PORT:8080}`；新增 `app.cors.allowed-origins` 读环境变量 |
| `backend/src/main/java/com/auth/config/CorsConfig.java` | CORS 允许域名改为从环境变量读取，支持多个逗号分隔 |
| `backend/Dockerfile` | 多阶段构建（Maven 编译 + JRE21 运行） |
| `backend/.dockerignore` | 排除 target/、query/ 等 |
| `backend/railway.toml` | Railway 用 Dockerfile 构建 + 崩溃自动重启 |
| `frontend/src/api/client.js` | `baseURL` 改为读 `VITE_API_BASE_URL` |
| `frontend/.env.production` | 生产构建的后端地址（**待你替换**） |
| `frontend/public/_redirects` | Cloudflare Pages 的 SPA 路由回退 |

## 二、部署顺序

**先部署后端拿到域名，再配前端**（因为前端需要填后端地址）。

## 三、部署后端到 Railway

### 1. 准备数据库（MySQL）
1. 登录 https://railway.com ，New Project。
2. 点 **+ New → Database → Add MySQL**，Railway 会自动创建一个 MySQL 实例。
3. 点进 MySQL 服务 → Variables，记下 Railway 提供的连接变量（`MYSQLHOST`、`MYSQLPORT`、`MYSQLDATABASE`、`MYSQLUSER`、`MYSQLPASSWORD`）。

### 2. 部署后端服务
1. 同一项目里 **+ New → GitHub Repo**（需先把代码推到 GitHub），选中本仓库。
2. 进入该服务 → **Settings → Root Directory** 填 `backend`（关键！否则找不到 Dockerfile）。
3. Railway 会自动识别 `backend/railway.toml` 和 `Dockerfile` 开始构建。

### 3. 配置后端环境变量
进入后端服务 → **Variables**，添加以下变量（值用 Railway 的引用语法引用 MySQL 服务）：

```
DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
JWT_SECRET=（自己生成一串 base64 随机字符串，别用默认值）
RSA_KEYSTORE_PASSWORD=（设一个强密码）
RSA_KEY_PASSWORD=（同上）
AI_API_KEY=（你的 AI 服务密钥）
CORS_ALLOWED_ORIGINS=https://你的前端.pages.dev
```

> 注意：`MySQL` 是数据库服务名，若你的服务名不同请相应替换。
> `CORS_ALLOWED_ORIGINS` 这一项**等前端部署好拿到域名后再回来填/更新**。

### 4. 获取后端域名
后端服务 → Settings → Networking → **Generate Domain**，得到形如
`https://auth-backend-production.up.railway.app` 的地址，**记下来**。

---

## 四、部署前端到 Cloudflare Pages

### 1. 填后端地址
编辑 `frontend/.env.production`，把 `VITE_API_BASE_URL` 换成上一步的 Railway 域名（不要以 `/` 结尾）：
```
VITE_API_BASE_URL=https://auth-backend-production.up.railway.app
```

### 2. 在 Cloudflare 创建 Pages 项目
1. 登录 https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git**，选中本仓库。
2. 构建配置：
   - **Framework preset**: `Vite`（或 None）
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. （可选）也可在 Cloudflare 的环境变量里设 `VITE_API_BASE_URL`，与 `.env.production` 二选一即可。
4. Save and Deploy，等构建完成得到 `https://你的项目.pages.dev`。

### 3. 回填 CORS
拿到前端域名后，回到 Railway 后端的 `CORS_ALLOWED_ORIGINS`，填入该 `.pages.dev` 域名并重新部署（Railway 改变量会自动重启）。

---

## 五、验证清单

- [ ] 打开前端 `.pages.dev`，页面正常加载
- [ ] 打开浏览器 F12 → Network，登录/注册请求指向 Railway 域名且返回 200
- [ ] 无 CORS 报错（若有，检查 `CORS_ALLOWED_ORIGINS` 是否与前端域名完全一致，含 https）
- [ ] 刷新非首页路由不 404（`_redirects` 已处理）

---

## 六、你需要准备的东西

1. **一个 GitHub 账号**，并把本项目推上去（Railway 和 Cloudflare 都从 GitHub 拉代码）。
2. **Railway 账号**（用 GitHub 登录即可）——后端 + MySQL，约 $5/月。
3. **Cloudflare 账号**（免费）——前端托管。
4. 生产用的 **JWT 密钥、RSA 密钥库密码、AI API Key**（别用仓库里的默认值）。

## 七、安全提醒

- `application.yml` 里目前有硬编码的默认密码和 AI 密钥（`DB_PASSWORD`、`AI_API_KEY` 等），这些**只作本地开发兜底**。生产环境务必在 Railway 用环境变量覆盖，且建议尽快把仓库里的真实密钥轮换掉——它们已进入 git 历史。
- 后端所有敏感接口已由 Spring Security + JWT 保护，CORS 已限制来源，未做 `*` 泛开放。

## 八、已实施的 P0 安全防护（代码已完成）

本次部署已加入以下关键安全机制，**无需额外配置即自动生效**：

### 1. 接口频率限制（防暴力破解/DDoS）
- **登录接口** `/api/auth/login`：同一 IP **5 次/分钟**
- **注册接口** `/api/auth/register`：同一 IP **3 次/小时**
- 超限返回 `429 Too Many Requests`，自动记录日志

### 2. 账户锁定机制（防撞库攻击）
- 同一账户登录失败 **5 次**后自动锁定 **15 分钟**
- 锁定期间拒绝登录，返回"账户已被锁定"提示
- 成功登录后自动重置失败计数

### 3. 请求体大小限制（防内存耗尽）
- HTTP POST 请求体最大 **2MB**
- 超限自动拒绝，防止恶意大请求打爆内存

### 4. 异常行为日志（监控告警依据）
- 自动记录：
  - 登录失败（IP、用户名、失败次数）
  - 接口频率超限（IP、接口路径）
  - 账户锁定事件（用户名、解锁时间）
- Railway Logs 面板可实时查看

## 九、上线后监控建议

1. **第一周密切关注 Railway Metrics**：
   - CPU/内存使用率异常飙升 → 可能遭受攻击
   - 网络流量激增 → 检查是否 DDoS
   - 预算：$5 不够立即升级或临时下线

2. **定期查看日志**（Railway 服务 → Logs）：
   - 搜索 `登录失败`、`频率超限`、`账户锁定` 关键词
   - 同一 IP 短时间大量 429 → 考虑永久封禁

3. **Cloudflare Pages 开启"Under Attack Mode"**（可选）：
   - 前端已在 Cloudflare，可临时开启 5 秒浏览器验证
   - 路径：Pages 项目 → Settings → Security → Under Attack Mode

4. **数据库备份**：
   - Railway MySQL 服务 → Backups → 启用自动备份
   - 防止恶意注册塞满数据库后无法恢复

## 十、成本预估（含安全防护后）

| 场景 | Railway 月成本 | 说明 |
|------|---------------|------|
| 轻负载（<100 日活） | **$5** | Hobby 额度够用 |
| 中度负载（100~500 日活） | **$8~15** | 超出部分按量计费 |
| 遭受持续攻击 | **$20~50+** | 限流会挡大部分,但仍有成本 |

**省钱技巧**：前端套 Cloudflare 免费 CDN + DDoS 防护，后端流量费能省 70%。

