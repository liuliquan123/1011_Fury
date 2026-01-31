# Vercel 环境变量配置快速指南

## 📋 配置步骤

### 1. 复制环境变量

打开 `satoshis-fury-nextjs/.env.production` 文件，复制所有内容。

### 2. 在 Vercel 中配置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 点击 **Add New** → **Add Multiple**
5. 粘贴 `.env.production` 的全部内容
6. 选择环境：
   - ✅ **Production** （必选）
   - ✅ **Preview** （推荐）
   - ⬜ **Development** （可选）
7. 点击 **Add**

### 3. 触发重新部署

- 方式 1：在 **Deployments** 标签中，点击最新部署旁的 **⋯** → **Redeploy**
- 方式 2：推送新的代码到 Git 仓库，自动触发部署

## ✅ 验证配置

部署完成后，在浏览器控制台输入：

```javascript
console.log(process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL)
// 应该输出：https://base-mainnet.g.alchemy.com/v2/O0Tda15HPvbkGk_1trKvZ
```

## 📝 需要配置的环境变量清单

| 类别 | 变量数量 | 必需 |
|------|---------|------|
| 网络配置 | 1 | ✅ |
| RPC 节点 | 2 | ✅ |
| 智能合约地址 | 12 | ✅ |
| Uniswap V2 | 3 | ✅ |
| Supabase | 3 | ✅ |
| Web3Auth | 1 | ✅ |
| Telegram Bot | 1 | ✅ |
| Google Analytics | 1 | 推荐 |
| 应用配置 | 2 | 推荐 |
| **总计** | **26** | - |

## ⚠️ 重要提示

1. **不要提交 `.env.production` 到 Git**（已在 `.gitignore` 中）
2. 修改环境变量后必须重新部署才能生效
3. 所有 `NEXT_PUBLIC_` 开头的变量会暴露在客户端代码中
4. 确保 `NEXT_PUBLIC_APP_URL` 设置为你的实际域名

## 🔗 相关文档

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
