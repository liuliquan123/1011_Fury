import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'utils/withRouter'
import classNames from 'classnames'
import * as actions from 'actions/auth'
import { toast } from 'react-toastify'
import { WALLET_CONNECTORS, AUTH_CONNECTION } from '@web3auth/modal'
import styles from './style.css'

const Login = ({ actions }) => {
  const [initializing, setInitializing] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [connectingTwitter, setConnectingTwitter] = useState(false)

  const authByWallet = useCallback(() => {
    setConnectingWallet(true)

    actions.authByWallet({
      onSuccess: () => {
        toast('Wallet Login Success!')
        setConnectingWallet(false)
      },
      onError: (message) => {
        toast(message)
        setConnectingWallet(false)
      }
    })
  }, [])

  const authByTwitter = useCallback(() => {
    setConnectingTwitter(true)

    actions.authByTwitter({
      onSuccess: () => {
        toast('Twitter Login Success!')
        setConnectingTwitter(false)
      },
      onError: (message) => {
        toast(message)
        setConnectingTwitter(false)
      }
    })
  }, [])

  useEffect(() => {
    setInitializing(true)

    actions.initWeb3Auth({
      onSuccess: () => {
        setInitializing(false)
      },
      onError: (message) => {
        setInitializing(false)
      }
    })
  }, [])

  if (initializing) {
    return (
      <div className={styles.login}>
        <div className={styles.container}>
          <div className={styles.status}>
            Initializing...
          </div>
        </div>
      </div>
    )
  }

  if (connectingWallet) {
    return (
      <div className={styles.login}>
        <div className={styles.container}>
          <div className={styles.status}>
            Connecting Wallet...
          </div>
        </div>
      </div>
    )
  }

  if (connectingTwitter) {
    return (
      <div className={styles.login}>
        <div className={styles.container}>
          <div className={styles.status}>
            Connecting X...
          </div>
        </div>
      </div>
    )
  }

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
          <div className={styles.provider} onClick={authByWallet}>
            WALLET
          </div>
          <div className={styles.provider} onClick={authByTwitter}>
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
