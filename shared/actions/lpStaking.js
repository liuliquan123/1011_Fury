import { createAction } from 'redux-actions'

// LP Staking Actions

// 获取合约信息
export const fetchContractInfo = createAction('lpStaking/FETCH_CONTRACT_INFO')
export const updateContractInfo = createAction('lpStaking/UPDATE_CONTRACT_INFO')

// 获取用户质押状态
export const fetchUserStaking = createAction('lpStaking/FETCH_USER_STAKING')
export const updateUserStaking = createAction('lpStaking/UPDATE_USER_STAKING')

// 质押操作
export const approveLp = createAction('lpStaking/APPROVE_LP')
export const depositLp = createAction('lpStaking/DEPOSIT_LP')
export const withdrawLp = createAction('lpStaking/WITHDRAW_LP')
export const withdrawAllLp = createAction('lpStaking/WITHDRAW_ALL_LP')

// Activity Log - 获取用户的质押/取消质押事件
export const fetchActivityLog = createAction('lpStaking/FETCH_ACTIVITY_LOG')
export const updateActivityLog = createAction('lpStaking/UPDATE_ACTIVITY_LOG')

// 获取总积分（用于计算空投比例）
export const fetchTotalPoints = createAction('lpStaking/FETCH_TOTAL_POINTS')
export const updateTotalPoints = createAction('lpStaking/UPDATE_TOTAL_POINTS')

// Uniswap V2 - Add Liquidity
export const fetchPairReserves = createAction('lpStaking/FETCH_PAIR_RESERVES')
export const updatePairReserves = createAction('lpStaking/UPDATE_PAIR_RESERVES')
export const addLiquidity = createAction('lpStaking/ADD_LIQUIDITY')
export const approvePairedToken = createAction('lpStaking/APPROVE_PAIRED_TOKEN')
export const fetchPairedTokenBalance = createAction('lpStaking/FETCH_PAIRED_TOKEN_BALANCE')
export const updatePairedTokenBalance = createAction('lpStaking/UPDATE_PAIRED_TOKEN_BALANCE')








