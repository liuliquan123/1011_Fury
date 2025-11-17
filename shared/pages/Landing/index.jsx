import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import styles from './style.css'

const Landing = () => {
  return (
    <Fragment>
      <div className={styles.landing}>
        Hello world!
      </div>
    </Fragment>
  )
}

export default Landing
