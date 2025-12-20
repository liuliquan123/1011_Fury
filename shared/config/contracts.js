/**
 * 智能合约配置
 * 支持 Base Sepolia Testnet (84532) 和 Base Mainnet (8453)
 */

import { CHAIN_ID as ENV_CHAIN_ID } from 'constants/env'

// 从环境配置读取 chainID，fallback 到 Base Sepolia
export const CHAIN_ID = ENV_CHAIN_ID || 84532

// ============================================
// 1011 Token 配置
// ============================================
export const TOKEN_1011 = {
  name: '1011',
  symbol: '1011',
  decimals: 18,
  totalSupply: 2_100_000_000, // 21 亿
  // 合约地址
  addresses: {
    84532: '0x7420726162497cd100d0038cA3ff2473Ba4Dd61a', // Base Sepolia
    8453: '0x7420726162497cd100d0038cA3ff2473Ba4Dd61a',  // Base Mainnet (同地址)
  },
}

// 获取当前链的 1011 Token 地址
export const get1011TokenAddress = () => {
  return TOKEN_1011.addresses[CHAIN_ID] || TOKEN_1011.addresses[84532]
}

// ============================================
// 轮次奖励配置 (Token Distribution)
// ============================================
export const TOKEN_DISTRIBUTION = {
  // Submit Loss 证据提交奖励
  submitLoss: {
    round1: { percentage: 1.5, tokens: 31_500_000 },  // 第一轮 1.5%
    round2: { percentage: 4, tokens: 84_000_000 },    // 第二轮 4%
    round3: { percentage: 8, tokens: 168_000_000 },   // 第三轮 8%
  },
  // LP Liquidity Rewards 流动性奖励
  lpRewards: {
    round1: { percentage: 1, tokens: 21_000_000 },    // 第一轮 1%
    round2: { percentage: 2, tokens: 42_000_000 },    // 第二轮 2%
    round3: { percentage: 3, tokens: 63_000_000 },    // 第三轮 3%
  },
  // People DAO 认购
  peopleDao: { percentage: 37.5, tokens: 787_500_000 }, // 37.5%
}

// 获取当前轮次配置（暂时硬编码为第一轮，后续可从后端获取）
export const getCurrentRound = () => {
  return {
    round: 1,
    submitLoss: TOKEN_DISTRIBUTION.submitLoss.round1,
    lpRewards: TOKEN_DISTRIBUTION.lpRewards.round1,
  }
}

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

// ============================================
// 按网络区分的合约地址配置
// ============================================

// Base Mainnet (8453) 合约地址
const MAINNET_CONTRACTS = {
  signatureClaim: '0x22f198A0d94B3E410c5478f052CdA489f51418f0', // 已部署
  signatureClaimETH: null, // 未部署
  crowdfund: null,         // 未部署
}

// Base Sepolia (84532) 测试合约地址
const TESTNET_CONTRACTS = {
  signatureClaim: '0x0c500663300c053affA1f9f49Ba6846D80693A89',
  signatureClaimETH: '0x97984818f82B39E91f52dE914810F37922aB27F6',
  crowdfund: '0xf893Db8f7708377120f6B50f78c23Eb17118338f',
}

// 根据当前网络选择合约配置
export const CONTRACTS = CHAIN_ID === 8453 ? MAINNET_CONTRACTS : TESTNET_CONTRACTS

// LP Staking 配置
export const LP_STAKING = {
  84532: { // Base Sepolia (测试)
    stakingContract: '0x82Fd3C14e01E5b1c647AA14E5Db146070a47d204',
    lpToken: '0xb5dDf8eDF044a997eB5863BF81700aaF145ED2f8',
  },
  8453: { // Base Mainnet (未部署)
    stakingContract: null,
    lpToken: null,
  }
}

// 获取当前链的 LP Staking 配置
export const getLpStakingConfig = () => {
  return LP_STAKING[CHAIN_ID] || LP_STAKING[84532]
}

// 检查功能是否可用（合约已部署）
export const isFeatureAvailable = (feature) => {
  switch (feature) {
    case 'claim':
      return !!CONTRACTS.signatureClaim
    case 'refund':
      return !!CONTRACTS.signatureClaimETH
    case 'crowdfund':
      return !!CONTRACTS.crowdfund
    case 'lpStaking':
      const lpConfig = getLpStakingConfig()
      return !!(lpConfig.stakingContract && lpConfig.lpToken)
    default:
      return false
  }
}

/**
 * 获取 Crowdfund 合约地址
 * @returns {string|null} 合约地址，null 表示未部署
 */
export const getCrowdfundAddress = () => {
  return CONTRACTS.crowdfund
}

/**
 * 获取 SignatureClaim 合约地址
 * @returns {string|null} 合约地址，null 表示未部署
 */
export const getSignatureClaimAddress = () => {
  return CONTRACTS.signatureClaim
}

/**
 * 获取 SignatureClaimETH 合约地址（用于退款）
 * @returns {string|null} 合约地址，null 表示未部署
 */
export const getSignatureClaimETHAddress = () => {
  return CONTRACTS.signatureClaimETH
}
