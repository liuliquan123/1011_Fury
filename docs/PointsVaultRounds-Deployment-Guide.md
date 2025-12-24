# PointsVaultRounds 部署与运营指南

## 概述

PointsVaultRounds 是一个三轮 LP 质押奖励合约，用户质押 LP 代币获取时间加权积分，按积分比例领取 ERC20 奖励代币。

### 轮次结构

| 轮次 | 时长 | 时间范围 |
|------|------|----------|
| Round 1 | 7 天 | [T0, T0 + 7d) |
| Round 2 | 30 天 | [T0 + 7d, T0 + 37d) |
| Round 3 | 90 天 | [T0 + 37d, T0 + 127d) |
| **总计** | **127 天** | |

### 核心机制

- **积分计算**: `points = balance × time`（LP-秒）
- **奖励分配**: `reward = userPoints / totalPoints × rewardAmount`
- **领取条件**: 轮次结束 + 资金充足（`fundedAmount >= rewardAmount`）

---

## 部署前准备

### 1. 确认代币地址

```
□ LP Token 地址（Uniswap V2 LP 或兼容代币）
□ Reward Token 地址（奖励代币，需要 approve 给合约）
□ Owner 地址（管理员钱包）
```

### 2. 规划时间线

```
□ 确定 startTime（必须是未来时间戳）
□ 预留充足的宣传期（建议 startTime 前 3-7 天部署）
□ 考虑时区差异（使用 UTC 时间戳）
```

### 3. 设置奖励数量

`_rewardAmounts` 是一个长度为 3 的数组，按顺序对应三轮的奖励：

```
_rewardAmounts = [第一轮奖励, 第二轮奖励, 第三轮奖励]
```

**示例**: 第一轮 1,000 token，第二轮 3,000 token，第三轮 5,000 token（假设 18 位小数）：

```javascript
const REWARD_AMOUNTS = [
  ethers.parseEther("1000"),   // Round 1: 1,000 tokens
  ethers.parseEther("3000"),   // Round 2: 3,000 tokens
  ethers.parseEther("5000"),   // Round 3: 5,000 tokens
];
// 总计: 9,000 tokens
```

**注意**: 数值需要包含代币的 decimals。18 位小数用 `parseEther()`，其他精度需手动计算。

### 4. 准备奖励代币

```
□ 计算总奖励数量 = sum(_rewardAmounts)
□ 确保 Owner 地址持有足够的 Reward Token
□ 在部署后需要 approve 并调用 fund()
```

---

## 部署步骤

### 1. 构造函数参数

```solidity
constructor(
    address _lpToken,           // LP 代币地址
    address _rewardToken,       // 奖励代币地址
    uint256 _startTime,         // 开始时间戳（秒）
    uint256 _minDeposit,        // 最小存款（防 DoS，可设 0）
    uint256[3] memory _rewardAmounts,  // 三轮奖励数量
    address _owner              // 管理员地址
)
```

### 2. 部署脚本示例

```javascript
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 配置参数
  const LP_TOKEN = "0x...";           // LP Token 地址
  const REWARD_TOKEN = "0x...";       // Reward Token 地址
  const OWNER = "0x...";              // Owner 地址（建议多签）

  // 开始时间：部署后 3 天
  const START_TIME = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60;

  // 最小存款：1 LP（18位小数）
  const MIN_DEPOSIT = ethers.parseEther("1");

  // 三轮奖励：总计 9,000 REWARD
  const REWARD_AMOUNTS = [
    ethers.parseEther("1000"),    // Round 1: 1,000
    ethers.parseEther("3000"),    // Round 2: 3,000
    ethers.parseEther("5000"),    // Round 3: 5,000
  ];

  // 部署
  const PointsVaultRounds = await ethers.getContractFactory("PointsVaultRounds");
  const vault = await PointsVaultRounds.deploy(
    LP_TOKEN,
    REWARD_TOKEN,
    START_TIME,
    MIN_DEPOSIT,
    REWARD_AMOUNTS,
    OWNER
  );

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("PointsVaultRounds deployed to:", vaultAddress);
  console.log("Start time:", new Date(START_TIME * 1000).toISOString());
  console.log("End time:", new Date((START_TIME + 127 * 24 * 60 * 60) * 1000).toISOString());

  // 验证合约（可选）
  console.log("\nVerify command:");
  console.log(`npx hardhat verify --network <network> ${vaultAddress} \\
    ${LP_TOKEN} \\
    ${REWARD_TOKEN} \\
    ${START_TIME} \\
    ${MIN_DEPOSIT} \\
    "[${REWARD_AMOUNTS.map(a => a.toString()).join(',')}]" \\
    ${OWNER}`);
}

main().catch(console.error);
```

### 3. 部署后验证

```javascript
// 验证部署参数
const info = await vault.getContractInfo();
console.log("LP Token:", info._lpToken);
console.log("Reward Token:", info._rewardToken);
console.log("Start Time:", new Date(Number(info._startTime) * 1000));
console.log("End Time:", new Date(Number(info._endTime) * 1000));
console.log("Min Deposit:", ethers.formatEther(info._minDeposit));
console.log("Owner:", info._owner);

// 验证各轮次配置
for (let i = 0; i < 3; i++) {
  const round = await vault.getRoundInfo(i);
  console.log(`\nRound ${i + 1}:`);
  console.log("  Start:", new Date(Number(round._startTime) * 1000));
  console.log("  End:", new Date(Number(round._endTime) * 1000));
  console.log("  Reward:", ethers.formatEther(round._rewardAmount));
  console.log("  Funded:", ethers.formatEther(round._fundedAmount));
}
```

---

## 运营流程

### 阶段一：部署后 - 活动开始前

#### 1. 为各轮次充值奖励

