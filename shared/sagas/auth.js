import {
  eventChannel,
  takeEvery,
  call,
  apply,
  delay,
  put,
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
import * as actions from 'actions/auth'

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
    if (!web3auth) {
      web3auth = new Web3AuthNoModal({
        clientId: 'BCkAjl_q8vF43zMg45PzrroZ7oE6Bq-thcCBseBXjSzzlV8XLMZEKQhh_dYCkdPRc6gdcLFdI4cSAMe0OVd4k6k',
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
        sessionTime: 86400 * 7, // 7 days (in seconds)
        storageType: 'local'
      })
    }

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

function* authByWallet(action) {
  const { onSuccess, onError } = action.payload

  try {
    // const web3auth = yield call(initWeb3Auth)
    console.log('authByWallet start', web3auth, web3auth.status)

    yield apply(web3auth, web3auth.connectTo, [
      WALLET_CONNECTORS.METAMASK, {
        chainNamespace: CHAIN_NAMESPACES.EIP155
      }
    ])

    console.log('authByWallet end', web3auth, web3auth.status)
    onSuccess()
  } catch (error) {
    console.log('authByWallet error')
    console.log('error', error)
    onError(error.message)
  }
}

function* authByTwitter(action) {
  const { onSuccess, onError } = action.payload

  try {
    // const web3auth = yield call(initWeb3Auth)
    console.log('authByTwitter start', web3auth, web3auth.status)

    yield apply(web3auth, web3auth.connectTo, [
      WALLET_CONNECTORS.AUTH, {
        authConnection: AUTH_CONNECTION.TWITTER,
      }
    ])

    console.log('authByTwitter end', web3auth, web3auth.status)
    onSuccess()
  } catch (error) {
    console.log('authByTwitter error')
    console.log('error', error)
    onError(error.message)
  }
}

export default function* intlSaga() {
  yield takeEvery(String(actions.initWeb3Auth), initWeb3Auth)
  yield takeEvery(String(actions.authByWallet), authByWallet)
  yield takeEvery(String(actions.authByTwitter), authByTwitter)
}
