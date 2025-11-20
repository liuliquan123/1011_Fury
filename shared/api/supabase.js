import { supabaseApi } from 'api'

export const authToken = (params) => supabaseApi('POST', '/auth_tokens', params)
export const web3AuthLogin = (params, options) => supabaseApi('POST', '/web3auth-login', params, options)
