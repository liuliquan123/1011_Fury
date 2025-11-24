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

const WEB3AUTH_CLIENT_ID = "BCkAjl_q8vF43zMg45PzrroZ7oE6Bq-thcCBseBXjSzzlV8XLMZEKQhh_dYCkdPRc6gdcLFdI4cSAMe0OVd4k6k"
const SUPABASE_URL = "https://npsdvkqmdkzadkzbxhbq.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_wl9QBcaEFGJWauO77gIDiQ_VEmbEnxv"
const API_BASE_URL = "https://npsdvkqmdkzadkzbxhbq.supabase.co/functions/v1"
const TELEGRAM_BOT_USERNAME = "xreceivebot"
const APP_URL = "https://satoshis-fury-nextjs.vercel.app"

// console.log('WALLET_CONNECTORS', WALLET_CONNECTORS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

let web3auth

function* waitUntil(web3auth, status) {
  return new Promise((resolve, reject) => {
    const iv = setInterval(() => {
      if (web3auth.status === status) {
        clearInterval(iv)
        resolve(true)
      } else {
        console.log('wait until', web3auth, status)
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
      } else {
        console.log('wait until not', web3auth, status)
      }
    }, 100)
  })
}

function* initWeb3Auth(action) {
  const { onSuccess, onError } = action.payload

  try {
    // if (!web3auth) {
    // localStorage.removeItem('auth_store')

    web3auth = new Web3Auth({
      clientId: WEB3AUTH_CLIENT_ID,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
      sessionTime: 86400 * 7,
      storageType: 'local'
    })

    // }

    console.log('initWeb3Auth load', web3auth, web3auth.status, web3auth.configureAdapter)

    if (
      web3auth.status !== 'connected'
      && web3auth.status !== 'errored'
      && web3auth.status !== 'ready'
      && web3auth.status !== 'connecting'
    ) {
      yield apply(web3auth, web3auth.init)
      yield call(waitUntilNot, web3auth, 'not_ready')
      console.log('initWeb3Auth init', web3auth, web3auth.status)
    }

    if (web3auth.status === 'connected') {
      yield apply(web3auth, web3auth.logout, [{ cleanup: true }])
      console.log('initWeb3Auth logout', web3auth, web3auth.status)
    } else if (web3auth.status === 'connecting') {
      // yield call(waitUntilNot, web3auth, 'connecting')
      console.log('initWeb3Auth abort', web3auth, web3auth.status)
    }

    onSuccess()
  } catch (error) {
    console.log('initWeb3Auth error')
    console.log('error', error)
    onError(error.message)
  }
}

function* web3AuthLogin(web3auth, data) {
  const web3AuthResponse = yield apply(web3auth, web3auth.getIdentityToken)
  const web3AuthToken = web3AuthResponse.idToken

  if (web3AuthToken) {
    localStorage.setItem('web3Auth_token', web3AuthToken)

    console.log('[Referral] Calling web3AuthLogin API with:', {
      referred_by: data.referralCode || null
    })

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

    const profileResponse = yield call(api.getProfile, {
      userId
    }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })

    yield put(actions.updateProfile(profileResponse.data))
    console.log('profileResponse', profileResponse)
  }
}

function* authByWallet(action) {
  const { onSuccess, onError, referralCode, isWalletBrowser } = action.payload

  try {
    /* yield call(initWeb3Auth, { payload: {
     *   onSuccess: () => {},
     *   onError: () => {},
     * }}) */

    console.log('[Referral] authByWallet received:', { referralCode, isWalletBrowser })
    console.log('authByWallet start', web3auth, web3auth.status)

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

    yield call(web3AuthLogin, web3auth, { referralCode })

    console.log('authByWallet end', web3auth, web3auth.status)
    onSuccess()
  } catch (error) {
    localStorage.removeItem('auth_store')
    console.log('authByWallet error')
    console.log('error', error)
    onError(error.message)
  }
}

