import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { isExchangeVisible } from 'config/exchanges'
import styles from './style.css'
import furyLogo from 'resources/images/Logo_v2.svg'

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

const Landing = ({ cases, actions }) => {
  const [activeIdx, setActiveIdx] = useState(0)
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  useEffect(() => {
    actions.getCases({})
  }, [])

  const allCases = Array.isArray(cases) ? cases : []
  // 过滤只显示可见交易所的 cases
  const caseList = allCases.filter(c => isExchangeVisible(c.exchange))
  const activeCases = caseList.length
  const totalParticipants = caseList.reduce((sum, c) => sum + (c.participant_count || 0), 0)
  const totalDamage = caseList.reduce((sum, c) => sum + (c.total_damage || 0), 0)
  
  const featuredCase = caseList[activeIdx] || {}

  const prevCase = () => {
    setActiveIdx((prev) => (prev === 0 ? caseList.length - 1 : prev - 1))
  }

  const nextCase = () => {
    setActiveIdx((prev) => (prev === caseList.length - 1 ? 0 : prev + 1))
  }

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <div className={styles.landing}>
      <div className={styles.banner}>
        <div className={styles.content}>
          <div className={styles.title}>
            It's decentralized revolution
          </div>
          <div className={styles.text}>
            They Took Control. We Take It Back
          </div>
          <Link className={styles.button} to="/submit-loss">
            <div className={classNames(styles.leftArrow)}>{">"}</div>
            <div className={classNames(styles.buttonText)}>SUBMIT YOUR LOSS</div>
            <div className={classNames(styles.rightArrow)}>{"<"}</div>
          </Link>
          <Link className={classNames(styles.button, styles.secondaryButton)} to="/crowdfund">
            <div className={classNames(styles.leftArrow)}>{">"}</div>
            <div className={classNames(styles.buttonText)}>CROWDFUND</div>
            <div className={classNames(styles.rightArrow)}>{"<"}</div>
          </Link>
        </div>
      </div>
      <div className={styles.sections}>
        <div className={classNames(styles.section, styles.platform)}>
          <div className={styles.sectionTitle}>
            _> UNBURIED-NUMBERS
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.statistic}>
              <div className={styles.statisticNumber}>
                {activeCases || 0}
              </div>
              <div className={styles.statisticName}>
                Active Cases
              </div>
            </div>
            <div className={styles.statistic}>
              <div className={styles.statisticNumber}>
                {formatNumber(totalParticipants)}
              </div>
              <div className={styles.statisticName}>
                Participants
              </div>
            </div>
            <div className={styles.statistic}>
              <div className={styles.statisticNumber}>
                {formatAmount(totalDamage)}
              </div>
              <div className={styles.statisticName}>
                Total Damage
              </div>
            </div>
            <div className={styles.statistic}>
              <div className={styles.statisticNumber}>
                1250K
              </div>
              <div className={styles.statisticName}>
                Token Distributed
              </div>
            </div>
          </div>
        </div>
        <div className={classNames(styles.section, styles.featured)}>
          <div className={styles.sectionTitle}>
            _> FEATURED CASES
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.cases}>
              <div className={styles.case}>
                <div className={styles.caseTitle}>
                  {/* 单交易所模式：隐藏 exchange 名称 */}
                  <div className={styles.text}>{featuredCase.trading_pair || ''} Malicious Liquidation</div>
                </div>
                <div className={styles.caseCards}>
                  {/* 单交易所模式：隐藏 Exchange 卡片
                  <div className={styles.caseCard}>
                    <div className={styles.caseContent}>
                      {featuredCase.exchange || 'Binance'}
                    </div>
                    <div className={styles.caseName}>
                      Exchange
                    </div>
                  </div>
                  */}
                  <div className={styles.caseCard}>
                    <div className={styles.caseContent}>
                      {formatNumber(featuredCase.participant_count || 0)}
                    </div>
                    <div className={styles.caseName}>
                      Participants
                    </div>
                  </div>
                  <div className={styles.caseCard}>
                    <div className={styles.caseContent}>
                      {formatAmount(featuredCase.total_damage || 0)}
                    </div>
                    <div className={styles.caseName}>
                      Total Damage
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 轮播 pagination - 只有多个 case 时才显示 */}
            {caseList.length > 1 && (
              <div className={styles.pagination}>
                <div className={styles.paginationContent}>
                  <div className={styles.leftButton} onClick={prevCase} style={{ cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                      <path d="M0.113852 5.56483C0.103751 5.57951 0.0957266 5.59583 0.0869215 5.6111C0.0387433 5.69507 0.0108409 5.78666 0.00267635 5.8804C-0.0138618 6.06774 0.0465054 6.26109 0.189811 6.40452L5.46894 11.6837C5.7261 11.9406 6.14327 11.9398 6.40047 11.683C6.65744 11.4258 6.65745 11.0093 6.40047 10.7521L2.01627 6.36792H13.794C14.1578 6.36792 14.4528 6.07295 14.4528 5.70915C14.4528 5.34537 14.1578 5.05038 13.794 5.05038H2.47479L6.40047 1.1247C6.65768 0.867487 6.65762 0.449726 6.40047 0.192476C6.1432 -0.0644227 5.72607 -0.0639614 5.46894 0.193166L0.190502 5.47161C0.16168 5.50047 0.136207 5.5324 0.113852 5.56483Z" fill="white" />
                    </svg>
                  </div>
                  <div className={styles.dots}>
                    {caseList.map((_, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: idx === activeIdx ? '#D90A20' : '#666',
                          display: 'inline-block',
                          margin: '0 4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setActiveIdx(idx)}
                      />
                    ))}
                  </div>
                  <div className={styles.rightButton} onClick={nextCase} style={{ cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                      <path d="M14.272 5.48209C14.3215 5.53372 14.3599 5.59201 14.3894 5.65334C14.4053 5.68642 14.418 5.72074 14.428 5.75554C14.4335 5.77454 14.4402 5.79353 14.4439 5.81285C14.484 6.02032 14.4236 6.24327 14.263 6.40395L8.98455 11.6824C8.72737 11.9396 8.31027 11.9401 8.05302 11.6831C7.79607 11.4258 7.79587 11.008 8.05302 10.7509L12.4358 6.36804L0.65878 6.36873C0.295167 6.36873 0.000307519 6.07351 1.08056e-05 5.70996C1.06422e-05 5.34617 0.294985 5.05119 0.65878 5.05119L11.9787 5.0505L8.05233 1.12413C7.79558 0.866846 7.79594 0.449676 8.05302 0.192598C8.31011 -0.0643469 8.72662 -0.0641074 8.98386 0.192598L14.2637 5.47242C14.2666 5.47532 14.2692 5.47911 14.272 5.48209Z" fill="black" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={classNames(styles.section, styles.intro)}>
          <div className={styles.sectionContent}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 31 33" fill="none">
                  <path d="M21.667 33H5.66699V30H18.667V28H21.667V33ZM16.667 2H21.667V3H22.667V15H23.667V11H25.667V9H28.667V12H30.667V20H27.667V12H26.667V17H25.667V18H20.667V16H19.667V5H17.667V15H14.667V3H12.667V15.75H9.66699V6H7.66699V16H4.66699V12H3V24H5.66699V30H2.66699V24H0V12H1.66699V9H4.66699V3H9.66699V1.75H10.667V0H16.667V2ZM24.667 28H21.667V25H24.667V28ZM27.667 25H24.667V20H27.667V25Z" fill="white"/>
                </svg>
              </div>
              <div className={styles.featureTitle}>
                Unmute Your Voice
              </div>
              <div className={styles.featureText}>
                Turn silence into pressure. Turn losses into signal.
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 28" fill="none">
                  <path d="M24 28.0078H0V10.0078H24V28.0078ZM3 25.0078H21V13.0078H3V25.0078ZM15 22.0078H10V17.0078H15V22.0078ZM17 2.98438H20V9.98438H17V3H7V9.98438H4V2.98438H7V0H17V2.98438Z" fill="white"/>
                </svg>
              </div>
              <div className={styles.featureTitle}>
                Stand With Fury
              </div>
              <div className={styles.featureText}>
                Every witness strengthens the chain we build together.
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 37 27" fill="none">
                  <rect x="6.5" y="7" width="24" height="18" stroke="white" strokeWidth="3"/>
                  <rect x="12" y="12.5" width="3" height="3" fill="white"/>
                  <rect x="22" y="12.5" width="3" height="3" fill="white"/>
                  <rect x="34" y="10.5" width="3" height="11" fill="white"/>
                  <rect y="10.5" width="3" height="11" fill="white"/>
                  <rect x="17.5" width="3" height="8" fill="white"/>
                  <rect x="14" y="18.5" width="9" height="3" fill="white"/>
                </svg>
              </div>
              <div className={styles.featureTitle}>
                Reclaim What’s Yours
              </div>
              <div className={styles.featureText}>
                End their control and reclaim what belongs to the people.
              </div>
            </div>
          </div>
        </div>
        <div className={classNames(styles.section, styles.community)}>
          <div className={styles.sectionTitle}>
            _> JOIN OUR COMMUNITY
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.socialAccount}>
              <div className={styles.socialAccountInfo}>
                <div className={styles.socialAccountIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="18" viewBox="0 0 36 18" fill="none">
                    <path d="M19.2253 8.09238L24.6845 1.74658H23.3908L18.6507 7.25671L14.8647 1.74658H10.4978L16.2228 10.0788L10.4978 16.7336H11.7915L16.7971 10.9144L20.7957 16.7336H25.1626L19.2247 8.09238H19.2253ZM17.4533 10.1522L16.8733 9.32252L12.2576 2.72044H14.2449L17.9697 8.04832L18.5497 8.878L23.3914 15.8038H21.4042L17.4533 10.1522Z" fill="white" />
                  </svg>
                </div>
                <div className={styles.socialAccountTitle}>
                  Follow us on Twitter
                </div>
                <div className={styles.socialAccountText}>
                  Get the latest updates on cases, announcements, and compensation progress
                </div>
              </div>
              <button className={styles.socialAccountAction}>
                <div className={classNames(styles.leftArrow)}>{">"}</div>
                <div className={classNames(styles.text)}>go</div>
                <div className={classNames(styles.rightArrow)}>{"<"}</div>
              </button>
            </div>
            <div className={styles.socialAccount}>
              <div className={styles.socialAccountInfo}>
                <div className={styles.socialAccountIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="18" viewBox="0 0 36 18" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.3718 4.5598C17.8493 5.23406 14.8063 6.62962 10.2429 8.74646C9.50186 9.06021 9.11368 9.36715 9.07834 9.66727C9.01862 10.1745 9.61519 10.3742 10.4276 10.6462C10.5381 10.6832 10.6526 10.7215 10.7699 10.7621C11.5692 11.0388 12.6443 11.3624 13.2033 11.3752C13.7103 11.3869 14.2761 11.1644 14.9009 10.7076C19.1646 7.64324 21.3655 6.09436 21.5037 6.06097C21.6012 6.03741 21.7363 6.00779 21.8278 6.09441C21.9193 6.18103 21.9103 6.34507 21.9006 6.38907C21.8415 6.65732 19.4998 8.97531 18.2879 10.1749C17.9101 10.5488 17.6421 10.8141 17.5874 10.8747C17.4646 11.0104 17.3396 11.1388 17.2194 11.2621C16.4768 12.0243 15.92 12.5958 17.2502 13.5291C17.8894 13.9776 18.4009 14.3484 18.9112 14.7185C19.4685 15.1225 20.0244 15.5256 20.7436 16.0275C20.9268 16.1554 21.1018 16.2882 21.2723 16.4176C21.9208 16.9099 22.5035 17.3522 23.2234 17.2816C23.6417 17.2406 24.0737 16.8219 24.2932 15.5729C24.8117 12.6212 25.8311 6.22581 26.0667 3.59042C26.0873 3.35952 26.0613 3.06402 26.0405 2.93431C26.0196 2.80459 25.9761 2.61977 25.8177 2.48295C25.6301 2.32092 25.3406 2.28675 25.2111 2.28918C24.6223 2.30022 23.719 2.63464 19.3718 4.5598Z" fill="white" />
                  </svg>
                </div>
                <div className={styles.socialAccountTitle}>
                  Join Telegram Channel
                </div>
                <div className={styles.socialAccountText}>
                  Connect with other users, get instant support, and participate in community discussions
                </div>
              </div>
              <button className={styles.socialAccountAction}>
                <div className={classNames(styles.leftArrow)}>{">"}</div>
                <div className={classNames(styles.text)}>go</div>
                <div className={classNames(styles.rightArrow)}>{"<"}</div>
              </button>
            </div>
          </div>
        </div>
        <div className={classNames(styles.section, styles.questions)}>
          <div className={styles.sectionTitle}>
            _> DECODE THE FURY
          </div>
          <div className={styles.sectionContent}>
            {[
              { 
                q: "What is Fury?", 
                a: "Fury is a decentralized rights-protection network built by volunteers and users.\n\nIt uses AI evidence verification, community voting, and on-chain transparency to help crypto users surface losses, submit proof, drive collective action, and earn tokens for contributing." 
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
      <div className={styles.footer}>
        <div className={styles.content}>
          <Link className={classNames(styles.branding)} to="/">
            <div className={classNames(styles.logo)}>
              <img src={furyLogo} alt="Fury" style={{ height: '32px' }} />
            </div>
          </Link>

          <div className={classNames(styles.social)}>
            <div className={classNames(styles.socialTitle)}>
              Connect With Us
            </div>
            <div className={classNames(styles.socialLinks)}>
              <div className={classNames(styles.socialLink)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="18" viewBox="0 0 36 18" fill="none">
                  <path d="M19.2253 8.09238L24.6845 1.74658H23.3908L18.6507 7.25671L14.8647 1.74658H10.4978L16.2228 10.0788L10.4978 16.7336H11.7915L16.7971 10.9144L20.7957 16.7336H25.1626L19.2247 8.09238H19.2253ZM17.4533 10.1522L16.8733 9.32252L12.2576 2.72044H14.2449L17.9697 8.04832L18.5497 8.878L23.3914 15.8038H21.4042L17.4533 10.1522Z" fill="white" />
                </svg>
              </div>
              <div className={classNames(styles.socialLink)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="18" viewBox="0 0 36 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M19.3718 4.5598C17.8493 5.23406 14.8063 6.62962 10.2429 8.74646C9.50186 9.06021 9.11368 9.36715 9.07834 9.66727C9.01862 10.1745 9.61519 10.3742 10.4276 10.6462C10.5381 10.6832 10.6526 10.7215 10.7699 10.7621C11.5692 11.0388 12.6443 11.3624 13.2033 11.3752C13.7103 11.3869 14.2761 11.1644 14.9009 10.7076C19.1646 7.64324 21.3655 6.09436 21.5037 6.06097C21.6012 6.03741 21.7363 6.00779 21.8278 6.09441C21.9193 6.18103 21.9103 6.34507 21.9006 6.38907C21.8415 6.65732 19.4998 8.97531 18.2879 10.1749C17.9101 10.5488 17.6421 10.8141 17.5874 10.8747C17.4646 11.0104 17.3396 11.1388 17.2194 11.2621C16.4768 12.0243 15.92 12.5958 17.2502 13.5291C17.8894 13.9776 18.4009 14.3484 18.9112 14.7185C19.4685 15.1225 20.0244 15.5256 20.7436 16.0275C20.9268 16.1554 21.1018 16.2882 21.2723 16.4176C21.9208 16.9099 22.5035 17.3522 23.2234 17.2816C23.6417 17.2406 24.0737 16.8219 24.2932 15.5729C24.8117 12.6212 25.8311 6.22581 26.0667 3.59042C26.0873 3.35952 26.0613 3.06402 26.0405 2.93431C26.0196 2.80459 25.9761 2.61977 25.8177 2.48295C25.6301 2.32092 25.3406 2.28675 25.2111 2.28918C24.6223 2.30022 23.719 2.63464 19.3718 4.5598Z" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>© 2025 Fury. All rights reserved.</div>
          <div className={styles.bottomRight}>
            <a className={styles.privacyButton} href="/privacy">Privacy Policy</a> | <a className={styles.tosButton} href="/terms">Terms of Use</a>
          </div>
        </div>
      </div>
      <div className={styles.bottomButtons}>
        <Link className={styles.button} to="/submit-loss">
          <div className={classNames(styles.leftArrow)}>{">"}</div>
          <div className={classNames(styles.text)}>SUBMIT YOUR LOSS</div>
          <div className={classNames(styles.rightArrow)}>{"<"}</div>
        </Link>
      </div>
    </div>
  )
}

export default withRouter(
  connect(
    state => ({
      cases: state.auth.cases
    }),
    dispatch => ({
      actions: bindActionCreators({
        ...actions
      }, dispatch)
    })
  )(Landing)
)
