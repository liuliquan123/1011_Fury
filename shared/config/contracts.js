/**
 * 智能合约配置
 * 支持 Base Sepolia Testnet (84532) 和 Base Mainnet (8453)
 */

import { CHAIN_ID as ENV_CHAIN_ID } from 'constants/env'

// 从环境配置读取 chainID，fallback 到 Base Sepolia
export const CHAIN_ID = ENV_CHAIN_ID || 84532

// 网络配置（用于 Web3Auth connectTo 和 wallet_addEthereumChain）
export const CHAIN_CONFIG = {
  84532: {
    chainId: '0x14A34', // 84532 十六进制
    chainName: 'Base Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://base-sepolia.g.alchemy.com/v2/FZyIRZ0HcoRTVgwCW8PV4'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
  8453: {
    chainId: '0x2105', // 8453 十六进制
    chainName: 'Base',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  },
}

// 当前链的配置
export const CURRENT_CHAIN_CONFIG = CHAIN_CONFIG[CHAIN_ID] || CHAIN_CONFIG[84532]

// 当前链的十六进制 chainId（用于 Web3Auth）
export const CHAIN_ID_HEX = CURRENT_CHAIN_CONFIG.chainId

// 当前链的 RPC URL
export const RPC_URL = CURRENT_CHAIN_CONFIG.rpcUrls[0]

// 合约地址配置
export const CONTRACTS = {
  // 测试用（单一合约，用于开发测试）
  test: {
    signatureClaim: '0x0c500663300c053affA1f9f49Ba6846D80693A89',
  },
  // 每个交易所独立的合约地址（待部署）
  Binance: {
    signatureClaim: null, // TBD - 待合约工程师部署
    token: null,          // CDNB token 地址
  },
  OKX: {
    signatureClaim: null, // TBD
    token: null,          // COKX token 地址
  },
  Bybit: {
    signatureClaim: null, // TBD
    token: null,          // Anti-Bybit token 地址
  },
  Bitget: {
    signatureClaim: null, // TBD
    token: null,          // Anti-Bitget token 地址
  },
}

/**
 * 获取交易所对应的 SignatureClaim 合约地址
 * @param {string} exchange - 交易所名称
 * @returns {string|null} 合约地址
 */
export const getSignatureClaimAddress = (exchange) => {
  // 优先使用交易所专用合约，fallback 到测试合约
  return CONTRACTS[exchange]?.signatureClaim || CONTRACTS.test.signatureClaim
}
