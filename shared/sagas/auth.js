import {
  eventChannel,
  takeEvery,
  call,
  apply,
  delay,
  put,
  select,
  END
} from 'redux-saga/effects'
import {
  Web3Auth,
  Web3AuthNoModal,
  WEB3AUTH_NETWORK,
  WALLET_CONNECTORS,
  CHAIN_NAMESPACES,
  ADAPTER_EVENTS,
  CONNECTOR_EVENTS,
  AUTH_CONNECTION
} from '@web3auth/modal'
import { createClient } from "@supabase/supabase-js"
import * as actions from 'actions/auth'
import * as api from 'api/supabase'
import { ethers } from 'ethers'
import { CHAIN_ID, CHAIN_ID_HEX, RPC_URL, CHAIN_CONFIG, getSignatureClaimAddress } from 'config/contracts'
import SIGNATURE_CLAIM_ABI from 'config/abi/signatureClaim.json'
import { WEB3AUTH_CLIENT_ID, SUPABASE_URL, SUPABASE_ANON_KEY, TELEGRAM_BOT_USERNAME } from 'constants/env'
import { trackSignUp, trackLogin, trackSubmitEvidence } from 'utils/analytics'

// console.log('WALLET_CONNECTORS', WALLET_CONNECTORS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// 导出 web3auth 供其他 saga 使用
export let web3auth

// 全局锁：避免并发 init 和 connect
let initInFlight = false
export let connectInFlight = false
export const setConnectInFlight = (value) => { connectInFlight = value }

function* waitUntil(web3auth, status) {
  return new Promise((resolve, reject) => {
    const iv = setInterval(() => {
      if (web3auth.status === status) {
        clearInterval(iv)
        resolve(true)
      }
    }, 100)
  })
}

function waitUntilNot(web3auth, status) {
  return new Promise((resolve, reject) => {
    const iv = setInterval(() => {
      if (web3auth.status !== status) {
        clearInterval(iv)
        resolve(true)
      }
    }, 100)
  })
}

function* initWeb3Auth(action) {
  const { onSuccess, onError } = action.payload

  // 并发锁：避免多个 saga 同时 init
  if (initInFlight) {
    while (initInFlight) {
      yield delay(200)
    }
    // init 完成后检查状态
    if (web3auth && (web3auth.status === 'ready' || web3auth.status === 'connected')) {
      onSuccess()
      return
    }
  }

  try {
    initInFlight = true

    // 单例：仅在实例不存在时创建
    if (!web3auth) {
      web3auth = new Web3Auth({
        clientId: WEB3AUTH_CLIENT_ID,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
        sessionTime: 86400 * 7,
        storageType: 'local'
      })
    }

    // 仅在 not_ready 状态时 init
    if (web3auth.status === 'not_ready') {
      yield apply(web3auth, web3auth.init)
      yield call(waitUntilNot, web3auth, 'not_ready')
    }

    // 不再强制 logout - 如果已 connected，保持连接状态
    // 如果需要断开，由调用方显式调用 disconnectWallet

    onSuccess()
  } catch (error) {
    onError(error.message)
  } finally {
    initInFlight = false
  }
}

/**
 * 等待 Web3Auth 初始化完成
 * 用于 claimToken、linkWallet、lpStaking、crowdfund 等需要钱包的操作
 * 导出供其他 saga 使用
 */
export function* waitWeb3AuthReady() {
  // 1. 确保实例已初始化
  if (!web3auth || web3auth.status === 'not_ready' || web3auth.status === 'errored') {
    yield call(initWeb3Auth, {
      payload: {
        onSuccess: () => {},
        onError: (e) => { throw new Error(e) },
      },
    })
  }

  // 2. 等待 Web3Auth 变成 ready / connected（v10 标准枚举）
  let waitCount = 0
  const maxWait = 20 // 最多等 10 秒

  while (
    web3auth &&
    web3auth.status !== 'ready' &&
    web3auth.status !== 'connected' &&
    waitCount < maxWait
  ) {
    yield delay(500)
    waitCount++
  }

  // 3. 超时或失败兜底
  if (!web3auth || (web3auth.status !== 'ready' && web3auth.status !== 'connected')) {
    throw new Error('Web3Auth initialization timeout. Please refresh and try again.')
  }

  // 4. 给一个小延迟让 SDK 内部稳定（不再轮询内部字段）
  yield delay(500)
}

