# LP 功能集成 - 待办清单

## 状态说明

- [ ] 未完成
- [x] 已完成

---

## 一、合约工程师

| 序号 | 状态 | 需要的内容 | 说明 |
|------|------|-----------|------|
| 1 | [x] | 1011 Token 合约地址 | `0x7420726162497cd100d0038cA3ff2473Ba4Dd61a` |
| 2 | [x] | LP Staking 合约地址 | `0x82Fd3C14e01E5b1c647AA14E5Db146070a47d204` (Base Sepolia 测试) |
| 3 | [x] | LP Staking 合约 ABI | 已保存至 `shared/config/abi/lp-staking.json` |
| 4 | [x] | 空投合约地址 | `0x22f198A0d94B3E410c5478f052CdA489f51418f0` |
| 5 | [x] | 空投合约 ABI 文件 | 已有 `shared/config/abi/signatureClaim.json` |
| 6 | [x] | LP Pool 创建 | 上线前提供，开发阶段使用测试 Token |
| 7 | [x] | LP Token 地址（测试） | `0xb5dDf8eDF044a997eB5863BF81700aaF145ED2f8` (Base Sepolia 测试) |
| 8 | [x] | 初始流动性添加 | 与前端无关，运营/合约层面处理 |
| 9 | [x] | 初始价格设定 | 与前端无关，运营/合约层面处理 |
| 10 | [x] | 空投合约函数说明 | 使用签名验证，非 Merkle Proof，详见下方速查表 |
| 11 | [ ] | 空投领取限制 | 等设计师完成后确认 |

---

## 二、设计师

| 序号 | 状态 | 需要的内容 | 说明 |
|------|------|-----------|------|
| 1 | [ ] | LP 功能入口设计 | Profile 页面入口位置和样式 |
| 2 | [ ] | LP 页面整体布局 | 添加流动性、质押、领取空投的布局 |
| 3 | [ ] | 添加流动性区域设计 | 输入框、按钮、预估数据展示 |
| 4 | [ ] | 质押 LP 区域设计 | 余额显示、输入框、Stake/Unstake 按钮 |
| 5 | [ ] | 我的质押信息设计 | 已质押数量、累计积分、质押时长展示 |
| 6 | [ ] | 空投领取区域设计 | 可领取数量、Claim 按钮 |
| 7 | [ ] | 移除流动性区域设计 | 用户退出时需要移除流动性 |
| 8 | [ ] | 授权步骤 UI | Approve Token 的加载状态和成功提示 |
| 9 | [ ] | 多步骤交易流程 | 如 Approve -> Stake 两步操作的进度展示 |
| 10 | [ ] | 空状态设计 | 无 LP、无质押、无可领取空投时的展示 |
| 11 | [ ] | 交易状态设计 | 等待确认、交易中、成功、失败的 UI 状态 |
| 12 | [ ] | 移动端适配 | 响应式布局 |

---

## 三、文案/产品

| 序号 | 状态 | 需要的内容 | 说明 |
|------|------|-----------|------|
| 1 | [ ] | 功能说明文案 | 什么是 LP、为什么要质押、积分规则 |
| 2 | [ ] | 按钮文案 | Add Liquidity / Stake / Unstake / Claim 是否需要本地化 |
| 3 | [ ] | 提示文案 | 授权提示、交易确认提示、成功/失败提示 |
| 4 | [ ] | 风险提示 | 无常损失说明、质押风险说明 |
| 5 | [ ] | FAQ | 常见问题解答内容 |
| 6 | [ ] | 多步骤操作说明 | 授权和交易是两步，需要向用户说明 |
| 7 | [ ] | 滑点说明 | 是否需要向用户解释滑点概念 |
| 8 | [ ] | Gas 费用说明 | 提示用户需要 Base ETH 作为 Gas |

---

## 四、后端

| 序号 | 状态 | 需要确认的内容 | 说明 |
|------|------|---------------|------|
| 1 | [ ] | 空投资格查询 API | 用户是否有资格领取、可领取数量 |
| 2 | [ ] | 签名生成 API | 空投使用签名验证，后端需提供 ClaimRequest + signature |
| 3 | [ ] | 质押事件同步确认 | 后端是否已配置监听 Base Mainnet 的质押合约事件 |
| 4 | [ ] | 历史记录 API | 用户的质押/取消质押历史查询（可选） |

备注：积分查询可直接调用合约 `pointsOf(address)` 函数，无需后端 API。

---

## 五、外部信息（前端自行查找）

