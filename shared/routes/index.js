import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Root from 'pages/Root'
import NoMatch from 'components/NoMatch'
import {
  Landing,
  Profile,
  SubmitLoss,
  Login,
  Referral,
  Cases,
  Invite
} from 'routes/sync'

// DEBUG: 直接导入 Crowdfund，绕过 syncComponent
import Crowdfund from 'pages/Crowdfund'
import Terms from 'pages/Terms'
import Privacy from 'pages/Privacy'

export const routes = [
  {
    path: '*',
    component: Root,
    children: [
      {
        index: true,
        component: Landing
      },
      {
        path: 'profile',
        component: Profile
      },
      {
        path: 'submit-loss',
        component: SubmitLoss
      },
      {
        path: 'referral',
        component: Referral
      },
      {
        path: 'my-case',
        component: Cases
      },
      {
        path: 'invite',
        component: Invite
      },
      {
        path: 'crowdfund',
        component: Crowdfund
      },
      {
        path: 'terms',
        component: Terms
      },
      {
        path: 'privacy',
        component: Privacy
      },
      {
        path: 'login',
        component: Login
      },
      {
        path: '*',
        component: NoMatch
      }
    ]
  }
]

export const RootRoutes = () => (
  <Routes>
    <Route path="*" element={<Root />}>
      <Route index element={<Landing />} />
      <Route path="profile" element={<Profile />} />
      <Route path="submit-loss" element={<SubmitLoss />} />
      <Route path="referral" element={<Referral />} />
      <Route path="my-case" element={<Cases />} />
      <Route path="invite" element={<Invite />} />
      <Route path="crowdfund" element={<Crowdfund />} />
      <Route path="terms" element={<Terms />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="login" element={<Login />} />
      <Route path="*" element={<NoMatch />} />
    </Route>
  </Routes>
)

export default RootRoutes
