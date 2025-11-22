import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import styles from './style.css'

const Cases = ({ profile, userTokens, referralStats, actions, submissions, history }) => {
  return (
    <div className={styles.cases}>
      <div className={styles.title}>
        <div className={styles.text}>
          My Cases
        </div>
        <div className={styles.description}>
          Track your submissions and monitor case progress
        </div>
        <div className={styles.buttons}>
          <Link className={styles.button} to="/submit-loss">
            Create New Case
          </Link>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.account}>
          <div className={styles.statistic}>
            <div className={styles.top}>
              <div className={styles.text}>
                Your Participated Cases
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    0
                  </div>
                  <div className={styles.listItemName}>
                    Total Submissions
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    0
                  </div>
                  <div className={styles.listItemName}>
                    Total Loss
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    0
                  </div>
                  <div className={styles.listItemName}>
                    Evidence Submitted
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.statistic}>
            <div className={styles.top}>
              <div className={styles.text}>
                Your Participated Cases
              </div>
              <div className={styles.buttons}>
                <div className={styles.inviteButton}>
                  Invite
                </div>
                <div className={styles.submitButton}>
                  Submit New Loss
                </div>
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.caseList}>
                <div className={styles.caseListItem}>
                  <div className={styles.caseListItemTop}>
                    <div className={styles.text}>
                      Binance BTC/USDT Flash Crash Liquidation Event - Feb 15,2024
                    </div>
                    <div className={styles.status}>
                      Verified
                    </div>
                  </div>
                  <div className={styles.caseListItemBottom}>
                    <div className={styles.statsList}>
                      <div className={styles.statsListItem}>
                        <div className={styles.statsListItemNumber}>
                          0
                        </div>
                        <div className={styles.statsListItemName}>
                          Your Loss
                        </div>
                      </div>
                      <div className={styles.statsListItem}>
                        <div className={styles.statsListItemNumber}>
                          0
                        </div>
                        <div className={styles.statsListItemName}>
                          Trading Fees
                        </div>
                      </div>
                      <div className={styles.statsListItem}>
                        <div className={styles.statsListItemNumber}>
                          0
                        </div>
                        <div className={styles.statsListItemName}>
                          Evidence
                        </div>
                      </div>
                      <div className={styles.statsListItem}>
                        <div className={styles.statsListItemNumber}>
                          0
                        </div>
                        <div className={styles.statsListItemName}>
                          Submitted
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.caseListItem}>
                  <div className={styles.caseListItemTop}>
                    <div className={styles.text}>
                      Binance BTC/USDT Flash Crash Liquidation Event - Feb 15,2024
                    </div>
                    <div className={styles.status}>
                      Verified
                    </div>
                  </div>
                  <div className={styles.caseListItemBottom}>
                    <div className={styles.statsList}>
                      <div className={styles.statsListItem}>
                        <div className={styles.statsListItemNumber}>
                          0
                        </div>
                        <div className={styles.statsListItemName}>
                          Your Loss
                        </div>
                      </div>
                      <div className={styles.statsListItem}>
                        <div className={styles.statsListItemNumber}>
                          0
                        </div>
                        <div className={styles.statsListItemName}>
                          Trading Fees
                        </div>
                      </div>
                      <div className={styles.statsListItem}>
                        <div className={styles.statsListItemNumber}>
                          0
                        </div>
                        <div className={styles.statsListItemName}>
                          Evidence
                        </div>
                      </div>
                      <div className={styles.statsListItem}>
                        <div className={styles.statsListItemNumber}>
                          0
                        </div>
                        <div className={styles.statsListItemName}>
                          Submitted
                        </div>
                      </div>
                    </div>
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
  )(Cases)
)
