import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')
  try {
    const symbolsParam = req.query.symbols
    if (!symbolsParam) {
      return res.status(400).json({ error: 'symbols query param required' })
    }
    const symbols = String(symbolsParam).split(',').map(s => s.trim()).filter(Boolean)
    const results = await yahooFinance.quote(symbols)
    const list = Array.isArray(results) ? results : [results]

    const quotes = {}
    for (const q of list) {
      quotes[q.symbol] = {
        price: q.regularMarketPrice,
        changePct: q.regularMarketChangePercent,
        change: q.regularMarketChange,
        currency: q.currency,
        name: q.shortName || q.longName,
      }
    }
    res.status(200).json({ quotes })
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch quotes', detail: String(err?.message || err) })
  }
}
