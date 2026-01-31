# 🚨 甲方操作指南（紧急）

## 📅 更新时间
2026-01-31

## 🎯 需要立即完成的操作

代码已推送到你的仓库 `git@github.com:liuliquan123/1011_Fury.git`，现在需要你在 Vercel 中完成配置并重新部署。

---

## ✅ 第一步：配置关键环境变量

登录 Vercel Dashboard，进入你的项目（绑定到 `liuliquan123/1011_Fury`）

### Settings → Environment Variables → 添加以下变量：

### 1. 最关键的环境控制变量

```bash
APP_ENV=production
```

- **Name**: `APP_ENV`
- **Value**: `production`
- **Environment**: 只勾选 **Production**

**说明**：这个变量控制使用哪个配置文件
- 不设置 → 使用 `staging.json`（测试网，CHAIN_ID=84532）❌
- 设置为 `production` → 使用 `production.json`（主网，CHAIN_ID=8453）✅

---

### 2. 确认 RPC URL 已配置（你已添加，再确认一次）

```bash
NEXT_PUBLIC_BASE_MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/O0Tda15HPvbkGk_1trKvZ
```

- **Environment**: 只勾选 **Production**

---

### 3. 其他建议配置的变量（可选，但推荐）

```bash
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_TOKEN_1011_MAINNET=0x7420726162497cd100d0038cA3ff2473Ba4Dd61a
NEXT_PUBLIC_SIGNATURE_CLAIM_MAINNET=0x22f198A0d94B3E410c5478f052CdA489f51418f0
NEXT_PUBLIC_LP_STAKING_CONTRACT_MAINNET=0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac
NEXT_PUBLIC_LP_TOKEN_MAINNET=0x2B6C35e8b2b0ffaf637C3cfbDE6bEF77A109B4fA
NEXT_PUBLIC_UNISWAP_ROUTER_MAINNET=0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24
NEXT_PUBLIC_WETH_MAINNET=0x4200000000000000000000000000000000000006
NEXT_PUBLIC_UNISWAP_PAIR_MAINNET=0x2B6C35e8b2b0ffaf637C3cfbDE6bEF77A109B4fA
NEXT_PUBLIC_SUPABASE_URL=https://npsdvkqmdkzadkzbxhbq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_wl9QBcaEFGJWauO77gIDiQ_VEmbEnxv
NEXT_PUBLIC_API_BASE_URL=https://npsdvkqmdkzadkzbxhbq.supabase.co/functions/v1
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BCkAjl_q8vF43zMg45PzrroZ7oE6Bq-thcCBseBXjSzzlV8XLMZEKQhh_dYCkdPRc6gdcLFdI4cSAMe0OVd4k6k
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=Fury1011Bot
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-CNW74S8FP0
NEXT_PUBLIC_APP_URL=https://你的域名.vercel.app
NEXT_PUBLIC_VISIBLE_EXCHANGES=binance
```

---

## ✅ 第二步：强制重新构建

**重要**：必须清除构建缓存，否则环境变量不会生效！

1. 进入 Vercel Dashboard → **Deployments**
2. 找到最新的部署
3. 点击右侧的 **...** → **Redeploy**
4. **取消勾选** "Use existing Build Cache"（强制重新构建）
5. 点击 **Redeploy**

---

## ✅ 第三步：验证部署结果

### 1. 检查构建日志

在 Deployment 详情中，查看 Build Logs，应该看到：

```
[Webpack] Building with APP_ENV=production, VERCEL_ENV=production
```

**如果看到**：
- `APP_ENV=staging` → `APP_ENV` 变量未生效
- `APP_ENV=undefined` → `APP_ENV` 变量未添加

### 2. 检查 RPC URL

在构建日志中搜索 "alchemy"，应该能找到你配置的 Alchemy URL。

### 3. 浏览器验证

部署完成后，打开网站，按 `F12` 打开控制台，运行：

```javascript
// 检查打包代码中的配置
fetch('/scripts/bundle.js').then(r => r.text()).then(code => {
  console.log('=== 配置验证 ===')
  
  // 检查 RPC URL
  const alchemyMatch = code.match(/https:\/\/base-mainnet\.g\.alchemy\.com/)
  console.log('1. Alchemy RPC:', alchemyMatch ? '✅ 已配置' : '❌ 使用 fallback')
  
  // 检查 ENV
  const envMatch = code.match(/ENV:"production"/)
  console.log('2. ENV:', envMatch ? '✅ production' : '❌ 其他环境')
  
  // 检查 Telegram Bot
  const botMatch = code.match(/Fury1011Bot/)
  console.log('3. Telegram Bot:', botMatch ? '✅ Fury1011Bot' : '❌ 错误')
  
  // 检查 LP Staking 主网合约
  const lpMainMatch = code.match(/0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac/)
  console.log('4. LP Staking 主网:', lpMainMatch ? '✅ 找到' : '❌ 未找到')
  
  // 检查是否有测试网合约（不应该有）
  const lpTestMatch = code.match(/0xdF5bF5f4c4DCc27161B028B0a80C62Ae26b828C4/)
  console.log('5. LP Staking 测试网:', lpTestMatch ? '⚠️ 还在用测试网！' : '✅ 已移除')
  
  console.log('\n如果所有项都是 ✅，配置成功！')
})
```

### 4. 测试 Telegram 登录

1. 点击 **TELEGRAM** 按钮
2. 控制台应该显示：
   ```
   [Telegram] User Agent: Mozilla/5.0 ...
   [Telegram] Desktop platform detected
   [Telegram] Desktop detected - using web link only
   [Telegram] Web link: https://t.me/Fury1011Bot?start=...
   [Telegram] Deep link will NOT be used
   [Telegram] Web window opened successfully
   ```

3. **不应该看到任何关于 `tg://` 协议的错误！**

---

## 🐛 如果仍有问题

### 问题 1：构建日志显示 `APP_ENV=staging`

**解决**：
- 确认 `APP_ENV=production` 变量的 Environment 选择了 **Production**（不是 Preview 或 Development）
- 重新部署

### 问题 2：RPC 仍然是 `https://mainnet.base.org`

**解决**：
- 确认 `NEXT_PUBLIC_BASE_MAINNET_RPC_URL` 已添加
- 确认值正确（包含 Alchemy API Key）
- 清除缓存重新部署

### 问题 3：Telegram 登录仍然报 `tg://` 错误

**解决**：
- 确认部署的代码版本是最新的（commit `c3b7316`）
- 查看控制台日志，确认显示 "Desktop detected - using web link only"
- 清除浏览器缓存（Ctrl+Shift+R）

---

## 📞 联系方式

如果按照上述步骤操作后仍有问题，请提供：
1. Vercel 构建日志截图（包含 `[Webpack] Building with APP_ENV=...` 这一行）
2. 浏览器控制台截图（包含 Telegram 登录的日志）
3. Environment Variables 配置截图

---

## 📋 快速检查清单

```
□ 1. 已添加 APP_ENV=production（Environment: Production）
□ 2. 已添加 NEXT_PUBLIC_BASE_MAINNET_RPC_URL（带 Alchemy URL）
□ 3. 已取消勾选 "Use existing Build Cache" 并重新部署
□ 4. 构建日志显示 APP_ENV=production
□ 5. 构建日志中能找到 alchemy.com
□ 6. 浏览器验证脚本全部显示 ✅
□ 7. Telegram 登录控制台显示 "using web link only"
□ 8. 没有 tg:// 协议错误
□ 9. LP Staking 显示正确的状态（Phase II）
```

---

**最后更新**：2026-01-31  
**关键提交**：`c3b7316` - Telegram 登录修复
