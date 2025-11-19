import React, { useEffect, useState, useCallback, Fragment } from 'react'
import classNames from 'classnames'
import styles from './style.css'

const Profile = () => {
  return (
    <div className={styles.profile}>
      <div className={styles.title}>
        <div className={styles.text}>
          Profile
        </div>
        <div className={styles.description}>
          Manage your account and view your activity
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.account}>
          <div className={styles.user}>
            <div className={styles.top}>
              <div className={styles.logo}></div>
              <div className={styles.name}>demo_wallet_user</div>
              <div className={styles.description}>N/A</div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <div className={styles.listItemName}>
                    Login Type
                  </div>
                  <div className={styles.listItemContent}>
                    Wallet
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemName}>
                    Wallet
                  </div>
                  <div className={styles.listItemContent}>
                    Ox742d……ObEb
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemName}>
                    Member Since
                  </div>
                  <div className={styles.listItemContent}>
                    2025-10-24
                  </div>
                </div>
              </div>
              <div className={styles.button}>
                Edit PROFILE
              </div>
            </div>
          </div>
          <div className={styles.tokenSection}>
            <div className={styles.locked}>
              <div className={styles.text}>Token Locked</div>
              <div className={styles.tokens}>
                <div className={styles.token}>
                  <div className={styles.tokenLogo}></div>
                  <div className={styles.tokenAmount}>888,888</div>
                  <div className={styles.tokenLockTime}>
                    <div className={styles.tokenLockTimeName}>
                      Remaining
                    </div>
                    <div className={styles.tokenLockTimeContent}>
                      <div className={styles.tokenLockTimeContentCellNumber}>00</div>
                      <div className={styles.tokenLockTimeContentCellText}>D</div>
                      <div className={styles.tokenLockTimeContentCellNumber}>01</div>
                      <div className={styles.tokenLockTimeContentCellText}>H</div>
                      <div className={styles.tokenLockTimeContentCellNumber}>07</div>
                      <div className={styles.tokenLockTimeContentCellText}>M</div>
                      <div className={styles.tokenLockTimeContentCellNumber}>17</div>
                      <div className={styles.tokenLockTimeContentCellText}>S</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.progress}>
                <div className={styles.percentage}>

                </div>
              </div>
              <div className={styles.actionButtons}>
                <div className={styles.actionButton}>
                  Accelerate Unlock
                </div>
                <div className={styles.actionButtonDark}>
                  Connect Wallet
                </div>
              </div>
            </div>
            <div className={styles.statistic}>
              <div className={styles.statisticTitle}>
                Account Statistics
              </div>
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    3
                  </div>
                  <div className={styles.listItemName}>
                    Cases
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    5
                  </div>
                  <div className={styles.listItemName}>
                    Evidence
                  </div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listItemNumber}>
                    12
                  </div>
                  <div className={styles.listItemName}>
                    Referrals
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.actionTitle}>
            Quick Actions
          </div>
          <div className={styles.list}>
            <div className={styles.listItem}>
              submit new loss
            </div>
            <div className={styles.listItem}>
              view referral program
            </div>
            <div className={styles.listItem}>
              my cases
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
