import { handleActions } from 'utils/redux-actions'
import * as actions from 'actions/lpStaking'

// 默认轮次信息
const defaultRoundInfo = {
  startTime: 0,
  endTime: 0,
  rewardAmount: '0',
  fundedAmount: '0',
  totalPoints: '0',
}

// 默认用户轮次状态
const defaultUserRoundState = {
  points: '0',
  pendingPoints: '0',
  claimed: false,
  pendingReward: '0',
}

const initialState = {
  // 合约总体信息 (适配 PointsVaultRounds)
  contractInfo: {
    loading: false,
    error: null,
    lpToken: null,
    rewardToken: null,      // 新增：奖励代币地址
    startTime: 0,           // 新增：活动开始时间
    endTime: 0,             // 替代 endTimestamp：活动结束时间
    minDeposit: '0',        // 新增：最小存款限制
    totalStaked: '0',       // 替代 totalDeposits：当前总质押量
    participantCount: 0,
    isPaused: false,
    currentRound: 0,        // 新增：当前轮次 ID (0, 1, 2)
  },
  // 用户质押状态 (简化：积分改为按轮次查询)
  userStaking: {
    loading: false,
    error: null,
    balance: '0',           // 已质押数量 (balanceOf)
    lpBalance: '0',         // 钱包 LP 余额
    allowance: '0',         // 授权额度
  },
  // 三轮信息 (新增)
  roundsInfo: {
    loading: false,
    error: null,
    rounds: [
      { ...defaultRoundInfo },  // Round 0 (7 days)
      { ...defaultRoundInfo },  // Round 1 (30 days)
      { ...defaultRoundInfo },  // Round 2 (90 days)
    ],
  },
  // 用户在各轮的状态 (新增)
  userRoundsState: {
    loading: false,
    error: null,
    rounds: [
      { ...defaultUserRoundState },  // Round 0
      { ...defaultUserRoundState },  // Round 1
      { ...defaultUserRoundState },  // Round 2
    ],
  },
  // Activity Log - 用户的质押/取消质押历史
  activityLog: {
    loading: false,
    error: null,
    events: [],              // { type: 'Staked'|'Unstaked', amount, timestamp, txHash, blockNumber }
  },
  // Uniswap V2 Pair 储备量（用于价格计算）
  pairReserves: {
    loading: false,
    error: null,
    reserveETH: '0',
    reservePairedToken: '0', // USDC or 1011
    token0: null,            // token0 地址
    token1: null,            // token1 地址
    isToken0WETH: true,      // token0 是否是 WETH
  },
  // 配对代币余额（USDC or 1011）
  pairedTokenBalance: {
    loading: false,
    balance: '0',
    allowance: '0',          // 对 Router 的授权额度
  },
  // 交易状态
  txPending: false,
}

export default handleActions({
  // 合约信息
  [actions.updateContractInfo] (state, action) {
    Object.assign(state.contractInfo, action.payload)
  },
  
  // 用户质押状态
  [actions.updateUserStaking] (state, action) {
    Object.assign(state.userStaking, action.payload)
  },
  
  // 三轮信息
  [actions.fetchRoundsInfo] (state) {
    state.roundsInfo.loading = true
    state.roundsInfo.error = null
  },
  [actions.updateRoundsInfo] (state, action) {
    if (action.payload.loading !== undefined) {
      state.roundsInfo.loading = action.payload.loading
    }
    if (action.payload.error !== undefined) {
      state.roundsInfo.error = action.payload.error
    }
    if (action.payload.rounds) {
      state.roundsInfo.rounds = action.payload.rounds
    }
  },
  
  // 用户各轮状态
  [actions.fetchUserRoundsState] (state) {
    state.userRoundsState.loading = true
    state.userRoundsState.error = null
  },
  [actions.updateUserRoundsState] (state, action) {
    if (action.payload.loading !== undefined) {
      state.userRoundsState.loading = action.payload.loading
    }
    if (action.payload.error !== undefined) {
      state.userRoundsState.error = action.payload.error
    }
    if (action.payload.rounds) {
      state.userRoundsState.rounds = action.payload.rounds
    }
  },
  
  // Activity Log
  [actions.updateActivityLog] (state, action) {
    Object.assign(state.activityLog, action.payload)
  },
  
  // Uniswap V2 相关
  [actions.updatePairReserves] (state, action) {
    Object.assign(state.pairReserves, action.payload)
  },
  [actions.updatePairedTokenBalance] (state, action) {
    Object.assign(state.pairedTokenBalance, action.payload)
  },
  
  // 交易状态
  [actions.approveLp] (state) {
    state.txPending = true
  },
  [actions.depositLp] (state) {
    state.txPending = true
  },
  [actions.withdrawLp] (state) {
    state.txPending = true
  },
  [actions.withdrawAllLp] (state) {
    state.txPending = true
  },
  [actions.addLiquidity] (state) {
    state.txPending = true
  },
  [actions.approvePairedToken] (state) {
    state.txPending = true
  },
  [actions.claimReward] (state) {
    state.txPending = true
  },
}, initialState)
