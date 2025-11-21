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

const WEB3AUTH_CLIENT_ID = "BCkAjl_q8vF43zMg45PzrroZ7oE6Bq-thcCBseBXjSzzlV8XLMZEKQhh_dYCkdPRc6gdcLFdI4cSAMe0OVd4k6k"
const SUPABASE_URL = "https://npsdvkqmdkzadkzbxhbq.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_wl9QBcaEFGJWauO77gIDiQ_VEmbEnxv"
const API_BASE_URL = "https://npsdvkqmdkzadkzbxhbq.supabase.co/functions/v1"
const TELEGRAM_BOT_USERNAME = "xreceivebot"
const APP_URL = "https://satoshis-fury-nextjs.vercel.app"

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

    web3auth = new Web3AuthNoModal({
      clientId: WEB3AUTH_CLIENT_ID,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
      sessionTime: 86400 * 7,
      storageType: 'local'
    })
    // }

    console.log('initWeb3Auth load', web3auth, web3auth.status)

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
  const { onSuccess, onError, referralCode } = action.payload

  try {
    // const web3auth = yield call(initWeb3Auth)
    console.log('authByWallet start', web3auth, web3auth.status)

    yield apply(web3auth, web3auth.connectTo, [
      WALLET_CONNECTORS.METAMASK, {
        chainNamespace: CHAIN_NAMESPACES.EIP155
      }
    ])

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

      if (!webWindow) {
        throw new Error('Popup blocked. Please allow popups for Telegram authentication.')
      }
    }

    const tgAuthResponse = yield call(api.getAuthToken, {
      token,
    })
    console.log('tgAuthResponse', tgAuthResponse)

    console.log('authByTelegram start', { token, encodedToken, deepLink, webLink })
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
    yield put(actions.updateOcrForm(evidenceResponse.data.ocr))
    onSuccess()
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
    console.log('error', error)
    onError(error.message)
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

      // const exchangePhaseResponse = yield call(api.getExchangePhase, {}, {
      //   requireAuth: true,
      //   tokenFetcher: () => authToken
      // })

      // yield put(actions.updateExchangePhase(exchangePhaseResponse.data))
    }
  } catch (error) {
    console.log('getProfile error', error)
  }
}

function* getExchangePhase(action) {
  try {
    const authToken = localStorage.getItem('auth_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const userId = localStorage.getItem('user_id')

    if (userId && authToken && refreshToken) {
      const exchange = action.payload.exchange

      const exchangePhaseResponse = yield call(api.getExchangePhase, { exchange }, {
        requireAuth: true,
        tokenFetcher: () => authToken
      })

      yield put(actions.updateExchangePhase({ exchange, phase: exchangePhaseResponse.data }))
    }
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

    localStorage.removeItem('auth_store')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')

    onSuccess()
  } catch (error) {
    console.log('error', error)
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

  yield takeEvery(String(actions.logout), logout)
}
