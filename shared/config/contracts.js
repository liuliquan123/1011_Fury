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
    rpcUrls: ['https://base-mainnet.g.alchemy.com/v2/pMrL8GqUkE5zs50Y1x6ZX'],
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
    signatureClaimETH: '0x97984818f82B39E91f52dE914810F37922aB27F6', // Base Sepolia SignatureClaimETH (退款)
    crowdfund: '0xf893Db8f7708377120f6B50f78c23Eb17118338f', // Base Sepolia Crowdfund
  },
  // 每个交易所独立的合约地址（待部署）
  Binance: {
    signatureClaim: null, // TBD - 待合约工程师部署
    crowdfund: null,      // TBD - Binance Crowdfund 合约
    token: null,          // 1011 token 地址
  },
  OKX: {
    signatureClaim: null, // TBD
    crowdfund: null,      // TBD
    token: null,          // COKX token 地址
  },
  Bybit: {
    signatureClaim: null, // TBD
    crowdfund: null,      // TBD
    token: null,          // Anti-Bybit token 地址
  },
  Bitget: {
    signatureClaim: null, // TBD
    crowdfund: null,      // TBD
    token: null,          // Anti-Bitget token 地址
  },
}

// LP Staking 配置
export const LP_STAKING = {
  84532: { // Base Sepolia (测试)
    stakingContract: '0x82Fd3C14e01E5b1c647AA14E5Db146070a47d204',
    lpToken: '0xb5dDf8eDF044a997eB5863BF81700aaF145ED2f8',
  },
  8453: { // Base Mainnet (上线前填入)
    stakingContract: null,
    lpToken: null,
  }
}

// 获取当前链的 LP Staking 配置
export const getLpStakingConfig = () => {
  return LP_STAKING[CHAIN_ID] || LP_STAKING[84532]
}

/**
 * 获取交易所对应的 Crowdfund 合约地址
 * @param {string} exchange - 交易所名称
 * @returns {string|null} 合约地址
 */
export const getCrowdfundAddress = (exchange) => {
  // 优先使用交易所专用合约，fallback 到测试合约
  return CONTRACTS[exchange]?.crowdfund || CONTRACTS.test.crowdfund
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

/**
 * 获取交易所对应的 SignatureClaimETH 合约地址（用于退款）
 * @param {string} exchange - 交易所名称
 * @returns {string|null} 合约地址
 */
export const getSignatureClaimETHAddress = (exchange) => {
  // 优先使用交易所专用合约，fallback 到测试合约
  return CONTRACTS[exchange]?.signatureClaimETH || CONTRACTS.test.signatureClaimETH
}
