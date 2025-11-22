import { asyncComponent } from 'components/DynamicComponent'

export const Landing = asyncComponent(() => import('pages/Landing'/* webpackChunkName: 'Landing' */))
export const Profile = asyncComponent(() => import('pages/Profile'/* webpackChunkName: 'Profile' */))
export const SubmitLoss = asyncComponent(() => import('pages/SubmitLoss'/* webpackChunkName: 'SubmitLoss' */))
export const Login = asyncComponent(() => import('pages/Login'/* webpackChunkName: 'Login' */))
export const Cases = asyncComponent(() => import('pages/Cases'/* webpackChunkName: 'Cases' */))
export const Referral = asyncComponent(() => import('pages/Referral'/* webpackChunkName: 'Referral' */))
export const Invite = asyncComponent(() => import('pages/Invite'/* webpackChunkName: 'Invite' */))
