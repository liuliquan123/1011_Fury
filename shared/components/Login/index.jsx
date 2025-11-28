import React, { useEffect, useState, useCallback, Fragment, useRef } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'utils/withRouter'
import classNames from 'classnames'
import * as actions from 'actions/auth'
import Spinner from 'resources/icons/Spinner'
import WalletSelector from 'components/WalletSelector'
import { toast } from 'react-toastify'
import { WALLET_CONNECTORS, AUTH_CONNECTION } from '@web3auth/modal'
import { debounce } from 'utils'
import { validateReferralCode } from 'utils/validateReferralCode'
import styles from './style.css'

const REFERRAL_CODE_REGEX = /^[A-Z0-9]{8}(?:-(?:BNB|OKX|BYB|BGT))?$/

const isIOSBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  return isIOS;
};

const isMobileBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  // Detect iOS or Android
  const isMobileOS = /Android|iPhone|iPad|iPod/i.test(ua);

  // Detect *regular* mobile browsers (Safari / Chrome / Firefox / Edge)
  const isRegularMobileBrowser =
    /(Mobile Safari|CriOS|FxiOS|EdgiOS|SamsungBrowser|Chrome|Firefox|Edge)/i.test(ua) && !/wv/i.test(ua); // exclude Android WebView

  return isMobileOS && isRegularMobileBrowser
};

const isWalletBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  // Known wallet identifiers (far from exhaustive, tweak for your user base)
  const walletRegex = /(MetaMaskMobile|MetaMask|Trust Wallet|TrustWallet|imToken|TokenPocket|MathWallet|BitKeep|CoinbaseWallet|Rainbow|Phantom)/i;

  const hasInjectedProvider =
    typeof window.ethereum !== "undefined" ||
    typeof window.web3 !== "undefined";

  // If a wallet name is in UA, or we have an injected provider *without* being a desktop browser extension
  console.log('isWalletBrowser', ua, walletRegex.test(ua))
  console.log('hasInjectedProvider', ua, hasInjectedProvider, /Android|iPhone|iPad/i.test(ua))
  return walletRegex.test(ua) // || (hasInjectedProvider && /Android|iPhone|iPad/i.test(ua));
};

