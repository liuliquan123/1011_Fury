import { all, fork } from 'redux-saga/effects'
import { ENV } from 'constants/env'
import intlSaga from './intl'
import themeSaga from './theme'
import authSaga from './auth'
import loggerSaga from './logger'
import crowdfundSaga from './crowdfund'
import lpStakingSaga from './lpStaking'

const sagas = {
  intlSaga: fork(intlSaga),
  themeSaga: fork(themeSaga),
  authSaga: fork(authSaga),
  loggerSaga: fork(loggerSaga),
  crowdfundSaga: fork(crowdfundSaga),
  lpStakingSaga: fork(lpStakingSaga)
}

if (ENV === 'production') {
  // delete sagas.loggerSaga
}

export default function* rootSaga() {
  yield all(sagas)
}
