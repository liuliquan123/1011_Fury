import React, { useEffect, useState, useCallback, useRef, Fragment } from 'react'
import classNames from 'classnames'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import binanceLogo from 'resources/images/logos/binance-logo.svg'
import okxLogo from 'resources/images/logos/okx-logo.svg'
import bybitLogo from 'resources/images/logos/bybit-logo.svg'
import bitgetLogo from 'resources/images/logos/bitget-logo.svg'
import Modal from 'react-modal'
import LoginModal from 'components/Login'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import binanceScreenshotStep1 from 'resources/images/screenshots/binance/binance-step1.jpeg'
import binanceScreenshotStep2 from 'resources/images/screenshots/binance/binance-step2.jpeg'
import binanceScreenshotStep3 from 'resources/images/screenshots/binance/binance-step3.jpeg'
import binanceScreenshotStep4 from 'resources/images/screenshots/binance/binance-step4.jpeg'

import okxScreenshotStep1 from 'resources/images/screenshots/okx/okx-step1.jpeg'
import okxScreenshotStep2 from 'resources/images/screenshots/okx/okx-step2.jpeg'
import okxScreenshotStep3 from 'resources/images/screenshots/okx/okx-step3.jpeg'
import okxScreenshotStep4 from 'resources/images/screenshots/okx/okx-step4.jpeg'

import bybitScreenshotStep1 from 'resources/images/screenshots/bybit/bybit-step1.jpeg'
import bybitScreenshotStep2 from 'resources/images/screenshots/bybit/bybit-step2.jpeg'
import bybitScreenshotStep3 from 'resources/images/screenshots/bybit/bybit-step3.jpeg'
import bybitScreenshotStep4 from 'resources/images/screenshots/bybit/bybit-step4.jpeg'

import bitgetScreenshotStep1 from 'resources/images/screenshots/bitget/bitget-step1.jpeg'
import bitgetScreenshotStep2 from 'resources/images/screenshots/bitget/bitget-step2.jpeg'
import bitgetScreenshotStep3 from 'resources/images/screenshots/bitget/bitget-step3.jpeg'
import bitgetScreenshotStep4 from 'resources/images/screenshots/bitget/bitget-step4.jpeg'

import styles from './style.css'

const getExchangeName = (exchangeType) => {
  if (exchangeType === 'binance') {
    return 'Binance'
  } else if (exchangeType === 'okx') {
    return 'OKX'
  } else if (exchangeType === 'bybit') {
    return 'Bybit'
  } else if (exchangeType === 'bitget') {
    return 'Bitget'
  }

  return ''
}

const getExchangeScreenUrl = (exchangeType, stepIndex) => {
  if (stepIndex === 1) {
    if (exchangeType === 'binance') {
      return binanceScreenshotStep1
    } else if (exchangeType === 'okx') {
      return okxScreenshotStep1
    } else if (exchangeType === 'bybit') {
      return bybitScreenshotStep1
    } else if (exchangeType === 'bitget') {
      return bitgetScreenshotStep1
    }

    return ''
  } else if (stepIndex === 2) {
    if (exchangeType === 'binance') {
      return binanceScreenshotStep2
    } else if (exchangeType === 'okx') {
      return okxScreenshotStep2
    } else if (exchangeType === 'bybit') {
      return bybitScreenshotStep2
    } else if (exchangeType === 'bitget') {
      return bitgetScreenshotStep2
    }

    return ''
  } else if (stepIndex === 3) {
    if (exchangeType === 'binance') {
      return binanceScreenshotStep3
    } else if (exchangeType === 'okx') {
      return okxScreenshotStep3
    } else if (exchangeType === 'bybit') {
      return bybitScreenshotStep3
    } else if (exchangeType === 'bitget') {
      return bitgetScreenshotStep3
    }

    return ''
  } else if (stepIndex === 4) {
    if (exchangeType === 'binance') {
      return binanceScreenshotStep4
    } else if (exchangeType === 'okx') {
      return okxScreenshotStep4
    } else if (exchangeType === 'bybit') {
      return bybitScreenshotStep4
    } else if (exchangeType === 'bitget') {
      return bitgetScreenshotStep4
    }

    return ''
  }
}

