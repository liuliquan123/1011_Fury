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
  if (!num || num === 0) return '0'
  
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  
  if (absNum < 1000) {
    return sign + absNum.toFixed(0)
  }
  
  if (absNum < 1000000) {
    const numShort = absNum / 1000
    if (numShort < 10) return sign + numShort.toFixed(2) + 'K'
    if (numShort < 100) return sign + numShort.toFixed(1) + 'K'
    return sign + numShort.toFixed(0) + 'K'
  }
  
  if (absNum < 1000000000) {
    const numShort = absNum / 1000000
    if (numShort < 10) return sign + numShort.toFixed(2) + 'M'
    if (numShort < 100) return sign + numShort.toFixed(1) + 'M'
    return sign + numShort.toFixed(0) + 'M'
  }
  
  const numShort = absNum / 1000000000
  if (numShort < 10) return sign + numShort.toFixed(2) + 'B'
  if (numShort < 100) return sign + numShort.toFixed(1) + 'B'
  return sign + numShort.toFixed(0) + 'B'
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
