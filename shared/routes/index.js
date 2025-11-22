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
        path: 'my-cases',
        component: Cases
      },
      {
        path: 'invite',
        component: Invite
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
      <Route path="my-cases" element={<Cases />} />
      <Route path="invite" element={<Invite />} />
      <Route path="login" element={<Login />} />
      <Route path="*" element={<NoMatch />} />
    </Route>
  </Routes>
)

export default RootRoutes
