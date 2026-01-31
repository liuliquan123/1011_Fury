/**
 * 交易所显示配置（重构版）
 * 控制前端 UI 中显示哪些交易所
 * 
 * 配置方式：
 * - 通过环境变量 NEXT_PUBLIC_VISIBLE_EXCHANGES 配置
 * - 格式：逗号分隔，例如 "binance,okx,bybit,bitget"
 * - 如未配置，默认显示 ['binance']
 */

// 从环境变量读取可见交易所列表
const getVisibleExchanges = () => {
  const envValue = process.env.NEXT_PUBLIC_VISIBLE_EXCHANGES
  if (envValue && typeof envValue === 'string') {
    return envValue
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0)
  }
  // 默认值：只显示 binance
  return ['binance']
}

// 当前可见的交易所（小写）
export const VISIBLE_EXCHANGES = getVisibleExchanges()

// 完整交易所列表（保留，便于恢复）
export const ALL_EXCHANGES = ['binance', 'okx', 'bybit', 'bitget']

/**
 * 判断交易所是否可见
 * @param {string} exchange - 交易所名称
 * @returns {boolean}
 */
export const isExchangeVisible = (exchange) => {
  if (!exchange) return false
  return VISIBLE_EXCHANGES.includes(String(exchange).toLowerCase())
}

// 交易所对应的 Token 名称
export const EXCHANGE_TOKENS = {
  binance: '$1011',
  okx: '$COKX',
  bybit: 'Anti-Bybit',
  bitget: 'Anti-Bitget',
}

/**
 * 获取交易所对应的 Token 名称
 * @param {string} exchange - 交易所名称
 * @returns {string}
 */
export const getTokenName = (exchange) => {
  if (!exchange) return ''
  return EXCHANGE_TOKENS[String(exchange).toLowerCase()] || ''
}

