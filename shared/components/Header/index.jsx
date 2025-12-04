import React, { Fragment, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import { useSearchParams, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import styles from './style.css'

const Header = ({ profile, actions, history }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [referralCode, setReferralCode] = useState(searchParams.get('code') || '')
  const [showMenu, setShowMenu] = useState(true)
  const location = useLocation()

  useEffect(() => {
    actions.getProfile()
  }, [])

  const logout = useCallback(() => {
    actions.logout({
      onSuccess: () => {
        history('/login')
        window.location.reload()
      }
    })
  }, [])

  return (
    <div className={classNames(styles.header)}>
      <Link className={classNames(styles.branding)} to="/">
        <div className={classNames(styles.logo)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M24 6.29748L18.2973 11.9999L24 17.7027L17.7026 24L12 18.2974L6.29744 24L0 17.7027L5.70256 11.9999L0 6.29748L6.29744 0L12 5.70259L17.7026 0L24 6.29748ZM15.9919 14.5275L15.4393 16.5725L15.1217 15.3978L13.8652 16.6543C14.7252 17.5143 16.1195 17.5143 16.9794 16.6543C17.8394 15.7944 17.8394 14.4001 16.9794 13.5401L15.9919 14.5275ZM7.33969 13.5401C6.47974 14.4001 6.47974 15.7944 7.33969 16.6543C8.19966 17.5143 9.59396 17.5143 10.4539 16.6543L9.19748 15.3978L8.87986 16.5725L8.32726 14.5275L7.33969 13.5401Z" fill="black" />
          </svg>
        </div>
        <div className={classNames(styles.text)}>
          Satoshi's Fury
        </div>
      </Link>
      {profile.id && (
        <div className={classNames(styles.topMenu)}>
          <Link
            className={classNames(styles.topMenuItem, {
              [styles.active]: location.pathname.indexOf('my-case') !== -1
            })}
            to={profile.id ? `/my-case` : `/login`}
          >
            My Case
          </Link>
          <Link
            className={classNames(styles.topMenuItem, {
              [styles.active]: location.pathname.indexOf('profile') !== -1
            })}
            to={profile.id ? `/profile` : `/login`}
          >
            Profile
          </Link>
          <Link
            className={classNames(styles.topMenuItem, {
              [styles.active]: location.pathname.indexOf('referral') !== -1
            })}
            to={profile.id ? `/referral` : `/login`}
          >
            Advocate Hub
          </Link>
        </div>
      )}
      <div className={classNames(styles.buttons)} style={{ gap: '10px' }}>
        <Link
          className={classNames(styles.button, styles.large)}
          to={referralCode ? `/submit-loss?code=${referralCode}` : '/submit-loss'}
        >
          <div className={classNames(styles.leftArrow)}>{">"}</div>
          <div className={classNames(styles.text)}>
            SUBMIT YOUR LOSS
          </div>
          <div className={classNames(styles.rightArrow)}>{"<"}</div>
        </Link>
        <Link
          className={classNames(styles.button, styles.small)}
          to={referralCode ? `/submit-loss?code=${referralCode}` : '/submit-loss'}
        >
          <div className={classNames(styles.leftArrow)}>{">"}</div>
          <div className={classNames(styles.text)}>
            SUBMIT
          </div>
          <div className={classNames(styles.rightArrow)}>{"<"}</div>
        </Link>
        {!profile.id && (
          <Fragment>
            <Link 
              className={classNames(styles.desktopLoginButton)} 
              to={referralCode ? `/login?code=${referralCode}` : '/login'}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px 16px',
                height: '52px',
                background: '#E9FD66',
                border: 'none',
                textDecoration: 'none',
                cursor: 'pointer',
                fontFamily: 'Google Sans Code',
                fontSize: '16px',
                fontWeight: 500,
                color: 'black'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M4 9H5V10H11V9H12V8H13V2H12V1H11V0H5V1H4V2H3V8H4V9ZM5 4H6V3H7V2H9V3H10V4H11V6H10V7H9V8H7V7H6V6H5V4Z" fill="black"/>
                <path d="M15 13V12H14V11H2V12H1V13H0V18H2V15H3V14H4V13H12V14H13V15H14V18H16V13H15Z" fill="black"/>
              </svg>
            </Link>
            <Link 
              className={classNames(styles.mobileLoginButton)} 
              to={referralCode ? `/login?code=${referralCode}` : '/login'}
              style={{ 
                display: 'none',
                padding: '8px',
                width: '40px',
                height: '40px',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="27" viewBox="0 0 16 18" fill="none">
                <path d="M4 9H5V10H11V9H12V8H13V2H12V1H11V0H5V1H4V2H3V8H4V9ZM5 4H6V3H7V2H9V3H10V4H11V6H10V7H9V8H7V7H6V6H5V4Z" fill="black"/>
                <path d="M15 13V12H14V11H2V12H1V13H0V18H2V15H3V14H4V13H12V14H13V15H14V18H16V13H15Z" fill="black"/>
              </svg>
          </Link>
          </Fragment>
        )}
        {profile.id && (
          <Link className={classNames(styles.logoButton)} to={profile.id ? `/profile` : `/login`}>
            <div className={classNames(styles.logo)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M4 9H5V10H11V9H12V8H13V2H12V1H11V0H5V1H4V2H3V8H4V9ZM5 4H6V3H7V2H9V3H10V4H11V6H10V7H9V8H7V7H6V6H5V4Z" fill="black"/>
                <path d="M15 13V12H14V11H2V12H1V13H0V18H2V15H3V14H4V13H12V14H13V15H14V18H16V13H15Z" fill="black"/>
              </svg>
            </div>
            <div className={classNames(styles.menu)}>
              {/* <Link className={classNames(styles.menuItem)} to={profile.id ? `/profile` : `/login`}>
                Profile
              </Link>
                  <Link className={classNames(styles.menuItem)} to={profile.id ? `/referral` : `/login`}>
                  Advocate Hub
              </Link>
                  <Link className={classNames(styles.menuItem)} to={profile.id ? `/my-case` : `/login`}>
                My Case
                  </Link> */}
              <div className={classNames(styles.menuItem)} onClick={logout}>
                Logout
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

export default withRouter(
  connect(
    state => ({
      profile: state.auth.profile
    }),
    dispatch => ({
      actions: bindActionCreators({
        ...actions
      }, dispatch)
    })
  )(Header)
)
