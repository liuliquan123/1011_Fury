# 🚀 Satoshi's Fury - 生产环境配置指南（甲方专用）

## ⚠️ 重要提示

此文档包含**仅供生产环境使用**的配置。请将以下所有环境变量添加到 **Vercel Dashboard** 中。

---

## 📋 配置步骤

### 第一步：登录 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目（绑定到 `liuliquan123/1011_Fury` 仓库的项目）
3. 进入 **Settings** → **Environment Variables**

### 第二步：添加环境变量

**重要：** 选择 **Production** 环境，然后逐个添加以下变量。

### 第三步：重新部署

配置完成后，在 **Deployments** 页面点击最新部署的 **Redeploy** 按钮。

---

## 🔑 必需的环境变量清单

### ⭐ 最关键配置（必须首先配置）

```bash
# ============================================
# 区块链网络配置 - 最关键！
# ============================================
# 此变量决定使用哪个区块链网络
# 8453 = Base Mainnet（生产环境）
# 84532 = Base Sepolia（测试环境）
NEXT_PUBLIC_CHAIN_ID=8453
```

**⚠️ 警告：** 如果没有配置此变量，系统可能使用测试网配置，导致合约地址错误！

---

### 🌐 RPC 节点配置

```bash
# ============================================
# RPC 节点配置
# ============================================
# 主网 RPC URL（Alchemy 节点）
NEXT_PUBLIC_BASE_MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/O0Tda15HPvbkGk_1trKvZ
```

---

### 📝 智能合约地址 - Base Mainnet

```bash
# ============================================
# 智能合约地址 - Base Mainnet (8453)
# ============================================
# 1011 Token 合约
NEXT_PUBLIC_TOKEN_1011_MAINNET=0x7420726162497cd100d0038cA3ff2473Ba4Dd61a

# SignatureClaim 合约（用户领取奖励）
NEXT_PUBLIC_SIGNATURE_CLAIM_MAINNET=0x22f198A0d94B3E410c5478f052CdA489f51418f0

# LP Staking 合约（流动性质押 - Phase II）
NEXT_PUBLIC_LP_STAKING_CONTRACT_MAINNET=0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac

# LP Token 地址（ETH-1011 Uniswap V2 LP）
NEXT_PUBLIC_LP_TOKEN_MAINNET=0x2B6C35e8b2b0ffaf637C3cfbDE6bEF77A109B4fA
```

---

### 🔄 Uniswap V2 配置

```bash
# ============================================
# Uniswap V2 配置 - Base Mainnet
# ============================================
# Uniswap V2 Router 地址
NEXT_PUBLIC_UNISWAP_ROUTER_MAINNET=0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24

# WETH 地址（Base 链原生代币包装合约）
NEXT_PUBLIC_WETH_MAINNET=0x4200000000000000000000000000000000000006

# ETH-1011 交易对地址
NEXT_PUBLIC_UNISWAP_PAIR_MAINNET=0x2B6C35e8b2b0ffaf637C3cfbDE6bEF77A109B4fA
```

---

### 🔐 API 配置

```bash
# ============================================
# Supabase API 配置
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://npsdvkqmdkzadkzbxhbq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_wl9QBcaEFGJWauO77gIDiQ_VEmbEnxv
NEXT_PUBLIC_API_BASE_URL=https://npsdvkqmdkzadkzbxhbq.supabase.co/functions/v1

# ============================================
# Web3Auth 配置
# ============================================
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BCkAjl_q8vF43zMg45PzrroZ7oE6Bq-thcCBseBXjSzzlV8XLMZEKQhh_dYCkdPRc6gdcLFdI4cSAMe0OVd4k6k
```

---

### 🤖 Telegram Bot 配置

```bash
# ============================================
# Telegram Bot 配置
# ============================================
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=Fury1011Bot
```

---

### 📊 Google Analytics

```bash
# ============================================
# Google Analytics
# ============================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-CNW74S8FP0
```

---

### 🌍 应用 URL

