import { handleActions } from 'utils/redux-actions'
import * as actions from 'actions/crowdfund'

const initialState = {
  byExchange: {}
}

export default handleActions({
  // 注意：项目使用 immer，可以直接修改 state
  [actions.updateCrowdfund] (state, action) {
    const { exchange, data } = action.payload
    if (!state.byExchange[exchange]) {
      state.byExchange[exchange] = {}
    }
    Object.assign(state.byExchange[exchange], data)
  }
}, initialState)

