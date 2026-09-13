import { EMA, RSI, ADX } from 'technicalindicators'

/**
 * Computes trend/momentum/structure signals from daily OHLCV candles.
 * candles: array of { date, open, high, low, close, volume }, oldest first.
 * Returns null if there isn't enough history to compute reliably.
 */
export function computeLevels(candles) {
  if (!candles || candles.length < 30) return null

  const closes = candles.map(c => c.close)
  const highs = candles.map(c => c.high)
  const lows = candles.map(c => c.low)
  const volumes = candles.map(c => c.volume)

  const ema9 = EMA.calculate({ period: 9, values: closes })
  const ema21 = EMA.calculate({ period: 21, values: closes })
  const rsiVals = RSI.calculate({ period: 14, values: closes })
  const adxVals = ADX.calculate({ period: 14, close: closes, high: highs, low: lows })

  if (!ema9.length || !ema21.length || !rsiVals.length || !adxVals.length) return null

  const lastEma9 = ema9[ema9.length - 1]
  const lastEma21 = ema21[ema21.length - 1]
  const lastRsi = rsiVals[rsiVals.length - 1]
  const lastAdx = adxVals[adxVals.length - 1]

  // Rolling 20-day VWAP proxy (true intraday VWAP needs tick data; this approximates
  // "value area" using daily typical price weighted by volume over the recent window).
  const window = 20
  const recent = candles.slice(-window)
  let pv = 0, vsum = 0
  for (const c of recent) {
    const typical = (c.high + c.low + c.close) / 3
    pv += typical * c.volume
    vsum += c.volume
  }
  const vwap = vsum > 0 ? pv / vsum : closes[closes.length - 1]
  const lastClose = closes[closes.length - 1]
  const prevClose = closes[closes.length - 2]
  const changePct = ((lastClose - prevClose) / prevClose) * 100

  const trend = lastEma9 > lastEma21 ? 'up' : lastEma9 < lastEma21 ? 'down' : 'flat'
  const aboveVwap = lastClose > vwap

  // Setup label: purely descriptive of what criteria are currently met — not a call to act.
  let setup = 'No clear setup'
  const strongTrend = lastAdx.adx > 22
  if (trend === 'up' && aboveVwap && lastRsi > 50 && lastRsi < 72 && strongTrend) {
    setup = 'Uptrend + momentum aligned'
  } else if (trend === 'down' && !aboveVwap && lastRsi < 50 && lastRsi > 28 && strongTrend) {
    setup = 'Downtrend + momentum aligned'
  } else if (lastRsi >= 72) {
    setup = 'Extended — momentum stretched'
  } else if (lastRsi <= 28) {
    setup = 'Oversold — momentum stretched'
  } else if (!strongTrend) {
    setup = 'Range-bound — weak trend strength'
  }

  return {
    price: lastClose,
    changePct,
    trend,
    rsi: lastRsi,
    adx: lastAdx.adx,
    aboveVwap,
    setup,
  }
}
