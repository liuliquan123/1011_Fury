import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import { formatDate } from 'utils'
import styles from './style.css'

// 基础数字格式化（内部使用）
const formatNumberWithUnit = (num) => {
  // 1. 处理空值 / 零
  if (num === null || num === undefined || isNaN(num)) return '0'
  if (num === 0) return '0'

  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  // 2. < 1000：使用智能小数（去掉无意义的 0）
  if (absNum < 1000) {
    const s = Number(absNum.toFixed(2)).toString()
    return sign + s
  }

  // 工具函数：带进位处理的缩写生成
  const buildWithUnit = (value, divisor, suffix, next) => {
    const short = value / divisor
    let digits
    if (short < 10) digits = 2
    else if (short < 100) digits = 1
    else digits = 0

    let rounded = Number(short.toFixed(digits))

    // 如果四舍五入后变成 1000，说明应该进位到下一单位
    if (rounded >= 1000 && next) {
      return buildWithUnit(value, next.divisor, next.suffix, next.next)
    }

    return sign + rounded.toString() + suffix
  }

  // 3. K / M / B 分段 + 进位处理
  if (absNum < 1000000) {
    return buildWithUnit(absNum, 1000, 'K', {
      divisor: 1000000,
      suffix: 'M',
      next: {
        divisor: 1000000000,
        suffix: 'B',
        next: null
      }
    })
  }

  if (absNum < 1000000000) {
    return buildWithUnit(absNum, 1000000, 'M', {
      divisor: 1000000000,
      suffix: 'B',
      next: null
    })
  }

  return buildWithUnit(absNum, 1000000000, 'B', null)
}

// 金额格式化（带 $ 符号）
const formatAmount = (amount) => {
  return '$' + formatNumberWithUnit(amount)
}

// {
//   created_at: "2025-11-21T11:18:42.279562+00:00",
//   exchange: "Binance",
//   granted_at: "2025-11-21T11:18:42.294+00:00",
//   id: "3070fe14-8438-42e3-b074-74daf0a859cb",
//   status: "locked",
//   submission_id: "e2b62bce-aacf-4870-bf98-c8aab7380a9e",
//   token_amount: 0,
//   unlock_date: "2025-11-28T11:18:42.294+00:00",
//   updated_at: "2025-11-21T11:18:42.279562+00:00",
//   user_id: "7f2f5499-98e7-466a-baee-ebc103e5b362"
// }

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

