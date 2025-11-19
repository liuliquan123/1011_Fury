import { asyncComponent } from 'components/DynamicComponent'

export const Landing = asyncComponent(() => import('pages/Landing'/* webpackChunkName: 'Landing' */))
export const Profile = asyncComponent(() => import('pages/Profile'/* webpackChunkName: 'Profile' */))
export const SubmitLoss = asyncComponent(() => import('pages/SubmitLoss'/* webpackChunkName: 'SubmitLoss' */))
export const Login = asyncComponent(() => import('pages/Login'/* webpackChunkName: 'Login' */))
