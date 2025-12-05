/**
 * Crowdfund Phase 配置
 * 临时写死，后续可从 get-exchange-phase API 获取
 */
export const CROWDFUND_PHASES = {
  1: { tokenPercent: 0.01, softcapEth: 10 },  // Phase 1: 1% token, 10 ETH 软顶
  2: { tokenPercent: 0.02, softcapEth: 20 },  // Phase 2: 2% token, 20 ETH 软顶
  3: { tokenPercent: 0.03, softcapEth: 30 },  // Phase 3: 3% token, 30 ETH 软顶
  4: { tokenPercent: 0.04, softcapEth: 40 },  // Phase 4: 4% token, 40 ETH 软顶
}

export const TOTAL_TOKEN_SUPPLY = 2_100_000_000  // 21亿

/**
 * 计算用户预估可获得的 Token 数量（前端计算）
 * @param {number} userInput - 用户输入的 ETH 数量
 * @param {number} currentRaised - 当前已募资 ETH 数量
 * @param {number} phase - 当前 phase (1-4)
 * @returns {{ estimatedToken: number, estimatedRefund: number }}
 */
export const calculateEstimate = (userInput, currentRaised, phase) => {
  const config = CROWDFUND_PHASES[phase]
  if (!config || userInput <= 0) {
    return { estimatedToken: 0, estimatedRefund: 0 }
  }

  const { tokenPercent, softcapEth } = config
  const totalToken = TOTAL_TOKEN_SUPPLY * tokenPercent
  const totalAfterContribution = currentRaised + userInput

  // 情况1：未超募
  if (totalAfterContribution <= softcapEth) {
    const estimatedToken = (userInput / totalAfterContribution) * totalToken
    return { estimatedToken, estimatedRefund: 0 }
  }

  // 情况2：超募
  const effectiveRatio = softcapEth / totalAfterContribution
  const effectiveContribution = userInput * effectiveRatio
  const estimatedToken = (effectiveContribution / softcapEth) * totalToken
  const estimatedRefund = userInput - effectiveContribution

  return { estimatedToken, estimatedRefund }
}

/**
 * 格式化 Token 数量显示
 * @param {number} amount - Token 数量
 * @returns {string}
 */
export const formatTokenAmount = (amount) => {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(2) + 'M'
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(2) + 'K'
  }
  return amount.toFixed(2)
}