const SubmitLoss = ({ actions, exchangePhase, phasesLocked, profile, ocrForm, history }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [referralCode, setReferralCode] = useState(searchParams.get('code') || '')

  const [uploadError, setUploadError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [exchangeType, setExchangeType] = useState()
  const [loadingPhase, setLoadingPhase] = useState(false)
  const [file, setFile] = useState()
  const [previewUrl, setPreviewUrl] = useState()
  const [stepIndex, setStepIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef(null)

  // 每次步骤发生变化时，自动滚动到页面顶部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [stepIndex])

  const isLoggedIn = !!profile && !!profile.id
  const phase = exchangePhase[getExchangeName(exchangeType)]
  const phaseLocked = phasesLocked[getExchangeName(exchangeType)]

  // 检查当前阶段是否已提交
  const hasSubmittedInCurrentPhase = phase && phase.user_submission_status && isLoggedIn
    ? phase.user_submission_status[`phase_${phase.current_phase}`]
    : false

  const selectExchange = useCallback((exchangeType) => () => {
    setExchangeType(exchangeType)
    setLoadingPhase(true)
    actions.getExchangePhase({ exchange: getExchangeName(exchangeType) })
  }, [])

  console.log('exchangePhase', exchangePhase, phase, ocrForm)
  console.log('isLoggedIn', isLoggedIn, profile)
  console.log('phaseLocked', phasesLocked, getExchangeName(exchangeType), !!phaseLocked)

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeModal = useCallback((event) => {
    setIsOpen(false)
  }, [])

  const nextStep = useCallback(() => {
    if (stepIndex < 3) {
      setStepIndex(stepIndex + 1)
    }
  }, [stepIndex])

  const prevStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
    } else {
      // 在 Step 0 (Select Exchange)，返回首页
      history('/')
    }
  }, [stepIndex, history])

  const updateEvidenceForm = useCallback(({ name, value }) => {

  }, [])

  const updateFile = useCallback((file) => {
    setFile(file)
    setUploadError(false)
    const previewUrl = URL.createObjectURL(file)
    setPreviewUrl(previewUrl)
    console.log('set file', file, previewUrl)
  }, [])

  const uploadFile = useCallback(() => {
    setUploading(true)
    actions.uploadEvidenceOcr({
      file,
      onSuccess: () => {
        setUploading(false)
        nextStep()
      },
      onError: (message) => {
        setUploading(false)
        toast(message)
        setUploadError(message)
      },
    })
  }, [file, isLoggedIn])

  const submitLoss = useCallback(() => {
    console.log('submit isLoggedIn', isLoggedIn)
    if (!isLoggedIn) {
      setIsOpen(true)
    } else {
      setSubmitting(true)
      actions.submitLoss({
        onSuccess: () => {
          setSubmitting(false)
          toast('Submit loss sucess!')
          setFile()
          history('/profile')
        },
        onError: (message) => {
          setSubmitting(false)
          toast(message)
        },
      })
    }
  }, [file, isLoggedIn])

  useEffect(() => {
    // 当 phase 数据加载完成时，取消 loading 状态
    if (exchangeType && phase) {
      setLoadingPhase(false)
    }
  }, [phase, exchangeType])

  const onModalClick = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const onLoggedIn = useCallback((event) => {
    setIsOpen(false)
    actions.getProfile()
  }, [])

  const exchangeName = getExchangeName(exchangeType)

  return (
    <div className={styles.submitLoss}>
      {(isOpen && !isLoggedIn) && (
        <div className={styles.modal} onClick={closeModal}>
          <LoginModal
            code={referralCode}
            onClick={onModalClick}
            onLoggedIn={onLoggedIn}
            onClose={closeModal}
          />
        </div>
      )}
      {stepIndex === 0 && (
        <Fragment>
          <div className={styles.stepOne}>
            <div className={styles.title}>
              Step 1: Name the Exchange
            </div>
            <div className={styles.sections}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  Exchanges currently eligible for claims
                </div>
                <div className={styles.exchanges}>
                  <div
                    className={classNames(styles.exchange, {
                      [styles.selected]: exchangeType === 'binance'
                    })}
                    onClick={selectExchange('binance')}
                  >
                    <div className={styles.exchangeLogo}>
                      <img src={binanceLogo} alt={`binance logo`} />
                    </div>
                    <div className={styles.exchangeName}>Binance</div>
                  </div>
                  <div
                    className={classNames(styles.exchange, {
                      [styles.selected]: exchangeType === 'okx'
                    })}
                    onClick={selectExchange('okx')}
                  >
                    <div className={styles.exchangeLogo}>
                      <img src={okxLogo} alt={`okx logo`} />
                    </div>
                    <div className={styles.exchangeName}>OKX</div>
                  </div>
                  <div
                    className={classNames(styles.exchange, {
                      [styles.selected]: exchangeType === 'bybit'
                    })}
                    onClick={selectExchange('bybit')}
                  >
                    <div className={styles.exchangeLogo}>
                      <img src={bybitLogo} alt={`bybit logo`} />
                    </div>
                    <div className={styles.exchangeName}>Bybit</div>
                  </div>
                  <div
                    className={classNames(styles.exchange, {
                      [styles.selected]: exchangeType === 'bitget'
                    })}
                    onClick={selectExchange('bitget')}
                  >
                    <div className={styles.exchangeLogo}>
                      <img src={bitgetLogo} alt={`bitget logo`} />
                    </div>
                    <div className={styles.exchangeName}>Bitget</div>
                  </div>
                </div>
                {phase && (
                  <div className={classNames(styles.notification, {
                    [styles.error]: !!phaseLocked || hasSubmittedInCurrentPhase
                  })}>
                    {hasSubmittedInCurrentPhase && (
                      <div className={styles.warningText}>
                        You've already submitted for this exchange in Phase {phase.current_phase}. Please wait for the next phase to submit again.
                      </div>
                    )}
                    <div className={styles.notificationTitle}>
                      {phase.phase_info.description}
                    </div>
                    <div className={styles.notificationContent}>
                      <div className={styles.notificationContentItem}>
                        Current Stage: {phase.current_phase}/3
                      </div>
                      <div className={styles.notificationContentItem}>
                        Submissions in this stage: {phase.phase_info.current_submissions}/{phase.phase_info.max_submissions}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.backButton} onClick={prevStep}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.text)}>back</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
            <button className={classNames(styles.nextButton, {
              [styles.disabled]: !exchangeType || loadingPhase || !!phaseLocked || hasSubmittedInCurrentPhase
            })} onClick={!exchangeType || loadingPhase || !!phaseLocked || hasSubmittedInCurrentPhase ? null : nextStep}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.text)}>{loadingPhase ? 'LOADING...' : 'CONTINUE'}</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
          </div>
        </Fragment>
      )}
      {stepIndex === 1 && (
        <Fragment>
          <div className={styles.stepTwo}>
            <div className={styles.title}>
              Step 2: Gather Your Proof
            </div>
            <div className={styles.sections}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  Tips For Evidence Gathering
                </div>
                <div className={styles.sectionDescription}>
                  Follow these steps to capture your trading loss evidence from CEX and submit.
                </div>
                <div className={styles.sectionSteps}>
                  <div className={styles.sectionStep}>
                    <div className={styles.sectionStepInfo}>
                      <div className={styles.sectionStepTitle}>
                        Open {exchangeName} App
                      </div>
                      <div className={styles.sectionStepTitleDescription}>
                        Navigate to Futures → History
                      </div>
                    </div>
                    <div className={styles.sectionStepTitleScreenShot}>
                      <img src={getExchangeScreenUrl(exchangeType, 1)} alt={`${exchangeName} Step1`} />
                    </div>
                  </div>
                  <div className={styles.sectionStep}>
                    <div className={styles.sectionStepInfo}>
                      <div className={styles.sectionStepTitle}>
                        Select "Completed Orders"
                      </div>
                      <div className={styles.sectionStepTitleDescription}>
                        Switch to the completed trading records list
                      </div>
                    </div>
                    <div className={styles.sectionStepTitleScreenShot}>
                      <img src={getExchangeScreenUrl(exchangeType, 2)} alt={`${exchangeName} Step2`} />
                    </div>
                  </div>
                  <div className={styles.sectionStep}>
                    <div className={styles.sectionStepInfo}>
                      <div className={styles.sectionStepTitle}>
                        Find Your Loss Record
                      </div>
                      <div className={styles.sectionStepTitleDescription}>
                        Look for leverage trades with negative PNL (red)
                      </div>
                    </div>

                    <div className={styles.sectionStepTitleScreenShot}>
                      <img src={getExchangeScreenUrl(exchangeType, 3)} alt={`${exchangeName} Step3`} />
                    </div>
                  </div>
                  <div className={styles.sectionStep}>
                    <div className={styles.sectionStepInfo}>
                      <div className={styles.sectionStepTitle}>
                        Generate Screenshot
                      </div>
                      <div className={styles.sectionStepTitleDescription}>
                        Tap "Share" button to generate a screenshot with complete info
                      </div>
                    </div>
                    <div className={styles.sectionStepTitleScreenShot}>
                      <img src={getExchangeScreenUrl(exchangeType, 4)} alt={`${exchangeName} Step4`} />
                    </div>
                  </div>
                </div>
                <div className={styles.warning}>
                  <div className={styles.warningTitle}>
                    Kindly Reminders
                  </div>
                  <div className={styles.warningContent}>
                    <div className={styles.warningContentItem}>
                      Only image uploads are supported for now.
                    </div>
                    <div className={styles.warningContentItem}>
                      The screenshot must clearly show negative PnL (a real loss).
                    </div>
                    <div className={styles.warningContentItem}>
                      Blurry, cropped, or edited images may fail verification.
                    </div>
                    <div className={styles.warningContentItem}>
                      Use "Share Order" feature for best OCR recognition
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.backButton} href="" tabIndex={0} role="button " onClick={prevStep}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.text)}>back</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
            <button className={styles.nextButton} onClick={nextStep}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.text)}>CONTINUE</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
          </div>
        </Fragment>
      )}
      {stepIndex === 2 && (
        <Fragment>
          <div className={styles.stepThree}>
            <div className={styles.title}>
              Step 3: Send Your Proof
            </div>
            <div className={styles.sections}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  Upload Your Photo
                </div>
                <div className={styles.input}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateFile(e.target.files[0])}
                  />
                  {!file && (
                    <Fragment>
                      <div className={styles.inputIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <path d="M16 12H28V16H16V28H12V16H0V12H12V0H16V12Z" fill="white"/>
                        </svg>
                      </div>
                      <div className={styles.inputButton}>
                        Click to upload
                      </div>
                      <div className={styles.inputDescription}>
                        PNG, JPG up to 10MB
                      </div>
                      <div className={styles.inputDescription}>
                        · Single file only
                      </div>
                    </Fragment>
                  )}
                  {!!file && (
                    <Fragment>
                      <div className={styles.imagePreview}>
                        <img src={previewUrl} alt="image preview" />
                      </div>
                      <div className={styles.inputDescription}>
                        {file.name}
                      </div>
                    </Fragment>
                  )}
                  
                  {uploadError && (
                    <div className={styles.uploadErrorOverlay}>
                      <div className={styles.overlayContent}>
                        <div className={styles.overlayErrorIcon}>❌</div>
                        <div className={styles.overlayErrorTitle}>Upload Failed</div>
                        <div className={styles.overlayErrorMessage}>{uploadError}</div>
                        <button 
                          className={styles.overlayRetryButton}
                          onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.tip}>
                  <div className={styles.tipContent}>
                    <div className={styles.tipContentItem}>
                      All evidence is encrypted and saved securely on-chain. Your privacy is protected.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.questions}>
              <div className={styles.questionsTitle}>
                What Happens Next?
              </div>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <div className={styles.listItemTitle}>
                    1. AI Evidence Check
                  </div>
                  <div className={styles.listItemDescritipn}>
                    AI will verify whether your screenshot is valid.
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemTitle}>
                    2. Confirm & Submit
                  </div>
                  <div className={styles.listItemDescritipn}>
                    If AI passes, confirm extracted details and submit to file your case.
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemTitle}>
                    3. Waiting For Claim
                  </div>
                  <div className={styles.listItemDescritipn}>
                    Get the exchange-specific token — tradable and tied to future case payouts.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.backButton} onClick={prevStep}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.text)}>back</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
            <button className={classNames(styles.nextButton, {
              [styles.disabled]: uploading || !file
            })} onClick={uploading ? null : (!file ? null : uploadFile)}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.text)}>{uploading ? 'UPLOADING' : 'CONTINUE'}</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
          </div>
        </Fragment>
      )}
      {stepIndex === 3 && (
        <Fragment>
          <div className={styles.stepFour}>
            <div className={styles.title}>
              Confirm Your Rights
            </div>
            <div className={styles.sections}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  Claimed Details
                </div>
                <div className={styles.form}>
                  <div className={styles.field}>
                    <div className={styles.name}>
                      Exchange
                    </div>
                    <div className={styles.input}>
                      <input
                        className={styles.disabled}
                        type="text" value={ocrForm.exchange || ''} />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <div className={styles.name}>
                      Loss Date*
                    </div>
                    <div className={styles.input}>
                      <input
                        className={styles.disabled}
                        type="text"
                        value={ocrForm.loss_date || ''}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <div className={styles.name}>
                      Loss Amount (USD)*
                    </div>
                    <div className={styles.input}>
                      <input
                        className={styles.disabled}
                        type="text"
                        value={ocrForm.loss_amount || ''}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <div className={styles.name}>
                      Leverage *
                    </div>
                    <div className={styles.input}>
                      <input
                        className={styles.disabled}
                        type="text"
                        value={ocrForm.leverage || ''}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <div className={styles.name}>
                      User Note (Optional)
                    </div>
                    <div className={styles.input}>
                      <input
                        type="text"
                        value={ocrForm.user_note || ''}
                        onChange={(e) => actions.updateOcrForm({
                          user_note: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.backButton} onClick={prevStep}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.text)}>back</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
            <button className={classNames(styles.nextButton, {
              [styles.disabled]: submitting
            })} onClick={submitLoss}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.text)}>{uploading ? 'SUBMITTING' : 'SUBMIT'}</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </button>
          </div>
        </Fragment>
      )}

    </div>
  )
}

export default withRouter(
  connect(
    state => ({
      exchangePhase: state.auth.exchangePhase,
      phasesLocked: state.auth.phasesLocked,
      profile: state.auth.profile,
      ocrForm: state.auth.ocrForm,
    }),
    dispatch => ({
      actions: bindActionCreators({
        ...actions
      }, dispatch)
    })
  )(SubmitLoss)
)
