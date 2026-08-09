import { useEffect, useState } from 'react'

const SYMBOLS = [
  { symbol: '^NSEI', label: 'NIFTY 50' },
  { symbol: '^BSESN', label: 'SENSEX' },
  { symbol: '^NSEBANK', label: 'BANK NIFTY' },
  { symbol: 'RELIANCE.NS', label: 'RELIANCE' },
  { symbol: 'TCS.NS', label: 'TCS' },
  { symbol: 'HDFCBANK.NS', label: 'HDFC BANK' },
  { symbol: 'INFY.NS', label: 'INFOSYS' },
]

export default function TickerTape() {
  const [quotes, setQuotes] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const symbols = SYMBOLS.map(s => s.symbol).join(',')
        const res = await fetch(`/api/quote?symbols=${encodeURIComponent(symbols)}`)
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (!cancelled) { setQuotes(data.quotes); setError(false) }
      } catch (e) {
        if (!cancelled) setError(true)
      }
    }
    load()
    const iv = setInterval(load, 60000)
    return () => { cancelled = true; clearInterval(iv) }
  }, [])

  const items = quotes
    ? SYMBOLS.map(s => ({ ...s, q: quotes[s.symbol] })).filter(x => x.q)
    : []

  return (
    <div className="ticker-tape">
      <div className="ticker-track">
        {(error || !quotes) && (
          <span className="ticker-item ticker-muted">
            {error ? 'Live data unavailable — retrying' : 'Loading market data…'}
          </span>
        )}
        {[...items, ...items].map((it, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-label">{it.label}</span>
            <span className="mono ticker-price">{it.q.price?.toFixed(2)}</span>
            <span className={`mono ticker-chg ${it.q.changePct >= 0 ? 'up' : 'down'}`}>
              {it.q.changePct >= 0 ? '▲' : '▼'} {Math.abs(it.q.changePct).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
