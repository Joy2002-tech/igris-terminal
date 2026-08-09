// Black-Scholes European option pricing & Greeks.
// Works entirely from user-supplied inputs (spot, strike, expiry, IV, rate) —
// no live option-chain data required.

function normCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp((-x * x) / 2)
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  if (x > 0) p = 1 - p
  return p
}

function normPDF(x) {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-(x * x) / 2)
}

/**
 * @param {Object} p
 * @param {number} p.S spot price
 * @param {number} p.K strike price
 * @param {number} p.T time to expiry in years
 * @param {number} p.r risk-free rate (decimal, e.g. 0.07)
 * @param {number} p.sigma implied volatility (decimal, e.g. 0.22)
 * @param {'call'|'put'} p.type
 */
export function blackScholes({ S, K, T, r, sigma, type }) {
  if (T <= 0 || sigma <= 0 || S <= 0 || K <= 0) {
    const intrinsic = type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0)
    return { price: intrinsic, delta: type === 'call' ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0, rho: 0 }
  }

  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)

  let price, delta, theta, rho
  const gamma = normPDF(d1) / (S * sigma * Math.sqrt(T))
  const vega = (S * normPDF(d1) * Math.sqrt(T)) / 100 // per 1% change in IV

  if (type === 'call') {
    price = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2)
    delta = normCDF(d1)
    theta = (-((S * normPDF(d1) * sigma) / (2 * Math.sqrt(T))) - r * K * Math.exp(-r * T) * normCDF(d2)) / 365
    rho = (K * T * Math.exp(-r * T) * normCDF(d2)) / 100
  } else {
    price = K * Math.exp(-r * T) * normCDF(-d2) - S * Math.exp(0) * normCDF(-d1)
    delta = normCDF(d1) - 1
    theta = (-((S * normPDF(d1) * sigma) / (2 * Math.sqrt(T))) + r * K * Math.exp(-r * T) * normCDF(-d2)) / 365
    rho = (-K * T * Math.exp(-r * T) * normCDF(-d2)) / 100
  }

  return { price, delta, gamma, theta, vega, rho }
}

/**
 * Computes a payoff curve for a multi-leg strategy across a spot price range.
 * legs: [{ type: 'call'|'put', side: 'buy'|'sell', K, premium, qty }]
 */
export function strategyPayoff(legs, spotRange) {
  return spotRange.map(S => {
    let total = 0
    for (const leg of legs) {
      const intrinsic = leg.type === 'call' ? Math.max(S - leg.K, 0) : Math.max(leg.K - S, 0)
      const legPnl = leg.side === 'buy'
        ? (intrinsic - leg.premium) * leg.qty
        : (leg.premium - intrinsic) * leg.qty
      total += legPnl
    }
    return { spot: S, pnl: total }
  })
}
