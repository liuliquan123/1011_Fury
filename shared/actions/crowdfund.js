import { createAction } from 'redux-actions'

// Crowdfund Actions
export const fetchCrowdfund = createAction('crowdfund/FETCH')
export const updateCrowdfund = createAction('crowdfund/UPDATE')
export const contribute = createAction('crowdfund/CONTRIBUTE')
export const claimRefund = createAction('crowdfund/CLAIM_REFUND')
export const claimCrowdfundToken = createAction('crowdfund/CLAIM_TOKEN')

