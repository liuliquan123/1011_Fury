import { createAction } from 'redux-actions'

export const initWeb3Auth = createAction('auth/INIT_WEB3_AUTH')
export const authByWallet = createAction('auth/BY_WALLET')
export const authByEmail = createAction('auth/BY_EMAIL')
export const authByTwitter = createAction('auth/BY_TWITTER')
export const authByTelegram = createAction('auth/BY_TELEGRAM')
