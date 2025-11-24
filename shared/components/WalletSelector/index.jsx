import React from 'react'
import styles from './style.css'

const WalletSelector = ({ wallets, onSelect, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.modal} onClick={handleBackdropClick}>
      <div className={styles.selector}>
        <div className={styles.title}>Choose Wallet</div>
        <div className={styles.walletList}>
          {wallets.map(wallet => (
            <div 
              key={wallet.id}
              className={styles.walletItem} 
              onClick={() => onSelect(wallet)}
            >
              <span className={styles.icon}>{wallet.icon}</span>
              <span className={styles.name}>{wallet.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WalletSelector
