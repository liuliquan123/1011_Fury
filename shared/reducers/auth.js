import { handleActions } from 'utils/redux-actions'
import * as actions from 'actions/auth'

const initialState = {
  profile: {},
  userTokens: {},
  submissions: {},
  referralStats: {},
  exchangePhase: {},
  submitLoss: {}
}

export default handleActions({
  [actions.updateUser] (state, action) {
    state.user = action.payload
  },
  [actions.updateProfile] (state, action) {
    state.profile = action.payload
  },
  [actions.updateUserTokens] (state, action) {
    state.userTokens = action.payload
  },
  [actions.updateReferralStats] (state, action) {
    state.referralStats = action.payload
  },
  [actions.updateSubmissions] (state, action) {
    state.submissions = action.payload
  },
  [actions.updateExchangePhase] (state, action) {
    const { exchange, phase } = action.payload
    state.exchangePhase[exchange] = phase
  }
}, initialState)
