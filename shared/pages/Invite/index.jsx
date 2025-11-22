import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import styles from './style.css'

const getFormattedTime = (reward) => {
  if (reward) {
    const unlockTimestamp = new Date(reward.unlock_date).getTime()
    const now = Date.now()

    let diff = unlockTimestamp - now

    if (diff <= 0) {
      return { d: 0, h: 0, m: 0, s: 0 }; // already unlocked
    }

    // Convert ms → d/h/m/s
    let seconds = Math.floor(diff / 1000)

    const d = Math.floor(seconds / 86400)
    seconds %= 86400

    const h = Math.floor(seconds / 3600)
    seconds %= 3600

    const m = Math.floor(seconds / 60)
    const s = seconds % 60

    return { d, h, m, s }
  }

  return { d: 0, h: 0, m: 0, s: 0 }
}

const getPercentage = (reward) => {
  if (reward) {
    const start = new Date(reward.granted_at).getTime();
    const end = new Date(reward.unlock_date).getTime();
    const now = Date.now();

    if (now <= start) return 0;      // not started yet
    if (now >= end) return 100;      // already unlocked

    const total = end - start;
    const passed = now - start;

    const percentage = (passed / total) * 100;

    return Math.min(100, Math.max(0, percentage))
  }

  return 0
}


const Invite = ({ profile, userTokens, referralStats, actions, submissions, history }) => {
  const rewards = userTokens.rewards || []
  const exchangeTypes = rewards.map(reward => reward.exchange)
  const exchangeCount = exchangeTypes.length
  const [activeIdx, setActiveIdx] = useState(0)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [date, setDate] = useState(0)
  let reward = !!exchangeCount ? rewards[activeIdx] : null
  const [formattedTime, setFormattedTime] = useState(getFormattedTime(reward))
  const [percentage, setPercentage] = useState(getPercentage(reward))

  console.log('profile', profile)
  console.log('userTokens', userTokens)
  console.log('referralStats', referralStats)
  console.log('submissions', submissions)

  console.log('formattedTime', formattedTime)
  console.log('percentage', percentage)

  useEffect(() => {
    const iv = setInterval(() => {
      setDate(+new Date())
    }, 1000)

    return () => {
      clearInterval(iv)
    }
  }, [])

  useEffect(() => {
    setFormattedTime(getFormattedTime(reward))
    setPercentage(getPercentage(reward))
  }, [reward, date])

  useEffect(() => {
    setActiveIdx(0)
  }, [exchangeCount])

  useEffect(() => {
    actions.getProfile()
  }, [])

  const linkWallet = useCallback(() => {
    setConnectingWallet(true)

    actions.linkWallet({
      onSuccess: () => {
        toast('Connect Wallet Success!')
        setConnectingWallet(false)
      },
      onError: (message) => {
        toast(message)
        setConnectingWallet(false)
      },
    })
  }, [])

  const prev = useCallback(() => {
    if (activeIdx > 0) {
      setActiveIdx(activeIdx - 1)
    }
  }, [activeIdx])

  const next = useCallback(() => {
    if (activeIdx < exchangeCount) {
      setActiveIdx(activeIdx + 1)
    }
  }, [activeIdx, exchangeCount])

  const logout = useCallback(() => {
    actions.logout({
      onSuccess: () => {
        history('/login')
        window.location.reload()
      }
    })
  }, [])

  if (!profile) {
    return null
  }

  return (
    <div className={styles.invite}>
      <div className={styles.title}>
        <div className={styles.text}>
          You’ve Been Invited!
        </div>
        <div className={styles.description}>
          Join with referral code: DEMO123
        </div>
        <div className={styles.buttons}>
          <Link className={styles.button} to="/submit-loss">
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
                    Demo User
                  </div>
                  <div className={styles.code}>
                    <div className={styles.label}>
                      Referral Code：
                    </div>
                    <div className={styles.value}>
                      DEMO123
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
                    0
                  </div>
                  <div className={styles.listItemName}>
                    Participants
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    0
                  </div>
                  <div className={styles.listItemName}>
                    Total Damage
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    0
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
    }),
    dispatch => ({
      actions: bindActionCreators({
        ...actions
      }, dispatch)
    })
  )(Invite)
)
