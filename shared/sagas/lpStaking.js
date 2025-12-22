import { takeEvery, call, put, select, apply, delay } from 'redux-saga/effects'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import { WALLET_CONNECTORS } from '@web3auth/modal'
import * as actions from 'actions/lpStaking'
import { RPC_URL, getLpStakingConfig, getUniswapV2Config, CHAIN_CONFIG, CHAIN_ID } from 'config/contracts'
import LP_STAKING_ABI from 'config/abi/lp-staking.json'
import UNISWAP_V2_ROUTER_ABI from 'config/abi/uniswap-v2-router.json'
import UNISWAP_V2_PAIR_ABI from 'config/abi/uniswap-v2-pair.json'
import { web3auth, waitWeb3AuthReady, isTransientConnectError, connectInFlight, setConnectInFlight } from './auth'

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
    
    console.log('[LpStaking] Contract info fetched', {
      totalDeposits: ethers.formatEther(info._totalDeposits),
      participantCount: Number(info._participantCount),
    })
  } catch (error) {
    console.error('[LpStaking] fetchContractInfo error:', error)
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
    
    console.log('[LpStaking] User staking fetched', {
      balance: ethers.formatEther(userState.balance),
      points: ethers.formatEther(userState.points),
    })
  } catch (error) {
    console.error('[LpStaking] fetchUserStaking error:', error)
    yield put(actions.updateUserStaking({ loading: false, error: error.message }))
  }
}

/**
 * 获取钱包 Provider（复用 claimToken 的模式）
 * 1. 等待 Web3Auth 初始化
 * 2. 如果已连接，直接使用 provider
 * 3. 如果未连接，调用 connectTo 连接钱包
 */
function* getWalletProvider() {
  // 1. 等待 Web3Auth 初始化完成
  yield call(waitWeb3AuthReady)

  // 2. 检查是否已连接
  let provider
  if (web3auth.status === 'connected' && web3auth.provider) {
    provider = web3auth.provider
    console.log('[LpStaking] Using existing provider')
  } else {
    // 3. 并发锁：避免多个 saga 同时 connectTo
    if (connectInFlight) {
      console.log('[LpStaking] connect already in flight, waiting...')
      while (connectInFlight) {
        yield delay(200)
      }
      // 连接完成后检查结果
      if (web3auth.status === 'connected' && web3auth.provider) {
        return web3auth.provider
      }
    }

    // 4. 连接钱包
    console.log('[LpStaking] Connecting to MetaMask...')
    setConnectInFlight(true)
    
    try {
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          // v10: MetaMask connector 不传 chainId/rpcTarget 参数
          provider = yield call(
            [web3auth, web3auth.connectTo],
            WALLET_CONNECTORS.METAMASK
          )
          break
        } catch (connectError) {
          const code = connectError?.code
          
          // 用户拒绝：不重试
          if (code === 4001) {
            throw new Error('User rejected wallet connection.')
          }
          
          // 不属于临时错误：不重试
          if (!isTransientConnectError(connectError)) {
            throw connectError
          }
          
          retryCount++
          console.log(`[LpStaking] Connection attempt ${retryCount}/${maxRetries} failed:`, connectError.message)
          
          if (retryCount >= maxRetries) {
            throw connectError
          }
          
          yield delay(1000)
          console.log(`[LpStaking] Retrying...`)
        }
      }
    } finally {
      setConnectInFlight(false)
    }
  }

  if (!provider) {
    throw new Error('Failed to connect wallet')
  }

  return provider
}

/**
 * 切换到目标网络
 */
