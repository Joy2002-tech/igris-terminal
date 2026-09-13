import { useState } from 'react'

const ROWS = [
  { key: 'price', label: 'Price', fmt: v => `₹${v?.toFixed(2)}` },
  { key: 'marketCap', label: 'Market cap', fmt: v => v ? `₹${(v / 1e7).toFixed(0)} Cr` : '—' },
  { key: 'pe', label: 'P/E (TTM)', fmt: v => v?.toFixed(2) ?? '—' },
  { key: 'pb', label: 'P/B', fmt: v => v?.toFixed(2) ?? '—' },
  { key: 'roe', label: 'ROE %', fmt: v => v != null ? `${v.toFixed(1)}%` : '—' },
  { key: 'debtToEquity', label: 'Debt / Equity', fmt: v => v?.toFixed(2) ?? '—' },
  { key: 'revenueGrowth', label: 'Revenue growth %', fmt: v => v != null ? `${(v * 100).toFixed(1)}%` : '—' },
  { key: 'dcfFairValue', label: 'Simplified DCF fair value', fmt: v => v ? `₹${v.toFixed(2)}` : '—' },
]

export default function Compare() {
  const [symA, setSymA] = useState('TCS.NS')
  const [symB, setSymB] = useState('INFY.NS')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function runCompare() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/compare?a=${encodeURIComponent(symA)}&b=${encodeURIComponent(symB)}`)
      if (!res.ok) throw new Error('failed')
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError('Could not fetch fundamentals for one or both symbols. Check the tickers and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool">
      <div className="tool-head">
        <span className="eyebrow">Compare</span>
        <h2>Stock Comparison & Valuation</h2>
        <p className="tool-desc">
          Side-by-side fundamentals plus a simplified DCF estimate (based on a flat growth/discount assumption —
          treat it as a rough anchor, not a precise fair value).
        </p>
      </div>

      <div className="card cmp-inputs">
        <div className="field">
          <label>Symbol A (NSE)</label>
          <input value={symA} onChange={e => setSymA(e.target.value.toUpperCase())} placeholder="e.g. TCS.NS" />
        </div>
        <div className="field">
          <label>Symbol B (NSE)</label>
          <input value={symB} onChange={e => setSymB(e.target.value.toUpperCase())} placeholder="e.g. INFY.NS" />
        </div>
        <button className="btn-p" onClick={runCompare} disabled={loading}>
          {loading ? 'Comparing…' : 'Compare'}
        </button>
      </div>

      {error && <div className="card wl-error">{error}</div>}

      {data && (
        <div className="card cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <th></th>
                <th className="mono">{data.a.symbol.replace('.NS', '')}</th>
                <th className="mono">{data.b.symbol.replace('.NS', '')}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(row => (
                <tr key={row.key}>
                  <td className="cmp-row-label">{row.label}</td>
                  <td className="mono">{row.fmt(data.a[row.key])}</td>
                  <td className="mono">{row.fmt(data.b[row.key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="disclaimer">
        Informational only, not investment advice. DCF uses a simplified single-stage model on trailing free cash flow —
        useful for a rough comparison, not a substitute for full modelling.
      </p>
    </div>
  )
}
