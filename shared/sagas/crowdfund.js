import { takeEvery, call, put, select, apply, delay } from 'redux-saga/effects'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import * as actions from 'actions/crowdfund'
import * as api from 'api/supabase'
import { RPC_URL, getCrowdfundAddress, CHAIN_CONFIG, CHAIN_ID } from 'config/contracts'
import CROWDFUND_ABI from 'config/abi/crowdfund.json'
import { web3auth } from './auth'

/**
 * 读取合约数据（只读，使用 JsonRpcProvider）
 */
function* fetchCrowdfundSaga({ payload }) {
  const { exchange } = payload
  
  try {
    yield put(actions.updateCrowdfund({ exchange, data: { loading: true, error: null } }))
    
    const contractAddress = getCrowdfundAddress(exchange)
    if (!contractAddress) {
      throw new Error('Crowdfund contract not configured for this exchange')
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(contractAddress, CROWDFUND_ABI, provider)
    
    // 获取合约信息
    const info = yield call([contract, contract.getCrowdfundInfo])
    
    // 获取用户贡献和 ETH 余额（如果有钱包地址）
    const profile = yield select(state => state.auth.profile)
    let myContribution = '0'
    let ethBalance = null
    
    if (profile?.wallet_address) {
      try {
        // 获取用户在合约中的贡献
        const contribution = yield call([contract, contract.getContribution], profile.wallet_address)
        myContribution = ethers.formatEther(contribution)
        
        // 获取用户 ETH 余额
        const balance = yield call([provider, provider.getBalance], profile.wallet_address)
        ethBalance = parseFloat(ethers.formatEther(balance)).toFixed(2)
      } catch (err) {
        console.error('Error fetching user data:', err)
      }
    }
    
    yield put(actions.updateCrowdfund({
      exchange,
      data: {
        loading: false,
        deadline: Number(info.deadlineTime),
        targetEth: ethers.formatEther(info.target),
        raisedEth: ethers.formatEther(info.raised),
        contributors: Number(info.contributorCount),
        ended: info.ended,
        targetReached: info.targetReached,
        isPaused: info.isPaused,
        myContribution,
        ethBalance,
      }
    }))
  } catch (error) {
    console.error('fetchCrowdfund error:', error)
    yield put(actions.updateCrowdfund({
      exchange,
      data: { loading: false, error: error.message }
    }))
  }
}

/**
 * 等待 Web3Auth 就绪
 */
function* waitWeb3AuthReady() {
  let waitCount = 0
  const maxWait = 20
  
  while (web3auth && web3auth.status !== 'ready' && web3auth.status !== 'connected' && waitCount < maxWait) {
    console.log('[Crowdfund] waiting for Web3Auth, status:', web3auth?.status)
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
 * Contribute ETH
 */
function* contributeSaga({ payload }) {
  const { exchange, amount, onSuccess, onError } = payload
  
  try {
    yield call(waitWeb3AuthReady)
    
    // 获取 provider
    const provider = web3auth.provider
    if (!provider) {
      throw new Error('Wallet not connected')
    }
    
    // 切换网络
    yield call(switchToTargetChain, provider)
    
    // 创建 ethers provider 和 signer
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    
    // 获取合约
    const contractAddress = getCrowdfundAddress(exchange)
    const contract = new ethers.Contract(contractAddress, CROWDFUND_ABI, signer)
    
    // 发送交易
    console.log('[Crowdfund] Contributing', amount, 'ETH')
    const tx = yield call([contract, contract.contribute], {
      value: ethers.parseEther(amount)
    })
    
    console.log('[Crowdfund] Transaction sent:', tx.hash)
    yield call([tx, tx.wait])
    console.log('[Crowdfund] Transaction confirmed')
    
    // 刷新数据
    yield put(actions.fetchCrowdfund({ exchange }))
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    console.error('contribute error:', error)
    const message = error.reason || error.message || 'Contribution failed'
    onError && onError(message)
  }
}

/**
 * Claim Refund（使用 SignatureClaimETH）
 */
function* claimRefundSaga({ payload }) {
  const { exchange, onSuccess, onError } = payload
  
  try {
    // 1. 从后端获取签名
    const authToken = localStorage.getItem('auth_token')
    const response = yield call(api.crowdfundRefundSignature, { exchange }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get refund signature')
    }
    
    // TODO: 调用 SignatureClaimETH 合约
    // 需要合约地址和 ABI
    
    onSuccess && onSuccess()
  } catch (error) {
    console.error('claimRefund error:', error)
    onError && onError(error.message)
  }
}

/**
 * Claim Token（使用 SignatureClaim）
 */
function* claimCrowdfundTokenSaga({ payload }) {
  const { exchange, onSuccess, onError } = payload
  
  try {
    // 1. 从后端获取签名
    const authToken = localStorage.getItem('auth_token')
    const response = yield call(api.crowdfundClaimSignature, { exchange }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get claim signature')
    }
    
    // TODO: 调用 SignatureClaim 合约（复用现有 claimToken 逻辑）
    
    onSuccess && onSuccess()
  } catch (error) {
    console.error('claimCrowdfundToken error:', error)
    onError && onError(error.message)
  }
}

export default function* crowdfundSaga() {
  yield takeEvery(String(actions.fetchCrowdfund), fetchCrowdfundSaga)
  yield takeEvery(String(actions.contribute), contributeSaga)
  yield takeEvery(String(actions.claimRefund), claimRefundSaga)
  yield takeEvery(String(actions.claimCrowdfundToken), claimCrowdfundTokenSaga)
}

