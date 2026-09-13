import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import YahooFinance from 'yahoo-finance2'
import { computeLevels } from './_lib/levels.js'
import { saveScreenerSnapshot } from './_lib/store.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const universe = JSON.parse(
  readFileSync(join(__dirname, '..', 'data', 'nifty500.json'), 'utf-8')
)

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

// Keep both numbers conservative — this runs against Yahoo's undocumented
// endpoint for ~500 symbols inside one function invocation. If this starts
// timing out in practice (check the Vercel function logs after a run),
// lower BATCH_SIZE first before raising maxDuration in vercel.json.
const BATCH_SIZE = 40
const BATCH_PAUSE_MS = 250

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default async function handler(req, res) {
  // Vercel sends this header automatically for scheduled invocations, using
  // the CRON_SECRET env var you set in Project Settings. This blocks anyone
  // who just hits the URL directly from triggering a full 500-stock refresh.
  const authHeader = req.headers['authorization']
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const period2 = new Date()
    const period1 = new Date()
    period1.setDate(period1.getDate() - 120)

    const results = []
    const failures = []

    for (let i = 0; i < universe.length; i += BATCH_SIZE) {
      const batch = universe.slice(i, i + BATCH_SIZE)
      const settled = await Promise.allSettled(
        batch.map(async ({ symbol, name, sector }) => {
          const chart = await yahooFinance.chart(symbol, { period1, period2, interval: '1d' })
          const quotes = (chart?.quotes || []).filter(q => q.close != null)
          const candles = quotes.map(q => ({
            date: q.date, open: q.open, high: q.high, low: q.low, close: q.close, volume: q.volume || 0,
          }))
          const levels = computeLevels(candles)
          if (!levels) return null
          return { symbol, name, sector, ...levels }
        })
      )

      settled.forEach((s, idx) => {
        if (s.status === 'fulfilled' && s.value) {
          results.push(s.value)
        } else {
          failures.push(batch[idx].symbol)
        }
      })

      if (i + BATCH_SIZE < universe.length) await sleep(BATCH_PAUSE_MS)
    }

    const snapshot = await saveScreenerSnapshot(results)

    res.status(200).json({
      ok: true,
      stored: results.length,
      universeSize: universe.length,
      failed: failures.length,
      generatedAt: snapshot.generatedAt,
    })
  } catch (err) {
    res.status(502).json({ error: 'Screener refresh failed', detail: String(err?.message || err) })
  }
}
