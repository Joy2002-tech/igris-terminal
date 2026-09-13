import { Redis } from '@upstash/redis'

// Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN from the environment.
// These are injected automatically once you install a Redis integration
// (e.g. Upstash) from the Vercel Marketplace — nothing to hardcode here.
const redis = Redis.fromEnv()

const SCREENER_KEY = 'screener:nifty500'

/**
 * Overwrites the cached NIFTY 500 screener snapshot.
 * results: array of { symbol, name, sector, price, changePct, trend, rsi, adx, aboveVwap, setup }
 */
export async function saveScreenerSnapshot(results) {
  const payload = {
    results,
    count: results.length,
    generatedAt: new Date().toISOString(),
  }
  await redis.set(SCREENER_KEY, payload)
  return payload
}

/**
 * Reads the most recent cached snapshot. Returns null if nothing has been
 * stored yet (e.g. the first cron run hasn't fired).
 */
export async function getScreenerSnapshot() {
  const payload = await redis.get(SCREENER_KEY)
  return payload || null
}
