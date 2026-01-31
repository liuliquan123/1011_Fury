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
  // 合约地址 - 从环境变量读取
  addresses: {
    84532: process.env.NEXT_PUBLIC_TOKEN_1011_TESTNET || '0x7420726162497cd100d0038cA3ff2473Ba4Dd61a',
    8453: process.env.NEXT_PUBLIC_TOKEN_1011_MAINNET || '0x7420726162497cd100d0038cA3ff2473Ba4Dd61a',
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

// 注意：getCurrentRound() 已移除
// LP Staking 的轮次信息现在从 PointsVaultRounds 合约直接获取
// Submit Loss 的轮次信息保留在 TOKEN_DISTRIBUTION 中供后端使用

// ============================================
// RPC URL 配置 - 从环境变量读取
// ============================================
const getRpcUrl = (chainId) => {
  if (chainId === 8453) {
    // 主网：优先使用环境变量，fallback 到公共 RPC
    return process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
  }
  // 测试网：优先使用环境变量，fallback 到公共 RPC
  return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
}

// 网络配置（用于 Web3Auth connectTo 和 wallet_addEthereumChain）
export const CHAIN_CONFIG = {
  84532: {
    chainId: '0x14A34', // 84532 十六进制
    chainName: 'Base Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [getRpcUrl(84532)],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
  8453: {
    chainId: '0x2105', // 8453 十六进制
    chainName: 'Base',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [getRpcUrl(8453)],
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
// 按网络区分的合约地址配置 - 从环境变量读取
// ============================================

// Base Mainnet (8453) 合约地址
const MAINNET_CONTRACTS = {
  signatureClaim: process.env.NEXT_PUBLIC_SIGNATURE_CLAIM_MAINNET || '0x22f198A0d94B3E410c5478f052CdA489f51418f0',
  signatureClaimETH: process.env.NEXT_PUBLIC_SIGNATURE_CLAIM_ETH_MAINNET || null,
  crowdfund: process.env.NEXT_PUBLIC_CROWDFUND_MAINNET || null,
}

// Base Sepolia (84532) 测试合约地址
const TESTNET_CONTRACTS = {
  signatureClaim: process.env.NEXT_PUBLIC_SIGNATURE_CLAIM_TESTNET || '0x0c500663300c053affA1f9f49Ba6846D80693A89',
  signatureClaimETH: process.env.NEXT_PUBLIC_SIGNATURE_CLAIM_ETH_TESTNET || '0x97984818f82B39E91f52dE914810F37922aB27F6',
  crowdfund: process.env.NEXT_PUBLIC_CROWDFUND_TESTNET || '0xf893Db8f7708377120f6B50f78c23Eb17118338f',
}

// 根据当前网络选择合约配置
export const CONTRACTS = CHAIN_ID === 8453 ? MAINNET_CONTRACTS : TESTNET_CONTRACTS

// ============================================
// LP Staking 配置 (PointsVaultRounds 合约) - 从环境变量读取
// 三轮奖励机制：Round 1 (7天) + Round 2 (30天) + Round 3 (90天) = 127天
// ============================================
export const LP_STAKING = {
  84532: { // Base Sepolia (测试) - PointsVaultRounds 新合约
    stakingContract: process.env.NEXT_PUBLIC_LP_STAKING_CONTRACT_TESTNET || '0xdF5bF5f4c4DCc27161B028B0a80C62Ae26b828C4',
    lpToken: process.env.NEXT_PUBLIC_LP_TOKEN_TESTNET || '0xb5dDf8eDF044a997eB5863BF81700aaF145ED2f8',
  },
  8453: { // Base Mainnet - PointsVaultRounds 合约 (ETH-1011 LP)
    stakingContract: process.env.NEXT_PUBLIC_LP_STAKING_CONTRACT_MAINNET || '0xbB0A0222aCbe664aAaaA6dF5210D7E99E2C935Ac',
    lpToken: process.env.NEXT_PUBLIC_LP_TOKEN_MAINNET || '0x2B6C35e8b2b0ffaf637C3cfbDE6bEF77A109B4fA',
  }
}

// ============================================
// Uniswap V2 配置（用于 Add Liquidity） - 从环境变量读取
// ============================================
export const UNISWAP_V2 = {
  84532: { // Base Sepolia (暂无)
    router: null,
    weth: null,
    pairedToken: null, // 1011 token
    pair: null,
  },
  8453: { // Base Mainnet - ETH-1011 交易对
    router: process.env.NEXT_PUBLIC_UNISWAP_ROUTER_MAINNET || '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    weth: process.env.NEXT_PUBLIC_WETH_MAINNET || '0x4200000000000000000000000000000000000006',
    pairedToken: process.env.NEXT_PUBLIC_TOKEN_1011_MAINNET || '0x7420726162497cd100d0038cA3ff2473Ba4Dd61a',
    pairedTokenDecimals: 18,
    pairedTokenSymbol: '1011',
    pair: process.env.NEXT_PUBLIC_UNISWAP_PAIR_MAINNET || '0x2B6C35e8b2b0ffaf637C3cfbDE6bEF77A109B4fA',
  }
}

// 获取当前链的 Uniswap V2 配置
export const getUniswapV2Config = () => {
  return UNISWAP_V2[CHAIN_ID] || UNISWAP_V2[8453]
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