```javascript
// Owner 需要先 approve
const rewardToken = await ethers.getContractAt("IERC20", REWARD_TOKEN);
const totalRewards = REWARD_AMOUNTS.reduce((a, b) => a + b, 0n);
await rewardToken.approve(vaultAddress, totalRewards);

// 为每轮充值
await vault.fund(0, REWARD_AMOUNTS[0]);  // Round 1
await vault.fund(1, REWARD_AMOUNTS[1]);  // Round 2
await vault.fund(2, REWARD_AMOUNTS[2]);  // Round 3

// 验证充值结果
for (let i = 0; i < 3; i++) {
  const round = await vault.getRoundInfo(i);
  console.log(`Round ${i + 1} funded: ${ethers.formatEther(round._fundedAmount)}`);
}
```

**重要**: 可以分多次充值，只要在用户领取前 `fundedAmount >= rewardAmount` 即可。

#### 2. 宣传与公告

```
□ 公布合约地址和开始时间
□ 说明各轮次奖励数量和规则
□ 提醒用户需要先 approve LP Token
□ 说明积分计算规则（质押时长 × 数量）
```

### 阶段二：活动进行中

#### 1. 监控指标

```javascript
// 定期检查关键指标
async function checkStatus() {
  const info = await vault.getContractInfo();
  console.log("Total Staked:", ethers.formatEther(info._totalStaked));
  console.log("Participants:", info._participantCount.toString());
  console.log("Is Paused:", info._isPaused);
  console.log("Current Round:", (await vault.currentRound()).toString());
}
```

#### 2. 紧急情况处理

**暂停存款**（不影响提款和领取）:
```javascript
await vault.pause();   // 暂停
await vault.unpause(); // 恢复
```

**注意**: 暂停只影响 `deposit()`，用户始终可以 `withdraw()` 和 `claim()`。

### 阶段三：轮次结束后

#### 1. 验证领取条件

```javascript
// 检查某轮次是否可领取
async function canClaim(roundId) {
  const round = await vault.getRoundInfo(roundId);
  const now = Math.floor(Date.now() / 1000);

  const ended = now >= Number(round._endTime);
  const funded = round._fundedAmount >= round._rewardAmount;

  console.log(`Round ${roundId + 1}:`);
  console.log("  Ended:", ended);
  console.log("  Funded:", funded, `(${ethers.formatEther(round._fundedAmount)} / ${ethers.formatEther(round._rewardAmount)})`);
  console.log("  Can Claim:", ended && funded);

  return ended && funded;
}
```

#### 2. 追加充值（如需要）

如果发现某轮次资金不足：
```javascript
const round = await vault.getRoundInfo(roundId);
const deficit = round._rewardAmount - round._fundedAmount;
if (deficit > 0n) {
  await rewardToken.approve(vaultAddress, deficit);
  await vault.fund(roundId, deficit);
}
```

### 阶段四：活动结束后

#### 1. 所有轮次结束（127天后）

- 用户仍可随时领取奖励（无时间限制）
- 用户可随时提取 LP Token
- 合约进入维护状态

#### 2. 处理剩余资金

**注意**: 合约设计为**不能**通过 `rescueTokens` 取出 LP Token 和 Reward Token，这是安全特性。

如果有未领取的奖励，它们将永久留在合约中，等待用户领取。

---

## 安全注意事项

### 1. Owner 权限

Owner 可以执行的操作：
- `fund()`: 充值奖励代币
- `pause()/unpause()`: 暂停/恢复存款
- `rescueTokens()`: 救援误发的其他代币（**不包括** LP 和 Reward Token）
- `transferOwnership()`: 转移所有权（两步验证）

Owner **不能**执行的操作：
- 取出用户存入的 LP Token
- 取出已充值的 Reward Token
- 修改轮次时间或奖励数量
- 修改用户积分

### 2. 用户资金安全

```
✓ LP Token 只能由存入者本人提取
✓ Reward Token 只能通过 claim() 按积分比例领取
✓ 即使合约被 pause，用户仍可 withdraw
✓ Owner 无法触及用户资金
```

### 3. 时间戳依赖

合约依赖 `block.timestamp` 计算积分：
- 矿工可以小范围操纵（约 15 秒）
- 对于天/周级别的轮次影响可忽略
- 不要用于高精度时间敏感场景

### 4. 溢出保护

合约使用 `Math.mulDiv` 进行乘法运算：
- 防止大数值溢出导致 revert
- 支持极端大额质押（最高测试 10^36）

---

## 常见问题排查

### Q1: 用户无法存款

检查清单：
```
□ 活动是否已开始？(block.timestamp >= startTime)
□ 活动是否已结束？(block.timestamp < endTime)
□ 合约是否被暂停？(paused() == false)
□ 存款金额是否达到最低要求？(amount >= minDeposit)
□ 用户是否已 approve LP Token？
```

### Q2: 用户无法领取奖励

检查清单：
```
□ 该轮次是否已结束？(block.timestamp >= round.endTime)
□ 资金是否充足？(fundedAmount >= rewardAmount)
□ 用户是否有积分？(pendingPoints > 0)
□ 用户是否已领取过？(claimed == false)
```

### Q3: 显示的积分不正确

积分 = 质押数量 × 质押时长（秒）

检查：
```javascript
// 获取用户实时积分
const points = await vault.pendingPoints(userAddress, roundId);

// 获取用户状态
const [userPoints, claimed] = await vault.getUserRoundState(userAddress, roundId);
```

### Q4: 预估奖励与实际不符

奖励 = 用户积分 / 总积分 × 轮次奖励

注意：
- `calculateReward()` 只在轮次结束后返回准确值
- 进行中的轮次，总积分会持续增长
- 其他用户的存取款会影响奖励比例