/**
 * 显式断开钱包连接
 * 仅在需要时才调用（如用户点击 Disconnect / Switch Account）
 */
export function* disconnectWallet() {
  if (web3auth && web3auth.status === 'connected') {
    try {
      // cleanup: false 更安全，不会破坏 connector 状态
      yield apply(web3auth, web3auth.logout, [{ cleanup: false }])
    } catch (error) {
      // disconnect error ignored
    }
  }
}

/**
 * 切换到目标网络
 * 如果用户未添加该网络，自动添加
 * @param {object} provider - Web3Auth provider
 */
function* switchToTargetChain(provider) {
  const chainConfig = CHAIN_CONFIG[CHAIN_ID]
  if (!chainConfig) {
    throw new Error(`Chain ${CHAIN_ID} not configured in CHAIN_CONFIG`)
  }

  // 防御性检查
  if (!provider || typeof provider.request !== 'function') {
    throw new Error('Wallet provider does not support network switching')
  }

  try {
    // 尝试切换网络
    yield apply(provider, provider.request, [{
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainConfig.chainId }],
    }])
  } catch (switchError) {
    // 错误码 4902 = 用户钱包中未添加该网络
    if (switchError.code === 4902) {
      yield apply(provider, provider.request, [{
        method: 'wallet_addEthereumChain',
        params: [chainConfig],
      }])
    } else if (switchError.code === 4001) {
      // 用户拒绝切换
      throw new Error('User rejected network switch. Please switch to ' + chainConfig.chainName + ' manually.')
    } else {
      throw switchError
    }
  }
}

/**
 * 判断是否是临时性连接错误（可以重试）
 * @param {Error} err - 错误对象
 * @returns {boolean} 是否可重试
 */
export const isTransientConnectError = (err) => {
  const msg = (err?.message || '').toLowerCase()
  return msg.includes('wallet connector is not ready yet') ||
         msg.includes('adapter not ready') ||
         msg.includes('not ready')
}

function* web3AuthLogin(web3auth, data) {
  const web3AuthResponse = yield apply(web3auth, web3auth.getIdentityToken)
  const web3AuthToken = web3AuthResponse.idToken

  if (web3AuthToken) {
    localStorage.setItem('web3Auth_token', web3AuthToken)

    const authResponse = yield call(api.web3AuthLogin, {
      id_token: web3AuthToken,
      wallet_address: '',
      referred_by: data.referralCode || null,
    })

    const authToken = authResponse.data.token
    const refreshToken = authResponse.data.refresh_token
    const userId = authResponse.data.user.id

    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('user_id', userId)

    // GA4 追踪：根据 is_new_user 区分注册和登录
    const method = data.method || 'unknown'
    if (authResponse.data.is_new_user) {
      trackSignUp(method, data.referralCode)
    } else {
      trackLogin(method)
    }

    const profileResponse = yield call(api.getProfile, {
      userId
    }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })

    yield put(actions.updateProfile(profileResponse.data))
  }
}

function* authByWallet(action) {
  const { onSuccess, onError, referralCode, isWalletBrowser } = action.payload

  try {
    /* yield call(initWeb3Auth, { payload: {
     *   onSuccess: () => {},
     *   onError: () => {},
     * }}) */

    if (isWalletBrowser) {
      yield apply(web3auth, web3auth.connect)
    } else {
    yield apply(web3auth, web3auth.connectTo, [
      WALLET_CONNECTORS.METAMASK, {
        chainNamespace: CHAIN_NAMESPACES.EIP155
      }
    ])
    }

    // yield apply(web3auth, web3auth.connect)

    yield call(web3AuthLogin, web3auth, { referralCode, method: 'metamask' })

    onSuccess()
  } catch (error) {
    localStorage.removeItem('auth_store')
    onError(error.message)
  }
}

function* authByEmail(action) {
  const { onSuccess, onError, email, referralCode } = action.payload

  try {
    yield apply(web3auth, web3auth.connectTo, [
      WALLET_CONNECTORS.AUTH, {
        authConnection: AUTH_CONNECTION.EMAIL_PASSWORDLESS,
        loginHint: email
      }
    ])

    yield call(web3AuthLogin, web3auth, { referralCode, method: 'email' })

    onSuccess()
  } catch (error) {
    localStorage.removeItem('auth_store')
    onError(error.message)
  }
}

