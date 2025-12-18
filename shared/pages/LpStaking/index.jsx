import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames'
import * as actions from 'actions/lpStaking'
import { getLpStakingConfig } from 'config/contracts'
import styles from './style.css'

const LpStaking = () => {
  const dispatch = useDispatch()
  const { contractInfo, userStaking } = useSelector(state => state.lpStaking)
  const { profile, isLoggedIn } = useSelector(state => state.auth)
  
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [txLoading, setTxLoading] = useState(false)
  
  const config = getLpStakingConfig()
  
  // 初始化加载数据
  useEffect(() => {
    dispatch(actions.fetchContractInfo())
  }, [dispatch])
  
  // 登录后加载用户数据
  useEffect(() => {
    if (isLoggedIn && profile?.wallet_address) {
      dispatch(actions.fetchUserStaking())
    }
  }, [dispatch, isLoggedIn, profile?.wallet_address])
  
  // 检查是否需要授权
  const needsApproval = parseFloat(userStaking.allowance) < parseFloat(depositAmount || '0')
  
  // 处理授权
  const handleApprove = () => {
    setTxLoading(true)
    dispatch(actions.approveLp({
      onSuccess: () => setTxLoading(false),
      onError: () => setTxLoading(false),
    }))
  }
  
  // 处理质押
  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return
    
    setTxLoading(true)
    dispatch(actions.depositLp({
      amount: depositAmount,
      onSuccess: () => {
        setTxLoading(false)
        setDepositAmount('')
      },
      onError: () => setTxLoading(false),
    }))
  }
  
  // 处理取消质押
  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return
    
    setTxLoading(true)
    dispatch(actions.withdrawLp({
      amount: withdrawAmount,
      onSuccess: () => {
        setTxLoading(false)
        setWithdrawAmount('')
      },
      onError: () => setTxLoading(false),
    }))
  }
  
  // 处理全部取消质押
  const handleWithdrawAll = () => {
    setTxLoading(true)
    dispatch(actions.withdrawAllLp({
      onSuccess: () => setTxLoading(false),
      onError: () => setTxLoading(false),
    }))
  }
  
  // 设置最大值
  const setMaxDeposit = () => setDepositAmount(userStaking.lpBalance)
  const setMaxWithdraw = () => setWithdrawAmount(userStaking.balance)
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>LP Staking (Test Page)</h1>
      
      {/* 合约配置 */}
      <section className={styles.section}>
        <h2>Contract Config</h2>
        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span>Staking Contract:</span>
            <code>{config.stakingContract || 'Not configured'}</code>
          </div>
          <div className={styles.infoRow}>
            <span>LP Token:</span>
            <code>{config.lpToken || 'Not configured'}</code>
          </div>
        </div>
      </section>
      
      {/* 合约信息 */}
      <section className={styles.section}>
        <h2>Contract Info</h2>
        {contractInfo.loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : contractInfo.error ? (
          <div className={styles.error}>{contractInfo.error}</div>
        ) : (
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span>Total Deposits:</span>
              <strong>{contractInfo.totalDeposits} LP</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Participants:</span>
              <strong>{contractInfo.participantCount}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Campaign Ended:</span>
              <strong>{contractInfo.isCampaignEnded ? 'Yes' : 'No'}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Paused:</span>
              <strong>{contractInfo.isPaused ? 'Yes' : 'No'}</strong>
            </div>
          </div>
        )}
        <button 
          className={styles.refreshBtn}
          onClick={() => dispatch(actions.fetchContractInfo())}
        >
          Refresh
        </button>
      </section>
      
      {/* 用户状态 */}
      {isLoggedIn ? (
        <section className={styles.section}>
          <h2>My Staking</h2>
          {userStaking.loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : userStaking.error ? (
            <div className={styles.error}>{userStaking.error}</div>
          ) : (
            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span>Wallet:</span>
                <code>{profile?.wallet_address?.slice(0, 6)}...{profile?.wallet_address?.slice(-4)}</code>
              </div>
              <div className={styles.infoRow}>
                <span>LP Balance (Wallet):</span>
                <strong>{parseFloat(userStaking.lpBalance).toFixed(6)} LP</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Staked Balance:</span>
                <strong>{parseFloat(userStaking.balance).toFixed(6)} LP</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Points:</span>
                <strong>{parseFloat(userStaking.points).toFixed(6)}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Allowance:</span>
                <strong>{parseFloat(userStaking.allowance) > 1e18 ? 'Unlimited' : parseFloat(userStaking.allowance).toFixed(6)}</strong>
              </div>
            </div>
          )}
          <button 
            className={styles.refreshBtn}
            onClick={() => dispatch(actions.fetchUserStaking())}
          >
            Refresh
          </button>
        </section>
      ) : (
        <section className={styles.section}>
          <h2>My Staking</h2>
          <div className={styles.notLoggedIn}>Please login to view your staking info</div>
        </section>
      )}
      
      {/* 操作区域 */}
      {isLoggedIn && (
        <section className={styles.section}>
          <h2>Actions</h2>
          
          {/* 授权 */}
          <div className={styles.actionGroup}>
            <h3>1. Approve LP Token</h3>
            <p className={styles.hint}>First time users need to approve LP token spending</p>
            <button 
              className={styles.actionBtn}
              onClick={handleApprove}
              disabled={txLoading || parseFloat(userStaking.allowance) > 1e18}
            >
              {txLoading ? 'Processing...' : parseFloat(userStaking.allowance) > 1e18 ? 'Already Approved' : 'Approve'}
            </button>
          </div>
          
          {/* 质押 */}
          <div className={styles.actionGroup}>
            <h3>2. Deposit LP</h3>
            <div className={styles.inputGroup}>
              <input 
                type="number"
                placeholder="Amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={txLoading}
              />
              <button className={styles.maxBtn} onClick={setMaxDeposit}>MAX</button>
            </div>
            <button 
              className={styles.actionBtn}
              onClick={needsApproval ? handleApprove : handleDeposit}
              disabled={txLoading || !depositAmount || parseFloat(depositAmount) <= 0}
            >
              {txLoading ? 'Processing...' : needsApproval ? 'Approve First' : 'Deposit'}
            </button>
          </div>
          
          {/* 取消质押 */}
          <div className={styles.actionGroup}>
            <h3>3. Withdraw LP</h3>
            <div className={styles.inputGroup}>
              <input 
                type="number"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={txLoading}
              />
              <button className={styles.maxBtn} onClick={setMaxWithdraw}>MAX</button>
            </div>
            <button 
              className={styles.actionBtn}
              onClick={handleWithdraw}
              disabled={txLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            >
              {txLoading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
          
          {/* 全部取消质押 */}
          <div className={styles.actionGroup}>
            <h3>4. Withdraw All</h3>
            <button 
              className={classNames(styles.actionBtn, styles.dangerBtn)}
              onClick={handleWithdrawAll}
              disabled={txLoading || parseFloat(userStaking.balance) <= 0}
            >
              {txLoading ? 'Processing...' : 'Withdraw All'}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default LpStaking

