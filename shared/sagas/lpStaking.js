import { takeEvery, call, put, select, apply, delay } from 'redux-saga/effects'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import * as actions from 'actions/lpStaking'
import { RPC_URL, getLpStakingConfig, CHAIN_CONFIG, CHAIN_ID } from 'config/contracts'
import LP_STAKING_ABI from 'config/abi/lp-staking.json'
import { web3auth } from './auth'
import logger from './logger'

// ERC20 ABI (只需要 balanceOf, allowance, approve)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

/**
 * 获取合约信息（只读）
 */
function* fetchContractInfoSaga() {
  try {
    yield put(actions.updateContractInfo({ loading: true, error: null }))
    
    const config = getLpStakingConfig()
    if (!config.stakingContract) {
      throw new Error('LP Staking contract not configured')
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(config.stakingContract, LP_STAKING_ABI, provider)
    
    // 获取合约信息
    const info = yield call([contract, contract.getContractInfo])
    const isCampaignEnded = yield call([contract, contract.isCampaignEnded])
    
    yield put(actions.updateContractInfo({
      loading: false,
      lpToken: info._lpToken,
      endTimestamp: Number(info._endTimestamp),
      totalDeposits: ethers.formatEther(info._totalDeposits),
      participantCount: Number(info._participantCount),
      isPaused: info._isPaused,
      isCampaignEnded,
    }))
    
    logger.info('[LpStaking] Contract info fetched', {
      totalDeposits: ethers.formatEther(info._totalDeposits),
      participantCount: Number(info._participantCount),
    })
  } catch (error) {
    logger.error('[LpStaking] fetchContractInfo error:', error)
    yield put(actions.updateContractInfo({ loading: false, error: error.message }))
  }
}

/**
 * 获取用户质押状态（只读）
 */
function* fetchUserStakingSaga() {
  try {
    yield put(actions.updateUserStaking({ loading: true, error: null }))
    
    const profile = yield select(state => state.auth.profile)
    if (!profile?.wallet_address) {
      yield put(actions.updateUserStaking({ loading: false }))
      return
    }
    
    const config = getLpStakingConfig()
    if (!config.stakingContract || !config.lpToken) {
      throw new Error('LP Staking not configured')
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const stakingContract = new ethers.Contract(config.stakingContract, LP_STAKING_ABI, provider)
    const lpTokenContract = new ethers.Contract(config.lpToken, ERC20_ABI, provider)
    
    // 获取用户质押状态
    const userState = yield call([stakingContract, stakingContract.getUserState], profile.wallet_address)
    
    // 获取用户 LP Token 余额和授权额度
    const lpBalance = yield call([lpTokenContract, lpTokenContract.balanceOf], profile.wallet_address)
    const allowance = yield call([lpTokenContract, lpTokenContract.allowance], profile.wallet_address, config.stakingContract)
    
    yield put(actions.updateUserStaking({
      loading: false,
      balance: ethers.formatEther(userState.balance),
      points: ethers.formatEther(userState.points),
      lastUpdate: Number(userState.lastUpdate),
      lpBalance: ethers.formatEther(lpBalance),
      allowance: ethers.formatEther(allowance),
    }))
    
    logger.info('[LpStaking] User staking fetched', {
      balance: ethers.formatEther(userState.balance),
      points: ethers.formatEther(userState.points),
    })
  } catch (error) {
    logger.error('[LpStaking] fetchUserStaking error:', error)
    yield put(actions.updateUserStaking({ loading: false, error: error.message }))
  }
}

/**
 * 等待 Web3Auth 就绪
 */
function* waitWeb3AuthReady() {
  let waitCount = 0
  const maxWait = 20
  
  while (web3auth && web3auth.status !== 'ready' && web3auth.status !== 'connected' && waitCount < maxWait) {
    logger.info('[LpStaking] waiting for Web3Auth, status:', web3auth?.status)
    yield delay(500)
    waitCount++
  }
  
  if (!web3auth || (web3auth.status !== 'ready' && web3auth.status !== 'connected')) {
    throw new Error('Web3Auth not ready. Please refresh and try again.')
  }
}

/**
 * 切换到目标网络
 */
function* switchToTargetChain(provider) {
  const chainConfig = CHAIN_CONFIG[CHAIN_ID]
  if (!chainConfig) {
    throw new Error(`Chain ${CHAIN_ID} not configured`)
  }
  
  try {
    yield apply(provider, provider.request, [{
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainConfig.chainId }]
    }])
  } catch (switchError) {
    if (switchError.code === 4902) {
      yield apply(provider, provider.request, [{
        method: 'wallet_addEthereumChain',
        params: [chainConfig]
      }])
    } else if (switchError.code === 4001) {
      throw new Error('User rejected network switch')
    } else {
      throw switchError
    }
  }
}

/**
 * 授权 LP Token
 */
