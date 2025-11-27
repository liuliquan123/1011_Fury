import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'
import classNames from 'classnames'
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

// 数字格式化（不带 $ 符号）
const formatNumber = (num) => {
  return formatNumberWithUnit(num)
}

const parseExchangeFromCode = (code) => {
  if (!code) return 'Binance'
  
  if (code.endsWith('-BNB')) return 'Binance'
  if (code.endsWith('-OKX')) return 'OKX'
  if (code.endsWith('-BYB')) return 'Bybit'
  if (code.endsWith('-BGT')) return 'Bitget'
  
  return 'Binance'
}

const Invite = ({ profile, userTokens, referralStats, referralInfo, cases, actions, submissions, history }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [referralCode, setReferralCode] = useState(searchParams.get('code') || '')
  const info = referralInfo[referralCode] || { referrer: {} }
  const exchange = parseExchangeFromCode(referralCode)
  const caseList = Array.isArray(cases) ? cases : []
  const exchangePool = caseList.find(c => c.exchange === exchange) || {}
  console.log('referralInfo', referralInfo, searchParams)

  useEffect(() => {
    const referralCode = searchParams.get('code')
    setReferralCode(referralCode)
    actions.getReferralInfo({ referralCode })
    
    const exchange = parseExchangeFromCode(referralCode)
    actions.getCases({ exchange })
  }, [searchParams])

  return (
    <div className={styles.invite}>
      <div className={styles.title}>
        <div className={styles.text}>
          You’ve Been Invited!
        </div>
        <div className={styles.description}>
          Join with referral code: {referralCode}
        </div>
        <div className={styles.buttons}>
          <Link className={styles.button} to={referralCode ? `/submit-loss?code=${referralCode}` : '/submit-loss'}>
            Create New Case
          </Link>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.account}>
          <div className={styles.user}>
            <div className={styles.top}>
              <div className={styles.text}>Invited By</div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.box}>
                <div className={styles.logo}></div>

                <div className={styles.info}>
                  <div className={styles.name}>
                    {info.referrer.username}
                  </div>
                  <div className={styles.code}>
                    <div className={styles.label}>
                      Referral Code：
                    </div>
                    <div className={styles.value}>
                      {referralCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.statistic}>
            <div className={styles.top}>
              <div className={styles.text}>
                Featured Case
              </div>
              <div className={styles.subtext}>
                Demo： Binance Futures Fee Overcharge(Referral Test Case)
              </div>
              <div className={styles.description}>
                This is demonstration case specifically designed to showcase the referral system.**What happened…
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {formatNumber(exchangePool.participant_count || 0)}
                  </div>
                  <div className={styles.listItemName}>
                    Participants
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {formatAmount(exchangePool.total_damage || 0)}
                  </div>
                  <div className={styles.listItemName}>
                    Total Damage
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {formatNumber(exchangePool.participant_count || 0)}
                  </div>
                  <div className={styles.listItemName}>
                    Evidence
                  </div>
                </div>
              </div>
            </div>
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
      referralInfo: state.auth.referralInfo,
      cases: state.auth.cases,
    }),
    dispatch => ({
      actions: bindActionCreators({
        ...actions
      }, dispatch)
    })
  )(Invite)
)
