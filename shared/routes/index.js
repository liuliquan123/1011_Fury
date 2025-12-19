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

// Crowdfund 功能（入口隐藏，但链接可访问）
import Crowdfund from 'pages/Crowdfund'
import Terms from 'pages/Terms'
import Privacy from 'pages/Privacy'
import LpStaking from 'pages/LpStaking'

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
      /* 隐藏 Crowdfund 路由
      {
        path: 'crowdfund',
        component: Crowdfund
      },
      */
      {
        path: 'terms',
        component: Terms
      },
      {
        path: 'privacy',
        component: Privacy
      },
      {
        path: 'lp-staking',
        component: LpStaking
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
      <Route path="lp-staking" element={<LpStaking />} />
      <Route path="login" element={<Login />} />
      <Route path="*" element={<NoMatch />} />
    </Route>
  </Routes>
)

export default RootRoutes
