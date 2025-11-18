import React, { Fragment, useEffect, useState } from 'react'
import classNames from 'classnames'
import styles from './style.css'

const Header = () => {
  return (
    <div className={classNames(styles.header)}>
      <div className={classNames(styles.branding)}>
        <div className={classNames(styles.logo)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M24 6.29748L18.2973 11.9999L24 17.7027L17.7026 24L12 18.2974L6.29744 24L0 17.7027L5.70256 11.9999L0 6.29748L6.29744 0L12 5.70259L17.7026 0L24 6.29748ZM15.9919 14.5275L15.4393 16.5725L15.1217 15.3978L13.8652 16.6543C14.7252 17.5143 16.1195 17.5143 16.9794 16.6543C17.8394 15.7944 17.8394 14.4001 16.9794 13.5401L15.9919 14.5275ZM7.33969 13.5401C6.47974 14.4001 6.47974 15.7944 7.33969 16.6543C8.19966 17.5143 9.59396 17.5143 10.4539 16.6543L9.19748 15.3978L8.87986 16.5725L8.32726 14.5275L7.33969 13.5401Z" fill="black" />
          </svg>
        </div>
        <div className={classNames(styles.text)}>
          Satoshi's Fury
        </div>
      </div>
      <div className={classNames(styles.buttons)}>
        <div className={classNames(styles.button)}>
          <div className={classNames(styles.leftArrow)}>{">"}</div>
          <div className={classNames(styles.text)}>Submit your Loss</div>
          <div className={classNames(styles.rightArrow)}>{"<"}</div>
        </div>
      </div>
    </div>
  )
}

export default Header
