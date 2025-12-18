import { takeEvery, call, put, select, apply, delay } from 'redux-saga/effects'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import { WALLET_CONNECTORS, CHAIN_NAMESPACES } from '@web3auth/modal'
import * as actions from 'actions/crowdfund'
import * as api from 'api/supabase'
import { RPC_URL, getCrowdfundAddress, getSignatureClaimETHAddress, CHAIN_CONFIG, CHAIN_ID, CHAIN_ID_HEX } from 'config/contracts'
import CROWDFUND_ABI from 'config/abi/crowdfund.json'
import SIGNATURE_CLAIM_ETH_ABI from 'config/abi/signatureClaimETH.json'
import { web3auth, waitWeb3AuthReady, isTransientConnectError } from './auth'

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
    console.log('[Crowdfund] Using existing provider')
  } else {
    // 3. 没有连接 → 调用 connectTo（带重试逻辑）
    console.log('[Crowdfund] Connecting to MetaMask...')
    
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        provider = yield apply(web3auth, web3auth.connectTo, [
          WALLET_CONNECTORS.METAMASK, {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: CHAIN_ID_HEX,
            rpcTarget: RPC_URL,
          }
        ])
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
        console.log(`[Crowdfund] Connection attempt ${retryCount} failed:`, connectError.message)
        
        if (retryCount >= maxRetries) {
          throw connectError
        }
        
        yield delay(1000)
      }
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
    // 获取钱包 provider（会自动初始化和连接）
    const provider = yield call(getWalletProvider)
    
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
    // 获取钱包 provider（会自动初始化和连接）
    const provider = yield call(getWalletProvider)
    
    // 切换网络
    yield call(switchToTargetChain, provider)
    
    // 创建 ethers provider 和 signer
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    const userAddress = yield apply(signer, signer.getAddress)
    
    // 获取 SignatureClaimETH 合约
    const contractAddress = getSignatureClaimETHAddress(exchange)
    if (!contractAddress) {
      throw new Error('SignatureClaimETH contract not configured')
    }
    const contract = new ethers.Contract(contractAddress, SIGNATURE_CLAIM_ETH_ABI, signer)
    
    // 获取用户当前 nonce
    const nonce = yield call([contract, contract.getNonce], userAddress)
    console.log('[Crowdfund] User nonce:', nonce.toString())
    
    // 从后端获取签名
    const authToken = localStorage.getItem('auth_token')
    const response = yield call(api.crowdfundRefundSignature, { 
      exchange,
      wallet_address: userAddress,
      nonce: nonce.toString()
    }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get refund signature')
    }
    
    // 构建 ClaimRequest
    const request = {
      claimer: response.claimer,
      amount: response.amount,
      nonce: response.nonce,
      deadline: response.deadline
    }
    
    console.log('[Crowdfund] Claiming refund with request:', request)
    
    // 调用合约 claim
    const tx = yield call([contract, contract.claim], request, response.signature)
    console.log('[Crowdfund] Refund transaction sent:', tx.hash)
    
    yield call([tx, tx.wait])
    console.log('[Crowdfund] Refund transaction confirmed')
    
    // 刷新数据
    yield put(actions.fetchCrowdfund({ exchange }))
    
    onSuccess && onSuccess({ txHash: tx.hash })
  } catch (error) {
    console.error('claimRefund error:', error)
    const message = error.reason || error.message || 'Refund claim failed'
    onError && onError(message)
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