function* switchToTargetChain(provider) {
  const chainConfig = CHAIN_CONFIG[CHAIN_ID]
  console.log('[LpStaking] Target chain:', CHAIN_ID, chainConfig?.chainId)
  
  if (!chainConfig) {
    throw new Error(`Chain ${CHAIN_ID} not configured`)
  }
  
  try {
    console.log('[LpStaking] Switching to chain:', chainConfig.chainId)
    yield apply(provider, provider.request, [{
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainConfig.chainId }]
    }])
    console.log('[LpStaking] Network switched successfully')
  } catch (switchError) {
    console.log('[LpStaking] Switch error:', switchError.code, switchError.message)
    if (switchError.code === 4902) {
      console.log('[LpStaking] Adding chain...')
      yield apply(provider, provider.request, [{
        method: 'wallet_addEthereumChain',
        params: [chainConfig]
      }])
      console.log('[LpStaking] Chain added')
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
    // 获取钱包 provider（会自动初始化和连接）
    const provider = yield call(getWalletProvider)
    yield call(switchToTargetChain, provider)
    
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    
    const config = getLpStakingConfig()
    const lpTokenContract = new ethers.Contract(config.lpToken, ERC20_ABI, signer)
    
    // 授权最大值
    const maxApproval = ethers.MaxUint256
    console.log('[LpStaking] Approving LP Token...')
    
    const tx = yield call([lpTokenContract, lpTokenContract.approve], config.stakingContract, maxApproval)
    console.log('[LpStaking] Approve tx sent:', tx.hash)
    
    yield call([tx, tx.wait])
    console.log('[LpStaking] Approve confirmed')
    
    toast.success('LP Token approved!')
    
    // 刷新用户数据
    yield put(actions.fetchUserStaking())
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    console.error('[LpStaking] approve error:', error)
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
    // 获取钱包 provider（会自动初始化和连接）
    const provider = yield call(getWalletProvider)
    yield call(switchToTargetChain, provider)
    
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    
    const config = getLpStakingConfig()
    const stakingContract = new ethers.Contract(config.stakingContract, LP_STAKING_ABI, signer)
    
    const amountWei = ethers.parseEther(amount)
    console.log('[LpStaking] Depositing', amount, 'LP')
    
    const tx = yield call([stakingContract, stakingContract.deposit], amountWei)
    console.log('[LpStaking] Deposit tx sent:', tx.hash)
    
    yield call([tx, tx.wait])
    console.log('[LpStaking] Deposit confirmed')
    
    toast.success(`Deposited ${amount} LP!`)
    
    // 刷新数据
    yield put(actions.fetchContractInfo())
    yield put(actions.fetchUserStaking())
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    console.error('[LpStaking] deposit error:', error)
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
    // 获取钱包 provider（会自动初始化和连接）
    const provider = yield call(getWalletProvider)
    yield call(switchToTargetChain, provider)
    
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    
    const config = getLpStakingConfig()
    const stakingContract = new ethers.Contract(config.stakingContract, LP_STAKING_ABI, signer)
    
    const amountWei = ethers.parseEther(amount)
    console.log('[LpStaking] Withdrawing', amount, 'LP')
    
    const tx = yield call([stakingContract, stakingContract.withdraw], amountWei)
    console.log('[LpStaking] Withdraw tx sent:', tx.hash)
    
    yield call([tx, tx.wait])
    console.log('[LpStaking] Withdraw confirmed')
    
    toast.success(`Withdrawn ${amount} LP!`)
    
    // 刷新数据
    yield put(actions.fetchContractInfo())
    yield put(actions.fetchUserStaking())
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    console.error('[LpStaking] withdraw error:', error)
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
    // 获取钱包 provider（会自动初始化和连接）
    const provider = yield call(getWalletProvider)
    yield call(switchToTargetChain, provider)
    
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    
    const config = getLpStakingConfig()
    const stakingContract = new ethers.Contract(config.stakingContract, LP_STAKING_ABI, signer)
    
    console.log('[LpStaking] Withdrawing all LP')
    
    const tx = yield call([stakingContract, stakingContract.withdrawAll])
    console.log('[LpStaking] WithdrawAll tx sent:', tx.hash)
    
    yield call([tx, tx.wait])
    console.log('[LpStaking] WithdrawAll confirmed')
    
    toast.success('All LP withdrawn!')
    
    // 刷新数据
    yield put(actions.fetchContractInfo())
    yield put(actions.fetchUserStaking())
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    console.error('[LpStaking] withdrawAll error:', error)
    const message = error.reason || error.message || 'Withdraw all failed'
    toast.error(message)
    onError && onError(message)
  }
}

