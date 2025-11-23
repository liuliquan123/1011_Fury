import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'utils/withRouter'
import classNames from 'classnames'
import * as actions from 'actions/auth'
import Spinner from 'resources/icons/Spinner'
import LoginModal from 'components/Login'
import { toast } from 'react-toastify'
import { WALLET_CONNECTORS, AUTH_CONNECTION } from '@web3auth/modal'
import { useSearchParams } from 'react-router-dom'
import styles from './style.css'

const Login = ({ history }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [referralCode, setReferralCode] = useState(searchParams.get('code') || '')

  const onLoggedIn = useCallback((event) => {
    history('/profile')
  }, [])

  const onLoggedOut = useCallback((code) => {
    history(code ? `/login?code=${code}` : '/login')
    window.location.reload()
  }, [])

  return (
    <div className={styles.login}>
      <LoginModal
        code={referralCode}
        onLoggedIn={onLoggedIn}
        onLoggedOut={onLoggedOut}
      />
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
