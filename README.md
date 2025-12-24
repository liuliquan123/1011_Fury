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

打包后的文件在static/目录

## 🔐 环境变量配置

### 运行时环境变量
- **文件**: `shared/constants/env/production.json`
- **配置**:

| 环境变量 | 说明 |
|---------|------|
| `WEB3AUTH_CLIENT_ID` | web3auth 的 client id |
| `SUPABASE_URL` | supabase 的 api url |
| `SUPABASE_ANON_KEY` | supabase 的 api access key |
| `TELEGRAM_BOT_USERNAME` | telegram bot 名称 |
| `CHAIN_ID` | 目前支持的链ID |

## 🔐 其他
- **注意**: 由于web3auth的白名单限制(不支持localhost的URL)，本地登录会报错，若要测试登录功能可以发布到线上。
