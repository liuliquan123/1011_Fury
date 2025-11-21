import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import styles from './style.css'

const Profile = ({ profile, userTokens, referralStats, actions, submissions, history }) => {
  const rewards = userTokens.rewards || [{
    created_at: "2025-11-21T11:18:42.279562+00:00",
    exchange: "Binance",
    granted_at: "2025-11-21T11:18:42.294+00:00",
    id: "3070fe14-8438-42e3-b074-74daf0a859cb",
    status: "locked",
    submission_id: "e2b62bce-aacf-4870-bf98-c8aab7380a9e",
    token_amount: 0,
    unlock_date: "2025-11-28T11:18:42.294+00:00",
    updated_at: "2025-11-21T11:18:42.279562+00:00",
    user_id: "7f2f5499-98e7-466a-baee-ebc103e5b362"
  }]
  const exchangeTypes = rewards.map(reward => rewards.exchange)
  const exchangeCount = exchangeTypes.length
  const [activeIdx, setActiveIdx] = useState(0)
  let reward = !!exchangeCount ? rewards[activeIdx] : null

  console.log('profile', profile)
  console.log('userTokens', userTokens)
  console.log('referralStats', referralStats)
  console.log('submissions', submissions)

  useEffect(() => {
    setActiveIdx(0)
  }, [exchangeCount])

  useEffect(() => {
    actions.getProfile()
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
    <div className={styles.profile}>
      <div className={styles.title}>
        <div className={styles.text}>
          Profile
        </div>
        <div className={styles.description}>
          Manage your account and view your activity
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.account}>
          <div className={styles.user}>
            <div className={styles.top}>
              <div className={styles.logo}></div>
              <div className={styles.name}>{profile.username}</div>
              <div className={styles.description}>{profile.id}</div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <div className={styles.listItemName}>
                    Login Type
                  </div>
                  <div className={styles.listItemContent}>
                    {profile.login_type}
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemName}>
                    Wallet
                  </div>
                  <div className={styles.listItemContent}>
                    {profile.wallet_address}
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemName}>
                    Member Since
                  </div>
                  <div className={styles.listItemContent}>
                    {profile.created_at}
                  </div>
                </div>
              </div>
              <div className={styles.button} onClick={logout}>
                LOGOUT
              </div>
            </div>
          </div>
          <div className={styles.tokenSection}>
            {(!!reward || true) && (
              <div className={styles.locked}>
                <div className={styles.nav}>
                  <div className={classNames(styles.leftButton, {
                    [styles.disabled]: activeIdx === 0
                  })} onClick={prev}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                      <path d="M0.113852 5.56483C0.103751 5.57951 0.0957266 5.59583 0.0869215 5.6111C0.0387433 5.69507 0.0108409 5.78666 0.00267635 5.8804C-0.0138618 6.06774 0.0465054 6.26109 0.189811 6.40452L5.46894 11.6837C5.7261 11.9406 6.14327 11.9398 6.40047 11.683C6.65744 11.4258 6.65745 11.0093 6.40047 10.7521L2.01627 6.36792H13.794C14.1578 6.36792 14.4528 6.07295 14.4528 5.70915C14.4528 5.34537 14.1578 5.05038 13.794 5.05038H2.47479L6.40047 1.1247C6.65768 0.867487 6.65762 0.449726 6.40047 0.192476C6.1432 -0.0644227 5.72607 -0.0639614 5.46894 0.193166L0.190502 5.47161C0.16168 5.50047 0.136207 5.5324 0.113852 5.56483Z" fill="black" />
                    </svg>
                  </div>
                  <div className={classNames(styles.rightButton, {
                    [styles.disabled]: activeIdx === exchangeCount - 1
                  })} onClick={next}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                      <path d="M14.272 5.48209C14.3215 5.53372 14.3599 5.59201 14.3894 5.65334C14.4053 5.68642 14.418 5.72074 14.428 5.75554C14.4335 5.77454 14.4402 5.79353 14.4439 5.81285C14.484 6.02032 14.4236 6.24327 14.263 6.40395L8.98455 11.6824C8.72737 11.9396 8.31027 11.9401 8.05302 11.6831C7.79607 11.4258 7.79587 11.008 8.05302 10.7509L12.4358 6.36804L0.65878 6.36873C0.295167 6.36873 0.000307519 6.07351 1.08056e-05 5.70996C1.06422e-05 5.34617 0.294985 5.05119 0.65878 5.05119L11.9787 5.0505L8.05233 1.12413C7.79558 0.866846 7.79594 0.449676 8.05302 0.192598C8.31011 -0.0643469 8.72662 -0.0641074 8.98386 0.192598L14.2637 5.47242C14.2666 5.47532 14.2692 5.47911 14.272 5.48209Z" fill="black" />
                    </svg>
                  </div>
                </div>
                <div className={styles.text}>{reward.exchange}</div>
                <div className={styles.tokens}>
                  <div className={styles.token}>
                    <div className={styles.tokenLogo}></div>
                    <div className={styles.tokenAmount}>
                      {reward.token_amount || 0}
                      <span className={styles.status}>{reward.status}</span>
                    </div>
                    <div className={styles.tokenLockTime}>
                      <div className={styles.tokenLockTimeName}>
                        Remaining
                      </div>
                      <div className={styles.tokenLockTimeContent}>
                        <div className={styles.tokenLockTimeContentCellNumber}>00</div>
                        <div className={styles.tokenLockTimeContentCellText}>D</div>
                        <div className={styles.tokenLockTimeContentCellNumber}>01</div>
                        <div className={styles.tokenLockTimeContentCellText}>H</div>
                        <div className={styles.tokenLockTimeContentCellNumber}>07</div>
                        <div className={styles.tokenLockTimeContentCellText}>M</div>
                        <div className={styles.tokenLockTimeContentCellNumber}>17</div>
                        <div className={styles.tokenLockTimeContentCellText}>S</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.progress}>
                  <div className={styles.percentage}>

                  </div>
                </div>
                <div className={styles.actionButtons}>
                  <div className={styles.actionButton}>
                    Accelerate Unlock
                  </div>
                  {profile && !profile.wallet_address && (
                    <div className={styles.actionButtonDark}>
                      Connect Wallet
                    </div>
                  )}
                </div>
              </div>
            )}
            {(!reward) && (
              <div className={styles.locked}>
                <div className={styles.actionButtons}>
                  <Link className={styles.actionButton} to="/submit-loss">
                    SUBMIT LOSS
                  </Link>
                </div>
              </div>
            )}

            <div className={styles.statistic}>
              <div className={styles.statisticTitle}>
                Account Statistics
              </div>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {(submissions && submissions.statistics && submissions.statistics.total_submissions) || 0}
                  </div>
                  <div className={styles.listItemName}>
                    Cases
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {(submissions && submissions.statistics && submissions.statistics.total_loss_amount) || 0}
                  </div>
                  <div className={styles.listItemName}>
                    Evidence
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {(profile && profile.referral_count) || 0}
                  </div>
                  <div className={styles.listItemName}>
                    Referrals
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.actionTitle}>
            Quick Actions
          </div>
          <div className={styles.list}>
            <Link className={styles.listItem} to="/submit-loss">
              submit new loss
            </Link>
            <div className={styles.listItem}>
              view referral program
            </div>
            <div className={styles.listItem}>
              my cases
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
  )(Profile)
)
