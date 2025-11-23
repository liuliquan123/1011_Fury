import { supabaseApi, supabaseRestApi } from 'api'

export const authToken = (params, options) => supabaseRestApi('POST', '/auth_tokens', params, options)
export const web3AuthLogin = (params, options) => supabaseApi('POST', '/web3auth-login', params, options)
export const getProfile = (params, options) => supabaseApi('GET', '/get-profile', params, options)
export const getUserTokens = (params, options) => supabaseApi('GET', '/get-user-tokens', params, options)
export const getMySubmissions = (params, options) => supabaseApi('GET', '/get-my-submissions', params, options)
export const getReferralStats = (params, options) => supabaseApi('GET', '/get-referral-stats', params, options)
export const getReferralInfo = (params, options) => supabaseApi('GET', '/get-referrer-info', params, options)

export const getExchangePhase = (params, options) => supabaseApi('GET', '/get-exchange-phase', params, options)

export const uploadEvidenceOcr = (params, options) => supabaseApi('POST', '/upload-evidence-ocr', params, options)
export const submitLoss = (params, options) => supabaseApi('POST', '/submit-loss', params, options)
export const linkWeb3Auth = (params, options) => supabaseApi('POST', '/link-web3auth', params, options)

export const getAuthToken = (params, options) => supabaseRestApi('GET', '/auth_tokens', params, options)
