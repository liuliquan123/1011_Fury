# 🚨 甲方 Vercel 环境配置紧急修复指南

## ⚠️ 核心问题

甲方 Vercel 项目显示 LP Staking "已结束"，实际应该在 Phase II 状态。

**根本原因**：构建时使用了 `staging.json`（测试网配置），而非 `production.json`（主网配置）。

---

## 🔑 最关键的环境变量（必须添加）

### 1. APP_ENV（控制使用哪个配置文件）

```bash
APP_ENV=production
```

**说明**：
- 这个变量决定使用 `production.json`（主网）还是 `staging.json`（测试网）
- **如果不设置**，默认使用 `staging.json`，导致：
  - `CHAIN_ID = 84532`（测试网）
  - `TELEGRAM_BOT_USERNAME = SatoshiFuryBot`（旧 Bot）
  - 所有合约地址都是测试网地址

**配置步骤**：
1. Vercel Dashboard → 选择项目
2. Settings → Environment Variables
3. 点击 **Add New**
4. Name: `APP_ENV`
5. Value: `production`
6. **Environment**: 只勾选 **Production**
7. 保存

---

## 📋 完整环境变量清单

### 必需配置（production.json 已有默认值，但建议显式配置）

```bash
# ========================================
# 1. 环境控制（最关键）
# ========================================
APP_ENV=production

# ========================================
# 2. 区块链网络配置
# ========================================
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_BASE_MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/O0Tda15HPvbkGk_1trKvZ

# ========================================
# 3. 智能合约地址 - Base Mainnet
# ========================================
NEXT_PUBLIC_TOKEN_1011_MAINNET=0x7420726162497cd100d0038cA3ff2473Ba4Dd61a
NEXT_PUBLIC_SIGNATURE_CLAIM_MAINNET=0x22f198A0d94B3E410c5478f052CdA489f51418f0
NEXT_PUBLIC_LP_STAKING_CONTRACT_MAINNET=0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac
NEXT_PUBLIC_LP_TOKEN_MAINNET=0x2B6C35e8b2b0ffaf637C3cfbDE6bEF77A109B4fA

# ========================================
# 4. Uniswap V2 配置
# ========================================
NEXT_PUBLIC_UNISWAP_ROUTER_MAINNET=0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24
NEXT_PUBLIC_WETH_MAINNET=0x4200000000000000000000000000000000000006
NEXT_PUBLIC_UNISWAP_PAIR_MAINNET=0x2B6C35e8b2b0ffaf637C3cfbDE6bEF77A109B4fA

# ========================================
# 5. Supabase API 配置
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://npsdvkqmdkzadkzbxhbq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_wl9QBcaEFGJWauO77gIDiQ_VEmbEnxv
NEXT_PUBLIC_API_BASE_URL=https://npsdvkqmdkzadkzbxhbq.supabase.co/functions/v1

# ========================================
# 6. Web3Auth 配置
# ========================================
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BCkAjl_q8vF43zMg45PzrroZ7oE6Bq-thcCBseBXjSzzlV8XLMZEKQhh_dYCkdPRc6gdcLFdI4cSAMe0OVd4k6k

# ========================================
# 7. Telegram Bot 配置
# ========================================
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=Fury1011Bot

# ========================================
# 8. Google Analytics
# ========================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-CNW74S8FP0

# ========================================
# 9. 应用 URL（替换为实际域名）
# ========================================
NEXT_PUBLIC_APP_URL=https://甲方的域名.vercel.app

# ========================================
# 10. 交易所显示配置
# ========================================
NEXT_PUBLIC_VISIBLE_EXCHANGES=binance
```

---

## ✅ 配置步骤

### 步骤 1：添加环境变量

1. 登录 Vercel Dashboard
2. 选择项目（`liuliquan123/1011_Fury`）
3. 进入 **Settings** → **Environment Variables**
4. 逐个添加上面的变量
5. **Environment** 选择：只勾选 **Production**

### 步骤 2：重新部署

1. 进入 **Deployments** 页面
2. 找到最新的部署
3. 点击右侧的 **...** → **Redeploy**
4. 确认重新部署

---

## 🔍 验证配置

### 方法 1：检查构建日志

在 Vercel Deployment 日志中，应该看到：

