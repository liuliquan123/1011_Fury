import { combineReducers } from 'redux'
import { enableMapSet } from 'immer'
import { createRouterReducer } from '@lagunovsky/redux-react-router'
import { reducer as form } from 'redux-form'
import intl from './intl'
import theme from './theme'
import auth from './auth'
import crowdfund from './crowdfund'
import lpStaking from './lpStaking'

enableMapSet()

const createRootReducer = (history) => combineReducers({
  router: createRouterReducer(history),
  form,
  intl,
  theme,
  auth,
  crowdfund,
  lpStaking
})

export default createRootReducer