function* approveLpSaga({ payload }) {
  const { amount, onSuccess, onError } = payload
  
  try {
    yield call(waitWeb3AuthReady)
    
    const provider = web3auth.provider
    if (!provider) {
      throw new Error('Wallet not connected')
    }
    
    yield call(switchToTargetChain, provider)
    
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    
    const config = getLpStakingConfig()
    const lpTokenContract = new ethers.Contract(config.lpToken, ERC20_ABI, signer)
    
    // 授权最大值
    const maxApproval = ethers.MaxUint256
    logger.info('[LpStaking] Approving LP Token...')
    
    const tx = yield call([lpTokenContract, lpTokenContract.approve], config.stakingContract, maxApproval)
    logger.info('[LpStaking] Approve tx sent:', tx.hash)
    
    yield call([tx, tx.wait])
    logger.info('[LpStaking] Approve confirmed')
    
    toast.success('LP Token approved!')
    
    // 刷新用户数据
    yield put(actions.fetchUserStaking())
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    logger.error('[LpStaking] approve error:', error)
    const message = error.reason || error.message || 'Approve failed'
    toast.error(message)
    onError && onError(message)
  }
}

/**
 * 质押 LP Token
 */
function* depositLpSaga({ payload }) {
  const { amount, onSuccess, onError } = payload
  
  try {
    yield call(waitWeb3AuthReady)
    
    const provider = web3auth.provider
    if (!provider) {
      throw new Error('Wallet not connected')
    }
    
    yield call(switchToTargetChain, provider)
    
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    
    const config = getLpStakingConfig()
    const stakingContract = new ethers.Contract(config.stakingContract, LP_STAKING_ABI, signer)
    
    const amountWei = ethers.parseEther(amount)
    logger.info('[LpStaking] Depositing', amount, 'LP')
    
    const tx = yield call([stakingContract, stakingContract.deposit], amountWei)
    logger.info('[LpStaking] Deposit tx sent:', tx.hash)
    
    yield call([tx, tx.wait])
    logger.info('[LpStaking] Deposit confirmed')
    
    toast.success(`Deposited ${amount} LP!`)
    
    // 刷新数据
    yield put(actions.fetchContractInfo())
    yield put(actions.fetchUserStaking())
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    logger.error('[LpStaking] deposit error:', error)
    const message = error.reason || error.message || 'Deposit failed'
    toast.error(message)
    onError && onError(message)
  }
}

/**
 * 取消质押 LP Token
 */
function* withdrawLpSaga({ payload }) {
  const { amount, onSuccess, onError } = payload
  
  try {
    yield call(waitWeb3AuthReady)
    
    const provider = web3auth.provider
    if (!provider) {
      throw new Error('Wallet not connected')
    }
    
    yield call(switchToTargetChain, provider)
    
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    
    const config = getLpStakingConfig()
    const stakingContract = new ethers.Contract(config.stakingContract, LP_STAKING_ABI, signer)
    
    const amountWei = ethers.parseEther(amount)
    logger.info('[LpStaking] Withdrawing', amount, 'LP')
    
    const tx = yield call([stakingContract, stakingContract.withdraw], amountWei)
    logger.info('[LpStaking] Withdraw tx sent:', tx.hash)
    
    yield call([tx, tx.wait])
    logger.info('[LpStaking] Withdraw confirmed')
    
    toast.success(`Withdrawn ${amount} LP!`)
    
    // 刷新数据
    yield put(actions.fetchContractInfo())
    yield put(actions.fetchUserStaking())
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    logger.error('[LpStaking] withdraw error:', error)
    const message = error.reason || error.message || 'Withdraw failed'
    toast.error(message)
    onError && onError(message)
  }
}

/**
 * 取消全部质押
 */
function* withdrawAllLpSaga({ payload }) {
  const { onSuccess, onError } = payload || {}
  
  try {
    yield call(waitWeb3AuthReady)
    
    const provider = web3auth.provider
    if (!provider) {
      throw new Error('Wallet not connected')
    }
    
    yield call(switchToTargetChain, provider)
    
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    
    const config = getLpStakingConfig()
    const stakingContract = new ethers.Contract(config.stakingContract, LP_STAKING_ABI, signer)
    
    logger.info('[LpStaking] Withdrawing all LP')
    
    const tx = yield call([stakingContract, stakingContract.withdrawAll])
    logger.info('[LpStaking] WithdrawAll tx sent:', tx.hash)
    
    yield call([tx, tx.wait])
    logger.info('[LpStaking] WithdrawAll confirmed')
    
    toast.success('All LP withdrawn!')
    
    // 刷新数据
    yield put(actions.fetchContractInfo())
    yield put(actions.fetchUserStaking())
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    logger.error('[LpStaking] withdrawAll error:', error)
    const message = error.reason || error.message || 'Withdraw all failed'
    toast.error(message)
    onError && onError(message)
  }
}

export default function* lpStakingSaga() {
  yield takeEvery(String(actions.fetchContractInfo), fetchContractInfoSaga)
  yield takeEvery(String(actions.fetchUserStaking), fetchUserStakingSaga)
  yield takeEvery(String(actions.approveLp), approveLpSaga)
  yield takeEvery(String(actions.depositLp), depositLpSaga)
  yield takeEvery(String(actions.withdrawLp), withdrawLpSaga)
  yield takeEvery(String(actions.withdrawAllLp), withdrawAllLpSaga)
}

