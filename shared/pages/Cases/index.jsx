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
  // 1. 处理空值 / 零
  if (num === null || num === undefined || isNaN(num)) return '0'
  if (num === 0) return '0'

  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  // 2. < 1000：使用智能小数（去掉无意义的 0）
  if (absNum < 1000) {
    const s = Number(absNum.toFixed(2)).toString()
    return sign + s
  }

  // 工具函数：带进位处理的缩写生成
  const buildWithUnit = (value, divisor, suffix, next) => {
    const short = value / divisor
    let digits
    if (short < 10) digits = 2
    else if (short < 100) digits = 1
    else digits = 0

    let rounded = Number(short.toFixed(digits))

    // 如果四舍五入后变成 1000，说明应该进位到下一单位
    if (rounded >= 1000 && next) {
      return buildWithUnit(value, next.divisor, next.suffix, next.next)
    }

    return sign + rounded.toString() + suffix
  }

  // 3. K / M / B 分段 + 进位处理
  if (absNum < 1000000) {
    return buildWithUnit(absNum, 1000, 'K', {
      divisor: 1000000,
      suffix: 'M',
      next: {
        divisor: 1000000000,
        suffix: 'B',
        next: null
      }
    })
  }

  if (absNum < 1000000000) {
    return buildWithUnit(absNum, 1000000, 'M', {
      divisor: 1000000000,
      suffix: 'B',
      next: null
    })
  }

  return buildWithUnit(absNum, 1000000000, 'B', null)
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
            <div className={classNames(styles.buttonText)}>SUBMIT NEW LOSS</div>
            <div className={classNames(styles.rightArrow)}>{"<"}</div>
          </Link>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.account}>
          <div className={styles.statistic}>
            <div className={styles.top}>
              <div className={styles.text}>
                Overview
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {(submissions && submissions.statistics && submissions.statistics.total_submissions) || 0}
                  </div>
                  <div className={styles.listItemName}>
                    Total Submitted
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    {(submissions && submissions.statistics && submissions.statistics.total_loss_amount) 
                      ? formatAmount(submissions.statistics.total_loss_amount) 
                      : '--'}
                  </div>
                  <div className={styles.listItemName}>
                    Total Loss Amount
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
                Your Cases Submitted
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
                          {submission.matched_case.exchange} {submission.trading_pair}{submission.matched_case.matched_case ? ` - ${submission.matched_case.matched_case}` : ''} - {formatDateShort(submission.loss_date)}
                        </div>
                      )}
                      <div className={styles.status}>
                        {(submission.matched_case.status || '').toUpperCase()}
                      </div>
                    </div>
                    <div className={styles.caseListItemBottom}>
                      <div className={styles.statsList}>
                        <div className={styles.statsListItem}>
                          <div className={styles.statsListItemNumber}>
                            {submission.loss_amount ? formatAmount(submission.loss_amount) : '--'}
                          </div>
                          <div className={styles.statsListItemName}>
                            Loss Amount
                          </div>
                        </div>
                        <div className={styles.statsListItem}>
                          <div className={styles.statsListItemNumber}>
                            {submission.file_urls.length}
                          </div>
                          <div className={styles.statsListItemName}>
                            Evidence Files
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
