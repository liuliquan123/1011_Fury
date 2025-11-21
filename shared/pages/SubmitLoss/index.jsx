import React, { useEffect, useState, useCallback, Fragment } from 'react'
import classNames from 'classnames'
import { withRouter } from 'utils/withRouter'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions/auth'
import binanceLogo from 'resources/images/logos/binance-logo.svg'
import okxLogo from 'resources/images/logos/okx-logo.svg'
import bybitLogo from 'resources/images/logos/bybit-logo.svg'
import bitgetLogo from 'resources/images/logos/bitget-logo.svg'
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

const SubmitLoss = ({ actions, exchangePhase, profile, ocrFor, historym }) => {
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [exchangeType, setExchangeType] = useState()
  const [file, setFile] = useState()
  const [stepIndex, setStepIndex] = useState(0)
  const isLoggedIn = !!profile && !!profile.id
  const phase = exchangePhase[getExchangeName(exchangeType)]

  const selectExchange = useCallback((exchangeType) => () => {
    setExchangeType(exchangeType)
    actions.getExchangePhase({ exchange: getExchangeName(exchangeType) })
  }, [])
  console.log('exchangePhase', exchangePhase, phase, ocrForm)

  const nextStep = useCallback(() => {
    if (stepIndex < 3) {
      setStepIndex(stepIndex + 1)
    }
  }, [stepIndex])

  const prevStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
    }
  }, [stepIndex])

  const updateEvidenceForm = useCallback(({ name, value }) => {

  }, [])

  const updateFile = useCallback((file) => {
    setFile(file)
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
      },
    })
  }, [file])

  const submitLoss = useCallback(() => {
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
  }, [file])

  const exchangeName = getExchangeName(exchangeType)

  return (
    <div className={styles.submitLoss}>
      {stepIndex === 0 && (
        <Fragment>
          <div className={styles.stepOne}>
            <div className={styles.title}>
              Submit Your Loss - Step 1
            </div>
            <div className={styles.sections}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  Select Exchange
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
                    [styles.success]: true
                  })}>
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
            <div className={styles.backButton} onClick={prevStep}>
              Back
            </div>
            <div className={classNames(styles.nextButton, {
              [styles.disabled]: !exchangeType
            })} onClick={nextStep}>
              Continue
            </div>
          </div>
        </Fragment>
      )}
      {stepIndex === 1 && (
        <Fragment>
          <div className={styles.stepTwo}>
            <div className={styles.title}>
              Submit Your Loss - Step 2
            </div>
            <div className={styles.sections}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  How to Get Your Loss Screenshot
                </div>
                <div className={styles.sectionDescription}>
                  Follow these steps to capture your trading loss evidence from Binance.
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
                    Important Requirements
                  </div>
                  <div className={styles.warningContent}>
                    <div className={styles.warningContentItem}>
                      Screenshot must show leverage trading (≥1x leverage)
                    </div>
                    <div className={styles.warningContentItem}>
                      Must show negative PNL (loss, not profit)
                    </div>
                    <div className={styles.warningContentItem}>
                      Must include exchange name, timestamp, and amounts
                    </div>
                    <div className={styles.warningContentItem}>
                      Use "Share Order" feature for best OCR recognition
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
                    AI-Powered Recognition
                  </div>
                  <div className={styles.listItemDescritipn}>
                    Our AI will automatically extract trading details from your screenshot
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemTitle}>
                    Review & Submit
                  </div>
                  <div className={styles.listItemDescritipn}>
                    You'll have a chance to review and edit the extracted information
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemTitle}>
                    Get Your Token
                  </div>
                  <div className={styles.listItemDescritipn}>
                    After approval, receive your exchange-specific token with unlock benefits
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <div className={styles.backButton} onClick={prevStep}>
              Back
            </div>
            <div className={styles.nextButton} onClick={nextStep}>
              Continue
            </div>
          </div>
        </Fragment>
      )}
      {stepIndex === 2 && (
        <Fragment>
          <div className={styles.stepThree}>
            <div className={styles.title}>
              Submit Your Loss - Step 3
            </div>
            <div className={styles.sections}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  Upload Evidence
                </div>
                <div className={styles.input}>
                  <input
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
                        PNG, JPG up to 10MB • OCR extraction enabled • Single file only
                      </div>
                    </Fragment>
                  )}
                  {!!file && (
                    <div className={styles.inputDescription}>
                      {file.name}
                    </div>
                  )}
                </div>
                <div className={styles.tip}>
                  <div className={styles.tipContent}>
                    <div className={styles.tipContentItem}>
                      Tip: Our AI will automatically extract trading data from your screenshot. You can review and edit the data in the next step. Only one file can be uploaded.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <div className={styles.backButton} onClick={prevStep}>
              Back
            </div>
            <div className={classNames(styles.nextButton, {
              [styles.disabled]: uploading
            })}  onClick={uploadFile}>
              Continue
            </div>
          </div>
        </Fragment>
      )}
      {stepIndex === 3 && (
        <Fragment>
          <div className={styles.stepFour}>
            <div className={styles.title}>
              Submit Your Loss - Step 4
            </div>
            <div className={styles.sections}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  Loss Info
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
            <div className={styles.backButton} onClick={prevStep}>
              Back
            </div>
            <div className={classNames(styles.nextButton, {
              [styles.disabled]: submitting
            })} onClick={submitLoss}>
              Submit
            </div>
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
      ocrForm: state.auth.ocrForm,
    }),
    dispatch => ({
      actions: bindActionCreators({
        ...actions
      }, dispatch)
    })
  )(SubmitLoss)
)
