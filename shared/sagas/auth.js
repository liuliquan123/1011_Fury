// import { delay } from 'redux-saga'
import { takeEvery, call, apply, delay } from 'redux-saga/effects'
import {
  Web3Auth,
  Web3AuthNoModal,
  WEB3AUTH_NETWORK,
  WALLET_CONNECTORS,
  CHAIN_NAMESPACES,
  ADAPTER_EVENTS,
  CONNECTOR_EVENTS
} from '@web3auth/modal'
import * as actions from 'actions/auth'

let web3auth

function* initWeb3Auth() {
  if (!web3auth) {
    web3auth = new Web3AuthNoModal({
      clientId: 'BCkAjl_q8vF43zMg45PzrroZ7oE6Bq-thcCBseBXjSzzlV8XLMZEKQhh_dYCkdPRc6gdcLFdI4cSAMe0OVd4k6k',
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
      sessionTime: 86400 * 7, // 7 days (in seconds)
      storageType: 'local'
    })
  }

  yield apply(web3auth, web3auth.init)
  yield delay(500)

  if (web3auth.status === 'connected') {
    yield apply(web3auth, web3auth.logout)
  }

  return web3auth
}

function* initializeWeb3Auth(action) {
  const web3auth = yield call(initWeb3Auth)

  yield apply(web3auth, web3auth.connectTo, [
    WALLET_CONNECTORS.METAMASK, {
      chainNamespace: CHAIN_NAMESPACES.EIP155
    }
  ])

  console.log('initializeWeb3Auth', action, web3auth, web3auth.status)
}

export default function* intlSaga() {
  yield takeEvery(String(actions.initializeWeb3Auth), initializeWeb3Auth)
}
