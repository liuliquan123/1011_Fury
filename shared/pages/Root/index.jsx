import React, { Fragment, useEffect, useState } from 'react'
import classNames from 'classnames'
import { Outlet } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'utils/withRouter'
import Title from 'components/DocumentTitle'
import Header from 'components/Header'
import MobileBottomNav from 'components/MobileBottomNav'
import 'resources/fonts/style.css'
import { Buffer } from 'safe-buffer'
import darkThemeStyle from 'resources/themes/dark'
import lightThemeStyle from 'resources/themes/light'
import { ToastContainer } from 'react-toastify'
import * as actions from 'actions/auth'
import { trackPageView } from 'utils/analytics'
import styles from './style.css'

const getAppTheme = (mode) => {
  if (mode === 'dark') {
    return darkThemeStyle
  } else if (mode === 'light') {
    return lightThemeStyle
  }

  return darkThemeStyle
}

const Root = ({ location, history, theme, actions }) => {
  const [title, setTitle] = useState('Fury')

  useEffect(() => {
    setTitle('Fury')
    actions.getProfile()
  }, [])

  // GA4 页面浏览追踪
  useEffect(() => {
    if (location?.pathname) {
      trackPageView(location.pathname, document.title || 'Fury')
    }
  }, [location?.pathname])

  useEffect(() => {
    const themeStyle = getAppTheme(theme)
    const keys = Object.keys(themeStyle)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      document.querySelector(':root').style.setProperty(key, themeStyle[key])
    }
  }, [theme])

  return (
    <Fragment>
      <Title render={title} />
      <div className={classNames(styles.root)}>
        <Header />
        <div className={classNames(styles.content)}>
          <Outlet />
          <ToastContainer />
        </div>
        <MobileBottomNav />
      </div>
    </Fragment>
  )
}

export default withRouter(
  connect(
    state => ({
      theme: state.theme.mode
    }),
    dispatch => ({
      actions: bindActionCreators({
        ...actions
      }, dispatch)
    })
  )(Root)
)
