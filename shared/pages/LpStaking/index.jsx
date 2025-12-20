import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames'
import * as actions from 'actions/lpStaking'
import { getLpStakingConfig, isFeatureAvailable, getCurrentRound, get1011TokenAddress } from 'config/contracts'
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

// 格式化时间戳
const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 截断地址
const truncateHash = (hash) => {
  if (!hash) return ''
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

const LpStaking = () => {
  const dispatch = useDispatch()
  const { contractInfo, userStaking, activityLog, totalPoints } = useSelector(state => state.lpStaking)
  const { profile } = useSelector(state => state.auth)
  
  // 判断登录状态
  const isLoggedIn = !!profile?.id
  const hasWallet = !!profile?.wallet_address
  
  // 表单状态
  const [stakeAmount, setStakeAmount] = useState('')
  const [ethAmount, setEthAmount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [txLoading, setTxLoading] = useState(false)
  
  const config = getLpStakingConfig()
  const currentRound = getCurrentRound()
  
  // 初始化加载数据
  useEffect(() => {
    dispatch(actions.fetchContractInfo())
    dispatch(actions.fetchTotalPoints())
  }, [dispatch])
  
  // 登录后加载用户数据
  useEffect(() => {
    if (isLoggedIn && profile?.wallet_address) {
      dispatch(actions.fetchUserStaking())
      dispatch(actions.fetchActivityLog())
    }
  }, [dispatch, isLoggedIn, profile?.wallet_address])
  
  // 计算预估空投
  const estimatedAirdrop = useMemo(() => {
    const userPoints = parseFloat(userStaking.points) || 0
    const total = parseFloat(totalPoints.value) || 0
    
    if (total === 0 || userPoints === 0) return 0
    
    // 当前轮次的 LP 奖励池
    const rewardPool = currentRound.lpRewards.tokens
    
    // 用户占比
    const ratio = userPoints / total
    
    return Math.floor(ratio * rewardPool)
  }, [userStaking.points, totalPoints.value, currentRound])
  
  // 检查是否需要授权
  const needsApproval = parseFloat(userStaking.allowance) < parseFloat(stakeAmount || '0')
  
  // 处理授权
  const handleApprove = useCallback(() => {
    setTxLoading(true)
    dispatch(actions.approveLp({
      onSuccess: () => setTxLoading(false),
      onError: () => setTxLoading(false),
    }))
  }, [dispatch])
  
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
                  <div className={styles.assetLabel}>My Points</div>
                  <div className={styles.assetValue}>
                    {userStaking.loading ? '...' : formatLargeNumber(userStaking.points)}
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
              <div className={styles.liquidityGrid}>
                {/* ETH 输入 */}
                <div className={styles.liquidityItem}>
                  <div className={styles.liquidityHeader}>
                    <span className={styles.liquidityValue}>
                      {ethAmount || '0'}
                    </span>
                    <img 
                      src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" 
                      alt="ETH" 
                      className={styles.tokenIcon}
                    />
                  </div>
                  <div className={styles.liquidityLabel}>ETH</div>
                </div>
                
                {/* 1011 Token 输入 */}
                <div className={styles.liquidityItem}>
                  <div className={styles.liquidityHeader}>
                    <span className={styles.liquidityValue}>
                      {tokenAmount || '0'}
                    </span>
                    <div className={styles.tokenIconPlaceholder}>1011</div>
                  </div>
                  <div className={styles.liquidityLabel}>1011</div>
                </div>
              </div>
              
              <a 
                href={uniswapBuyLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.uniswapLink}
              >
                Don't have 1011? Buy it on Uniswap
              </a>
              
              <button
                className={classNames(styles.actionButton, styles.disabled)}
                disabled
              >
                Add (Coming Soon)
              </button>
            </div>
          </div>
          
          {/* Stake LP 卡片 */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Stake LP</h2>
            
            {isLoggedIn ? (
              <div className={styles.stakeForm}>
                <div className={styles.stakeDisplay}>
                  <div className={styles.stakeDisplayValue}>
                    {formatNumber(stakeAmount || '0')}
                  </div>
                  <div className={styles.stakeDisplayLabel}>Staking Amount</div>
                </div>
                
                <div className={styles.inputGroup}>
                  <div className={styles.inputLabel}>
                    <span>Amount</span>
                    <span className={styles.balance}>
                      Available: {formatNumber(userStaking.lpBalance)} LP
                    </span>
                  </div>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={txLoading}
                    />
                    <button className={styles.maxButton} onClick={setMaxStake}>MAX</button>
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
          {/* Rewards 卡片 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Rewards</h2>
              <div className={styles.roundBadge}>Round {currentRound.round}</div>
            </div>
            
            <div className={styles.rewardsInfo}>
              <div className={styles.rewardItem}>
                <div className={styles.rewardLabel}>Current LP Reward Pool</div>
                <div className={styles.rewardValue}>
                  {formatLargeNumber(currentRound.lpRewards.tokens)} 1011
                </div>
                <div className={styles.rewardPercent}>
                  {currentRound.lpRewards.percentage}% of total supply
                </div>
              </div>
              
              <div className={styles.divider} />
              
              <div className={styles.rewardItem}>
                <div className={styles.rewardLabel}>My Points</div>
                <div className={styles.rewardValue}>
                  {isLoggedIn ? formatLargeNumber(userStaking.points) : '--'}
                </div>
              </div>
              
              <div className={styles.rewardItem}>
                <div className={styles.rewardLabel}>Estimated Airdrop</div>
                <div className={styles.rewardValueHighlight}>
                  {isLoggedIn ? `~${formatLargeNumber(estimatedAirdrop)} 1011` : '--'}
                </div>
                {isLoggedIn && parseFloat(totalPoints.value) > 0 && (
                  <div className={styles.rewardPercent}>
                    Your share: {((parseFloat(userStaking.points) / parseFloat(totalPoints.value)) * 100).toFixed(4)}%
                  </div>
                )}
              </div>
              
              <button className={classNames(styles.claimButton, styles.disabled)} disabled>
                Claim (Coming Soon)
              </button>
              
              <div className={styles.rewardNote}>
                Rewards will be claimable after the airdrop snapshot
              </div>
            </div>
          </div>
          
          {/* Activity Log 移到右侧 */}
          {isLoggedIn && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Activity Log</h2>
                <a 
                  href={uniswapBuyLink}
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
