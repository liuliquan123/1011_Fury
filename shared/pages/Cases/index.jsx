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
  console.log('submissions', submissions)

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
                    {(submissions && submissions.statistics && submissions.statistics.total_submissions) || 0}
                  </div>
                  <div className={styles.listItemName}>
                    Total Submissions
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {(submissions && submissions.statistics && submissions.statistics.total_loss_amount) || 0}
                  </div>
                  <div className={styles.listItemName}>
                    Total Loss
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {(submissions && submissions.statistics && submissions.statistics.total_submissions) || 0}
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
                <Link className={styles.inviteButton} to="/referral">
                  Invite
                </Link>
                <div className={styles.submitButton}>
                  Submit New Loss
                </div>
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.caseList}>
                {(submissions.submissions) && submissions.submissions.map((submission) => (
                  <div className={styles.caseListItem}>
                    <div className={styles.caseListItemTop}>
                      {submission.matched_case && (
                        <div className={styles.text}>
                          {submission.matched_case.exchange} {submission.trading_pair} {submission.matched_case.matched_case} - {submission.loss_date}
                        </div>
                      )}
                      <div className={styles.status}>
                        {submission.matched_case.status}
                      </div>
                    </div>
                    <div className={styles.caseListItemBottom}>
                      <div className={styles.statsList}>
                        <div className={styles.statsListItem}>
                          <div className={styles.statsListItemNumber}>
                            {submission.loss_amount || 0}
                          </div>
                          <div className={styles.statsListItemName}>
                            Your Loss
                          </div>
                        </div>
                        <div className={styles.statsListItem}>
                          <div className={styles.statsListItemNumber}>
                            {submission.trading_fee || 0}
                          </div>
                          <div className={styles.statsListItemName}>
                            Trading Fees
                          </div>
                        </div>
                        <div className={styles.statsListItem}>
                          <div className={styles.statsListItemNumber}>
                            {submission.file_urls.length}
                          </div>
                          <div className={styles.statsListItemName}>
                            Evidence
                          </div>
                        </div>
                        <div className={styles.statsListItem}>
                          <div className={styles.statsListItemNumber}>
                            {submission.created_at}
                          </div>
                          <div className={styles.statsListItemName}>
                            Submitted
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
