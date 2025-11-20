import { createAction } from 'redux-actions'

export const initWeb3Auth = createAction('auth/INIT_WEB3_AUTH')
export const authByWallet = createAction('auth/BY_WALLET')
export const authByEmail = createAction('auth/BY_EMAIL')
export const authByTwitter = createAction('auth/BY_TWITTER')
export const authByTelegram = createAction('auth/BY_TELEGRAM')

export const getProfile = createAction('auth/GET_PROFILE')

export const updateProfile = createAction('auth/UPDATE_PROFILE')
export const updateUserTokens = createAction('auth/UPDATE_USER_TOKENS')
export const updateSubmissions = createAction('auth/UPDATE_SUBMISSIONS')
export const updateReferralStats = createAction('auth/UPDATE_REFERRAL_STATS')

export const updateUser = createAction('auth/UPDATE_USER')

export const uploadEvidenceOcr = createAction('auth/UPLOAD_EVIDENCE_OCR')
export const submitLoss = createAction('auth/SUBMIT_LOSS')
