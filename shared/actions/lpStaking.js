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


