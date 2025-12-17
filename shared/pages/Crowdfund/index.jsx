import React, { useEffect, useState, useCallback } from 'react'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as authActions from 'actions/auth'
import * as crowdfundActions from 'actions/crowdfund'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import { isExchangeVisible, getTokenName } from 'config/exchanges'
import { calculateEstimate, formatTokenAmount, CROWDFUND_PHASES } from 'config/crowdfund'
import LoginModal from 'components/Login'
import tokenLogo from 'resources/images/token-logo_v2.svg'
import styles from './style.css'

const EXCHANGE = 'Binance'

// 格式化剩余时间
const formatTimeRemaining = (deadline) => {
  if (!deadline) return { d: 0, h: 0, m: 0, s: 0 }
  
  const now = Math.floor(Date.now() / 1000)
  const remaining = Math.max(0, deadline - now)
  
  const d = Math.floor(remaining / 86400)
  const h = Math.floor((remaining % 86400) / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  
  return { d, h, m, s }
}

// 补零
const padZero = (num) => String(num).padStart(2, '0')

const Crowdfund = ({ profile, crowdfund, exchangePhase, authActions, crowdfundActions, navigate }) => {
  const [amount, setAmount] = useState('')
  const [contributing, setContributing] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [claimingRefund, setClaimingRefund] = useState(false)
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  
  const data = crowdfund.byExchange[EXCHANGE] || {}
  const phase = exchangePhase[EXCHANGE]?.current_phase || 1
  const isLoggedIn = !!profile?.id
  const hasWallet = !!profile?.wallet_address
  const phaseConfig = CROWDFUND_PHASES[phase] || CROWDFUND_PHASES[1]
  
  // 计算预估（前端计算）
  const userInput = parseFloat(amount) || 0
  const currentRaised = parseFloat(data.raisedEth) || 0
  const { estimatedToken, estimatedRefund } = calculateEstimate(userInput, currentRaised, phase)
  
  // 计算进度百分比
  const softcapEth = phaseConfig.softcapEth
  const progress = softcapEth > 0 ? Math.min(100, (currentRaised / softcapEth) * 100) : 0

  // ETH 余额
  const ethBalance = data.ethBalance || null

  // 加载交易所 phase（只需执行一次）
  useEffect(() => {
    if (!isExchangeVisible(EXCHANGE.toLowerCase())) return
    authActions.getExchangePhase({ exchange: EXCHANGE })
  }, [])

  // 加载 crowdfund 数据（当 wallet_address 变化时重新获取）
  useEffect(() => {
    if (!isExchangeVisible(EXCHANGE.toLowerCase())) return
    crowdfundActions.fetchCrowdfund({ exchange: EXCHANGE })
  }, [profile?.wallet_address])

  // 更新倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTimeRemaining(data.deadline))
    }, 1000)
    return () => clearInterval(timer)
  }, [data.deadline])

  // 登录弹窗处理
  const openLoginModal = useCallback(() => {
    setIsLoginOpen(true)
  }, [])

  const closeLoginModal = useCallback(() => {
    setIsLoginOpen(false)
  }, [])

  const onModalClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onLoggedIn = useCallback(() => {
    setIsLoginOpen(false)
    authActions.getProfile()
  }, [])

  // Connect Wallet 处理
  const handleConnectWallet = useCallback(() => {
    // 未登录先弹出登录框
    if (!isLoggedIn) {
      openLoginModal()
      return
    }
    
    setConnecting(true)
    authActions.linkWallet({
      onSuccess: () => {
        setConnecting(false)
        toast('Wallet connected!')
      },
      onError: (msg) => {
        setConnecting(false)
        toast(msg || 'Failed to connect wallet')
      }
    })
  }, [isLoggedIn])

  // Contribute 处理
  const handleContribute = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) {
      toast('Please enter a valid amount')
      return
    }
    if (!hasWallet) {
      handleConnectWallet()
      return
    }
    
    setContributing(true)
    crowdfundActions.contribute({
      exchange: EXCHANGE,
      amount,
      onSuccess: ({ txHash }) => {
        setContributing(false)
        setAmount('')
        toast('Contribution successful!')
      },
      onError: (msg) => {
        setContributing(false)
        toast(msg || 'Contribution failed')
      }
    })
  }, [amount, hasWallet])

  // Claim Refund 处理
  const handleClaimRefund = useCallback(() => {
    if (!isLoggedIn) {
      openLoginModal()
      return
    }
    if (!hasWallet) {
      handleConnectWallet()
      return
    }
    
    setClaimingRefund(true)
    crowdfundActions.claimRefund({
      exchange: EXCHANGE,
      onSuccess: ({ txHash }) => {
        setClaimingRefund(false)
        toast('Refund claimed successfully!')
      },
      onError: (msg) => {
        setClaimingRefund(false)
        toast(msg || 'Failed to claim refund')
      }
    })
  }, [isLoggedIn, hasWallet])

  if (!isExchangeVisible(EXCHANGE.toLowerCase())) return null

  const isEnded = data.ended
  const isLive = !isEnded && !data.isPaused
  const tokenName = getTokenName(EXCHANGE.toLowerCase()).replace('$', '')

  return (
    <div className={styles.crowdfund}>
      {/* 登录弹窗 */}
      {isLoginOpen && !isLoggedIn && (
        <div className={styles.modal} onClick={closeLoginModal}>
          <LoginModal
            onClick={onModalClick}
            onLoggedIn={onLoggedIn}
            onClose={closeLoginModal}
          />
        </div>
      )}

      {/* 标题区域 */}
      <div className={styles.title}>Crowdfund</div>
      <div className={styles.description}>
        Discover and participate in a diverse range of on-chain asset opportunities powered by Fury.
      </div>

      {/* 主卡片 */}
      <div className={styles.card}>
        {/* 卡片头部 */}
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <img src={tokenLogo} alt="1011" className={styles.titleLogo} />
            Fury Crowdfund
          </div>
          <div className={classNames(styles.statusBadge, {
            [styles.live]: isLive,
            [styles.ended]: isEnded,
            [styles.paused]: data.isPaused
          })}>
            {isLive ? 'Live' : isEnded ? 'Ended' : 'Paused'}
          </div>
        </div>

        {/* 进度区域：大百分比 + 倒计时 */}
        <div className={styles.progressHeader}>
          <div className={styles.progressPercent}>
            {data.loading ? '...' : `${progress.toFixed(2)}%`}
          </div>
          <div className={styles.countdown}>
            <span className={styles.countdownLabel}>Time Remaining</span>
            <span className={styles.countdownBlock}>{padZero(time.d)}</span>
            <span className={styles.countdownUnit}>D</span>
            <span className={styles.countdownBlock}>{padZero(time.h)}</span>
            <span className={styles.countdownUnit}>H</span>
            <span className={styles.countdownBlock}>{padZero(time.m)}</span>
            <span className={styles.countdownUnit}>M</span>
            <span className={styles.countdownBlock}>{padZero(time.s)}</span>
            <span className={styles.countdownUnit}>S</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 统计网格 - 3 列 */}
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{softcapEth} ETH</div>
            <div className={styles.statLabel}>Target</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {data.loading ? '—' : parseFloat(data.raisedEth || 0).toFixed(2)}
            </div>
            <div className={styles.statLabel}>Raised</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {data.loading ? '—' : data.contributors || 0}
            </div>
            <div className={styles.statLabel}>Contributors</div>
          </div>
        </div>

        <div className={styles.divider} />

        {/* 输入区域 - 仅在进行中时显示 */}
        {isLive && (
          <React.Fragment>
            <div className={styles.inputSection}>
              <div className={styles.inputLabelRow}>
                <span>Amount to Contribute</span>
                <span>
                  Balance: <span className={styles.balanceValue}>{ethBalance || '--'} ETH</span>
                </span>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  className={styles.inputField}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={contributing}
                />
                <span className={styles.ethBadge}>ETH</span>
              </div>
            </div>

            {/* 预估显示 */}
            {userInput > 0 && (
              <div className={styles.estimateSection}>
                <div className={styles.estimateRow}>
                  <span>Estimated Token:</span>
                  <span className={styles.estimateValue}>
                    ~{formatTokenAmount(estimatedToken)} {tokenName}
                  </span>
                </div>
                {estimatedRefund > 0 && (
                  <div className={styles.estimateRow}>
                    <span>Estimated Refund (if oversubscribed):</span>
                    <span className={styles.estimateRefund}>
                      ~{estimatedRefund.toFixed(4)} ETH
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 按钮：LOGIN -> CONNECT WALLET -> CONTRIBUTE */}
            {!isLoggedIn ? (
              <button
                className={styles.primaryButton}
                onClick={openLoginModal}
              >
                LOGIN
              </button>
            ) : !hasWallet ? (
              <button
                className={classNames(styles.primaryButton, {
                  [styles.disabled]: connecting
                })}
                onClick={handleConnectWallet}
                disabled={connecting}
              >
                {connecting ? 'CONNECTING...' : 'CONNECT WALLET'}
              </button>
            ) : (
              <button
                className={classNames(styles.primaryButton, {
                  [styles.disabled]: contributing || !amount
                })}
                onClick={handleContribute}
                disabled={contributing || !amount}
              >
                {contributing ? 'CONTRIBUTING...' : `CONTRIBUTE TO ${tokenName}`}
              </button>
            )}
          </React.Fragment>
        )}

        {/* 结束后的 Claim 按钮 */}
        {isEnded && (
          <div className={styles.claimSection}>
            <div className={styles.claimTitle}>Crowdfund Ended</div>
            <div className={styles.claimInfo}>
              <span>Your Contribution: </span>
              <span className={styles.claimValue}>
                {data.loading ? '—' : `${parseFloat(data.myContribution || 0).toFixed(4)} ETH`}
              </span>
            </div>
            
            {/* 退款按钮 - 只有有贡献的用户才能看到 */}
            {parseFloat(data.myContribution || 0) > 0 && (
              <button
                className={classNames(styles.claimButton, {
                  [styles.disabled]: claimingRefund || !hasWallet
                })}
                onClick={handleClaimRefund}
                disabled={claimingRefund || !hasWallet}
              >
                {!isLoggedIn ? 'LOGIN TO CLAIM' : 
                 !hasWallet ? 'CONNECT WALLET TO CLAIM' :
                 claimingRefund ? 'CLAIMING...' : 'CLAIM REFUND'}
              </button>
            )}
            
            {/* Claim Token 按钮 - 暂时禁用，等后端实现 */}
            <button className={styles.claimTokenButton} disabled>
              CLAIM TOKEN (COMING SOON)
            </button>
          </div>
        )}

        {/* 错误提示 */}
        {data.error && (
          <div className={styles.errorText}>{data.error}</div>
        )}
      </div>

      {/* 我的贡献卡片 */}
      <div className={styles.myContributionsCard}>
        <div className={styles.myContributionsTitle}>My Total Contributions</div>
        
        <div className={styles.contributionItem}>
          <div className={styles.contributionValue}>
            {(data.loading || data.myContribution === undefined) ? '—' : `${parseFloat(data.myContribution || 0).toFixed(2)} ETH`}
          </div>
          {/* 单交易所模式：隐藏 exchange 标签
          <div className={styles.contributionLabel}>Binance</div>
          */}
        </div>

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>
            {(data.loading || data.myContribution === undefined) ? '—' : `${parseFloat(data.myContribution || 0).toFixed(2)} ETH`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default withRouter(
  connect(
    state => ({
      profile: state.auth.profile,
      crowdfund: state.crowdfund,
      exchangePhase: state.auth.exchangePhase,
    }),
    dispatch => ({
      authActions: bindActionCreators(authActions, dispatch),
      crowdfundActions: bindActionCreators(crowdfundActions, dispatch),
    })
  )(Crowdfund)
)
