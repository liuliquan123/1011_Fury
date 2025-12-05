import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import binanceLogo from 'resources/images/logos/binance-logo.svg'
import okxLogo from 'resources/images/logos/okx-logo.svg'
import bybitLogo from 'resources/images/logos/bybit-logo.svg'
import bitgetLogo from 'resources/images/logos/bitget-logo.svg'
import classNames from 'classnames'
import { isExchangeVisible, getTokenName } from 'config/exchanges'
import styles from './style.css'

const getInviteCode = (code, exchangeType) => {
  if (exchangeType === 'binance') {
    return `${code || ''}-BNB`
  } else if (exchangeType === 'okx') {
    return `${code || ''}-OKX`
  } else if (exchangeType === 'bybit') {
    return `${code || ''}-BYB`
  } else if (exchangeType === 'bitget') {
    return `${code || ''}-BGT`
  }

  return code
}

const getExchangeName = (exchangeType, uppercase) => {
  if (exchangeType === 'binance') {
    return uppercase ? 'BINANCE' : 'Binance'
  } else if (exchangeType === 'okx') {
    return 'OKX'
  } else if (exchangeType === 'bybit') {
    return uppercase ? 'BYBIT' : 'Bybit'
  } else if (exchangeType === 'bitget') {
    return uppercase ? 'BITGET' : 'Bitget'
  }

  return ''
}

const getFormattedTime = (reward) => {
  if (reward) {
    const unlockTimestamp = new Date(reward.unlock_date).getTime()
    const now = Date.now()

    let diff = unlockTimestamp - now

    if (diff <= 0) {
      return { d: 0, h: 0, m: 0, s: 0 }; // already unlocked
    }

    // Convert ms → d/h/m/s
    let seconds = Math.floor(diff / 1000)

    const d = Math.floor(seconds / 86400)
    seconds %= 86400

    const h = Math.floor(seconds / 3600)
    seconds %= 3600

    const m = Math.floor(seconds / 60)
    const s = seconds % 60

    return { d, h, m, s }
  }

  return { d: 0, h: 0, m: 0, s: 0 }
}

const getPercentage = (reward) => {
  if (reward) {
    const start = new Date(reward.granted_at).getTime();
    const end = new Date(reward.unlock_date).getTime();
    const now = Date.now();

    if (now <= start) return 0;      // not started yet
    if (now >= end) return 100;      // already unlocked

    const total = end - start;
    const passed = now - start;

    const percentage = (passed / total) * 100;

    return Math.min(100, Math.max(0, percentage))
  }

  return 0
}

