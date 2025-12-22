import { handleActions } from 'utils/redux-actions'
import * as actions from 'actions/lpStaking'

const initialState = {
  // 合约总体信息
  contractInfo: {
    loading: false,
    error: null,
    lpToken: null,
    endTimestamp: 0,
    totalDeposits: '0',
    participantCount: 0,
    isPaused: false,
    isCampaignEnded: false,
  },
  // 用户质押状态
  userStaking: {
    loading: false,
    error: null,
    balance: '0',        // 已质押数量
    points: '0',         // 累计积分
    lastUpdate: 0,       // 最后更新时间
    lpBalance: '0',      // 钱包 LP 余额
    allowance: '0',      // 授权额度
  },
  // Activity Log - 用户的质押/取消质押历史
  activityLog: {
    loading: false,
    error: null,
    events: [],          // { type: 'Deposited'|'Withdrawn', amount, timestamp, txHash, blockNumber }
  },
  // 总积分（用于计算空投比例）
  totalPoints: {
    loading: false,
    error: null,
    value: '0',          // 全网总积分
  },
  // Uniswap V2 Pair 储备量（用于价格计算）
  pairReserves: {
    loading: false,
    error: null,
    reserveETH: '0',
    reservePairedToken: '0', // USDC or 1011
    token0: null,        // token0 地址
    token1: null,        // token1 地址
    isToken0WETH: true,  // token0 是否是 WETH
  },
  // 配对代币余额（USDC or 1011）
  pairedTokenBalance: {
    loading: false,
    balance: '0',
    allowance: '0',      // 对 Router 的授权额度
  },
  // 交易状态
  txPending: false,
}

export default handleActions({
  [actions.updateContractInfo] (state, action) {
    Object.assign(state.contractInfo, action.payload)
  },
  
  [actions.updateUserStaking] (state, action) {
    Object.assign(state.userStaking, action.payload)
  },
  
  [actions.updateActivityLog] (state, action) {
    Object.assign(state.activityLog, action.payload)
  },
  
  [actions.updateTotalPoints] (state, action) {
    Object.assign(state.totalPoints, action.payload)
  },
  
  [actions.updatePairReserves] (state, action) {
    Object.assign(state.pairReserves, action.payload)
  },
  
  [actions.updatePairedTokenBalance] (state, action) {
    Object.assign(state.pairedTokenBalance, action.payload)
  },
  
  // 交易状态可以通过 payload 中的 txPending 更新
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
}, initialState)