function* authByEmail(action) {
  const { onSuccess, onError, email, referralCode } = action.payload

  try {
    // const web3auth = yield call(initWeb3Auth)
    console.log('[Referral] authByEmail received:', { email, referralCode })
    console.log('authByEmail start', web3auth, web3auth.status)

    yield apply(web3auth, web3auth.connectTo, [
      WALLET_CONNECTORS.AUTH, {
        authConnection: AUTH_CONNECTION.EMAIL_PASSWORDLESS,
        loginHint: email
      }
    ])

    yield call(web3AuthLogin, web3auth, { referralCode })

    console.log('authByEmail end', web3auth, web3auth.status)
    onSuccess()
  } catch (error) {
    localStorage.removeItem('auth_store')
    console.log('authByEmail error')
    console.log('error', error)
    onError(error.message)
  }
}

function* authByTwitter(action) {
  const { onSuccess, onError, referralCode } = action.payload

  try {
    // const web3auth = yield call(initWeb3Auth)
    console.log('authByTwitter start', web3auth, web3auth.status)

    yield apply(web3auth, web3auth.connectTo, [
      WALLET_CONNECTORS.AUTH, {
        authConnection: AUTH_CONNECTION.TWITTER,
      }
    ])

    yield call(web3AuthLogin, web3auth, { referralCode })

    console.log('authByTwitter end', web3auth, web3auth.status)
    onSuccess()
  } catch (error) {
    localStorage.removeItem('auth_store')
    console.log('authByTwitter error')
    console.log('error', error)
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

    console.log('authByTelegram')

    const encodedToken = encodeURIComponent(token)
    const deepLink = `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}&start=${encodedToken}`
    const webLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${encodedToken}`

    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isIOS) {
        const link = document.createElement('a')
        link.href = deepLink
        link.style.display = 'none'
        document.body.appendChild(link)

        link.click()

        setTimeout(() => {
          try {
            if (link.parentNode) {
              document.body.removeChild(link)
            }
          } catch (e) {
            console.log('iOS: Failed to remove link element', e)
          }
        }, 100)
      } else {
        const iframe = document.createElement('iframe')
        iframe.style.cssText = 'display:none;width:0;height:0;border:0;position:absolute;top:-9999px;'
        iframe.src = deepLink
        document.body.appendChild(iframe)

        setTimeout(() => {
          try {
            if (iframe.parentNode) {
              document.body.removeChild(iframe)
            }
            console.log('Android: Iframe removed, polling continues')
          } catch (e) {
            console.log('Android: Failed to remove iframe', e);
          }
        }, 2000)
      }
    } else {
      const webWindow = window.open(webLink, 'telegram-auth', 'width=600,height=700')

      webWindow.onbeforeunload = function () {
        console.log('telegram window closed')
      }

      if (!webWindow) {
        throw new Error('Popup blocked. Please allow popups for Telegram authentication.')
      }
    }

    let finished = false
    let count = 0
    let MAX_ATTEMPTS = 30
    let authToken
    let refreshToken
    let userId

    while (!finished) {
      if (count === MAX_ATTEMPTS) {
        throw new Error('Telegram login timeout')
        break
      }

      const tgAuthResponse = yield call(api.getAuthToken, {
        token: `eq.${token}`,
        select: 'status,access_token,refresh_token,user_id'
      })

      console.log('tgAuthResponse', tgAuthResponse)

      if (tgAuthResponse && tgAuthResponse[0]) {
        const status = tgAuthResponse[0].status
        authToken = tgAuthResponse[0].access_token
        refreshToken = tgAuthResponse[0].refreshToken
        userId = tgAuthResponse[0].user_id

        if (status !== 'pending') {
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

    const profileResponse = yield call(api.getProfile, {
      userId
    }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })

    yield put(actions.updateProfile(profileResponse.data))
    console.log('profileResponse', profileResponse)

    onSuccess()
  } catch (error) {
    console.log('error', error)
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
    console.log('evidenceResponse', evidenceResponse)
    
    // 检查 OCR 是否成功
    if (evidenceResponse.data.ocr) {
      evidenceResponse.data.ocr.user_note = ''
      yield put(actions.updateOcrForm(evidenceResponse.data.ocr))
      onSuccess()
    } else {
      // OCR 失败，传递 ocr_details
      const errorDetails = evidenceResponse.data.ocr_details || evidenceResponse.data.ocr_error || 'OCR verification failed'
      onError(errorDetails)
    }
  } catch (error) {
    console.log('error', error)
    onError(error.message)
  }
}

function* submitLoss(action) {
  const { onSuccess, onError } = action.payload

  try {
    const ocrForm = yield select(state => state.auth.ocrForm)
    console.log('ocrForm', ocrForm)

    const authToken = localStorage.getItem('auth_token')

    const submitLossResponse = yield call(api.submitLoss, ocrForm, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })

    if (!submitLossResponse.success) {
      throw new Error(submitLossResponse.error)
    }

    console.log('submitLossResponse', submitLossResponse)
    onSuccess()
  } catch (error) {
    console.log('submitLoss error', error)
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
    console.log('getProfile error', error)
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
    console.log('getExchangePhase error', error)
  }
}

function* getReferralInfo(action) {
  try {
    const referralCode = action.payload.referralCode

    const infoResponse = yield call(api.getReferralInfo, { referral_code: referralCode })

    yield put(actions.updateReferralInfo({ code: referralCode, ...infoResponse.data }))
  } catch (error) {
    console.log('error', error)
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
        console.log('error', error)
      }
    }

    localStorage.removeItem('auth_store')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')

    yield put(actions.resetAuth())

    onSuccess()
  } catch (error) {
    console.log('error', error)
  }
}

function* linkWallet(action) {
  const { onSuccess, onError } = action.payload

  try {
    // Properly handle initWeb3Auth errors
    let initSuccess = false
    let initError = null
    
    yield call(initWeb3Auth, { payload: {
      onSuccess: () => { 
        console.log('[linkWallet] initWeb3Auth success')
        initSuccess = true 
      },
      onError: (err) => { 
        console.error('[linkWallet] initWeb3Auth failed:', err)
        initError = err
      },
    }})

    // Check if initialization failed
    if (initError) {
      throw new Error(`Failed to initialize Web3Auth: ${initError}`)
    }

    if (!initSuccess) {
      throw new Error('Web3Auth initialization did not complete successfully')
    }

    console.log('[linkWallet] Web3Auth status:', web3auth?.status)

    // Verify Web3Auth is ready
    if (!web3auth) {
      throw new Error('Web3Auth instance is not available')
    }

    if (web3auth.status === 'not_ready') {
      throw new Error('Web3Auth is not ready yet. Please try again in a moment.')
    }

    const provider = yield apply(web3auth, web3auth.connectTo, [
      WALLET_CONNECTORS.METAMASK, {
        chainNamespace: CHAIN_NAMESPACES.EIP155
      }
    ])
    console.log('[linkWallet] Provider connected:', !!provider)
    
    const web3AuthResponse = yield apply(web3auth, web3auth.getIdentityToken)
    const web3AuthToken = web3AuthResponse.idToken
    console.log('[linkWallet] Identity token obtained')

    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = yield apply(ethersProvider, ethersProvider.getSigner)
    const walletAddress = yield apply(signer, signer.getAddress)
    console.log('[linkWallet] Wallet address:', walletAddress)

    const authToken = localStorage.getItem('auth_token')

    const linkResponse = yield call(api.linkWeb3Auth, {
      idToken: web3AuthToken,
      walletAddress,
    }, {
      requireAuth: true,
      tokenFetcher: () => authToken
    })
    console.log('[linkWallet] Link response:', linkResponse)

    yield put(actions.getProfile())

    onSuccess()
  } catch (error) {
    console.error('[linkWallet] Error:', error)
    // Improved error message extraction
    const message = error?.response?.data?.error 
      || error?.message 
      || 'Failed to connect wallet. Please try again.'
    onError(message)
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

  yield takeEvery(String(actions.logout), logout)
  yield takeEvery(String(actions.linkWallet), linkWallet)
}
