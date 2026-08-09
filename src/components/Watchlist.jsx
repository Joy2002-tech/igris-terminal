import { useEffect, useState } from 'react'

export default function Watchlist() {
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [updated, setUpdated] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/watchlist')
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setRows(data.results)
      setUpdated(new Date())
    } catch (e) {
      setError('Could not load screener data right now. Try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="tool">
      <div className="tool-head">
        <span className="eyebrow">Watchlist</span>
        <h2>Technical Screener</h2>
        <p className="tool-desc">
          Stocks currently meeting a defined technical setup — trend, momentum, and structure criteria are shown
          for each one. This is a filter, not a recommendation: nothing here is a call to buy or sell.
        </p>
      </div>

      <div className="wl-toolbar">
        <button className="btn-o" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh screener'}
        </button>
        {updated && <span className="wl-updated mono">Updated {updated.toLocaleTimeString()}</span>}
      </div>

      {error && <div className="card wl-error">{error}</div>}

      {rows && (
        <div className="card wl-table-wrap">
          <table className="wl-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>LTP</th>
                <th>Chg %</th>
                <th>Trend</th>
                <th>Momentum (RSI)</th>
                <th>ADX</th>
                <th>vs VWAP</th>
                <th>Setup</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.symbol}>
                  <td className="mono wl-sym">{r.symbol.replace('.NS', '')}</td>
                  <td className="mono">{r.price?.toFixed(2)}</td>
                  <td className={`mono ${r.changePct >= 0 ? 'up' : 'down'}`}>
                    {r.changePct >= 0 ? '+' : ''}{r.changePct?.toFixed(2)}%
                  </td>
                  <td>
                    <span className={`tag ${r.trend === 'up' ? 'pos' : r.trend === 'down' ? 'neg' : 'neu'}`}>
                      {r.trend === 'up' ? 'Uptrend' : r.trend === 'down' ? 'Downtrend' : 'Sideways'}
                    </span>
                  </td>
                  <td className="mono">{r.rsi?.toFixed(1)}</td>
                  <td className="mono">{r.adx?.toFixed(1)}</td>
                  <td className={`mono ${r.aboveVwap ? 'up' : 'down'}`}>{r.aboveVwap ? 'Above' : 'Below'}</td>
                  <td className="wl-setup">{r.setup}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="wl-empty">No stocks in the tracked list currently meet the criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="disclaimer">
        Informational only, not investment advice. Criteria: EMA9/21 trend alignment, RSI(14), ADX/DMI, and price vs VWAP,
        computed from daily data. Screened against a fixed list of large-cap NSE stocks.
      </p>
    </div>
  )
}
