/**
 * Google Analytics 4 事件追踪工具
 * Measurement ID 通过环境变量配置
 */

import { GA_MEASUREMENT_ID } from 'constants/env'

export { GA_MEASUREMENT_ID }

/**
 * 发送页面浏览事件
 * @param {string} pagePath - 页面路径
 * @param {string} pageTitle - 页面标题
 */
export const trackPageView = (pagePath, pageTitle) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    })
  }
}

/**
 * 发送用户注册事件 (新用户)
 * @param {string} method - 注册方式: 'metamask', 'email', 'twitter', 'telegram'
 * @param {string} referralCode - 邀请码 (可选)
 */
export const trackSignUp = (method, referralCode) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method,
      referral_code: referralCode || null,
    })
  }
}

/**
 * 发送用户登录事件 (老用户)
 * @param {string} method - 登录方式: 'metamask', 'email', 'twitter', 'telegram'
 */
export const trackLogin = (method) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method,
    })
  }
}

/**
 * 发送提交证据事件
 * @param {Object} params
 * @param {boolean} params.isRegistered - 是否已注册用户
 * @param {string} params.exchange - 交易所名称
 */
export const trackSubmitEvidence = (params) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'submit_evidence', {
      is_registered: params.isRegistered,
      exchange: params.exchange,
    })
  }
}

