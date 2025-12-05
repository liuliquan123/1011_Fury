import React, { useEffect, useState, useCallback } from 'react'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as authActions from 'actions/auth'
import * as crowdfundActions from 'actions/crowdfund'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import { isExchangeVisible, getTokenName } from 'config/exchanges'
import { calculateEstimate, formatTokenAmount, CROWDFUND_PHASES, TOTAL_TOKEN_SUPPLY } from 'config/crowdfund'
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

const Crowdfund = ({ profile, crowdfund, exchangePhase, authActions, crowdfundActions, history }) => {
  const [amount, setAmount] = useState('')
  const [contributing, setContributing] = useState(false)
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })
  
  const data = crowdfund.byExchange[EXCHANGE] || {}
  const phase = exchangePhase[EXCHANGE]?.current_phase || 1
  const hasWallet = !!profile?.wallet_address
  const phaseConfig = CROWDFUND_PHASES[phase] || CROWDFUND_PHASES[1]
  
  // 计算预估（前端计算）
  const userInput = parseFloat(amount) || 0
  const currentRaised = parseFloat(data.raisedEth) || 0
  const { estimatedToken, estimatedRefund } = calculateEstimate(userInput, currentRaised, phase)
  
  // 计算进度百分比
  const softcapEth = phaseConfig.softcapEth
  const progress = softcapEth > 0 ? Math.min(100, (currentRaised / softcapEth) * 100) : 0

  // 加载数据
  useEffect(() => {
    if (!isExchangeVisible(EXCHANGE.toLowerCase())) return
    crowdfundActions.fetchCrowdfund({ exchange: EXCHANGE })
    authActions.getExchangePhase({ exchange: EXCHANGE })
  }, [])

  // 更新倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTimeRemaining(data.deadline))
    }, 1000)
    return () => clearInterval(timer)
  }, [data.deadline])

  // Contribute 处理
  const handleContribute = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) {
      toast('Please enter a valid amount')
      return
    }
    if (!hasWallet) {
      toast('Please connect your wallet first')
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

  if (!isExchangeVisible(EXCHANGE.toLowerCase())) return null

  const isEnded = data.ended
  const isLive = !isEnded && !data.isPaused

  return (
    <div className={styles.crowdfund}>
      <div className={styles.title}>Crowdfund</div>
      
      <div className={styles.card}>
        {/* 卡片标题 */}
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            {EXCHANGE} Crowdfund
          </div>
          <div className={classNames(styles.statusBadge, {
            [styles.live]: isLive,
            [styles.ended]: isEnded,
            [styles.paused]: data.isPaused
          })}>
            {isLive ? 'LIVE' : isEnded ? 'ENDED' : 'PAUSED'}
          </div>
        </div>

        {/* Token 信息 */}
        <div className={styles.tokenInfo}>
          <span className={styles.tokenName}>{getTokenName(EXCHANGE.toLowerCase())}</span>
          <span className={styles.phaseInfo}>Phase {phase}</span>
        </div>

        {/* 进度条 */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressText}>
            {data.loading ? '...' : `${progress.toFixed(1)}%`}
          </div>
        </div>

        {/* 统计网格 */}
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Softcap</div>
            <div className={styles.statValue}>
              {softcapEth} ETH
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Raised</div>
            <div className={styles.statValue}>
              {data.loading ? '—' : `${parseFloat(data.raisedEth || 0).toFixed(4)} ETH`}
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Contributors</div>
            <div className={styles.statValue}>
              {data.loading ? '—' : data.contributors || 0}
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Time Remaining</div>
            <div className={styles.statValue}>
              {data.loading ? '—' : `${time.d}d ${time.h}h ${time.m}m`}
            </div>
          </div>
        </div>

        {/* 输入区域 - 仅在进行中时显示 */}
        {isLive && (
          <>
            <div className={styles.inputSection}>
              <div className={styles.inputLabelRow}>
                <span>Amount to Contribute</span>
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
                <span className={styles.inputSuffix}>ETH</span>
              </div>
            </div>

            {/* 预估显示 */}
            {userInput > 0 && (
              <div className={styles.estimateSection}>
                <div className={styles.estimateRow}>
                  <span>Estimated Token:</span>
                  <span className={styles.estimateValue}>
                    ~{formatTokenAmount(estimatedToken)} {getTokenName(EXCHANGE.toLowerCase())}
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

            {/* Contribute 按钮 */}
            <button
              className={classNames(styles.primaryButton, {
                [styles.disabled]: contributing || !hasWallet || !amount
              })}
              onClick={handleContribute}
              disabled={contributing || !hasWallet || !amount}
            >
              {contributing ? 'Contributing...' : 
               !hasWallet ? 'Connect Wallet to Contribute' :
               `Contribute to ${EXCHANGE}`}
            </button>
          </>
        )}

        {/* 结束后的 Claim 按钮 */}
        {isEnded && (
          <div className={styles.claimSection}>
            <div className={styles.claimTitle}>Crowdfund Ended</div>
            {/* TODO: 根据后端返回的 claimable 状态显示按钮 */}
            <button className={styles.claimButton} disabled>
              Claim Available Soon
            </button>
          </div>
        )}

        {/* 我的贡献 */}
        <div className={styles.myContribution}>
          <div className={styles.myContributionTitle}>My Contribution</div>
          <div className={styles.myContributionValue}>
            {data.loading ? '—' : `${parseFloat(data.myContribution || 0).toFixed(4)} ETH`}
          </div>
        </div>

        {/* 错误提示 */}
        {data.error && (
          <div className={styles.errorText}>{data.error}</div>
        )}
      </div>
    </div>
  )
}

export default connect(
  state => ({
    profile: state.auth.profile,
    crowdfund: state.crowdfund,
    exchangePhase: state.auth.exchangePhase,
  }),
  dispatch => ({
    authActions: bindActionCreators(authActions, dispatch),
    crowdfundActions: bindActionCreators(crowdfundActions, dispatch),
  })
)(withRouter(Crowdfund))