function* authByTwitter(action) {
  const { onSuccess, onError, referralCode } = action.payload

  try {
    yield apply(web3auth, web3auth.connectTo, [
      WALLET_CONNECTORS.AUTH, {
        authConnection: AUTH_CONNECTION.TWITTER,
      }
    ])

    yield call(web3AuthLogin, web3auth, { referralCode, method: 'twitter' })

    onSuccess()
  } catch (error) {
    localStorage.removeItem('auth_store')
    onError(error.message)
  }
}

function* authByTelegram(action) {
  const { onSuccess, onError, referralCode } = action.payload

  try {
    const token = crypto.randomUUID()

    yield call(api.authToken, {
      token,
      status: 'pending',
      referred_by: referralCode || null, // ← 关键修改
      ip_address: typeof window !== 'undefined' ? window.location.hostname : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    })

    const encodedToken = encodeURIComponent(token)
    const deepLink = `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}&start=${encodedToken}`
    const webLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${encodedToken}`

    // 增强的设备检测逻辑
    const isMobile = (() => {
      if (typeof window === 'undefined') return false
      
      const ua = navigator.userAgent || ''
      
      // 优先检测桌面平台（排除移动端）
      if (/Windows NT|Macintosh|Linux x86_64/i.test(ua) && !/Mobile|Android/i.test(ua)) {
        return false  // 明确是桌面端
      }
      
      // 检测移动设备
      const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      return isMobileDevice
    })()

    if (isMobile) {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isIOS) {
        // iOS：尝试唤起应用，失败后自动回退到 Web 版本
        const link = document.createElement('a')
        link.href = deepLink
        link.style.display = 'none'
        document.body.appendChild(link)

        link.click()

        // 设置回退计时器：如果应用未打开，自动打开 Web 版本
        setTimeout(() => {
          try {
            if (link.parentNode) {
              document.body.removeChild(link)
            }
            // 检查页面是否仍然可见（应用未打开的情况）
            if (document.visibilityState === 'visible') {
              window.open(webLink, 'telegram-auth', 'width=600,height=700')
            }
          } catch (e) {
            // Failed to remove link element
          }
        }, 1500)
      } else {
        // Android：使用 iframe 尝试唤起应用
        const iframe = document.createElement('iframe')
        iframe.style.cssText = 'display:none;width:0;height:0;border:0;position:absolute;top:-9999px;'
        iframe.src = deepLink
        document.body.appendChild(iframe)

        setTimeout(() => {
          try {
            if (iframe.parentNode) {
              document.body.removeChild(iframe)
            }
          } catch (e) {
            // Failed to remove iframe
          }
        }, 2000)
      }
    } else {
      // 桌面端：先尝试唤起桌面应用，失败后自动回退到 Web 版本
      // 使用 localStorage 记住用户偏好，避免重复检测
      const PREF_KEY = 'telegram_login_preference'
      const preference = localStorage.getItem(PREF_KEY)
      
      // 打开 Web 版本的辅助函数
      const openWebVersion = () => {
        try {
          const webWindow = window.open(webLink, 'telegram-auth', 'width=600,height=700')
          
          if (!webWindow) {
            const shouldFallback = confirm(
              'Popup blocked. Click OK to open Telegram in a new tab (you will need to return here after login).'
            )
            if (shouldFallback) {
              window.location.href = webLink
            } else {
              throw new Error('Popup blocked. Please allow popups for Telegram authentication.')
            }
          }
        } catch (error) {
          throw new Error('Failed to open Telegram. Please check your popup blocker settings.')
        }
      }
      
      if (preference === 'web') {
        // 用户之前选择了 Web 版本，直接使用
        openWebVersion()
      } else {
        // 首次使用或用户偏好桌面应用：尝试唤起桌面应用
        // 使用 blur 事件检测应用是否成功打开
        let appOpened = false
        const handleBlur = () => {
          appOpened = true
        }
        window.addEventListener('blur', handleBlur)
        
        // 尝试通过 deep link 唤起桌面应用
        const link = document.createElement('a')
        link.href = deepLink
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        
        // 1.5 秒后检测结果
        setTimeout(() => {
          window.removeEventListener('blur', handleBlur)
          
          // 清理 link 元素
          try {
            if (link.parentNode) {
              document.body.removeChild(link)
            }
          } catch (e) {
            // Failed to remove link element
          }
          
          if (appOpened) {
            // 应用成功打开，记住偏好
            localStorage.setItem(PREF_KEY, 'desktop')
          } else {
            // 应用未打开，回退到 Web 版本并记住偏好
            localStorage.setItem(PREF_KEY, 'web')
            openWebVersion()
          }
        }, 1500)
      }
    }

    let finished = false
    let count = 0
    let MAX_ATTEMPTS = 30
    let authToken
    let refreshToken
    let userId
    let isNewUser = false

    while (!finished) {
      if (count === MAX_ATTEMPTS) {
        throw new Error('Telegram login timeout')
        break
      }

      const tgAuthResponse = yield call(api.getAuthToken, {
        token: `eq.${token}`,
        select: 'status,access_token,refresh_token,user_id,is_new_user'
      })

      if (tgAuthResponse && tgAuthResponse[0]) {
        const status = tgAuthResponse[0].status
        
        if (status !== 'pending') {
          // 只在 complete 时读取所有数据
          authToken = tgAuthResponse[0].access_token
          refreshToken = tgAuthResponse[0].refresh_token
          userId = tgAuthResponse[0].user_id
          isNewUser = tgAuthResponse[0].is_new_user === true  // 确保是布尔值
          finished = true
          break
        }
      }

      count++
                             yield delay(3000)
    }

    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('user_id', userId)

    // GA4 追踪：根据 is_new_user 区分注册和登录
    if (isNewUser) {
      trackSignUp('telegram', referralCode)
    } else {
      trackLogin('telegram')
    }

    const profileResponse = yield call(api.getProfile, {
      userId
    }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })

    yield put(actions.updateProfile(profileResponse.data))

    onSuccess()
  } catch (error) {
    onError(error.message)
  }
}

function* uploadEvidenceOcr(action) {
  const { onSuccess, onError, file } = action.payload

  try {
    const evidenceResponse = yield call(api.uploadEvidenceOcr, { file }, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // 检查 OCR 是否成功
    if (evidenceResponse.data.ocr) {
      // FIX: 保存 file_url 到 ocrForm
      const upload = evidenceResponse.data.upload || {}  // 防御性处理
      const ocrData = {
        ...evidenceResponse.data.ocr,
        user_note: '',
        file_url: upload.file_url || null
      }
      yield put(actions.updateOcrForm(ocrData))
      onSuccess()
    } else {
      // OCR 失败，传递 ocr_details
      const errorDetails = evidenceResponse.data.ocr_details || evidenceResponse.data.ocr_error || 'OCR verification failed'
      onError(errorDetails)
    }
  } catch (error) {
    onError(error.message)
  }
}

function* submitLoss(action) {
  const { onSuccess, onError } = action.payload

  try {
    const ocrForm = yield select(state => state.auth.ocrForm)

    const authToken = localStorage.getItem('auth_token')

    // FIX: 构建 files 数组发送给后端
    const { file_url, ...restOcrForm } = ocrForm
    const submitData = {
      ...restOcrForm,
      files: file_url ? [file_url] : []  // 后端只接收 files 数组
    }

    const submitLossResponse = yield call(api.submitLoss, submitData, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })

    if (!submitLossResponse.success) {
      throw new Error(submitLossResponse.error)
    }

    // GA4 追踪：提交证据成功
    trackSubmitEvidence({
      isRegistered: !!authToken,
      exchange: ocrForm.exchange || 'unknown',
    })

    onSuccess()
  } catch (error) {
    const message = typeof error.message === 'string' ? error.message : (error.message && error.message.error)
    onError(message)
  }
}

function* getProfile(action) {
  try {
    const authToken = localStorage.getItem('auth_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const userId = localStorage.getItem('user_id')

    if (userId && authToken && refreshToken) {
      const profileResponse = yield call(api.getProfile, {
        userId
      }, {
        requireAuth: true,
        tokenFetcher: () => authToken
      })

      yield put(actions.updateProfile(profileResponse.data))

      const userTokensResponse = yield call(api.getUserTokens, {}, {
        requireAuth: true,
        tokenFetcher: () => authToken
      })

      yield put(actions.updateUserTokens(userTokensResponse.data))

      const submissionsResponse = yield call(api.getMySubmissions, {}, {
        requireAuth: true,
        tokenFetcher: () => authToken
      })

      yield put(actions.updateSubmissions(submissionsResponse.data))

      const referralStatsResponse = yield call(api.getReferralStats, {}, {
        requireAuth: true,
        tokenFetcher: () => authToken
      })

      yield put(actions.updateReferralStats(referralStatsResponse.data))
    }
  } catch (error) {
    // getProfile error ignored
  }
}

function* getExchangePhase(action) {
  try {
    const authToken = localStorage.getItem('auth_token')
    const exchange = action.payload.exchange

    // 支持未登录访问：如果有 token 则传递，如果没有也能正常调用
    const exchangePhaseResponse = yield call(api.getExchangePhase, { exchange }, authToken ? {
      requireAuth: false,
      tokenFetcher: () => authToken
    } : {})

    yield put(actions.updateExchangePhase({ exchange, phase: exchangePhaseResponse.data }))
  } catch (error) {
    // getExchangePhase error ignored
  }
}

function* getReferralInfo(action) {
  try {
    const referralCode = action.payload.referralCode

    const infoResponse = yield call(api.getReferralInfo, { referral_code: referralCode })

    yield put(actions.updateReferralInfo({ code: referralCode, ...infoResponse.data }))
  } catch (error) {
    // getReferralInfo error ignored
  }
}

function* saveProfile(action) {
  const { username, onSuccess, onError } = action.payload

  try {
    const authToken = localStorage.getItem('auth_token')
    
    if (!authToken) {
      onError && onError('Not authenticated')
      return
    }

    const response = yield call(api.updateProfileApi, { username }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })

    if (response.success) {
      // 更新 Redux store 中的 profile
      yield put(actions.updateProfile(response.data))
      onSuccess && onSuccess()
    } else {
      onError && onError(response.error || 'Failed to update profile')
    }
  } catch (error) {
    onError && onError(error.message || 'Failed to update profile')
  }
}

function* logout(action) {
  const { onSuccess, onError } = action.payload

  try {
    const authToken = localStorage.getItem('auth_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const userId = localStorage.getItem('user_id')

    if (web3auth) {
      try {
        yield apply(web3auth, web3auth.logout, [{ cleanup: true }])
      } catch (error) {
        // logout error ignored
      }
    }

    localStorage.removeItem('auth_store')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')

    yield put(actions.resetAuth())

    onSuccess()
  } catch (error) {
    // logout error ignored
  }
}

function* linkWallet(action) {
  const { onSuccess, onError } = action.payload

  try {
    // 如果已连接，先断开（linkWallet 需要新连接）
    if (web3auth && web3auth.status === 'connected') {
      try {
        yield apply(web3auth, web3auth.logout, [{ cleanup: false }])
      } catch (error) {
        // disconnect error ignored
      }
    }

    // 等待 Web3Auth 初始化完成
    yield call(waitWeb3AuthReady)

    // v10: MetaMask connector 不传额外参数
    const provider = yield apply(web3auth, web3auth.connectTo, [
      WALLET_CONNECTORS.METAMASK
    ])
    const web3AuthResponse = yield apply(web3auth, web3auth.getIdentityToken)
    const web3AuthToken = web3AuthResponse.idToken

    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    const walletAddress = yield apply(signer, signer.getAddress)

    const authToken = localStorage.getItem('auth_token')

    const linkResponse = yield call(api.linkWeb3Auth, {
      idToken: web3AuthToken,
      walletAddress,
    }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })

    yield put(actions.getProfile())

    onSuccess()
  } catch (error) {
    const message = typeof error.message === 'string' ? error.message : (error.message && error.message.error)
    onError(message)
  }
}

function* getCases(action) {
  try {
    const { exchange, onSuccess, onError } = action.payload || {}
    
    const params = {}
    if (exchange) {
      params.exchange = exchange
    }
    
    const response = yield call(api.getCases, params)
    
    if (!response.success) {
      throw new Error(response.error)
    }
    
    yield put(actions.updateCases(response.data))
    
    if (onSuccess) {
      onSuccess(response.data)
    }
  } catch (error) {
    console.error('getCases error', error)
    if (action.payload?.onError) {
      action.payload.onError(error.message)
    }
  }
}

/**
 * Claim Token - 领取已解锁的 Token
 * 流程：
 * 1. 调用后端获取签名
 * 2. 连接钱包获取 provider
 * 3. 校验链 ID
 * 4. 调用合约 claim 函数
 * 5. 等待交易确认
 * 6. 刷新用户数据
 */
function* claimToken(action) {
  const { exchange, onSuccess, onError, onStatusChange } = action.payload

  try {
    // 通知状态变化：开始获取签名
    if (onStatusChange) onStatusChange('signing')

    // 1. 获取后端签名
    const authToken = localStorage.getItem('auth_token')
    if (!authToken) {
      throw new Error('Please login first')
    }

    const signatureResponse = yield call(api.claimSignature, { exchange }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })

    if (!signatureResponse.success) {
      throw new Error(signatureResponse.error || 'Failed to get claim signature')
    }

    const { claimData, signature } = signatureResponse.data

    // 通知状态变化：开始连接钱包
    if (onStatusChange) onStatusChange('connecting')

    // 2. 等待 Web3Auth 初始化完成（使用公共辅助函数）
    yield call(waitWeb3AuthReady)

    // 3. 连接钱包获取 provider
    let provider
    if (web3auth.status === 'connected' && web3auth.provider) {
      // 已经有连接（connected + provider）→ 直接复用
      provider = web3auth.provider
    } else {
      // 没有连接 → 走 connectTo（带重试逻辑 + 并发锁）
      // 并发锁：避免多个 saga 同时 connectTo
      if (connectInFlight) {
        while (connectInFlight) {
          yield delay(200)
        }
        // 连接完成后检查结果
        if (web3auth.status === 'connected' && web3auth.provider) {
          provider = web3auth.provider
        }
      }
      
      if (!provider) {
        connectInFlight = true
        
        try {
          let retryCount = 0
          const maxRetries = 3
          
          while (retryCount < maxRetries) {
            try {
              // v10: MetaMask connector 不传 chainId/rpcTarget 参数
              provider = yield apply(web3auth, web3auth.connectTo, [
                WALLET_CONNECTORS.METAMASK
              ])
              break // 成功则跳出循环
            } catch (connectError) {
              const code = connectError?.code
              
              // 用户拒绝：不重试，直接抛出
              if (code === 4001) {
                throw new Error('User rejected wallet connection.')
              }
              
              // 不属于"临时错误"：也不重试
              if (!isTransientConnectError(connectError)) {
                throw connectError
              }
              
              retryCount++
              
              if (retryCount >= maxRetries) {
                throw connectError
              }
              
              yield delay(1000)
            }
          }
        } finally {
          connectInFlight = false
        }
      }
    }

    if (!provider) {
      throw new Error('Failed to connect wallet')
    }

    let ethersProvider = new ethers.BrowserProvider(provider)
    let signer = yield apply(ethersProvider, ethersProvider.getSigner)
    const signerAddress = yield apply(signer, signer.getAddress)

    // 4. 验证钱包地址匹配
    if (signerAddress.toLowerCase() !== claimData.claimer.toLowerCase()) {
      const expectedShort = `${claimData.claimer.slice(0, 6)}...${claimData.claimer.slice(-4)}`
      const currentShort = `${signerAddress.slice(0, 6)}...${signerAddress.slice(-4)}`
      
      throw new Error(
        `Wallet mismatch. Current: ${currentShort}, Expected: ${expectedShort}. ` +
        `Please switch to the correct account in MetaMask.`
      )
    }

    // 5. 校验并自动切换网络
    const network = yield apply(ethersProvider, ethersProvider.getNetwork)
    const currentChainId = Number(network.chainId)
    
    if (currentChainId !== CHAIN_ID) {
      // 自动切换到目标网络
      yield call(switchToTargetChain, provider)
      
      // 切换后需要重新创建 provider 和 signer（网络变化后原对象可能失效）
      ethersProvider = new ethers.BrowserProvider(provider)
      signer = yield apply(ethersProvider, ethersProvider.getSigner)
      const newAddress = yield apply(signer, signer.getAddress)
      
      // 验证切换后地址仍然一致
      if (newAddress.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error('Wallet address changed after network switch. Please try again.')
      }
    }

    // 通知状态变化：发送交易
    if (onStatusChange) onStatusChange('claiming')

    // 6. 获取合约地址并创建合约实例
    const contractAddress = getSignatureClaimAddress()
    if (!contractAddress) {
      throw new Error(`No contract address configured for ${exchange}`)
    }

    // 6.5 检查签名是否快过期（离过期不足 1 分钟则提前报错）
    const now = Math.floor(Date.now() / 1000)
    const deadline = Number(claimData.deadline)
    
    if (deadline - now < 60) {
      throw new Error('Signature is about to expire. Please try again to get a fresh claim.')
    }

    const contract = new ethers.Contract(contractAddress, SIGNATURE_CLAIM_ABI, signer)

    // 7. 调用合约 claim 函数
    // ClaimRequest struct: [claimer, amount, nonce, deadline]
    const tx = yield apply(contract, contract.claim, [
      [claimData.claimer, claimData.amount, claimData.nonce, claimData.deadline],
      signature
    ])

    // 8. 等待交易确认
    if (onStatusChange) onStatusChange('confirming')
    const receipt = yield apply(tx, tx.wait)

    // 9. 刷新用户数据
    yield put(actions.getProfile())

    onSuccess({ txHash: receipt.hash })

  } catch (error) {
    console.error('claimToken error:', error)

    // 解析错误消息 - 兼容字符串和对象类型
    let errorMessage = 'Claim failed'
    let errorStr = ''
    
    // 处理不同类型的错误消息
    if (typeof error.message === 'string') {
      errorStr = error.message
    } else if (typeof error.message === 'object' && error.message !== null) {
      // API 返回的错误可能是 { error: "message" } 格式
      errorStr = error.message.error || error.message.message || JSON.stringify(error.message)
    } else if (typeof error === 'string') {
      errorStr = error
    }

    // 根据错误内容返回友好的提示
    if (errorStr.includes('SignatureExpired')) {
      errorMessage = 'Signature expired. Please try again.'
    } else if (errorStr.includes('InvalidNonce')) {
      errorMessage = 'Invalid nonce. Please refresh and try again.'
    } else if (errorStr.includes('InsufficientPoolBalance')) {
      errorMessage = 'Pool balance insufficient. Please contact support.'
    } else if (errorStr.includes('ClaimerMismatch')) {
      errorMessage = 'Wallet address does not match.'
    } else if (errorStr.includes('InvalidSignature')) {
      errorMessage = 'Invalid signature. Please try again.'
    } else if (errorStr.includes('user rejected') || errorStr.includes('User denied')) {
      errorMessage = 'Transaction rejected by user.'
    } else if (errorStr.includes('Already claimed')) {
      errorMessage = 'You have already claimed your tokens.'
    } else if (errorStr.includes('still locked')) {
      errorMessage = 'Your tokens are still locked.'
    } else if (errorStr.includes('Wallet address not found')) {
      errorMessage = 'Please connect your wallet first.'
    } else if (errorStr.includes('500') || errorStr.includes('Internal Server Error')) {
      errorMessage = 'Server error. The claim API may not be deployed yet.'
    } else if (errorStr.includes('0x1f2a2005')) {
      // 合约自定义错误：签名过期
      errorMessage = 'Transaction failed. Your signature may have expired. Please try again.'
    } else if (errorStr.includes('execution reverted')) {
      // 其他合约 revert 错误
      errorMessage = 'Transaction reverted on-chain. Please check your network and try again.'
    } else if (errorStr.includes('about to expire')) {
      // 前端 deadline pre-check 错误
      errorMessage = 'Signature is about to expire. Please try again to get a fresh claim.'
    } else if (errorStr) {
      errorMessage = errorStr
    }

    onError(errorMessage)
  }
}

export default function* authSaga() {
  yield takeEvery(String(actions.initWeb3Auth), initWeb3Auth)

  yield takeEvery(String(actions.authByWallet), authByWallet)
  yield takeEvery(String(actions.authByEmail), authByEmail)
  yield takeEvery(String(actions.authByTwitter), authByTwitter)
  yield takeEvery(String(actions.authByTelegram), authByTelegram)

  yield takeEvery(String(actions.uploadEvidenceOcr), uploadEvidenceOcr)
  yield takeEvery(String(actions.submitLoss), submitLoss)

  yield takeEvery(String(actions.getProfile), getProfile)
  yield takeEvery(String(actions.getExchangePhase), getExchangePhase)
  yield takeEvery(String(actions.getReferralInfo), getReferralInfo)
  yield takeEvery(String(actions.getCases), getCases)

  yield takeEvery(String(actions.logout), logout)
  yield takeEvery(String(actions.linkWallet), linkWallet)
  yield takeEvery(String(actions.claimToken), claimToken)
  yield takeEvery(String(actions.saveProfile), saveProfile)
}
