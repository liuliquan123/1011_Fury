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
}, initialState)