const detectWalletBrowser = () => {
  if (typeof window === 'undefined') {
    return { inWallet: false, walletId: null, walletName: null }
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera

  if (window.okxwallet && /OKApp/i.test(ua)) {
    return { inWallet: true, walletId: 'okx', walletName: 'OKX Wallet' }
  }

  if ((window.trustwallet || /Trust/i.test(ua))) {
    return { inWallet: true, walletId: 'trust', walletName: 'Trust Wallet' }
  }

  if ((window.bitkeep?.ethereum || /BitKeep/i.test(ua))) {
    return { inWallet: true, walletId: 'bitget', walletName: 'Bitget Wallet' }
  }

  if (window.ethereum?.isCoinbaseWallet && /Coinbase/i.test(ua)) {
    return { inWallet: true, walletId: 'coinbase', walletName: 'Coinbase Wallet' }
  }

  if (window.BinanceChain && /Binance/i.test(ua)) {
    return { inWallet: true, walletId: 'binance', walletName: 'Binance Wallet' }
  }

  if (window.ethereum?.isMetaMask && /MetaMask/i.test(ua)) {
    return { inWallet: true, walletId: 'metamask', walletName: 'MetaMask' }
  }

  return { inWallet: false, walletId: null, walletName: null }
};

const detectAllWallets = () => {
  if (typeof window === 'undefined') return []

  const wallets = []

  if (window.okxwallet) {
    wallets.push({ id: 'okx', name: 'OKX Wallet', icon: '⭕' })
  }
  if (window.ethereum?.isMetaMask && !window.okxwallet) {
    wallets.push({ id: 'metamask', name: 'MetaMask', icon: '🦊' })
  }
  if (window.trustwallet) {
    wallets.push({ id: 'trust', name: 'Trust Wallet', icon: '🛡️' })
  }
  if (window.bitkeep?.ethereum) {
    wallets.push({ id: 'bitget', name: 'Bitget Wallet', icon: '💼' })
  }
  if (window.ethereum?.isCoinbaseWallet) {
    wallets.push({ id: 'coinbase', name: 'Coinbase Wallet', icon: '🟦' })
  }
  if (window.BinanceChain) {
    wallets.push({ id: 'binance', name: 'Binance Wallet', icon: '🟡' })
  }

  if (wallets.length === 0 && window.ethereum) {
    wallets.push({ id: 'ethereum', name: 'Browser Wallet', icon: '🔐' })
  }

  return wallets
};

const Login = ({ actions, code, onClick, onLoggedIn, onLoggedOut, onClose }) => {
  const [initializing, setInitializing] = useState(true)
  const [checked, setChecked] = useState(false)

  const [connectingWallet, setConnectingWallet] = useState(false)
  const [connectingTwitter, setConnectingTwitter] = useState(false)
  const [connectingEmail, setConnectingEmail] = useState(false)
  const [connectingTelegram, setConnectingTelegram] = useState(false)

  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState('')
  const [referralCode, setReferralCode] = useState(code || '')
  const [isOpen, setIsOpen] = useState(false)
  const [isNoted, setIsNoted] = useState(false)

  const [validationState, setValidationState] = useState({
    status: 'idle',
    message: '',
    referrerName: undefined
  })
  const [isLoginDisabled, setIsLoginDisabled] = useState(false)
  const referralCodeRef = useRef(referralCode)

  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [detectedWallets, setDetectedWallets] = useState([])
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const link = code
    ? `${baseUrl}/invite?code=${code}`
    : (typeof window !== 'undefined' ? window.location.href : baseUrl)

  const onModalContentClick = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const toggleAgreement = useCallback(() => {
    setChecked(!checked)
    console.log('toggleAgreement')
  }, [checked])

  const logout = useCallback(() => {
    actions.logout({
      onSuccess: () => {
        // history(code ? `/login?code=${code}` : '/login')
        // window.location.reload()
        if (onLoggedOut) onLoggedOut(code)
      }
    })
  }, [code])

  const validateReferralCodeDebounced = useCallback(
    debounce(async (codeToValidate) => {
      if (!codeToValidate || codeToValidate.trim() === '') {
        setValidationState({ status: 'idle', message: '' })
        setIsLoginDisabled(false)
        return
      }

      if (!REFERRAL_CODE_REGEX.test(codeToValidate)) {
        setValidationState({
          status: 'invalid',
          message: 'Invalid format. Use 8 characters (e.g., ABC12345 or ABC12345-BNB)'
        })
        setIsLoginDisabled(true)
        return
      }

      setValidationState({ status: 'validating', message: 'Verifying referral code...' })
      setIsLoginDisabled(true)

      try {
        const validation = await validateReferralCode(codeToValidate)

        if (codeToValidate !== referralCodeRef.current) return

        if (validation.isValid) {
          setValidationState({
            status: 'valid',
            message: validation.referrerName
              ? `Valid code from @${validation.referrerName}`
              : 'Valid referral code',
            referrerName: validation.referrerName
          })
          setIsLoginDisabled(false)
        } else {
          setValidationState({
            status: 'invalid',
            message: validation.error || 'Referral code does not exist. Please check with your referrer.'
          })
          setIsLoginDisabled(true)
        }
      } catch (err) {
        if (codeToValidate !== referralCodeRef.current) return

        console.error('[Register] Validation error:', err)

        // 所有验证失败（除了为空）都禁用登录
        setValidationState({
          status: 'invalid',
          message: 'Cannot login with an invalid referral code'
        })
        setIsLoginDisabled(true)
      }
    }, 500),
    []
  )

  const onReferralCodeChange = useCallback((event) => {
    if (!code) {
      const newCode = event.target.value.trim().toUpperCase()
      setReferralCode(newCode)
      referralCodeRef.current = newCode
      validateReferralCodeDebounced(newCode)
    }
  }, [code, validateReferralCodeDebounced])

  const onEmailChange = useCallback((event) => {
    setEmail(event.target.value)
  }, [])

  const authByEmail = useCallback(() => {
    if (isLoginDisabled) return

    console.log('[Referral] Email login with code:', referralCode)
    setConnectingEmail(true)

    actions.authByEmail({
      email,
      referralCode,
      onSuccess: () => {
        toast('Email Login Success!')
        setConnectingEmail(false)
        setEmail('')
        if (onLoggedIn) onLoggedIn()
      },
      onError: (message) => {
        toast(message)
        setConnectingEmail(false)
        setEmail('')
      }
    })
  }, [email, referralCode, isLoginDisabled])

  const authByWallet = useCallback(() => {
    if (isLoginDisabled) return

    const walletInfo = detectWalletBrowser()

    if (walletInfo.inWallet) {
      console.log('[Wallet] In-app browser detected:', walletInfo.walletName)
      console.log('[Referral] Wallet login with code:', referralCode)
      setConnectingWallet(true)
      actions.authByWallet({
        walletId: walletInfo.walletId,
        referralCode,
        isWalletBrowser: true,
        onSuccess: () => {
          toast('Wallet Login Success!')
          setConnectingWallet(false)
          if (onLoggedIn) onLoggedIn()
        },
        onError: (message) => {
          toast(message)
          setConnectingWallet(false)
        }
      })
      return
    }

    if (isMobileBrowser() && !isIOSBrowser() && !isWalletBrowser() && !isNoted) {
      setIsOpen(true)
      setIsNoted(true)
      return
    }

    const wallets = detectAllWallets()
    console.log('[Wallet] Detected', wallets.length, 'wallet(s) in browser')

    if (wallets.length === 0) {
      toast('No wallet detected. Please install a Web3 wallet.')
    } else if (wallets.length === 1) {
      console.log('[Wallet] Auto-selecting:', wallets[0].name)
      console.log('[Referral] Wallet login with code:', referralCode)
      setConnectingWallet(true)
      actions.authByWallet({
        walletId: wallets[0].id,
        referralCode,
        isWalletBrowser: false,
        onSuccess: () => {
          toast('Wallet Login Success!')
          setConnectingWallet(false)
          if (onLoggedIn) onLoggedIn()
        },
        onError: (message) => {
          toast(message)
          setConnectingWallet(false)
        }
      })
    } else {
      console.log('[Wallet] Showing selector')
      setDetectedWallets(wallets)
      setShowWalletSelector(true)
    }
  }, [referralCode, isNoted, onLoggedIn, isLoginDisabled])

  const onWalletSelected = useCallback((wallet) => {
    console.log('[Wallet] User selected:', wallet.name)
    console.log('[Referral] Wallet login with code:', referralCode)
    setShowWalletSelector(false)
    setConnectingWallet(true)
    actions.authByWallet({
      walletId: wallet.id,
      referralCode,
      isWalletBrowser: false,
      onSuccess: () => {
        toast('Wallet Login Success!')
        setConnectingWallet(false)
        if (onLoggedIn) onLoggedIn()
      },
      onError: (message) => {
        toast(message)
        setConnectingWallet(false)
      }
    })
  }, [referralCode, onLoggedIn])

  const authByTwitter = useCallback(() => {
    if (isLoginDisabled) return

    setConnectingTwitter(true)

    actions.authByTwitter({
      referralCode,
      onSuccess: () => {
        toast('Twitter Login Success!')
        setConnectingTwitter(false)
        if (onLoggedIn) onLoggedIn()
      },
      onError: (message) => {
        toast(message)
        setConnectingTwitter(false)
      }
    })
  }, [referralCode, isLoginDisabled])

  const authByTelegram = useCallback(() => {
    if (isLoginDisabled) return

    setConnectingTelegram(true)

    actions.authByTelegram({
      referralCode,
      onSuccess: () => {
        toast('Telegram Login Success!')
        setConnectingTelegram(false)
        if (onLoggedIn) onLoggedIn()
      },
      onError: (message) => {
        toast(message)
        setConnectingTelegram(false)
      }
    })
  }, [referralCode, isLoginDisabled])

  useEffect(() => {
    setInitializing(true)

    actions.initWeb3Auth({
      onSuccess: () => {
        setInitializing(false)
      },
      onError: (message) => {
        setInitializing(false)
      }
    })
  }, [])

  useEffect(() => {
    if (code) {
      console.log('[Referral] Code from URL:', code)
    }
  }, [code])

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeModal = useCallback((event) => {
    setIsOpen(false)
  }, [])

  const handleCopyLink = useCallback(() => {
    try {
      navigator.clipboard.writeText(link);
      toast('Copied!')
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [link])

  if (initializing) {
    return (
      <div className={styles.login} onClick={onClick}>
        <div className={styles.container}>
          <div className={styles.status}>
            Initializing...
          </div>
        </div>
      </div>
    )
  }

  if (connectingWallet) {
    return (
      <div className={styles.login} onClick={onClick}>
        <div className={styles.container}>
          <div className={styles.status}>
            Connecting Wallet...
          </div>
          <div className={styles.cancelButton} onClick={logout}>
            Cancel
          </div>
        </div>
      </div>
    )
  }

  if (connectingTwitter) {
    return (
      <div className={styles.login} onClick={onClick}>
        <div className={styles.container}>
          <div className={styles.status}>
            Connecting X...
          </div>
        </div>
      </div>
    )
  }

  if (connectingTelegram) {
    return (
      <div className={styles.login} onClick={onClick}>
        <div className={styles.container}>
          <div className={styles.status}>
            Connecting Telegram...
          </div>
          <div className={styles.cancelButton} onClick={logout}>
            Cancel
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.login} onClick={onClick}>
      {showWalletSelector && (
        <WalletSelector
          wallets={detectedWallets}
          onSelect={onWalletSelected}
          onClose={() => setShowWalletSelector(false)}
        />
      )}
      {(isOpen) && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.note} onClick={onModalContentClick}>
            <div className={styles.title}>
              Open in Your Wallet App
            </div>
            <div className={styles.text}>
              For the best experience, please open this page in your wallet app's built-in browser. We recommend OKX Wallet, Bitget Wallet, or TokenPocket.
            </div>
            <div className={styles.link}>{link}</div>
            <div className={styles.buttons}>
              <div className={styles.copyButton} onClick={handleCopyLink}>
                Copy Link
              </div>
              <div className={styles.nextButton} onClick={closeModal}>
                I understand, continue anyway.
              </div>
            </div>
          </div>
        </div>
      )}
      {onClose && (
        <div className={styles.closeButton} onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      )}
      <div className={styles.title}>
        They Took Control. We Take It Back
      </div>
      <div className={styles.subtitle}>
        Login to continue
      </div>
      <div className={styles.form}>
        <div className={classNames(styles.field, styles.referral)}>
          <div className={classNames(
            styles.input,
            validationState.status === 'valid' && styles.inputValid,
            validationState.status === 'invalid' && styles.inputInvalid
          )}>
            <input
              type="text"
              value={referralCode}
              onChange={onReferralCodeChange}
            />
            {!referralCode && (
              <div className={styles.placeholder}>
                Advocate’s Code
              </div>
            )}
          </div>
          {validationState.status !== 'idle' && validationState.message && (
            <div className={classNames(
              styles.validationMessage,
              styles[`validation${validationState.status.charAt(0).toUpperCase() + validationState.status.slice(1)}`]
            )}>
              {validationState.status === 'validating' && <Spinner />}
              {validationState.message}
            </div>
          )}
          {validationState.status === 'invalid' && (
            <div className={styles.errorTip}>
              ⚠️ Cannot login with an invalid referral code
            </div>
          )}
        </div>
      </div>
      <div className={styles.checks} onClick={toggleAgreement}>
        <div className={styles.inputIcon}>
          <input type="checkbox" checked={checked} onChange={toggleAgreement} />
        </div>
        <div className={styles.inputText}>
          I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
        </div>
      </div>
      <div className={styles.separator}>
        <div className={styles.separatorLine}></div>
        <div className={styles.separatorText}>or</div>
      </div>
      <div className={styles.loginMethodLabel}>
        Login Method
      </div>
      <div className={styles.providers}>
        {showEmailInput && (
          <div className={styles.provider}>
            <div className={styles.form}>
              <div className={classNames(styles.field, styles.referral)}>
                <div className={styles.input}>
                  <input
                    type="text"
                    value={email}
                    onChange={onEmailChange}
                  />
                  <div className={classNames(styles.submit, { [styles.disabled]: !email || isLoginDisabled })} onClick={authByEmail}>
                    {connectingEmail && (
                      <Spinner />
                    )}
                    {!connectingEmail && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                        <path d="M14.272 5.48209C14.3215 5.53372 14.3599 5.59201 14.3894 5.65334C14.4053 5.68642 14.418 5.72074 14.428 5.75554C14.4335 5.77454 14.4402 5.79353 14.4439 5.81285C14.484 6.02032 14.4236 6.24327 14.263 6.40395L8.98455 11.6824C8.72737 11.9396 8.31027 11.9401 8.05302 11.6831C7.79607 11.4258 7.79587 11.008 8.05302 10.7509L12.4358 6.36804L0.65878 6.36873C0.295167 6.36873 0.000307519 6.07351 1.08056e-05 5.70996C1.06422e-05 5.34617 0.294985 5.05119 0.65878 5.05119L11.9787 5.0505L8.05233 1.12413C7.79558 0.866846 7.79594 0.449676 8.05302 0.192598C8.31011 -0.0643469 8.72662 -0.0641074 8.98386 0.192598L14.2637 5.47242C14.2666 5.47532 14.2692 5.47911 14.272 5.48209Z" fill="black">
                        </path>
                      </svg>
                    )}

                  </div>
                  {!email && (
                    <div className={styles.placeholder}>
                      Enter email address
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {!showEmailInput && (
          <div
            className={classNames(styles.provider, { [styles.disabled]: isLoginDisabled })}
            onClick={isLoginDisabled ? null : () => setShowEmailInput(true)}
          >
            EMAIL
          </div>
        )}
        <div className={classNames(styles.provider, { [styles.disabled]: isLoginDisabled })} onClick={authByWallet}>
          WALLET
        </div>
        <div className={classNames(styles.provider, { [styles.disabled]: isLoginDisabled })} onClick={authByTwitter}>
          X
        </div>
        <div className={classNames(styles.provider, { [styles.disabled]: isLoginDisabled })} onClick={authByTelegram}>
          TELEGRAM
        </div>
      </div>
    </div>
  )
}

export default connect(
  state => ({

  }),
  dispatch => ({
    actions: bindActionCreators({
      ...actions
    }, dispatch)
  })
)(Login)
