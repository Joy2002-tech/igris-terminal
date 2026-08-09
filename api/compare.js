import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

function simplifiedDCF({ freeCashflow, sharesOutstanding, growth, discountRate = 0.11, terminalGrowth = 0.04, years = 5 }) {
  if (!freeCashflow || !sharesOutstanding || freeCashflow <= 0) return null
  const g = Math.min(Math.max(growth ?? 0.08, 0), 0.25) // clamp to a sane range
  let pv = 0
  let fcf = freeCashflow
  for (let y = 1; y <= years; y++) {
    fcf = fcf * (1 + g)
    pv += fcf / Math.pow(1 + discountRate, y)
  }
  const terminalValue = (fcf * (1 + terminalGrowth)) / (discountRate - terminalGrowth)
  const pvTerminal = terminalValue / Math.pow(1 + discountRate, years)
  const enterpriseValue = pv + pvTerminal
  return enterpriseValue / sharesOutstanding
}

async function fetchOne(symbol) {
  const summary = await yahooFinance.quoteSummary(symbol, {
    modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'price'],
  })

  const price = summary.price?.regularMarketPrice
  const marketCap = summary.price?.marketCap
  const pe = summary.summaryDetail?.trailingPE
  const pb = summary.defaultKeyStatistics?.priceToBook
  const roe = summary.financialData?.returnOnEquity != null ? summary.financialData.returnOnEquity * 100 : null
  const debtToEquity = summary.financialData?.debtToEquity != null ? summary.financialData.debtToEquity / 100 : null
  const revenueGrowth = summary.financialData?.revenueGrowth ?? null
  const freeCashflow = summary.financialData?.freeCashflow
  const sharesOutstanding = summary.defaultKeyStatistics?.sharesOutstanding

  const dcfFairValue = simplifiedDCF({ freeCashflow, sharesOutstanding, growth: revenueGrowth })

  return { symbol, price, marketCap, pe, pb, roe, debtToEquity, revenueGrowth, dcfFairValue }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
  try {
    const a = req.query.a
    const b = req.query.b
    if (!a || !b) return res.status(400).json({ error: 'a and b query params required' })

    const [dataA, dataB] = await Promise.all([fetchOne(a), fetchOne(b)])
    res.status(200).json({ a: dataA, b: dataB })
  } catch (err) {
    res.status(502).json({ error: 'Comparison failed', detail: String(err?.message || err) })
  }
}
