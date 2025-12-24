import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames'
import * as actions from 'actions/lpStaking'
import { getLpStakingConfig, getUniswapV2Config, isFeatureAvailable, get1011TokenAddress } from 'config/contracts'
import styles from './style.css'

// 格式化数字，保留指定小数位
const formatNumber = (num, decimals = 4) => {
  const n = parseFloat(num)
  if (isNaN(n)) return '0'
  if (n === 0) return '0'
  if (n < 0.0001) return '<0.0001'
  return n.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals 
  })
}

// 格式化大数字（带 K/M/B 单位）
const formatLargeNumber = (num) => {
  const n = parseFloat(num)
  if (isNaN(n)) return '0'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return n.toFixed(2)
}

// 格式化时间戳为日期
const formatDate = (timestamp) => {
  if (!timestamp) return '--'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// 轮次名称
const ROUND_NAMES = ['Round 1 (7 days)', 'Round 2 (30 days)', 'Round 3 (90 days)']
const ROUND_SHORT_NAMES = ['Round 1', 'Round 2', 'Round 3']

const LpStaking = () => {
  const dispatch = useDispatch()
  const { 
    contractInfo, 
    userStaking, 
    roundsInfo, 
    userRoundsState, 
    activityLog, 
    pairReserves, 
    pairedTokenBalance 
  } = useSelector(state => state.lpStaking)
  const { profile } = useSelector(state => state.auth)
  
  // 判断登录状态
  const isLoggedIn = !!profile?.id
  const hasWallet = !!profile?.wallet_address
  
  // 表单状态
  const [stakeAmount, setStakeAmount] = useState('')
  const [ethAmount, setEthAmount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [txLoading, setTxLoading] = useState(false)
  const [liquidityLoading, setLiquidityLoading] = useState(false)
  const [claimLoading, setClaimLoading] = useState({})
  const [lastEditedField, setLastEditedField] = useState(null)
  const [expandedRounds, setExpandedRounds] = useState({}) // 轮次折叠状态
  
  // 切换轮次折叠状态
  const toggleRound = useCallback((roundId) => {
    setExpandedRounds(prev => ({
      ...prev,
      [roundId]: !prev[roundId]
    }))
  }, [])
  
  const config = getLpStakingConfig()
  const uniswapConfig = getUniswapV2Config()
  
  // 初始化加载数据
  useEffect(() => {
    dispatch(actions.fetchContractInfo())
    dispatch(actions.fetchRoundsInfo())
    dispatch(actions.fetchPairReserves())
  }, [dispatch])
  
  // 登录后加载用户数据
  useEffect(() => {
    if (isLoggedIn && profile?.wallet_address) {
      dispatch(actions.fetchUserStaking())
      dispatch(actions.fetchUserRoundsState())
      dispatch(actions.fetchActivityLog())
      dispatch(actions.fetchPairedTokenBalance())
    }
  }, [dispatch, isLoggedIn, profile?.wallet_address])
  
  // 当前轮次
  const currentRoundId = contractInfo.currentRound || 0
  
  // 计算用户总积分（三轮累计）
  const totalUserPoints = useMemo(() => {
    if (!userRoundsState.rounds) return '0'
    return userRoundsState.rounds.reduce((sum, round) => {
      return sum + parseFloat(round.pendingPoints || round.points || 0)
    }, 0).toString()
  }, [userRoundsState.rounds])
  
  // 检查轮次是否结束
  const isRoundEnded = (roundId) => {
    const round = roundsInfo.rounds?.[roundId]
    if (!round) return false
    const now = Math.floor(Date.now() / 1000)
    return now >= round.endTime
  }
  
  // 检查轮次是否资金充足
  const isRoundFunded = (roundId) => {
    const round = roundsInfo.rounds?.[roundId]
    if (!round) return false
    return parseFloat(round.fundedAmount) >= parseFloat(round.rewardAmount)
  }
  
  // 检查用户是否可以领取
  const canClaim = (roundId) => {
    const userRound = userRoundsState.rounds?.[roundId]
    if (!userRound) return false
    return isRoundEnded(roundId) && 
           isRoundFunded(roundId) && 
           !userRound.claimed && 
           parseFloat(userRound.pendingReward) > 0
  }
  
  // 处理领取奖励
  const handleClaim = useCallback((roundId) => {
    setClaimLoading(prev => ({ ...prev, [roundId]: true }))
    dispatch(actions.claimReward({
      roundId,
      onSuccess: () => {
        setClaimLoading(prev => ({ ...prev, [roundId]: false }))
      },
      onError: () => {
        setClaimLoading(prev => ({ ...prev, [roundId]: false }))
      },
    }))
  }, [dispatch])
  
  // 检查是否需要授权
  const needsApproval = parseFloat(userStaking.allowance) < parseFloat(stakeAmount || '0')
  
  // 处理授权（approve 成功后自动执行 stake）
  const handleApprove = useCallback(() => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return
    
    setTxLoading(true)
    dispatch(actions.approveLp({
      onSuccess: () => {
        // Approve 成功后等待 1.5 秒让 RPC 同步状态，再执行 stake
        setTimeout(() => {
          dispatch(actions.depositLp({
            amount: stakeAmount,
            onSuccess: () => {
              setTxLoading(false)
              setStakeAmount('')
              dispatch(actions.fetchActivityLog())
            },
            onError: () => setTxLoading(false),
          }))
        }, 1500)
      },
      onError: () => setTxLoading(false),
    }))
  }, [dispatch, stakeAmount])
  
  // 处理质押
  const handleStake = useCallback(() => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return
    
    setTxLoading(true)
    dispatch(actions.depositLp({
      amount: stakeAmount,
      onSuccess: () => {
        setTxLoading(false)
        setStakeAmount('')
        dispatch(actions.fetchActivityLog())
      },
      onError: () => setTxLoading(false),
    }))
  }, [dispatch, stakeAmount])
  
  // 处理全部取消质押
  const handleUnstakeAll = useCallback(() => {
    if (parseFloat(userStaking.balance) <= 0) return
    
    setTxLoading(true)
    dispatch(actions.withdrawAllLp({
      onSuccess: () => {
        setTxLoading(false)
        dispatch(actions.fetchActivityLog())
      },
      onError: () => setTxLoading(false),
    }))
  }, [dispatch, userStaking.balance])
  
  // 设置最大值
  const setMaxStake = () => setStakeAmount(userStaking.lpBalance)
  
  // Uniswap 外链
  const uniswapBuyLink = `https://app.uniswap.org/swap?chain=base&outputCurrency=${get1011TokenAddress()}`
  const uniswapPoolLink = uniswapConfig?.pair 
    ? `https://app.uniswap.org/explore/pools/base/${uniswapConfig.pair}` 
    : uniswapBuyLink
  
  // 价格计算：根据储备量计算另一个 token 的数量
  const calculateTokenFromETH = useCallback((ethValue) => {
    const eth = parseFloat(ethValue) || 0
    const reserveETH = parseFloat(pairReserves.reserveETH) || 0
    const reserveToken = parseFloat(pairReserves.reservePairedToken) || 0
    
    if (reserveETH === 0 || eth === 0) return ''
    
    const token = (eth * reserveToken / reserveETH).toFixed(6)
    return token
  }, [pairReserves.reserveETH, pairReserves.reservePairedToken])
  
  const calculateETHFromToken = useCallback((tokenValue) => {
    const token = parseFloat(tokenValue) || 0
    const reserveETH = parseFloat(pairReserves.reserveETH) || 0
    const reserveToken = parseFloat(pairReserves.reservePairedToken) || 0
    
    if (reserveToken === 0 || token === 0) return ''
    
    const eth = (token * reserveETH / reserveToken).toFixed(8)
    return eth
  }, [pairReserves.reserveETH, pairReserves.reservePairedToken])
  
  // 处理 ETH 输入变化（过滤负数）
  const handleEthAmountChange = (value) => {
    if (value && parseFloat(value) < 0) return
    setEthAmount(value)
    setLastEditedField('eth')
    const calculatedToken = calculateTokenFromETH(value)
    setTokenAmount(calculatedToken)
  }
  
  // 处理 Token 输入变化（过滤负数）
  const handleTokenAmountChange = (value) => {
    if (value && parseFloat(value) < 0) return
    setTokenAmount(value)
    setLastEditedField('token')
    const calculatedEth = calculateETHFromToken(value)
    setEthAmount(calculatedEth)
  }
  
  // 处理 Stake 输入变化（过滤负数）
  const handleStakeAmountChange = (value) => {
    if (value && parseFloat(value) < 0) return
    setStakeAmount(value)
  }
  
  // 禁用滚轮事件
  const disableWheel = (e) => e.target.blur()
  
  // 检查是否需要授权配对代币
  const needsTokenApproval = parseFloat(pairedTokenBalance.allowance) < parseFloat(tokenAmount || '0')
  
  // 处理授权配对代币（approve 成功后自动执行 addLiquidity）
  const handleApprovePairedToken = useCallback(() => {
    if (!ethAmount || !tokenAmount || parseFloat(ethAmount) <= 0 || parseFloat(tokenAmount) <= 0) return
    
    setLiquidityLoading(true)
    dispatch(actions.approvePairedToken({
      onSuccess: () => {
        // Approve 成功后等待 1.5 秒让 RPC 同步状态，再执行 addLiquidity
        setTimeout(() => {
          dispatch(actions.addLiquidity({
            ethAmount,
            tokenAmount,
            onSuccess: () => {
              setLiquidityLoading(false)
              setEthAmount('')
              setTokenAmount('')
            },
            onError: () => setLiquidityLoading(false),
          }))
        }, 1500)
      },
      onError: () => setLiquidityLoading(false),
    }))
  }, [dispatch, ethAmount, tokenAmount])
  
  // 处理添加流动性
  const handleAddLiquidity = useCallback(() => {
    if (!ethAmount || !tokenAmount || parseFloat(ethAmount) <= 0 || parseFloat(tokenAmount) <= 0) return
    
    setLiquidityLoading(true)
    dispatch(actions.addLiquidity({
      ethAmount,
      tokenAmount,
      onSuccess: () => {
        setLiquidityLoading(false)
        setEthAmount('')
        setTokenAmount('')
      },
      onError: () => setLiquidityLoading(false),
    }))
  }, [dispatch, ethAmount, tokenAmount])
  
  // 当前价格
  const currentPrice = useMemo(() => {
    const reserveETH = parseFloat(pairReserves.reserveETH) || 0
    const reserveToken = parseFloat(pairReserves.reservePairedToken) || 0
    if (reserveETH === 0) return null
    return reserveToken / reserveETH
  }, [pairReserves.reserveETH, pairReserves.reservePairedToken])
  
  // 检查功能是否可用
  const lpStakingAvailable = isFeatureAvailable('lpStaking')
  
  // 合约未部署时显示即将上线提示
  if (!lpStakingAvailable) {
    return (
      <div className={styles.lpStaking}>
        <div className={styles.title}>
          <div className={styles.titleText}>LP Staking</div>
          <div className={styles.titleDesc}>Stake LP tokens to earn 1011 token rewards</div>
        </div>
        <div className={styles.comingSoon}>
          <div className={styles.comingSoonIcon}>🚀</div>
          <div className={styles.comingSoonTitle}>Coming Soon</div>
          <div className={styles.comingSoonText}>
            LP Staking feature is not yet available on mainnet. Stay tuned!
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={styles.lpStaking}>
      {/* 页面标题 */}
      <div className={styles.title}>
        <div className={styles.titleText}>LP Staking</div>
        <div className={styles.titleDesc}>Stake LP tokens to earn 1011 token rewards</div>
      </div>
      
      <div className={styles.content}>
        {/* 左侧列 */}
        <div className={styles.leftColumn}>
          {/* My Assets 卡片 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>My Assets</h2>
              {isLoggedIn && (
                <button 
                  className={styles.refreshButton}
                  onClick={() => {
                    dispatch(actions.fetchUserStaking())
                    dispatch(actions.fetchUserRoundsState())
                    dispatch(actions.fetchContractInfo())
                  }}
                >
                  ↻
                </button>
              )}
            </div>
            
            {isLoggedIn ? (
              <div className={styles.assetsGrid}>
                <div className={styles.assetItem}>
                  <div className={styles.assetLabel}>Wallet LP</div>
                  <div className={styles.assetValue}>
                    {userStaking.loading ? '...' : formatNumber(userStaking.lpBalance)}
                  </div>
                </div>
                <div className={styles.assetItem}>
                  <div className={styles.assetLabel}>Staked LP</div>
                  <div className={styles.assetValue}>
                    {userStaking.loading ? '...' : formatNumber(userStaking.balance)}
                  </div>
                </div>
                <div className={styles.assetItem}>
                  <div className={styles.assetLabel}>Total Points</div>
                  <div className={styles.assetValue}>
                    {userRoundsState.loading ? '...' : formatNumber(totalUserPoints)}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.loginPrompt}>
                Please login to view your assets
              </div>
            )}
          </div>
          
          {/* Add Liquidity 卡片 */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Add Liquidity</h2>
            
            <div className={styles.liquidityForm}>
              {/* 当前价格显示 */}
              {currentPrice && (
                <div className={styles.priceInfo}>
                  1 ETH = {formatNumber(currentPrice, 2)} {uniswapConfig?.pairedTokenSymbol || 'Token'}
                </div>
              )}
              
              <div className={styles.liquidityGrid}>
                {/* ETH 输入 */}
                <div className={styles.liquidityInputItem}>
                  <div className={styles.liquidityInputHeader}>
                    <img 
                      src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" 
                      alt="ETH" 
                      className={styles.tokenIcon}
                    />
                    <span className={styles.tokenName}>ETH</span>
                  </div>
                  <input
                    type="number"
                    className={styles.liquidityInput}
                    placeholder="0.0"
                    min="0"
                    value={ethAmount}
                    onChange={(e) => handleEthAmountChange(e.target.value)}
                    onWheel={disableWheel}
                    disabled={liquidityLoading || pairReserves.loading}
                  />
                </div>
                
                {/* 配对 Token 输入 */}
                <div className={styles.liquidityInputItem}>
                  <div className={styles.liquidityInputHeader}>
                    <img 
                      src={uniswapConfig?.pairedTokenSymbol === 'USDC' 
                        ? 'https://assets.coingecko.com/coins/images/6319/small/usdc.png'
                        : '/images/1011-logo.png'
                      } 
                      alt={uniswapConfig?.pairedTokenSymbol || '1011'} 
                      className={styles.tokenIcon}
                    />
                    <span className={styles.tokenName}>{uniswapConfig?.pairedTokenSymbol || '1011'}</span>
                  </div>
                  <input
                    type="number"
                    className={styles.liquidityInput}
                    placeholder="0.0"
                    min="0"
                    value={tokenAmount}
                    onChange={(e) => handleTokenAmountChange(e.target.value)}
                    onWheel={disableWheel}
                    disabled={liquidityLoading || pairReserves.loading}
                  />
                </div>
              </div>
              
              {/* 余额显示 */}
              {isLoggedIn && (
                <div className={styles.balanceRow}>
                  <span>Balance: {formatNumber(pairedTokenBalance.balance, 2)} {uniswapConfig?.pairedTokenSymbol || 'Token'}</span>
                </div>
              )}
              
              <div className={styles.uniswapHint}>
                Don't have {uniswapConfig?.pairedTokenSymbol || '1011'}? Buy it on{' '}
                <a 
                  href={uniswapBuyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.uniswapLink}
                >
                  Uniswap
                </a>
              </div>
              
              {isLoggedIn ? (
                <button
                  className={styles.actionButton}
                  onClick={needsTokenApproval ? handleApprovePairedToken : handleAddLiquidity}
                  disabled={liquidityLoading || !ethAmount || !tokenAmount || parseFloat(ethAmount) <= 0 || parseFloat(tokenAmount) <= 0}
                >
                  {liquidityLoading 
                    ? 'Processing...' 
                    : needsTokenApproval 
                      ? `Approve ${uniswapConfig?.pairedTokenSymbol || 'Token'}` 
                      : 'Add Liquidity'
                  }
                </button>
              ) : (
                <button className={classNames(styles.actionButton, styles.disabled)} disabled>
                  Login to Add Liquidity
                </button>
              )}
            </div>
          </div>
          
          {/* Stake LP 卡片 */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Stake LP</h2>
            
            {isLoggedIn ? (
              <div className={styles.stakeForm}>
                {/* 最小存款提示 */}
                {parseFloat(contractInfo.minDeposit) > 0 && (
                  <div className={styles.minDepositHint}>
                    Minimum deposit: {formatNumber(contractInfo.minDeposit)} LP
                  </div>
                )}
                
                <div className={styles.stakeInputBox}>
                  <input
                    type="number"
                    className={styles.stakeInputLarge}
                    placeholder="0"
                    min="0"
                    value={stakeAmount}
                    onChange={(e) => handleStakeAmountChange(e.target.value)}
                    onWheel={disableWheel}
                    disabled={txLoading}
                  />
                  <div className={styles.stakeInputMeta}>
                    <span className={styles.stakeInputLabel}>Staking Amount</span>
                    <button className={styles.maxButtonInline} onClick={setMaxStake}>
                      MAX
                    </button>
                  </div>
                  <div className={styles.lpBalanceRow}>
                    <span>Wallet: {formatNumber(userStaking.lpBalance)} LP</span>
                    <span>Staked: {formatNumber(userStaking.balance)} LP</span>
                  </div>
                </div>
                
                <div className={styles.dualButtonRow}>
                  <button
                    className={styles.actionButton}
                    onClick={needsApproval ? handleApprove : handleStake}
                    disabled={txLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  >
                    {txLoading ? 'Processing...' : needsApproval ? 'Approve' : 'Stake'}
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={handleUnstakeAll}
                    disabled={txLoading || parseFloat(userStaking.balance) <= 0}
                  >
                    {txLoading ? 'Processing...' : 'Unstake All'}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.loginPrompt}>
                Please login to stake LP tokens
              </div>
            )}
          </div>
        </div>
        
        {/* 右侧列 */}
        <div className={styles.rightColumn}>
          {/* Campaign Info 卡片 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Campaign Info</h2>
              <div className={styles.roundBadge}>
                {currentRoundId < 3 ? ROUND_SHORT_NAMES[currentRoundId] : 'Ended'}
              </div>
            </div>
            
            <div className={styles.campaignInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Start</span>
                <span className={styles.infoValue}>{formatDate(contractInfo.startTime)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>End</span>
                <span className={styles.infoValue}>{formatDate(contractInfo.endTime)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Total Staked</span>
                <span className={styles.infoValue}>{formatNumber(contractInfo.totalStaked)} LP</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Participants</span>
                <span className={styles.infoValue}>{contractInfo.participantCount}</span>
              </div>
            </div>
          </div>
          
          {/* Rewards 卡片（三轮展示） */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Rewards by Round</h2>
            
            <div className={styles.roundsList}>
              {[0, 1, 2].map((roundId) => {
                const roundInfo = roundsInfo.rounds?.[roundId] || {}
                const userRound = userRoundsState.rounds?.[roundId] || {}
                const ended = isRoundEnded(roundId)
                const funded = isRoundFunded(roundId)
                const claimable = canClaim(roundId)
                const isActive = currentRoundId === roundId && !ended
                const isUpcoming = currentRoundId < roundId && !ended
                const isExpanded = isActive || expandedRounds[roundId]
                
                // Upcoming 轮次：极简展示（只显示名称 + 锁图标）
                if (isUpcoming) {
                  return (
                    <div 
                      key={roundId} 
                      className={classNames(styles.roundCard, styles.roundLocked)}
                    >
                      <div className={styles.roundHeader}>
                        <span className={styles.roundName}>{ROUND_SHORT_NAMES[roundId]}</span>
                        <span className={styles.lockIcon}>🔒</span>
                      </div>
                    </div>
                  )
                }
                
                // Active/Ended 轮次：完整展示（可折叠）
                return (
                  <div 
                    key={roundId} 
                    className={classNames(styles.roundCard, {
                      [styles.roundActive]: isActive,
                      [styles.roundEnded]: ended,
                    })}
                  >
                    <div 
                      className={classNames(styles.roundHeader, {
                        [styles.roundHeaderClickable]: ended,
                      })}
                      onClick={() => ended && toggleRound(roundId)}
                    >
                      <span className={styles.roundName}>{ROUND_NAMES[roundId]}</span>
                      <div className={styles.roundHeaderRight}>
                        <span className={classNames(styles.roundStatus, {
                          [styles.statusActive]: isActive,
                          [styles.statusEnded]: ended,
                        })}>
                          {ended ? 'Ended' : 'Active'}
                        </span>
                        {ended && (
                          <span className={styles.expandIcon}>
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className={styles.roundDetails}>
                        <div className={styles.roundRow}>
                          <span>Period</span>
                          <span>{formatDate(roundInfo.startTime)} - {formatDate(roundInfo.endTime)}</span>
                        </div>
                        <div className={styles.roundRow}>
                          <span>Reward Pool</span>
                          <span>{formatLargeNumber(roundInfo.rewardAmount)} 1011</span>
                        </div>
                        <div className={styles.roundRow}>
                          <span>Total Points</span>
                          <span>{formatNumber(roundInfo.totalPoints)}</span>
                        </div>
                        
                        {isLoggedIn && (
                          <>
                            <div className={styles.divider} />
                            <div className={styles.roundRow}>
                              <span>My Points</span>
                              <span>{formatNumber(userRound.pendingPoints || userRound.points)}</span>
                            </div>
                            <div className={styles.roundRow}>
                              <span>Est. Reward</span>
                              <span className={styles.rewardHighlight}>
                                {formatNumber(userRound.pendingReward)} 1011
                              </span>
                            </div>
                            
                            {userRound.claimed ? (
                              <div className={styles.claimedBadge}>✓ Claimed</div>
                            ) : (
                              <button
                                className={classNames(styles.claimButton, {
                                  [styles.claimDisabled]: !claimable,
                                })}
                                onClick={() => handleClaim(roundId)}
                                disabled={!claimable || claimLoading[roundId]}
                              >
                                {claimLoading[roundId] 
                                  ? 'Claiming...' 
                                  : !ended 
                                    ? 'Round Not Ended' 
                                    : !funded 
                                      ? 'Not Funded' 
                                      : parseFloat(userRound.pendingReward) <= 0 
                                        ? 'No Reward' 
                                        : 'Claim Reward'
                                }
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Activity Log */}
          {isLoggedIn && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Activity Log</h2>
                <a 
                  href={uniswapPoolLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewOnUniswap}
                >
                  View on Uniswap
                </a>
              </div>
              
              {activityLog.loading ? (
                <div className={styles.loadingText}>Loading activities...</div>
              ) : activityLog.events.length === 0 ? (
                <div className={styles.emptyText}>No activity yet</div>
              ) : (
                <div className={styles.activityList}>
                  {activityLog.events.slice(0, 6).map((event, idx) => (
                    <div key={idx} className={styles.activityRow}>
                      <span className={styles.activityDate}>
                        {new Date(event.timestamp * 1000).toLocaleDateString('en-CA')}
                      </span>
                      <span className={styles.activityDesc}>
                        {event.type === 'Staked' ? 'Staked' : 'Unstaked'} {formatNumber(event.amount)} LP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
    </div>
  )
}

export default LpStaking
