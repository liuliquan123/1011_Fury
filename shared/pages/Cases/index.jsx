import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import { formatDate, formatDateShort } from 'utils'
import styles from './style.css'

// 基础数字格式化（内部使用）
const formatNumberWithUnit = (num) => {
  if (!num || num === 0) return '0'
  
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  
  if (absNum < 1000) {
    return sign + absNum.toFixed(0)
  }
  
  if (absNum < 1000000) {
    const numShort = absNum / 1000
    if (numShort < 10) return sign + numShort.toFixed(2) + 'K'
    if (numShort < 100) return sign + numShort.toFixed(1) + 'K'
    return sign + numShort.toFixed(0) + 'K'
  }
  
  if (absNum < 1000000000) {
    const numShort = absNum / 1000000
    if (numShort < 10) return sign + numShort.toFixed(2) + 'M'
    if (numShort < 100) return sign + numShort.toFixed(1) + 'M'
    return sign + numShort.toFixed(0) + 'M'
  }
  
  const numShort = absNum / 1000000000
  if (numShort < 10) return sign + numShort.toFixed(2) + 'B'
  if (numShort < 100) return sign + numShort.toFixed(1) + 'B'
  return sign + numShort.toFixed(0) + 'B'
}

// 金额格式化（带 $ 符号）
const formatAmount = (amount) => {
  return '$' + formatNumberWithUnit(amount)
}

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
            <div className={classNames(styles.leftArrow)}>{">"}</div>
            <div className={classNames(styles.buttonText)}>Create New Case</div>
            <div className={classNames(styles.rightArrow)}>{"<"}</div>
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
                    {formatAmount((submissions && submissions.statistics && submissions.statistics.total_loss_amount) || 0)}
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
                  <div className={classNames(styles.leftArrow)}>{">"}</div>
                  <div className={classNames(styles.buttonText)}>Invite</div>
                  <div className={classNames(styles.rightArrow)}>{"<"}</div>
                </Link>
                <Link className={styles.submitButton} to="/submit-loss">
                  <div className={classNames(styles.leftArrow)}>{">"}</div>
                  <div className={classNames(styles.buttonText)}>Submit New Loss</div>
                  <div className={classNames(styles.rightArrow)}>{"<"}</div>
                </Link>
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.caseList}>
                {(submissions.submissions) && submissions.submissions.map((submission) => (
                  <div className={styles.caseListItem}>
                    <div className={styles.caseListItemTop}>
                      {submission.matched_case && (
                        <div className={styles.text}>
                          {submission.matched_case.exchange} {submission.trading_pair} {submission.matched_case.matched_case} - {formatDateShort(submission.loss_date)}
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
                            {formatAmount(submission.loss_amount || 0)}
                          </div>
                          <div className={styles.statsListItemName}>
                            Your Loss
                          </div>
                        </div>
                        <div className={styles.statsListItem}>
                          <div className={styles.statsListItemNumber}>
                            {formatAmount(submission.trading_fee || 0)}
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
                            {formatDate(submission.created_at)}
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
