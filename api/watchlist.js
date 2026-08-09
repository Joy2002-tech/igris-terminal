import YahooFinance from 'yahoo-finance2'
import { computeLevels } from './_lib/levels.js'

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

// Fixed, transparent universe — large-cap NSE names. Expand this list as needed.
const UNIVERSE = [
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
  'HINDUNILVR.NS', 'ITC.NS', 'LT.NS', 'SBIN.NS', 'BHARTIARTL.NS',
  'BAJFINANCE.NS', 'KOTAKBANK.NS', 'AXISBANK.NS', 'MARUTI.NS', 'TITAN.NS',
  'SUNPHARMA.NS', 'NTPC.NS', 'ADANIENT.NS', 'TATAMOTORS.NS', 'WIPRO.NS',
]

const SETUP_PRIORITY = {
  'Uptrend + momentum aligned': 0,
  'Downtrend + momentum aligned': 1,
  'Extended — momentum stretched': 2,
  'Oversold — momentum stretched': 2,
  'Range-bound — weak trend strength': 3,
  'No clear setup': 4,
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  try {
    const period2 = new Date()
    const period1 = new Date()
    period1.setDate(period1.getDate() - 120)

    const settled = await Promise.allSettled(UNIVERSE.map(async symbol => {
      const chart = await yahooFinance.chart(symbol, {
        period1, period2, interval: '1d',
      })
      const quotes = (chart?.quotes || []).filter(q => q.close != null)
      const candles = quotes.map(q => ({
        date: q.date, open: q.open, high: q.high, low: q.low, close: q.close, volume: q.volume || 0,
      }))
      const levels = computeLevels(candles)
      if (!levels) return null
      return { symbol, ...levels }
    }))

    const results = settled
      .map(r => r.status === 'fulfilled' ? r.value : null)
      .filter(Boolean)
      .sort((a, b) => (SETUP_PRIORITY[a.setup] ?? 9) - (SETUP_PRIORITY[b.setup] ?? 9))

    res.status(200).json({ results, universeSize: UNIVERSE.length })
  } catch (err) {
    res.status(502).json({ error: 'Screener failed', detail: String(err?.message || err) })
  }
}
