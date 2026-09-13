import { getScreenerSnapshot } from './_lib/store.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
  try {
    const snapshot = await getScreenerSnapshot()
    if (!snapshot) {
      return res.status(200).json({
        results: [],
        count: 0,
        generatedAt: null,
        note: 'No screener data yet — waiting on the first scheduled refresh.',
      })
    }
    res.status(200).json(snapshot)
  } catch (err) {
    res.status(502).json({ error: 'Could not load screener data', detail: String(err?.message || err) })
  }
}
