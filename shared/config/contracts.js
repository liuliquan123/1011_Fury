/**
 * 智能合约配置
 * Base Sepolia Testnet (Chain ID: 84532)
 */

// Base Sepolia Testnet
export const CHAIN_ID = 84532
export const RPC_URL = 'https://sepolia.base.org'

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

