/**
 * 交易所显示配置
 * 控制前端 UI 中显示哪些交易所
 * 
 * 恢复方法：将 VISIBLE_EXCHANGES 改为 ['binance', 'okx', 'bybit', 'bitget']
 */

// 当前可见的交易所（小写）
export const VISIBLE_EXCHANGES = ['binance']

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

