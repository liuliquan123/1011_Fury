import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import styles from './style.css'

const Landing = () => {
  return (
    <div className={styles.landing}>
      <div className={styles.banner}>
        <div className={styles.content}>
          <div className={styles.title}>
            Gate Welcome to Satoshi's Fury
          </div>
          <div className={styles.text}>
            Join thousands fighting for justice in the crypto space
          </div>
          <Link className={styles.button} to="/submit-loss">
            <div className={classNames(styles.leftArrow)}>{">"}</div>
            <div className={classNames(styles.text)}>SUBMIT YOUR LOSS</div>
            <div className={classNames(styles.rightArrow)}>{"<"}</div>
          </Link>
        </div>
      </div>
      <div className={styles.sections}>
        <div className={classNames(styles.section, styles.platform)}>
          <div className={styles.sectionTitle}>
            _> platform-statistics
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.statistic}>
              <div className={styles.statisticNumber}>
                12
              </div>
              <div className={styles.statisticName}>
                Active Cases
              </div>
            </div>
            <div className={styles.statistic}>
              <div className={styles.statisticNumber}>
                27,100
              </div>
              <div className={styles.statisticName}>
                Participants
              </div>
            </div>
            <div className={styles.statistic}>
              <div className={styles.statisticNumber}>
                $101.5M
              </div>
              <div className={styles.statisticName}>
                Total Damage
              </div>
            </div>
            <div className={styles.statistic}>
              <div className={styles.statisticNumber}>
                1250K
              </div>
              <div className={styles.statisticName}>
                Token Distributed
              </div>
            </div>
          </div>
        </div>
        <div className={classNames(styles.section, styles.featured)}>
          <div className={styles.sectionTitle}>
            _> Featured Cases
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.cases}>
              <div className={styles.case}>
                <div className={styles.caseTitle}>
                  <div className={styles.text}>Binance BTC/USDT - Illegal Contract Liquidation</div>
                  <div className={styles.status}>Under Legal Review</div>
                </div>
                <div className={styles.caseCards}>
                  <div className={styles.caseCard}>
                    <div className={styles.caseContent}>
                      Binance
                    </div>
                    <div className={styles.caseName}>
                      Exchange
                    </div>
                  </div>
                  <div className={styles.caseCard}>
                    <div className={styles.caseContent}>
                      12,547
                    </div>
                    <div className={styles.caseName}>
                      Participants
                    </div>
                  </div>
                  <div className={styles.caseCard}>
                    <div className={styles.caseContent}>
                      $18.5M
                    </div>
                    <div className={styles.caseName}>
                      Total Damage
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.pagination}>
              <div className={styles.paginationContent}>
                <div className={styles.leftButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                    <path d="M0.113852 5.56483C0.103751 5.57951 0.0957266 5.59583 0.0869215 5.6111C0.0387433 5.69507 0.0108409 5.78666 0.00267635 5.8804C-0.0138618 6.06774 0.0465054 6.26109 0.189811 6.40452L5.46894 11.6837C5.7261 11.9406 6.14327 11.9398 6.40047 11.683C6.65744 11.4258 6.65745 11.0093 6.40047 10.7521L2.01627 6.36792H13.794C14.1578 6.36792 14.4528 6.07295 14.4528 5.70915C14.4528 5.34537 14.1578 5.05038 13.794 5.05038H2.47479L6.40047 1.1247C6.65768 0.867487 6.65762 0.449726 6.40047 0.192476C6.1432 -0.0644227 5.72607 -0.0639614 5.46894 0.193166L0.190502 5.47161C0.16168 5.50047 0.136207 5.5324 0.113852 5.56483Z" fill="white" />
                  </svg>
                </div>
                <div className={styles.dots}>

                </div>
                <div className={styles.rightButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                    <path d="M14.272 5.48209C14.3215 5.53372 14.3599 5.59201 14.3894 5.65334C14.4053 5.68642 14.418 5.72074 14.428 5.75554C14.4335 5.77454 14.4402 5.79353 14.4439 5.81285C14.484 6.02032 14.4236 6.24327 14.263 6.40395L8.98455 11.6824C8.72737 11.9396 8.31027 11.9401 8.05302 11.6831C7.79607 11.4258 7.79587 11.008 8.05302 10.7509L12.4358 6.36804L0.65878 6.36873C0.295167 6.36873 0.000307519 6.07351 1.08056e-05 5.70996C1.06422e-05 5.34617 0.294985 5.05119 0.65878 5.05119L11.9787 5.0505L8.05233 1.12413C7.79558 0.866846 7.79594 0.449676 8.05302 0.192598C8.31011 -0.0643469 8.72662 -0.0641074 8.98386 0.192598L14.2637 5.47242C14.2666 5.47532 14.2692 5.47911 14.272 5.48209Z" fill="black" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={classNames(styles.section, styles.intro)}>
          <div className={styles.sectionContent}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>

              </div>
              <div className={styles.featureTitle}>
                Collective Action
              </div>
              <div className={styles.featureText}>
                Join forces with others who suffered similar losses
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>

              </div>
              <div className={styles.featureTitle}>
                Secure & Private
              </div>
              <div className={styles.featureText}>
                Your data is encrypted and stored securely
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>

              </div>
              <div className={styles.featureTitle}>
                AI-Powered Matching
              </div>
              <div className={styles.featureText}>
                Automatically matched to relevant cases
              </div>
            </div>
          </div>
        </div>
        <div className={classNames(styles.section, styles.community)}>
          <div className={styles.sectionTitle}>
            _> Join Our Community
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.socialAccount}>
              <div className={styles.socialAccountInfo}>
                <div className={styles.socialAccountIcon}>

                </div>
                <div className={styles.socialAccountTitle}>
                  Follow us on Twitter
                </div>
                <div className={styles.socialAccountText}>
                  Get the latest updates on cases, announcements, and compensation progress
                </div>
              </div>
              <div className={styles.socialAccountAction}>
                Go
              </div>
            </div>
            <div className={styles.socialAccount}>
              <div className={styles.socialAccountInfo}>
                <div className={styles.socialAccountIcon}>

                </div>
                <div className={styles.socialAccountTitle}>
                  Join Telegram Channel
                </div>
                <div className={styles.socialAccountText}>
                  Connect with other users, get instant support, and participate in community discussions
                </div>
              </div>
              <div className={styles.socialAccountAction}>
                Go
              </div>
            </div>
            <div className={styles.socialAccount}>
              <div className={styles.socialAccountInfo}>
                <div className={styles.socialAccountIcon}>

                </div>
                <div className={styles.socialAccountTitle}>
                  Join Discord Server
                </div>
                <div className={styles.socialAccountText}>
                  Chat with the community, get support, and participate in governance
                </div>
              </div>
              <div className={styles.socialAccountAction}>
                Go
              </div>
            </div>
            <div className={styles.socialAccount}>
              <div className={styles.socialAccountInfo}>
                <div className={styles.socialAccountIcon}>

                </div>
                <div className={styles.socialAccountTitle}>
                  Read on Medium
                </div>
                <div className={styles.socialAccountText}>
                  In-depth articles, case studies, and legal insights
                </div>
              </div>
              <div className={styles.socialAccountAction}>
                Go
              </div>
            </div>
          </div>
        </div>
        <div className={classNames(styles.section, styles.questions)}>
          <div className={styles.sectionTitle}>
            _> Frequently Asked Questions
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.question}>
              <div className={styles.questionTitle}>
                <div className={styles.questionTitleText}>
                  How does the collective lawsuit work?
                </div>
                <div className={styles.questionTitleIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="2" viewBox="0 0 14 2" fill="none">
                    <path d="M14 2H0V0H14V2Z" fill="white"/>
                  </svg>
                </div>
              </div>
              <div className={styles.questionContent}>
                We automatically match your loss report with similar cases. When enough evidence is gathered, our legal team will initiate proceedings on behalf of all participants.
              </div>
            </div>
            <div className={styles.question}>
              <div className={styles.questionTitle}>
                <div className={styles.questionTitleText}>
                  Is my data secure?
                </div>
                <div className={styles.questionTitleIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z" fill="white"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className={styles.question}>
              <div className={styles.questionTitle}>
                <div className={styles.questionTitleText}>
                  What are the costs involved?
                </div>
                <div className={styles.questionTitleIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z" fill="white"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className={styles.question}>
              <div className={styles.questionTitle}>
                <div className={styles.questionTitleText}>
                  How long does the process take?
                </div>
                <div className={styles.questionTitleIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z" fill="white"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.content}>
          <Link className={classNames(styles.branding)} to="/">
            <div className={classNames(styles.logo)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M24 6.29748L18.2973 11.9999L24 17.7027L17.7026 24L12 18.2974L6.29744 24L0 17.7027L5.70256 11.9999L0 6.29748L6.29744 0L12 5.70259L17.7026 0L24 6.29748ZM15.9919 14.5275L15.4393 16.5725L15.1217 15.3978L13.8652 16.6543C14.7252 17.5143 16.1195 17.5143 16.9794 16.6543C17.8394 15.7944 17.8394 14.4001 16.9794 13.5401L15.9919 14.5275ZM7.33969 13.5401C6.47974 14.4001 6.47974 15.7944 7.33969 16.6543C8.19966 17.5143 9.59396 17.5143 10.4539 16.6543L9.19748 15.3978L8.87986 16.5725L8.32726 14.5275L7.33969 13.5401Z" fill="black" />
              </svg>
            </div>
            <div className={classNames(styles.text)}>
              Satoshi's Fury
            </div>
          </Link>

          <div className={classNames(styles.social)}>
            <div className={classNames(styles.socialTitle)}>
              Connect With Us
            </div>
            <div className={classNames(styles.socialLinks)}>
              <div className={classNames(styles.socialLink)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="18" viewBox="0 0 36 18" fill="none">
                  <path d="M19.2253 8.09238L24.6845 1.74658H23.3908L18.6507 7.25671L14.8647 1.74658H10.4978L16.2228 10.0788L10.4978 16.7336H11.7915L16.7971 10.9144L20.7957 16.7336H25.1626L19.2247 8.09238H19.2253ZM17.4533 10.1522L16.8733 9.32252L12.2576 2.72044H14.2449L17.9697 8.04832L18.5497 8.878L23.3914 15.8038H21.4042L17.4533 10.1522Z" fill="white" />
                </svg>
              </div>
              <div className={classNames(styles.socialLink)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="18" viewBox="0 0 36 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M19.3718 4.5598C17.8493 5.23406 14.8063 6.62962 10.2429 8.74646C9.50186 9.06021 9.11368 9.36715 9.07834 9.66727C9.01862 10.1745 9.61519 10.3742 10.4276 10.6462C10.5381 10.6832 10.6526 10.7215 10.7699 10.7621C11.5692 11.0388 12.6443 11.3624 13.2033 11.3752C13.7103 11.3869 14.2761 11.1644 14.9009 10.7076C19.1646 7.64324 21.3655 6.09436 21.5037 6.06097C21.6012 6.03741 21.7363 6.00779 21.8278 6.09441C21.9193 6.18103 21.9103 6.34507 21.9006 6.38907C21.8415 6.65732 19.4998 8.97531 18.2879 10.1749C17.9101 10.5488 17.6421 10.8141 17.5874 10.8747C17.4646 11.0104 17.3396 11.1388 17.2194 11.2621C16.4768 12.0243 15.92 12.5958 17.2502 13.5291C17.8894 13.9776 18.4009 14.3484 18.9112 14.7185C19.4685 15.1225 20.0244 15.5256 20.7436 16.0275C20.9268 16.1554 21.1018 16.2882 21.2723 16.4176C21.9208 16.9099 22.5035 17.3522 23.2234 17.2816C23.6417 17.2406 24.0737 16.8219 24.2932 15.5729C24.8117 12.6212 25.8311 6.22581 26.0667 3.59042C26.0873 3.35952 26.0613 3.06402 26.0405 2.93431C26.0196 2.80459 25.9761 2.61977 25.8177 2.48295C25.6301 2.32092 25.3406 2.28675 25.2111 2.28918C24.6223 2.30022 23.719 2.63464 19.3718 4.5598Z" fill="white" />
                </svg>
              </div>
              <div className={classNames(styles.socialLink)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" fill="none">
                  <rect width="42" height="42" fill="black"/>
                  <path d="M28.8047 14.4358C28.7989 14.4238 28.7892 14.4143 28.7775 14.4092C27.4159 13.7455 25.9791 13.2722 24.5029 13.0012C24.4895 12.9985 24.4757 13.0004 24.4633 13.0066C24.451 13.0128 24.4408 13.023 24.4343 13.0357C24.2386 13.413 24.061 13.8005 23.9021 14.1969C22.3109 13.9402 20.6924 13.9402 19.1012 14.1969C18.9412 13.7995 18.7608 13.4119 18.5606 13.0357C18.5538 13.0233 18.5435 13.0133 18.5313 13.0072C18.519 13.001 18.5053 12.9989 18.4919 13.0012C17.0156 13.2716 15.5787 13.7449 14.2173 14.4092C14.2057 14.4145 14.1958 14.4235 14.1892 14.4349C11.4667 18.7547 10.7209 22.9682 11.0868 27.1296C11.0878 27.1398 11.0908 27.1496 11.0955 27.1586C11.1001 27.1676 11.1065 27.1754 11.1141 27.1817C12.6994 28.4289 14.4725 29.3808 16.3579 29.997C16.3711 30.0012 16.3853 30.001 16.3985 29.9964C16.4117 29.9918 16.4232 29.9831 16.4315 29.9713C16.8365 29.3859 17.1953 28.766 17.5043 28.1179C17.5085 28.109 17.511 28.0993 17.5114 28.0893C17.5119 28.0794 17.5103 28.0694 17.5069 28.0601C17.5034 28.0509 17.4982 28.0425 17.4915 28.0355C17.4848 28.0285 17.4767 28.0231 17.4679 28.0197C16.9021 27.7897 16.3543 27.5124 15.8298 27.1905C15.8202 27.1845 15.8122 27.1762 15.8065 27.1661C15.8007 27.1561 15.7973 27.1448 15.7967 27.133C15.796 27.1213 15.7981 27.1096 15.8027 27.0989C15.8073 27.0883 15.8144 27.079 15.8232 27.0719C15.9335 26.9842 16.042 26.8939 16.1485 26.801C16.1578 26.7929 16.1691 26.7876 16.1811 26.7859C16.1931 26.7842 16.2053 26.7861 16.2163 26.7913C19.6531 28.4578 23.3739 28.4578 26.7699 26.7913C26.781 26.7857 26.7933 26.7836 26.8055 26.7852C26.8177 26.7867 26.8292 26.7919 26.8387 26.8002C26.9452 26.8936 27.054 26.9842 27.1648 27.0719C27.1737 27.0789 27.1807 27.0881 27.1854 27.0988C27.1901 27.1094 27.1923 27.1211 27.1917 27.1328C27.1911 27.1445 27.1878 27.1559 27.1821 27.166C27.1764 27.176 27.1685 27.1844 27.159 27.1905C26.6356 27.5151 26.0874 27.7922 25.5201 28.0188C25.5113 28.0224 25.5033 28.0279 25.4966 28.035C25.4899 28.0421 25.4847 28.0505 25.4814 28.0599C25.478 28.0692 25.4765 28.0792 25.477 28.0892C25.4776 28.0992 25.4801 28.109 25.4844 28.1179C25.7986 28.7624 26.1568 29.3815 26.5563 29.9703C26.5644 29.9824 26.5759 29.9914 26.5891 29.9962C26.6023 30.001 26.6166 30.0012 26.63 29.9968C28.5187 29.3828 30.295 28.4308 31.8822 27.1817C31.8899 27.1758 31.8964 27.1681 31.9011 27.1592C31.9058 27.1504 31.9087 27.1406 31.9095 27.1304C32.3475 22.3195 31.1762 18.1405 28.8047 14.4358ZM18.0176 24.5957C16.9828 24.5957 16.1303 23.5868 16.1303 22.3478C16.1303 21.1088 16.9663 20.0998 18.0176 20.0998C19.077 20.0998 19.9213 21.1175 19.9048 22.3477C19.9048 23.5868 19.0687 24.5957 18.0176 24.5957ZM24.9954 24.5957C23.9608 24.5957 23.1082 23.5868 23.1082 22.3478C23.1082 21.1088 23.9442 20.0998 24.9954 20.0998C26.055 20.0998 26.8993 21.1175 26.8827 22.3477C26.8827 23.5868 26.055 24.5957 24.9954 24.5957Z" fill="white" />
                </svg>
              </div>
              <div className={classNames(styles.socialLink)}>
                <svg width="32" height="32" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="1024" height="1024" rx="179.649" fill="none"/>
                  <path d="M836.115 244.625L836.923 244.448V238.195H672.014L518.891 598.084L365.768 238.195H188.059V244.448L188.857 244.625C218.957 251.419 234.239 261.551 234.239 298.091V725.872C234.239 762.412 218.898 772.544 188.798 779.338L188 779.516V785.788H308.57V779.535L307.773 779.358C277.672 772.564 262.39 762.432 262.39 725.892V322.905L459.093 785.788H470.249L672.683 309.996V736.457C670.104 765.317 654.96 774.228 627.705 780.382L626.897 780.569V786.773H836.923V780.569L836.115 780.382C808.831 774.228 793.322 765.317 790.743 736.457L790.605 298.091H790.743C790.743 261.551 806.024 251.419 836.115 244.625Z" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>© 2025 Satoshi’s Fury. All rights reserved.</div>
          <div className={styles.bottomRight}>
            <div className={styles.privacyButton}>Privacy Policy</div> | <div className={styles.tosButton}>Terms of Use</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
