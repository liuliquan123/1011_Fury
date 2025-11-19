import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'utils/withRouter'
import classNames from 'classnames'
import * as actions from 'actions/auth'
import styles from './style.css'

const Login = ({ actions }) => {
  useEffect(() => {
    actions.initializeWeb3Auth()
  }, [])

  return (
    <div className={styles.login}>
      <div className={styles.container}>
        <div className={styles.title}>
          One more step to claim the token
        </div>
        <div className={styles.subtitle}>
          Join thousands fighting for justice
        </div>
        <div className={styles.form}>
          <div className={classNames(styles.field, styles.referral)}>
            <div className={styles.input}>
              <input type="text" />

              <div className={styles.placeholder}>
                Enter referral code
              </div>
            </div>
          </div>
        </div>
        <div className={styles.checks}>
          <div className={styles.inputIcon}>
            <input type="checkbox" />
          </div>
          <div className={styles.inputText}>
            I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
          </div>
        </div>
        <div className={styles.separator}>
          <div className={styles.separatorLine}></div>
          <div className={styles.separatorText}>or</div>
        </div>
        <div className={styles.providers}>
          <div className={styles.provider}>
            EMAIL
          </div>
          <div className={styles.provider}>
            WALLET
          </div>
          <div className={styles.provider}>
            X
          </div>
          <div className={styles.provider}>
            TELEGRAM
          </div>
        </div>
      </div>
    </div>
  )
}

export default withRouter(
  connect(
    state => ({

    }),
    dispatch => ({
      actions: bindActionCreators({
        ...actions
      }, dispatch)
    })
  )(Login)
)