/**
 * 获取用户的 Activity Log（Deposited/Withdrawn 事件）
 */
function* fetchActivityLogSaga() {
  try {
    yield put(actions.updateActivityLog({ loading: true, error: null }))
    
    const profile = yield select(state => state.auth.profile)
    if (!profile?.wallet_address) {
      yield put(actions.updateActivityLog({ loading: false, events: [] }))
      return
    }
    
    const config = getLpStakingConfig()
    if (!config.stakingContract) {
      throw new Error('LP Staking contract not configured')
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(config.stakingContract, LP_STAKING_ABI, provider)
    
    // 获取 Deposited 和 Withdrawn 事件
    const depositedFilter = contract.filters.Deposited(profile.wallet_address)
    const withdrawnFilter = contract.filters.Withdrawn(profile.wallet_address)
    
    const [depositedEvents, withdrawnEvents] = yield Promise.all([
      contract.queryFilter(depositedFilter),
      contract.queryFilter(withdrawnFilter),
    ])
    
    // 处理事件数据
    const events = []
    
    for (const event of depositedEvents) {
      const block = yield call([provider, provider.getBlock], event.blockNumber)
      events.push({
        type: 'Staked',
        amount: ethers.formatEther(event.args.amount),
        timestamp: block.timestamp,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
      })
    }
    
    for (const event of withdrawnEvents) {
      const block = yield call([provider, provider.getBlock], event.blockNumber)
      events.push({
        type: 'Unstaked',
        amount: ethers.formatEther(event.args.amount),
        timestamp: block.timestamp,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
      })
    }
    
    // 按时间倒序排列
    events.sort((a, b) => b.timestamp - a.timestamp)
    
    yield put(actions.updateActivityLog({
      loading: false,
      events,
    }))
    
    console.log('[LpStaking] Activity log fetched', { eventCount: events.length })
  } catch (error) {
    console.error('[LpStaking] fetchActivityLog error:', error)
    yield put(actions.updateActivityLog({ loading: false, error: error.message }))
  }
}

/**
 * 获取全网总积分（通过遍历所有参与者计算）
 */
function* fetchTotalPointsSaga() {
  try {
    yield put(actions.updateTotalPoints({ loading: true, error: null }))
    
    const config = getLpStakingConfig()
    if (!config.stakingContract) {
      throw new Error('LP Staking contract not configured')
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(config.stakingContract, LP_STAKING_ABI, provider)
    
    // 获取参与者总数
    const participantCount = yield call([contract, contract.getParticipantCount])
    const total = Number(participantCount)
    
    if (total === 0) {
      yield put(actions.updateTotalPoints({ loading: false, value: '0' }))
      return
    }
    
    // 分页获取所有参与者的积分
    let totalPoints = BigInt(0)
    const pageSize = 100
    
    for (let offset = 0; offset < total; offset += pageSize) {
      const limit = Math.min(pageSize, total - offset)
      const [participants] = yield call([contract, contract.getParticipantsPaginated], offset, limit)
      
      // 批量获取每个参与者的积分
      for (const participant of participants) {
        const userState = yield call([contract, contract.getUserState], participant)
        totalPoints += BigInt(userState.points)
      }
    }
    
    yield put(actions.updateTotalPoints({
      loading: false,
      value: ethers.formatEther(totalPoints),
    }))
    
    console.log('[LpStaking] Total points fetched', { totalPoints: ethers.formatEther(totalPoints) })
  } catch (error) {
    console.error('[LpStaking] fetchTotalPoints error:', error)
    yield put(actions.updateTotalPoints({ loading: false, error: error.message }))
  }
}

// ============================================
// Uniswap V2 Add Liquidity 相关 Saga
// ============================================

/**
 * 获取 Uniswap V2 Pair 储备量（用于价格计算）
 */
function* fetchPairReservesSaga() {
  try {
    yield put(actions.updatePairReserves({ loading: true, error: null }))
    
    const uniswapConfig = getUniswapV2Config()
    if (!uniswapConfig.pair || !uniswapConfig.weth) {
      throw new Error('Uniswap V2 not configured for this network')
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const pairContract = new ethers.Contract(uniswapConfig.pair, UNISWAP_V2_PAIR_ABI, provider)
    
    // 获取 token0, token1 和储备量
    const [token0, token1, reserves] = yield Promise.all([
      pairContract.token0(),
      pairContract.token1(),
      pairContract.getReserves(),
    ])
    
    // 判断 WETH 是 token0 还是 token1
    const isToken0WETH = token0.toLowerCase() === uniswapConfig.weth.toLowerCase()
    
    // 根据 token 顺序确定储备量
    // USDC 是 6 位小数，WETH 是 18 位小数
    const pairedTokenDecimals = uniswapConfig.pairedTokenDecimals || 18
    
    let reserveETH, reservePairedToken
    if (isToken0WETH) {
      reserveETH = ethers.formatEther(reserves._reserve0)
      reservePairedToken = ethers.formatUnits(reserves._reserve1, pairedTokenDecimals)
    } else {
      reserveETH = ethers.formatEther(reserves._reserve1)
      reservePairedToken = ethers.formatUnits(reserves._reserve0, pairedTokenDecimals)
    }
    
    yield put(actions.updatePairReserves({
      loading: false,
      reserveETH,
      reservePairedToken,
      token0,
      token1,
      isToken0WETH,
    }))
    
    console.log('[LpStaking] Pair reserves fetched', { reserveETH, reservePairedToken, isToken0WETH })
  } catch (error) {
    console.error('[LpStaking] fetchPairReserves error:', error)
    yield put(actions.updatePairReserves({ loading: false, error: error.message }))
  }
}

/**
 * 获取配对代币余额和授权额度（USDC 或 1011）
 */
function* fetchPairedTokenBalanceSaga() {
  try {
    yield put(actions.updatePairedTokenBalance({ loading: true }))
    
    const profile = yield select(state => state.auth.profile)
    if (!profile?.wallet_address) {
      yield put(actions.updatePairedTokenBalance({ loading: false, balance: '0', allowance: '0' }))
      return
    }
    
    const uniswapConfig = getUniswapV2Config()
    if (!uniswapConfig.pairedToken || !uniswapConfig.router) {
      yield put(actions.updatePairedTokenBalance({ loading: false, balance: '0', allowance: '0' }))
      return
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const tokenContract = new ethers.Contract(uniswapConfig.pairedToken, ERC20_ABI, provider)
    
    const pairedTokenDecimals = uniswapConfig.pairedTokenDecimals || 18
    
    const [balance, allowance] = yield Promise.all([
      tokenContract.balanceOf(profile.wallet_address),
      tokenContract.allowance(profile.wallet_address, uniswapConfig.router),
    ])
    
    yield put(actions.updatePairedTokenBalance({
      loading: false,
      balance: ethers.formatUnits(balance, pairedTokenDecimals),
      allowance: ethers.formatUnits(allowance, pairedTokenDecimals),
    }))
    
    console.log('[LpStaking] Paired token balance fetched', {
      balance: ethers.formatUnits(balance, pairedTokenDecimals),
      allowance: ethers.formatUnits(allowance, pairedTokenDecimals),
    })
  } catch (error) {
    console.error('[LpStaking] fetchPairedTokenBalance error:', error)
    yield put(actions.updatePairedTokenBalance({ loading: false, balance: '0', allowance: '0' }))
  }
}

/**
 * 授权配对代币给 Router（USDC 或 1011）
 */
function* approvePairedTokenSaga({ payload }) {
  const { onSuccess, onError } = payload || {}
  
  try {
    const uniswapConfig = getUniswapV2Config()
    if (!uniswapConfig.pairedToken || !uniswapConfig.router) {
      throw new Error('Uniswap V2 not configured')
    }
    
    // 获取钱包 provider
    const provider = yield call(getWalletProvider)
    yield call(switchToTargetChain, provider)
    
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    
    const tokenContract = new ethers.Contract(uniswapConfig.pairedToken, ERC20_ABI, signer)
    
    // 授权最大值
    const maxApproval = ethers.MaxUint256
    console.log('[LpStaking] Approving paired token for Router...')
    
    const tx = yield call([tokenContract, tokenContract.approve], uniswapConfig.router, maxApproval)
    console.log('[LpStaking] Approve tx sent:', tx.hash)
    
    yield call([tx, tx.wait])
    console.log('[LpStaking] Approve confirmed')
    
    toast.success(`${uniswapConfig.pairedTokenSymbol || 'Token'} approved!`)
    
    // 刷新余额
    yield put(actions.fetchPairedTokenBalance())
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    console.error('[LpStaking] approvePairedToken error:', error)
    const message = error.reason || error.message || 'Approve failed'
    toast.error(message)
    onError && onError(message)
  }
}

/**
 * 添加流动性（ETH + USDC/1011）
 */
function* addLiquiditySaga({ payload }) {
  const { ethAmount, tokenAmount, onSuccess, onError } = payload
  
  try {
    const uniswapConfig = getUniswapV2Config()
    if (!uniswapConfig.router || !uniswapConfig.pairedToken) {
      throw new Error('Uniswap V2 not configured')
    }
    
    // 获取钱包 provider
    const provider = yield call(getWalletProvider)
    yield call(switchToTargetChain, provider)
    
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    const signerAddress = yield apply(signer, signer.getAddress)
    
    const routerContract = new ethers.Contract(uniswapConfig.router, UNISWAP_V2_ROUTER_ABI, signer)
    
    // 转换金额
    const pairedTokenDecimals = uniswapConfig.pairedTokenDecimals || 18
    const ethAmountWei = ethers.parseEther(ethAmount)
    const tokenAmountWei = ethers.parseUnits(tokenAmount, pairedTokenDecimals)
    
    // 设置 1% 滑点保护
    const minTokenAmount = tokenAmountWei * BigInt(99) / BigInt(100)
    const minEthAmount = ethAmountWei * BigInt(99) / BigInt(100)
    
    // deadline: 当前时间 + 20 分钟
    const deadline = Math.floor(Date.now() / 1000) + 20 * 60
    
    console.log('[LpStaking] Adding liquidity...', {
      ethAmount,
      tokenAmount,
      minTokenAmount: ethers.formatUnits(minTokenAmount, pairedTokenDecimals),
      minEthAmount: ethers.formatEther(minEthAmount),
    })
    
    const tx = yield call(
      [routerContract, routerContract.addLiquidityETH],
      uniswapConfig.pairedToken,
      tokenAmountWei,
      minTokenAmount,
      minEthAmount,
      signerAddress,
      deadline,
      { value: ethAmountWei }
    )
    
    console.log('[LpStaking] AddLiquidity tx sent:', tx.hash)
    
    const receipt = yield call([tx, tx.wait])
    console.log('[LpStaking] AddLiquidity confirmed')
    
    toast.success('Liquidity added successfully!')
    
    // 刷新数据
    yield put(actions.fetchUserStaking())
    yield put(actions.fetchPairedTokenBalance())
    yield put(actions.fetchPairReserves())
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    console.error('[LpStaking] addLiquidity error:', error)
    const message = error.reason || error.message || 'Add liquidity failed'
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
  yield takeEvery(String(actions.fetchActivityLog), fetchActivityLogSaga)
  yield takeEvery(String(actions.fetchTotalPoints), fetchTotalPointsSaga)
  // Uniswap V2 Add Liquidity
  yield takeEvery(String(actions.fetchPairReserves), fetchPairReservesSaga)
  yield takeEvery(String(actions.fetchPairedTokenBalance), fetchPairedTokenBalanceSaga)
  yield takeEvery(String(actions.approvePairedToken), approvePairedTokenSaga)
  yield takeEvery(String(actions.addLiquidity), addLiquiditySaga)
}

