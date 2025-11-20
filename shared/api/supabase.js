import { supabaseApi, supabaseRestApi } from 'api'

export const authToken = (params, options) => supabaseRestApi('POST', '/auth_tokens', params, options)
export const web3AuthLogin = (params, options) => supabaseApi('POST', '/web3auth-login', params, options)
export const getProfile = (params, options) => supabaseApi('GET', '/get-profile', params, options)
