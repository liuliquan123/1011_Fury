import * as api from 'api/supabase'

export async function validateReferralCode(code) {
  if (!code || code.trim() === '') {
    return { isValid: true, reason: 'empty' }
  }

  try {
    // 提取基础邀请码（去掉 -BNB、-OKX 等后缀）并 trim
    const baseCode = code.split('-')[0].trim()
    
    const info = await api.getReferralInfo({ referral_code: baseCode })

    if (info && info.data && info.data.referrer) {
      return {
        isValid: true,
        reason: 'valid',
        referrerName: info.data.referrer.username
      }
    }

    return {
      isValid: false,
      reason: 'not_found',
      error: 'Referral code not found'
    }
  } catch (error) {

    const errorMessage = error?.message || ''

    if (errorMessage.includes('not found') ||
        errorMessage.includes('Invalid referral code') ||
        error?.code === 404) {
      return {
        isValid: false,
        reason: 'not_found',
        error: 'Referral code not found'
      }
    }

    return {
      isValid: false,
      reason: 'api_error',
      error: errorMessage || 'Failed to validate referral code'
    }
  }
}