const Profile = ({ profile, userTokens, referralStats, actions, submissions, history }) => {
  const rewards = userTokens.rewards || []
  const exchangeTypes = rewards.map(reward => reward.exchange)
  const exchangeCount = exchangeTypes.length
  const [activeIdx, setActiveIdx] = useState(0)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [date, setDate] = useState(0)
  let reward = !!exchangeCount ? rewards[activeIdx] : null
  const [formattedTime, setFormattedTime] = useState(getFormattedTime(reward))
  const [percentage, setPercentage] = useState(getPercentage(reward))

  console.log('profile', profile)
  console.log('userTokens', userTokens)
  console.log('referralStats', referralStats)
  console.log('submissions', submissions)

  console.log('formattedTime', formattedTime)
  console.log('percentage', percentage)

  useEffect(() => {
    const iv = setInterval(() => {
      setDate(+new Date())
    }, 1000)

    return () => {
      clearInterval(iv)
    }
  }, [])

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

  const linkWallet = useCallback(() => {
    setConnectingWallet(true)

    actions.linkWallet({
      onSuccess: () => {
        toast('Connect Wallet Success!')
        setConnectingWallet(false)
      },
      onError: (message) => {
        toast(message)
        setConnectingWallet(false)
      },
    })
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

  const logout = useCallback(() => {
    actions.logout({
      onSuccess: () => {
        history('/login')
        window.location.reload()
      }
    })
  }, [])

  return (
    <div className={styles.profile}>
      <div className={styles.title}>
        <div className={styles.text}>
          Profile
        </div>
        <div className={styles.description}>
          Manage your account and view your activity
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.account}>
          <div className={styles.user}>
            <div className={styles.top}>
              <div className={styles.logo}></div>
              <div className={styles.name}>{profile.username}</div>
              <div className={styles.description}>{profile.id}</div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <div className={styles.listItemName}>
                    Login Type
                  </div>
                  <div className={styles.listItemContent}>
                    {profile.login_type}
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemName}>
                    Wallet
                  </div>
                  <div className={styles.listItemContent}>
                    {profile.wallet_address}
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemName}>
                    Member Since
                  </div>
                  <div className={styles.listItemContent}>
                    {formatDate(profile.created_at)}
                  </div>
                </div>
              </div>
              <button className={styles.button} onClick={logout}>
                <div className={classNames(styles.leftArrow)}>{">"}</div>
                <div className={classNames(styles.buttonText)}>LOGOUT</div>
                <div className={classNames(styles.rightArrow)}>{"<"}</div>
              </button>
            </div>
          </div>
          <div className={styles.tokenSection}>
            {(!!reward) && (
              <div className={styles.locked}>
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
                <div className={styles.text}>{reward && reward.exchange}</div>
                <div className={styles.tokens}>
                  <div className={styles.token}>
                    <div className={styles.tokenLogo}></div>
                    <div className={styles.tokenAmount}>
                      {(reward && reward.token_amount) || 0}
                      <span className={styles.status}>{reward && reward.status}</span>
                    </div>
                    <div className={styles.tokenLockTime}>
                      <div className={styles.tokenLockTimeName}>
                        Remaining
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
                  </div>
                </div>
                <div className={styles.progress}>
                  <div className={styles.percentage} style={{ width: `${percentage}%` }}>

                  </div>
                </div>
                <div className={styles.actionButtons}>
                  <Link className={styles.actionButton} to="/referral">
                    <div className={classNames(styles.leftArrow)}>{">"}</div>
                    <div className={classNames(styles.buttonText)}>Accelerate Unlock</div>
                    <div className={classNames(styles.rightArrow)}>{"<"}</div>
                  </Link>
                  {profile && !profile.wallet_address && (
                    <button className={classNames(styles.actionButtonDark, {
                      [styles.disabled]: connectingWallet
                    })} onClick={linkWallet}>
                      <div className={classNames(styles.leftArrow)}>{">"}</div>
                      <div className={classNames(styles.buttonText)}>{connectingWallet ? 'Connecting Wallet' : 'Connect Wallet'}</div>
                      <div className={classNames(styles.rightArrow)}>{"<"}</div>
                    </button>
                  )}
                </div>
              </div>
            )}
            {(!reward) && (
              <div className={styles.locked}>
                <div className={styles.actionButtons}>
                  <Link className={styles.actionButton} to="/submit-loss">
                    <div className={classNames(styles.leftArrow)}>{">"}</div>
                    <div className={classNames(styles.buttonText)}>SUBMIT LOSS</div>
                    <div className={classNames(styles.rightArrow)}>{"<"}</div>
                  </Link>
                </div>
              </div>
            )}

            <div className={styles.statistic}>
              <div className={styles.statisticTitle}>
                Overview
              </div>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {(submissions && submissions.statistics && submissions.statistics.total_loss_amount) 
                      ? formatAmount(submissions.statistics.total_loss_amount) 
                      : '--'}
                  </div>
                  <div className={styles.listItemName}>
                    Total Loss Amount
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {(submissions && submissions.statistics && submissions.statistics.total_submissions) || 0}
                  </div>
                  <div className={styles.listItemName}>
                    Your Cases Submitted
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {(profile && profile.referral_count) || 0}
                  </div>
                  <div className={styles.listItemName}>
                    Referrals
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.actionTitle}>
            Quick Actions
          </div>
          <div className={styles.list}>
            <Link className={styles.listItem} to="/submit-loss">
              submit new loss
            </Link>
            <Link className={styles.listItem} to="/referral">
              view referral program
            </Link>
            <Link className={styles.listItem} to="/my-case">
              my cases
            </Link>
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
  )(Profile)
)

