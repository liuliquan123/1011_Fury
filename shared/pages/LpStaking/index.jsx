import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames'
import * as actions from 'actions/lpStaking'
import { getLpStakingConfig, getUniswapV2Config, isFeatureAvailable, getCurrentRound, get1011TokenAddress } from 'config/contracts'
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
  const { contractInfo, userStaking, activityLog, totalPoints, pairReserves, pairedTokenBalance } = useSelector(state => state.lpStaking)
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
  const [lastEditedField, setLastEditedField] = useState(null) // 'eth' or 'token'
  
  const config = getLpStakingConfig()
  const uniswapConfig = getUniswapV2Config()
  const currentRound = getCurrentRound()
  
  // 初始化加载数据
  useEffect(() => {
    dispatch(actions.fetchContractInfo())
    dispatch(actions.fetchTotalPoints())
    dispatch(actions.fetchPairReserves())
  }, [dispatch])
  
  // 登录后加载用户数据
  useEffect(() => {
    if (isLoggedIn && profile?.wallet_address) {
      dispatch(actions.fetchUserStaking())
      dispatch(actions.fetchActivityLog())
      dispatch(actions.fetchPairedTokenBalance())
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
  
  // 处理授权（approve 成功后自动执行 stake）
  const handleApprove = useCallback(() => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return
    
    setTxLoading(true)
    dispatch(actions.approveLp({
      onSuccess: () => {
        // Approve 成功后自动执行 stake
        dispatch(actions.depositLp({
          amount: stakeAmount,
          onSuccess: () => {
            setTxLoading(false)
            setStakeAmount('')
            dispatch(actions.fetchActivityLog())
          },
          onError: () => setTxLoading(false),
        }))
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
    
    // tokenAmount = ethAmount * reserveToken / reserveETH
    const token = (eth * reserveToken / reserveETH).toFixed(6)
    return token
  }, [pairReserves.reserveETH, pairReserves.reservePairedToken])
  
  const calculateETHFromToken = useCallback((tokenValue) => {
    const token = parseFloat(tokenValue) || 0
    const reserveETH = parseFloat(pairReserves.reserveETH) || 0
    const reserveToken = parseFloat(pairReserves.reservePairedToken) || 0
    
    if (reserveToken === 0 || token === 0) return ''
    
    // ethAmount = tokenAmount * reserveETH / reserveToken
    const eth = (token * reserveETH / reserveToken).toFixed(8)
    return eth
  }, [pairReserves.reserveETH, pairReserves.reservePairedToken])
  
  // 处理 ETH 输入变化（过滤负数）
  const handleEthAmountChange = (value) => {
    // 过滤负数
    if (value && parseFloat(value) < 0) return
    setEthAmount(value)
    setLastEditedField('eth')
    const calculatedToken = calculateTokenFromETH(value)
    setTokenAmount(calculatedToken)
  }
  
  // 处理 Token 输入变化（过滤负数）
  const handleTokenAmountChange = (value) => {
    // 过滤负数
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
  
  // 禁用滚轮事件（防止滚轮改变数字输入框的值）
  const disableWheel = (e) => e.target.blur()
  
  // 检查是否需要授权配对代币
  const needsTokenApproval = parseFloat(pairedTokenBalance.allowance) < parseFloat(tokenAmount || '0')
  
  // 处理授权配对代币
  const handleApprovePairedToken = useCallback(() => {
    setLiquidityLoading(true)
    dispatch(actions.approvePairedToken({
      onSuccess: () => setLiquidityLoading(false),
      onError: () => setLiquidityLoading(false),
    }))
  }, [dispatch])
  
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
                    {userStaking.loading ? '...' : formatNumber(userStaking.points)}
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
                
                {/* 配对 Token 输入 (USDC 测试 / 1011 正式) */}
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
                      MAX ({formatNumber(userStaking.lpBalance)} LP)
                    </button>
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
                  {isLoggedIn ? formatNumber(userStaking.points) : '--'}
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
