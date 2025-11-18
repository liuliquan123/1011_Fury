import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import styles from './style.css'

const Landing = () => {
  return (
    <Fragment>
      <div className={styles.landing}>
        <div className={styles.banner}>
          <div className={styles.content}>
            <div className={styles.title}>
              Gate Welcome to Satoshi's Fury
            </div>
            <div className={styles.text}>
              Join thousands fighting for justice in the crypto space
            </div>
            <div className={styles.button}>
              <div className={classNames(styles.leftArrow)}>{">"}</div>
              <div className={classNames(styles.text)}>SUBMIT YOUR LOSS</div>
              <div className={classNames(styles.rightArrow)}>{"<"}</div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Landing