```
[Webpack] Building with APP_ENV=production, VERCEL_ENV=production
```

**如果看到**：
```
[Webpack] Building with APP_ENV=staging, VERCEL_ENV=preview
```

说明 `APP_ENV` 环境变量未生效。

### 方法 2：浏览器控制台验证

部署完成后，打开网站，按 `F12` 打开控制台，粘贴以下代码：

```javascript
console.log('=== 环境配置检查 ===')

import('./shared/constants/env/index.js').then(m => {
  const isCorrect = m.CHAIN_ID === 8453 && m.TELEGRAM_BOT_USERNAME === 'Fury1011Bot'
  
  console.log('ENV:', m.ENV, isCorrect ? '✅' : '❌')
  console.log('CHAIN_ID:', m.CHAIN_ID, m.CHAIN_ID === 8453 ? '✅ 主网' : '❌ 测试网')
  console.log('TELEGRAM_BOT_USERNAME:', m.TELEGRAM_BOT_USERNAME)
  console.log('GA_MEASUREMENT_ID:', m.GA_MEASUREMENT_ID)
  
  if (isCorrect) {
    console.log('\n✅✅✅ 配置正确：使用主网（Base Mainnet 8453）')
  } else {
    console.log('\n❌❌❌ 配置错误：仍在使用测试网')
    console.log('请检查 Vercel 中是否添加了 APP_ENV=production')
  }
})
```

**预期输出**：
```
=== 环境配置检查 ===
ENV: production ✅
CHAIN_ID: 8453 ✅ 主网
TELEGRAM_BOT_USERNAME: Fury1011Bot
GA_MEASUREMENT_ID: G-CNW74S8FP0

✅✅✅ 配置正确：使用主网（Base Mainnet 8453）
```

### 方法 3：检查合约地址

```javascript
import('./shared/config/contracts.js').then(m => {
  console.log('=== 合约配置检查 ===')
  console.log('CHAIN_ID:', m.CHAIN_ID)
  
  const lpConfig = m.getLpStakingConfig()
  console.log('LP Staking Contract:', lpConfig.stakingContract)
  console.log('LP Token:', lpConfig.lpToken)
  
  const isCorrect = lpConfig.stakingContract === '0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac'
  console.log(isCorrect ? '✅ 使用正确的主网合约' : '❌ 使用错误的测试网合约')
})
```

**预期输出**：
```
=== 合约配置检查 ===
CHAIN_ID: 8453
LP Staking Contract: 0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac
LP Token: 0x2B6C35e8b2b0ffaf637C3cfbDE6bEF77A109B4fA
✅ 使用正确的主网合约
```

---

## 🐛 常见问题

### Q1: 添加了 `APP_ENV=production` 但仍然显示测试网？

**解决**：
1. 确认变量添加到了 **Production** 环境（不是 Preview 或 Development）
2. 必须重新部署才能生效
3. 清除浏览器缓存（Ctrl + Shift + R 或 Cmd + Shift + R）

### Q2: Vercel 中看不到 `APP_ENV` 选项？

**解决**：
- 手动添加即可，Vercel 支持任意自定义环境变量

### Q3: LP Staking 仍然显示"已结束"？

**可能原因**：
1. `APP_ENV` 未设置或设置错误
2. 未重新部署
3. 浏览器缓存了旧版本

**解决**：
1. 确认 `APP_ENV=production` 已添加
2. 重新部署
3. 使用浏览器的无痕模式访问网站测试

---

## 📊 配置文件对比

| 配置项 | staging.json（测试网）❌ | production.json（主网）✅ |
|--------|----------------------|----------------------|
| ENV | staging | production |
| CHAIN_ID | **84532** (Base Sepolia) | **8453** (Base Mainnet) |
| TELEGRAM_BOT_USERNAME | SatoshiFuryBot（旧） | Fury1011Bot（新） |
| GA_MEASUREMENT_ID | G-KZHWPQ8P4B | G-CNW74S8FP0 |

---

## 📞 技术支持

如果按照上述步骤配置后仍有问题，请提供：
1. Vercel 构建日志截图
2. 浏览器控制台验证结果截图
3. Environment Variables 配置截图

---

**最后更新**：2026-01-31  
**版本**：2.0 - 环境配置紧急修复版
