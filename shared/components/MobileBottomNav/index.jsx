import React, { useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { HomeIcon, MyCaseIcon, ProfileIcon, ReferralIcon } from 'components/Icons'
import styles from './style.css'

const MobileBottomNav = ({ profile }) => {
  const location = useLocation()
  const isLoggedIn = !!profile && !!profile.id

  // 路由匹配逻辑
  const isHomeActive = location.pathname === '/'
  const isMyCaseActive = location.pathname.startsWith('/my-case')
  const isProfileActive = location.pathname.startsWith('/profile')
  const isReferralActive = location.pathname.startsWith('/referral')

  return (
    <div className={styles.mobileBottomNav}>
      {/* Home */}
      <Link
        to="/"
        className={classNames(styles.navItem, { [styles.active]: isHomeActive })}
      >
        <HomeIcon className={styles.icon} />
        <span className={styles.label}>Home</span>
      </Link>

      {/* My Case - 始终指向目标页面，由页面自己处理登录保护 */}
      <Link
        to="/my-case"
        className={classNames(styles.navItem, { [styles.active]: isMyCaseActive })}
      >
        <MyCaseIcon className={styles.icon} />
        <span className={styles.label}>My Case</span>
      </Link>

      {/* Profile - 始终指向目标页面，由页面自己处理登录保护 */}
      <Link
        to="/profile"
        className={classNames(styles.navItem, { [styles.active]: isProfileActive })}
      >
        <ProfileIcon className={styles.icon} />
        <span className={styles.label}>Profile</span>
      </Link>

      {/* Referral - 始终指向目标页面，由页面自己处理登录保护 */}
      <Link
        to="/referral"
        className={classNames(styles.navItem, { [styles.active]: isReferralActive })}
      >
        <ReferralIcon className={styles.icon} />
        <span className={styles.label}>Referral</span>
      </Link>
    </div>
  )
}

export default connect(
  state => ({
    profile: state.auth.profile
  }),
  dispatch => ({})
)(MobileBottomNav)