| 序号 | 状态 | 需要的内容 | 说明 |
|------|------|-----------|------|
| 1 | [x] | Uniswap V2 Router 地址 | `0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24` |
| 2 | [x] | Uniswap V2 Factory 地址 | `0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6` |
| 3 | [x] | WETH 地址 | `0x4200000000000000000000000000000000000006` |
| 4 | [ ] | Uniswap V2 Router ABI | 标准 ABI |
| 5 | [ ] | Uniswap V2 Pair ABI | 标准 ABI |
| 6 | [ ] | ERC20 标准 ABI | 用于 Token Approve |

---

## 六、前端开发确认

| 序号 | 状态 | 需要确认/实现的内容 | 说明 |
|------|------|-------------------|------|
| 1 | [ ] | 滑点设置 | 默认 0.5%？是否允许用户修改？ |
| 2 | [ ] | 交易 deadline | 默认 20 分钟？ |
| 3 | [ ] | 价格显示 | 是否显示当前 1011/ETH 兑换率？ |
| 4 | [ ] | 余额刷新 | 交易成功后自动刷新余额 |
| 5 | [ ] | 错误处理 | 用户拒绝、Gas 不足、滑点过大等情况 |
| 6 | [ ] | 测试环境 | 开发阶段是否需要 Base Sepolia 测试？ |

---

## 七、运营/市场

| 序号 | 状态 | 需要确认的内容 | 说明 |
|------|------|---------------|------|
| 1 | [ ] | 功能上线时间 | LP 功能计划什么时候上线？ |
| 2 | [ ] | 公告文案 | 上线公告、社区通知 |
| 3 | [ ] | 教程 | 是否需要制作操作教程（图文/视频）？ |

---

## LP Staking 合约函数速查

ABI 文件位置：`shared/config/abi/lp-staking.json`

### 用户操作

| 函数 | 参数 | 说明 |
|------|------|------|
| `deposit(uint256 amount)` | amount: LP 数量（wei） | 质押 LP Token |
| `withdraw(uint256 amount)` | amount: LP 数量（wei） | 取消质押指定数量 |
| `withdrawAll()` | 无 | 取消全部质押 |

### 查询函数

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `balanceOf(address user)` | user: 用户地址 | uint256 | 用户已质押 LP 数量 |
| `pointsOf(address user)` | user: 用户地址 | uint256 | 用户累计积分 |
| `getUserState(address user)` | user: 用户地址 | (balance, points, lastUpdate) | 用户完整状态 |
| `getContractInfo()` | 无 | (lpToken, endTimestamp, totalDeposits, participantCount, isPaused, owner) | 合约整体信息 |
| `isCampaignEnded()` | 无 | bool | 活动是否已结束 |

### 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `Deposited(address indexed user, uint256 amount)` | user, amount | 用户质押 |
| `Withdrawn(address indexed user, uint256 amount)` | user, amount | 用户取消质押 |
| `CampaignEnded(uint256 endTimestamp)` | endTimestamp | 活动结束 |

---

## SignatureClaim 空投合约函数速查

ABI 文件位置：`shared/config/abi/signatureClaim.json`

合约地址：`0x22f198A0d94B3E410c5478f052CdA489f51418f0`

### Claim 流程

1. 后端生成签名（包含 claimer, amount, nonce, deadline）
2. 前端调用 `claim(request, signature)`

### 用户操作

| 函数 | 参数 | 说明 |
|------|------|------|
| `claim(ClaimRequest request, bytes signature)` | request: {claimer, amount, nonce, deadline}, signature: 后端签名 | 领取空投 |

### 查询函数

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getNonce(address user)` | user: 用户地址 | uint256 | 用户当前 nonce |
| `getPoolBalance()` | 无 | uint256 | 合约剩余可领取代币 |
| `getContractInfo()` | 无 | (admin, signer, token, poolBalance) | 合约信息 |
| `verifySignature(request, signature)` | request, signature | (valid, recoveredAddress) | 验证签名有效性 |

### 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `Claimed(address indexed claimer, uint256 amount, uint256 nonce)` | claimer, amount, nonce | 用户领取成功 |

### 后端需要提供

| 序号 | 内容 | 说明 |
|------|------|------|
| 1 | 签名生成 API | 根据用户地址返回 ClaimRequest + signature |
| 2 | Signer 私钥配置 | 后端需要持有 signer 私钥用于签名 |

---

## 更新记录

| 日期 | 更新内容 |
|------|----------|
| 2024-12-18 | 创建文档，保存 LP Staking ABI |
| 2024-12-18 | 添加 1011 Token 地址、空投合约地址、空投合约 ABI |
| 2024-12-18 | 添加 Uniswap V2 合约地址（Router、Factory、WETH） |

