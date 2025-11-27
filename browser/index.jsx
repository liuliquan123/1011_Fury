import 'core-js/stable'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReduxRouter } from '@lagunovsky/redux-react-router'
import { createBrowserHistory } from 'history'
import * as bundles from 'routes/async'
import Provider from 'components/Provider'
import { errorLoading } from 'utils'
import configure from 'store'
import Routes from 'routes'
import sagas from 'sagas'

const isPreloaded = !!window.__PRELOADED_STATE__
const preloadedState = window.__PRELOADED_STATE__ || {}
const preloadedChunks = window.__PRELOADED_CHUNKS__ || []
const browserHistory = createBrowserHistory()
const store = configure(preloadedState, browserHistory)
store.runSaga(sagas)

// 禁用浏览器的自动滚动恢复功能
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
  console.log('[ScrollReset] Disabled browser scroll restoration')
}

// 监听 Redux store 变化，自动滚动到页面顶部
if (typeof window !== 'undefined') {
  console.log('[ScrollReset] Initializing scroll reset via Redux store subscription...')
  
  let lastPathname = null
  
  store.subscribe(() => {
    const state = store.getState()
    const currentPathname = state.router?.location?.pathname
    
    console.log('[ScrollReset] Store updated, checking pathname...')
    console.log('[ScrollReset] - Last pathname:', lastPathname)
    console.log('[ScrollReset] - Current pathname:', currentPathname)
    
    if (currentPathname && currentPathname !== lastPathname) {
      console.log('[ScrollReset] 🔔 Route changed! Pathname changed from', lastPathname, 'to', currentPathname)
      console.log('[ScrollReset] - Current scroll position:', window.scrollY)
      
      // 使用 requestAnimationFrame + setTimeout 确保在 DOM 渲染完成后再滚动
      // 这样可以避免浏览器的默认滚动恢复行为
      requestAnimationFrame(() => {
        setTimeout(() => {
          console.log('[ScrollReset] - Executing scroll reset after DOM render...')
          console.log('[ScrollReset] - window.scrollY before:', window.scrollY)
          console.log('[ScrollReset] - document.documentElement.scrollTop before:', document.documentElement.scrollTop)
          console.log('[ScrollReset] - document.body.scrollTop before:', document.body.scrollTop)
          
          // 尝试滚动所有可能的容器
          window.scrollTo(0, 0)
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
          
          // 查找并滚动 .root 和 .content 容器
          const rootElement = document.querySelector('.root')
          const contentElement = document.querySelector('.content')
          if (rootElement) {
            console.log('[ScrollReset] - .root scrollTop before:', rootElement.scrollTop)
            rootElement.scrollTop = 0
          }
          if (contentElement) {
            console.log('[ScrollReset] - .content scrollTop before:', contentElement.scrollTop)
            contentElement.scrollTop = 0
          }
          
          // 验证滚动是否成功
          setTimeout(() => {
            console.log('[ScrollReset] - window.scrollY after:', window.scrollY)
            console.log('[ScrollReset] - document.documentElement.scrollTop after:', document.documentElement.scrollTop)
            console.log('[ScrollReset] - document.body.scrollTop after:', document.body.scrollTop)
            if (rootElement) console.log('[ScrollReset] - .root scrollTop after:', rootElement.scrollTop)
            if (contentElement) console.log('[ScrollReset] - .content scrollTop after:', contentElement.scrollTop)
          }, 50)
        }, 0)
      })
      
      lastPathname = currentPathname
    }
  })
  
  console.log('[ScrollReset] ✅ Redux store subscription registered successfully')
}

const renderApp = (Routes) => {
  if (isPreloaded) {
    ReactDOM.hydrateRoot(
      document.getElementById('root'),
      <Provider store={store}>
        <ReduxRouter history={browserHistory}>
          <Routes />
        </ReduxRouter>
      </Provider>
    )
  } else {
    const root = ReactDOM.createRoot(document.getElementById('root'))

    root.render(
      <Provider store={store}>
        <ReduxRouter history={browserHistory}>
          <Routes />
        </ReduxRouter>
      </Provider>
    )
  }
}

async function runApp() {
  try {
    if (!window.Intl) {
      await import('intl'/* webpackChunkName: 'intl' */)
      await Promise.all([
        import('intl/locale-data/jsonp/en.js'/* webpackChunkName: 'en' */),
        import('intl/locale-data/jsonp/zh.js'/* webpackChunkName: 'zh' */)
      ])
      console.log('using intl polyfill')
    }

    if (preloadedChunks) {
      await Promise.all(preloadedChunks.map(
        chunk => bundles[chunk].loadComponent()
      ))
    }

    renderApp(Routes)
  } catch (error) {
    errorLoading(error)
  }
}

if (module.hot) {
  module.hot.accept('routes', () => {
    const nextRoutes = require('routes').default
    renderApp(nextRoutes)
  })
}

runApp()
