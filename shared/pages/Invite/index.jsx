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
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const info = referralInfo[referralCode] || { referrer: {} }
  const exchange = parseExchangeFromCode(referralCode)
  const caseList = Array.isArray(cases) ? cases : []
  const exchangePool = caseList.find(c => c.exchange === exchange) || {}

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

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
          {info.referrer.username || 'Someone'} wants you to take back what's yours.
        </div>
        <div className={styles.description}>
          Submit your loss, claim your rights, and join the fight.
        </div>
        <div className={styles.buttons}>
          <Link className={styles.button} to={referralCode ? `/submit-loss?code=${referralCode}` : '/submit-loss'}>
            Submit My Proof
          </Link>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.account}>
          <div className={styles.user}>
            <div className={styles.top}>
              <div className={styles.text}>Called by</div>
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
                      Advocate Code
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
                {/* 单交易所模式：隐藏 exchange 名称 */}
                Malicious Liquidation
              </div>
              <div className={styles.description}>
                This case is currently collecting victim evidence. Submit proof and reclaim what's yours.
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

        <div className={classNames(styles.section, styles.questions)}>
          <div className={styles.sectionTitle}>
            _> Decode the 1011
          </div>
          <div className={styles.sectionContent}>
            {[
              { 
                q: "What is 1011?", 
                a: "1011 is a decentralized rights-protection network built by volunteers and users.\n\nIt uses AI evidence verification, community voting, and on-chain transparency to help crypto users surface losses, submit proof, drive collective action, and earn tokens for contributing." 
              },
              { 
                q: "Why was this created?", 
                a: "In Web3, scams, abnormal liquidations, and vanishing projects have become routine — and victims are usually left with no path forward.\n\nWe believe justice in crypto should be community-driven, transparent, and enforced by code, not centralized institutions." 
              },
              { 
                q: "How does the AI verification system work?", 
                a: "All submitted proof (tx hashes, screenshots, statements) goes through: AI risk-model assessment (detecting anomalies, address linkage, fund flow), AI text/image authenticity checks, and community multi-sig voting for transparent final approval.\n\nOnce your evidence is verified:\n✔ You receive token rewards for verified contribution\n✔ The evidence enters the case pool for future legal escalation" 
              },
              { 
                q: "What do I earn by contributing to a case?", 
                a: "You receive two types of rewards:\n\nA. Verification Rewards (Immediate) - Once your evidence passes AI + community verification, you earn Contributor Tokens instantly.\n\nB. Legal Recovery Rewards (Post-Case) - If the case proceeds to legal action and funds are recovered: 50% goes to verified victims involved in the case, 50% (after legal fees) is injected into the token pool, driving token value growth.\n\nTokens can be sold at any time." 
              },
              { 
                q: "Can I sell the token anytime?", 
                a: "Yes.\n\nThere is no lockup and no mandatory holding period.\n\nUsers can sell, trade, or exit at any time." 
              },
              { 
                q: "Why is KYC required in the legal phase?", 
                a: "Courts require verified personal identity to:\n\n1. Confirm you are a legitimate victim\n\n2. Enable you to legally receive recovered funds\n\n3. Prevent impersonation and claim fraud\n\nKYC is required only when a case enters the formal legal phase — not during submission." 
              },
              { 
                q: "Who decides which cases move forward?", 
                a: "Decisions are fully community-driven.\n\nToken holders vote on-chain to determine:\n\n1. Which cases advance to legal action\n\n2. How resources are allocated\n\n3. Adjustments to reward or governance models" 
              },
              { 
                q: "What types of cases can be submitted?", 
                a: "Any case traceable on-chain is eligible, including:\n\n1. Forced liquidations / abnormal margin wipes\n\n2. DeFi hacks and exploits\n\n3. NFT rug pulls\n\n4. Centralized exchange irregularities\n\n5. Market manipulation evidence\n\n6. Influencer-driven scams\n\n7. Token project abandonment" 
              },
              { 
                q: "Is my data safe?", 
                a: "Yes.\n\nPrivacy is protected through a zero-knowledge-based, layered verification flow:\n\n1. No identity is required during evidence submission\n\n2. AI and voters verify content only\n\n3. KYC is required only in the legal phase\n\n4. All sensitive data is encrypted and deletable upon request" 
              }
            ].map((faq, index) => (
              <div key={index} className={styles.question}>
                <div className={styles.questionTitle} onClick={() => toggleFAQ(index)}>
                  <div className={styles.questionTitleText}>
                    {faq.q}
                  </div>
                  <div className={styles.questionTitleIcon}>
                    {expandedFAQ === index ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="2" viewBox="0 0 14 2" fill="none">
                        <path d="M14 2H0V0H14V2Z" fill="white"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z" fill="white"/>
                      </svg>
                    )}
                  </div>
                </div>
                {expandedFAQ === index && (
                  <div className={styles.questionContent}>
                    {faq.a.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < faq.a.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