```bash
# ============================================
# 应用配置
# ============================================
# 替换为你的实际 Vercel 部署域名
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

### 💱 交易所显示配置（可选）

```bash
# ============================================
# 交易所显示配置
# ============================================
# 可选值：binance,okx,bybit,bitget（逗号分隔，无空格）
NEXT_PUBLIC_VISIBLE_EXCHANGES=binance
```

---

## ✅ 配置验证

### 方法 1: 检查 Vercel Dashboard

1. 进入 **Settings** → **Environment Variables**
2. 确认 **Production** 环境中有以下关键变量：
   - ✅ `NEXT_PUBLIC_CHAIN_ID` = `8453`
   - ✅ `NEXT_PUBLIC_LP_STAKING_CONTRACT_MAINNET` = `0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac`
   - ✅ `NEXT_PUBLIC_BASE_MAINNET_RPC_URL` = Alchemy URL

### 方法 2: 部署后浏览器验证

部署完成后，打开你的网站，按 `F12` 打开浏览器控制台，输入以下命令：

```javascript
// 检查当前网络配置
console.log('Chain ID:', process.env.NEXT_PUBLIC_CHAIN_ID)
console.log('LP Staking Contract:', process.env.NEXT_PUBLIC_LP_STAKING_CONTRACT_MAINNET)

// 应该输出：
// Chain ID: 8453
// LP Staking Contract: 0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac
```

**注意：** 如果看到 `undefined` 或错误的值，说明环境变量未正确配置。

### 方法 3: 验证 LP Staking 合约状态

访问 Base Scan 确认合约状态：

🔗 **LP Staking 合约**:  
https://basescan.org/address/0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac

在合约页面：
1. 点击 **Contract** → **Read Contract**
2. 查找 `currentPhase()` 函数
3. 确认返回值为 `1`（Phase II）或 `2`（Phase III）

---

## 🔧 常见问题

### Q1: LP Staking 显示"已结束"？

**原因：** 可能没有配置 `NEXT_PUBLIC_CHAIN_ID=8453`，导致系统使用了测试网配置。

**解决：**
1. 在 Vercel 添加 `NEXT_PUBLIC_CHAIN_ID=8453`
2. 添加 `NEXT_PUBLIC_LP_STAKING_CONTRACT_MAINNET=0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac`
3. 重新部署

### Q2: 如何重新部署？

1. 进入 Vercel Dashboard → **Deployments**
2. 找到最新的部署
3. 点击右侧的 **...** → **Redeploy**
4. 选择 **Use existing Build Cache** → **Redeploy**

### Q3: 配置后仍然不生效？

1. **清除浏览器缓存**：按 `Ctrl + Shift + Delete`（或 `Cmd + Shift + Delete`）
2. **强制刷新**：按 `Ctrl + Shift + R`（或 `Cmd + Shift + R`）
3. **检查 Vercel 部署日志**：确认最新部署使用了新的环境变量

---

## 📞 技术支持

如果配置过程中遇到问题，请联系开发团队并提供：

1. Vercel 部署日志截图
2. 浏览器控制台错误信息截图
3. 环境变量配置截图（注意隐藏敏感信息）

---

## 📝 配置清单（检查用）

复制此清单，逐项确认：

```
□ NEXT_PUBLIC_CHAIN_ID=8453
□ NEXT_PUBLIC_BASE_MAINNET_RPC_URL（Alchemy URL）
□ NEXT_PUBLIC_TOKEN_1011_MAINNET
□ NEXT_PUBLIC_SIGNATURE_CLAIM_MAINNET
□ NEXT_PUBLIC_LP_STAKING_CONTRACT_MAINNET
□ NEXT_PUBLIC_LP_TOKEN_MAINNET
□ NEXT_PUBLIC_UNISWAP_ROUTER_MAINNET
□ NEXT_PUBLIC_WETH_MAINNET
□ NEXT_PUBLIC_UNISWAP_PAIR_MAINNET
□ NEXT_PUBLIC_SUPABASE_URL
□ NEXT_PUBLIC_SUPABASE_ANON_KEY
□ NEXT_PUBLIC_API_BASE_URL
□ NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
□ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
□ NEXT_PUBLIC_GA_MEASUREMENT_ID
□ NEXT_PUBLIC_APP_URL（替换为实际域名）
□ NEXT_PUBLIC_VISIBLE_EXCHANGES
□ 已重新部署
□ 已清除浏览器缓存并验证
```

---

**最后更新：** 2026-01-31  
**版本：** 1.0 - 生产环境专用配置
