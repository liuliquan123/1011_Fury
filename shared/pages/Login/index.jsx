import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'utils/withRouter'
import classNames from 'classnames'
import * as actions from 'actions/auth'
import Spinner from 'resources/icons/Spinner'
import { toast } from 'react-toastify'
import { WALLET_CONNECTORS, AUTH_CONNECTION } from '@web3auth/modal'
import styles from './style.css'

const Login = ({ actions, history }) => {
  const [initializing, setInitializing] = useState(true)

  const [connectingWallet, setConnectingWallet] = useState(false)
  const [connectingTwitter, setConnectingTwitter] = useState(false)
  const [connectingEmail, setConnectingEmail] = useState(false)
  const [connectingTelegram, setConnectingTelegram] = useState(false)

  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState('')
  const [referralCode, setReferralCode] = useState('')

  const logout = useCallback(() => {
    actions.logout({
      onSuccess: () => {
        history('/login')
        window.location.reload()
      }
    })
  }, [])

  const onReferralCodeChange = useCallback((event) => {
    setReferralCode(event.target.value)
  }, [])

  const onEmailChange = useCallback((event) => {
    setEmail(event.target.value)
  }, [])

  const authByEmail = useCallback(() => {
    setConnectingEmail(true)

    actions.authByEmail({
      email,
      onSuccess: () => {
        toast('Email Login Success!')
        setConnectingEmail(false)
        setEmail('')
        history('/profile')
      },
      onError: (message) => {
        toast(message)
        setConnectingEmail(false)
        setEmail('')
      }
    })
  }, [email])

  const authByWallet = useCallback(() => {
    setConnectingWallet(true)

    actions.authByWallet({
      onSuccess: () => {
        toast('Wallet Login Success!')
        setConnectingWallet(false)
        history('/profile')
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
        history('/profile')
      },
      onError: (message) => {
        toast(message)
        setConnectingTwitter(false)
      }
    })
  }, [])

  const authByTelegram = useCallback(() => {
    setConnectingTelegram(true)

    actions.authByTelegram({
      onSuccess: () => {
        toast('Telegram Login Success!')
        setConnectingTelegram(false)
        history('/profile')
      },
      onError: (message) => {
        toast(message)
        setConnectingTelegram(false)
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
          <div className={styles.cancelButton} onClick={logout}>
            Cancel
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

  if (connectingTelegram) {
    return (
      <div className={styles.login}>
        <div className={styles.container}>
          <div className={styles.status}>
            Connecting Telegram...
          </div>
          <div className={styles.cancelButton} onClick={logout}>
            Cancel
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
              <input
                type="text"
                value={referralCode}
                onChange={onReferralCodeChange}
              />

              {!referralCode && (
                <div className={styles.placeholder}>
                  Enter referral code
                </div>
              )}
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
          {showEmailInput && (
            <div className={styles.provider}>
              <div className={styles.form}>
                <div className={classNames(styles.field, styles.referral)}>
                  <div className={styles.input}>
                    <input
                      type="text"
                      value={email}
                      onChange={onEmailChange}
                    />
                    <div className={classNames(styles.submit, { [styles.disabled]: !email })} onClick={authByEmail}>
                      {connectingEmail && (
                        <Spinner />
                      )}
                      {!connectingEmail && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                          <path d="M14.272 5.48209C14.3215 5.53372 14.3599 5.59201 14.3894 5.65334C14.4053 5.68642 14.418 5.72074 14.428 5.75554C14.4335 5.77454 14.4402 5.79353 14.4439 5.81285C14.484 6.02032 14.4236 6.24327 14.263 6.40395L8.98455 11.6824C8.72737 11.9396 8.31027 11.9401 8.05302 11.6831C7.79607 11.4258 7.79587 11.008 8.05302 10.7509L12.4358 6.36804L0.65878 6.36873C0.295167 6.36873 0.000307519 6.07351 1.08056e-05 5.70996C1.06422e-05 5.34617 0.294985 5.05119 0.65878 5.05119L11.9787 5.0505L8.05233 1.12413C7.79558 0.866846 7.79594 0.449676 8.05302 0.192598C8.31011 -0.0643469 8.72662 -0.0641074 8.98386 0.192598L14.2637 5.47242C14.2666 5.47532 14.2692 5.47911 14.272 5.48209Z" fill="black">
                          </path>
                        </svg>
                      )}

                    </div>
                    {!email && (
                      <div className={styles.placeholder}>
                        Enter email address
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {!showEmailInput && (
            <div className={styles.provider} onClick={() => setShowEmailInput(true)}>
              EMAIL
            </div>
          )}
          <div className={styles.provider} onClick={authByWallet}>
            WALLET
          </div>
          <div className={styles.provider} onClick={authByTwitter}>
            X
          </div>
          <div className={styles.provider} onClick={authByTelegram}>
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
