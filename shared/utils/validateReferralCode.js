import * as api from 'api/supabase'

export async function validateReferralCode(code) {
  if (!code || code.trim() === '') {
    return { isValid: true, reason: 'empty' }
  }

  try {
    const info = await api.getReferralInfo({ referral_code: code })

    if (info && info.referrer) {
      console.log('[Referral] Valid referral code', {
        code,
        referrer: info.referrer.username,
        stats: info.stats
      })
      return {
        isValid: true,
        reason: 'valid',
        referrerName: info.referrer.username
      }
    }

    return {
      isValid: false,
      reason: 'not_found',
      error: 'Referral code not found'
    }
  } catch (error) {
    console.error('[Referral] Failed to validate code', { code, error })

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
