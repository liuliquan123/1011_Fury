import React, { useEffect, useState, useCallback, Fragment } from 'react'
import classNames from 'classnames'
import styles from './style.css'

const SubmitLoss = () => {
  const [stepIndex, setStepIndex] = useState(0)

  return (
    <div className={styles.submitLoss}>
      {stepIndex === 0 && (
        <div className={styles.step}>
          <div className={styles.title}>
            Submit Your Loss - Step 1
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
                      Open Binance App
                    </div>
                    <div className={styles.sectionStepTitleDescription}>
                      Navigate to Futures → History
                    </div>
                  </div>
                  <div className={styles.sectionStepTitleScreenShot}>

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
      )}
      <div className={styles.actions}>
        <div className={styles.backButton}>
          Back
        </div>
        <div className={styles.nextButton}>
          Continue
        </div>
      </div>
    </div>
  )
}

export default SubmitLoss
