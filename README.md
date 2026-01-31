# Satoshi's Fury Reconstruction

一个基于 React + Redux 的 Web3 应用，集成了 Supabase 后端服务和区块链功能（Base 网络）。

## 🔧 系统要求

- **Node.js**: >= 16.x
- **包管理器**: pnpm >= 10.13.1（推荐，项目使用 `pnpm` 作为包管理器）
- **操作系统**: macOS / Linux / Windows

## 🚀 本地开发环境设置

### 1. 安装依赖

```bash
pnpm install
```

### 2. 本地运行 (http://localhost:4001)

```bash
pnpm start
```

### 3. 打包发布

```bash
pnpm run build
```

打包后的文件在 `static/` 目录

## 🚢 部署发布

### 方式一：使用 Vercel 部署（推荐）

项目已配置 `vercel.json`，可以直接部署到 Vercel：

1. **安装 Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**:
   ```bash
   vercel login
   ```

3. **部署**:
   ```bash
   # 预览部署
   vercel

   # 生产部署
   vercel --prod
   ```

   Vercel 会自动运行构建命令并部署 `static/` 目录，同时配置好 SPA 路由重写。

### 方式二：手动部署到 AWS/Google Cloud

1. **构建项目**:
   ```bash
   pnpm run build
   ```

2. **上传文件到服务器**:

   将 `static/` 目录下的所有文件上传到服务器的网站根目录（如 `/var/www/html` 或 `/usr/share/nginx/html`）

   ```bash
   # 示例：使用 scp 上传
   scp -r static/* user@your-server:/var/www/html/
   ```

3. **配置 Nginx**:

   创建或编辑 Nginx 配置文件（如 `/etc/nginx/sites-available/default` 或 `/etc/nginx/conf.d/default.conf`）:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;  # 或你的网站根目录
       index index.html;

       # SPA 路由支持：所有请求重定向到 index.html
       location / {
           try_files $uri $uri/ /index.html;
       }

       # 静态资源缓存
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Gzip 压缩
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

4. **测试并重启 Nginx**:
   ```bash
   # 测试配置
   sudo nginx -t

   # 重启 Nginx
   sudo systemctl restart nginx
   # 或
   sudo service nginx restart
   ```

5. **配置 HTTPS（推荐）**:

   使用 Let's Encrypt 免费 SSL 证书:

   ```bash
   # 安装 certbot
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx

   # 获取证书并自动配置 Nginx
   sudo certbot --nginx -d your-domain.com
   ```

**注意**: 单页应用必须配置路由重写（`try_files $uri $uri/ /index.html;`），否则刷新页面会出现 404 错误。

## 🔐 环境变量配置

### ⚠️ 重要变更（2025-01）

项目已重构为**环境变量驱动**的配置方式，所有敏感配置（RPC URL、合约地址等）现在从环境变量读取。

### 本地开发配置

1. **复制环境变量模板**：
   ```bash
   cp .env.example .env.local
   ```

2. **填写真实配置值**：
   编辑 `.env.local` 文件，填入你的实际配置（参考 `.env.production` 文件）

3. **重启开发服务器**：
   ```bash
   pnpm start
   ```

### Vercel 部署配置

**详细步骤请参考：[VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)**

快速步骤：
1. 打开 `.env.production` 文件
2. 复制所有内容
3. 在 Vercel Dashboard → Settings → Environment Variables 中粘贴
4. 选择 **Production** 环境
5. 重新部署

### 环境变量列表

| 类别 | 变量 | 说明 |
|------|------|------|
| **网络** | `NEXT_PUBLIC_CHAIN_ID` | 链 ID（8453=主网, 84532=测试网）|
| **RPC** | `NEXT_PUBLIC_BASE_MAINNET_RPC_URL` | 主网 RPC URL |
|  | `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` | 测试网 RPC URL |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
|  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公钥 |
| **Web3Auth** | `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` | Web3Auth 客户端 ID |
| **Telegram** | `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Telegram Bot 用户名 |
| **Analytics** | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID |
| **合约地址** | `NEXT_PUBLIC_TOKEN_1011_MAINNET` | 1011 Token 主网地址 |
|  | `NEXT_PUBLIC_SIGNATURE_CLAIM_MAINNET` | SignatureClaim 主网地址 |
|  | `NEXT_PUBLIC_LP_STAKING_CONTRACT_MAINNET` | LP Staking 主网地址 |
|  | ... | 更多合约地址见 `.env.example` |

完整环境变量列表请查看 `.env.example` 文件。

### 向后兼容

所有环境变量都提供了 fallback 默认值，如果未设置环境变量，将使用原有的硬编码值。

## 📊 数据埋点 (Google Analytics 4)

项目已集成 GA4 数据追踪，Measurement ID: `G-KZHWPQ8P4B`

### 追踪事件

| 事件 | 触发时机 | 参数 |
|------|----------|------|
| `page_view` | 页面切换 | `page_path`, `page_title` |
| `sign_up` | 新用户注册 | `method`, `referral_code` |
| `login` | 老用户登录 | `method` |
| `submit_evidence` | 提交证据成功 | `is_registered`, `exchange` |

### 登录方式 (method)

- `metamask` - MetaMask 钱包
- `email` - 邮箱登录
- `twitter` - Twitter 登录
- `telegram` - Telegram 登录

### 后端配合

为区分新用户和老用户，后端 `web3AuthLogin` API 需返回 `is_new_user` 字段：

```json
{
  "token": "...",
  "refresh_token": "...",
  "user": { ... },
  "is_new_user": true  // 新增字段
}
```

### 相关文件

- `browser/index.html` - GA4 脚本
- `shared/utils/analytics.js` - 追踪工具模块
- `shared/pages/Root/index.jsx` - 页面浏览追踪
- `shared/sagas/auth.js` - 登录/注册/提交证据追踪

## 🔐 其他
- **注意**: 由于web3auth的白名单限制(不支持localhost的URL)，本地登录会报错，若要测试登录功能可以发布到线上。