const Referral = ({ profile, userTokens, referralStats, actions, submissions, history }) => {
  // 过滤只显示可见交易所的 rewards
  const allRewards = Array.isArray(userTokens?.rewards) ? userTokens.rewards : []
  const rewards = allRewards.filter(r => isExchangeVisible(r.exchange))
  const exchangeTypes = rewards.map(reward => reward.exchange)
  const exchangeCount = exchangeTypes.length
  const [activeIdx, setActiveIdx] = useState(0)
  const [date, setDate] = useState(0)
  const [claimStatus, setClaimStatus] = useState('idle') // idle | signing | connecting | claiming | confirming
  let reward = !!exchangeCount ? rewards[activeIdx] : null
  const [formattedTime, setFormattedTime] = useState(getFormattedTime(reward))
  const [percentage, setPercentage] = useState(getPercentage(reward))
  const [exchangeType, setExchangeType] = useState('binance')
  const [inviteCode, setInviteCode] = useState(getInviteCode(referralStats.referral_code, exchangeType))

  // 派生变量：空值防御
  const rewardStatus = reward?.status
  const hasWallet = !!profile?.wallet_address

  const selectExchange = useCallback((exchangeType) => () => {
    setExchangeType(exchangeType)
    actions.getExchangePhase({ exchange: getExchangeName(exchangeType) })
  }, [])

  useEffect(() => {
    const iv = setInterval(() => {
      setDate(+new Date())
    }, 1000)

    return () => {
      clearInterval(iv)
    }
  }, [])

  useEffect(() => {
    setInviteCode(getInviteCode(referralStats.referral_code, exchangeType))
  }, [referralStats, exchangeType])

  useEffect(() => {
    setFormattedTime(getFormattedTime(reward))
    setPercentage(getPercentage(reward))
  }, [reward, date])

  useEffect(() => {
    setActiveIdx(0)
  }, [exchangeCount])

  useEffect(() => {
    actions.getProfile()
  }, [])

  const prev = useCallback(() => {
    if (activeIdx > 0) {
      setActiveIdx(activeIdx - 1)
    }
  }, [activeIdx])

  const next = useCallback(() => {
    if (activeIdx < exchangeCount) {
      setActiveIdx(activeIdx + 1)
    }
  }, [activeIdx, exchangeCount])

  const handleCopyLink = useCallback(() => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const link = `${baseUrl}/invite?code=${inviteCode}`
      navigator.clipboard.writeText(link);
      toast('Copied!')
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [inviteCode])

  const handleShareTwitter = useCallback(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${baseUrl}/invite?code=${inviteCode}`
    const text = `Join me on Satoshi's Fury! Use my referral code: ${inviteCode}\n${link}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`
    window.open(url, '_blank')
  }, [inviteCode])

  const handleShareTelegram = useCallback(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${baseUrl}/invite?code=${inviteCode}`
    const text = `Join me on Satoshi's Fury! Use my referral code: ${inviteCode}\n${link}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }, [inviteCode])

  // Claim Token 处理函数（复用 Profile 页面逻辑）
  const handleClaim = useCallback((exchange) => {
    if (claimStatus !== 'idle') return

    if (!profile?.wallet_address) {
      toast('Please connect your wallet first')
      return
    }

    actions.claimToken({
      exchange,
      onStatusChange: (status) => {
        setClaimStatus(status)
      },
      onSuccess: ({ txHash }) => {
        toast('Claim successful!')
        setClaimStatus('idle')
      },
      onError: (message) => {
        toast(message || 'Claim failed')
        setClaimStatus('idle')
      },
    })
  }, [claimStatus, profile?.wallet_address, actions])

  // 获取 Claim 按钮文案
  const getClaimButtonText = () => {
    switch (claimStatus) {
      case 'signing':
        return 'Getting Signature...'
      case 'connecting':
        return 'Connecting Wallet...'
      case 'claiming':
        return 'Sending Transaction...'
      case 'confirming':
        return 'Confirming...'
      default:
        return 'Claim'
    }
  }

  return (
    <div className={styles.referral}>
      <div className={styles.title}>
        <div className={styles.text}>
          Spread the Fury
        </div>
        <div className={styles.description}>
          Ignite action, inspire others, and unlock your rightful value.
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.myToken}>
          {reward ? (
            <>
              <div className={styles.exchange}>{reward.exchange}</div>
              <div className={styles.bottom}>
                <div className={styles.tokens}>
                  <div className={styles.token}>
                    <div className={styles.tokenAmount}>
                      {reward.token_amount || 0}
                      <span className={styles.tokenName}>{getTokenName(reward?.exchange)}</span>
                      <span className={styles.status}>{reward.status}</span>
                    </div>
                    {/* Unlocked/Claimed 时显示祝贺文案，否则显示倒计时 */}
                    {rewardStatus === 'unlocked' || rewardStatus === 'claimed' ? (
                      <div className={styles.congratsMessage}>
                        Congrats! You can claim the token now!
                      </div>
                    ) : (
                      <div className={styles.tokenLockTime}>
                        <div className={styles.tokenLockTimeName}>
                          Unlocks in
                        </div>
                        <div className={styles.tokenLockTimeContent}>
                          <div className={styles.tokenLockTimeContentCellNumber}>{formattedTime.d}</div>
                          <div className={styles.tokenLockTimeContentCellText}>D</div>
                          <div className={styles.tokenLockTimeContentCellNumber}>{formattedTime.h}</div>
                          <div className={styles.tokenLockTimeContentCellText}>H</div>
                          <div className={styles.tokenLockTimeContentCellNumber}>{formattedTime.m}</div>
                          <div className={styles.tokenLockTimeContentCellText}>M</div>
                          <div className={styles.tokenLockTimeContentCellNumber}>{formattedTime.s}</div>
                          <div className={styles.tokenLockTimeContentCellText}>S</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.progress}>
                  <div className={styles.percentage} style={{ width: `${percentage}%` }}>

                  </div>
                </div>
                {/* Claim 按钮 - 根据状态显示不同内容 */}
                <div className={styles.actionButtons}>
                  {/* 状态: locked - 显示 Locked */}
                  {rewardStatus === 'locked' && (
                    <button className={classNames(styles.withdrawalButton, styles.disabled)} disabled>
                      Locked
                    </button>
                  )}

                  {/* 状态: unlocked + 无钱包 - 显示提示 */}
                  {rewardStatus === 'unlocked' && !hasWallet && (
                    <button className={styles.withdrawalButton} disabled>
                      Connect Wallet First
                    </button>
                  )}

                  {/* 状态: unlocked + 有钱包 - 显示 Claim */}
                  {rewardStatus === 'unlocked' && hasWallet && (
                    <button
                      className={classNames(styles.withdrawalButton, {
                        [styles.disabled]: claimStatus !== 'idle'
                      })}
                      onClick={() => handleClaim(reward?.exchange)}
                      disabled={claimStatus !== 'idle'}
                    >
                      {getClaimButtonText()}
                    </button>
                  )}

                  {/* 状态: claimed - 显示 Claimed */}
                  {rewardStatus === 'claimed' && (
                    <button className={classNames(styles.withdrawalButton, styles.claimed)} disabled>
                      Claimed ✓
                    </button>
                  )}
                </div>

                {/* 轮播按钮 - 只有多个 reward 时才显示 */}
                {exchangeCount > 1 && (
                  <div className={styles.nav}>
                    <div className={classNames(styles.leftButton, {
                      [styles.disabled]: activeIdx === 0
                    })} onClick={prev}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                        <path d="M0.113852 5.56483C0.103751 5.57951 0.0957266 5.59583 0.0869215 5.6111C0.0387433 5.69507 0.0108409 5.78666 0.00267635 5.8804C-0.0138618 6.06774 0.0465054 6.26109 0.189811 6.40452L5.46894 11.6837C5.7261 11.9406 6.14327 11.9398 6.40047 11.683C6.65744 11.4258 6.65745 11.0093 6.40047 10.7521L2.01627 6.36792H13.794C14.1578 6.36792 14.4528 6.07295 14.4528 5.70915C14.4528 5.34537 14.1578 5.05038 13.794 5.05038H2.47479L6.40047 1.1247C6.65768 0.867487 6.65762 0.449726 6.40047 0.192476C6.1432 -0.0644227 5.72607 -0.0639614 5.46894 0.193166L0.190502 5.47161C0.16168 5.50047 0.136207 5.5324 0.113852 5.56483Z" fill="black" />
                      </svg>
                    </div>
                    <div className={classNames(styles.rightButton, {
                      [styles.disabled]: activeIdx === exchangeCount - 1
                    })} onClick={next}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                        <path d="M14.272 5.48209C14.3215 5.53372 14.3599 5.59201 14.3894 5.65334C14.4053 5.68642 14.418 5.72074 14.428 5.75554C14.4335 5.77454 14.4402 5.79353 14.4439 5.81285C14.484 6.02032 14.4236 6.24327 14.263 6.40395L8.98455 11.6824C8.72737 11.9396 8.31027 11.9401 8.05302 11.6831C7.79607 11.4258 7.79587 11.008 8.05302 10.7509L12.4358 6.36804L0.65878 6.36873C0.295167 6.36873 0.000307519 6.07351 1.08056e-05 5.70996C1.06422e-05 5.34617 0.294985 5.05119 0.65878 5.05119L11.9787 5.0505L8.05233 1.12413C7.79558 0.866846 7.79594 0.449676 8.05302 0.192598C8.31011 -0.0643469 8.72662 -0.0641074 8.98386 0.192598L14.2637 5.47242C14.2666 5.47532 14.2692 5.47911 14.272 5.48209Z" fill="black" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* 无 reward 时显示引导 */
            <div className={styles.noReward}>
              <div className={styles.noRewardTitle}>No Tokens Yet</div>
              <div className={styles.noRewardText}>Submit your loss to earn tokens</div>
              <Link className={styles.submitButton} to="/submit-loss">
                Submit Loss
              </Link>
            </div>
          )}
        </div>
        <div className={styles.myReferral}>
          <div className={styles.contentTitle}>
            Pick & Spread
          </div>
          <div className={styles.exchanges}>
            {isExchangeVisible('binance') && (
              <div
                className={classNames(styles.exchange, {
                  [styles.selected]: exchangeType === 'binance'
                })}
                onClick={selectExchange('binance')}
              >
                <div className={styles.exchangeLogo}>
                  <img src={binanceLogo} alt={`binance logo`} />
                </div>
                <div className={styles.exchangeName}>Binance</div>
              </div>
            )}
            {isExchangeVisible('okx') && (
              <div
                className={classNames(styles.exchange, {
                  [styles.selected]: exchangeType === 'okx'
                })}
                onClick={selectExchange('okx')}
              >
                <div className={styles.exchangeLogo}>
                  <img src={okxLogo} alt={`okx logo`} />
                </div>
                <div className={styles.exchangeName}>OKX</div>
              </div>
            )}
            {isExchangeVisible('bybit') && (
              <div
                className={classNames(styles.exchange, {
                  [styles.selected]: exchangeType === 'bybit'
                })}
                onClick={selectExchange('bybit')}
              >
                <div className={styles.exchangeLogo}>
                  <img src={bybitLogo} alt={`bybit logo`} />
                </div>
                <div className={styles.exchangeName}>Bybit</div>
              </div>
            )}
            {isExchangeVisible('bitget') && (
              <div
                className={classNames(styles.exchange, {
                  [styles.selected]: exchangeType === 'bitget'
                })}
                onClick={selectExchange('bitget')}
              >
                <div className={styles.exchangeLogo}>
                  <img src={bitgetLogo} alt={`bitget logo`} />
                </div>
                <div className={styles.exchangeName}>Bitget</div>
              </div>
            )}
          </div>
          <div className={styles.code}>
            {inviteCode}
          </div>
          <div className={styles.buttons}>
            <button className={styles.shareButton} onClick={handleShareTwitter}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.buttonText)}>share on X（Twitter）</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
            <button className={styles.shareButton} onClick={handleShareTelegram}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.buttonText)}>share on Telegram</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
            <button className={styles.copyButton} onClick={handleCopyLink}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.buttonText)}>Copy Advocate Link</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withRouter(
  connect(
    state => ({
      profile: state.auth.profile,
      userTokens: state.auth.userTokens,
      submissions: state.auth.submissions,
      referralStats: state.auth.referralStats,
    }),
    dispatch => ({
      actions: bindActionCreators({
        ...actions
      }, dispatch)
    })
  )(Referral)
)
