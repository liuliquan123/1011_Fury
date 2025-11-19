import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Root from 'pages/Root'
import NoMatch from 'components/NoMatch'
import {
  Landing,
  Profile,
  SubmitLoss,
  Login
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
      <Route path="login" element={<Login />} />
      <Route path="*" element={<NoMatch />} />
    </Route>
  </Routes>
)

export default RootRoutes
