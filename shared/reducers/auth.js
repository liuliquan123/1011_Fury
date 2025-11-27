import { handleActions } from 'utils/redux-actions'
import * as actions from 'actions/auth'

const initialState = {
  profile: {},
  userTokens: {},
  submissions: {},
  referralStats: {},
  referralInfo: {},
  exchangePhase: {},
  evidenceForm: {},
  ocrForm: {},
  phasesLocked: {},
  cases: {}
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

    const currentPhase = phase.current_phase
    const userSubmissionStatus = phase.user_submission_status
    // Safely check userSubmissionStatus for null (未登录用户)
    const isLocked = userSubmissionStatus ? userSubmissionStatus[`phase_${currentPhase}`] : false
    state.phasesLocked[exchange] = isLocked
  },
  [actions.updateEvidenceForm] (state, action) {
    const evidenceForm = action.payload
    state.evidenceForm = { ...state.evidenceForm, ...evidenceForm }
  },
  [actions.updateOcrForm] (state, action) {
    const ocrForm = action.payload
    state.ocrForm = { ...state.ocrForm, ...ocrForm }
  },
  [actions.updateReferralInfo] (state, action) {
    const info = action.payload
    const code = info.code
    state.referralInfo[code] = info
  },
  [actions.updateCases] (state, action) {
    state.cases = action.payload
  },
  [actions.resetAuth] (state, action) {
    state.profile = {}
    state.userTokens = {}

    state.submissions = {}
    state.referralStats = {}
    state.referralInfo = {}

    state.exchangePhase = {}
    state.evidenceForm = {}
    state.ocrForm = {}
    state.cases = {}
  }
}, initialState)
