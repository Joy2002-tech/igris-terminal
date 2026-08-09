import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { blackScholes, strategyPayoff } from '../lib/blackScholes.js'

let legId = 0

export default function OptionsBuilder() {
  const [spot, setSpot] = useState(24500)
  const [rate, setRate] = useState(6.8)
  const [legs, setLegs] = useState([
    { id: legId++, type: 'call', side: 'buy', K: 24600, days: 21, iv: 13, qty: 1 },
  ])

  function addLeg() {
    setLegs(l => [...l, { id: legId++, type: 'put', side: 'sell', K: 24300, days: 21, iv: 13, qty: 1 }])
  }
  function removeLeg(id) {
    setLegs(l => l.filter(x => x.id !== id))
  }
  function updateLeg(id, patch) {
    setLegs(l => l.map(x => x.id === id ? { ...x, ...patch } : x))
  }

  const legsWithGreeks = useMemo(() => legs.map(leg => {
    const T = Math.max(leg.days, 0) / 365
    const sigma = leg.iv / 100
    const g = blackScholes({ S: spot, K: leg.K, T, r: rate / 100, sigma, type: leg.type })
    return { ...leg, greeks: g }
  }), [legs, spot, rate])

  const netGreeks = useMemo(() => {
    return legsWithGreeks.reduce((acc, leg) => {
      const sign = leg.side === 'buy' ? 1 : -1
      acc.delta += sign * leg.greeks.delta * leg.qty
      acc.gamma += sign * leg.greeks.gamma * leg.qty
      acc.theta += sign * leg.greeks.theta * leg.qty
      acc.vega += sign * leg.greeks.vega * leg.qty
      acc.premium += (leg.side === 'buy' ? -1 : 1) * leg.greeks.price * leg.qty
      return acc
    }, { delta: 0, gamma: 0, theta: 0, vega: 0, premium: 0 })
  }, [legsWithGreeks])

  const payoffData = useMemo(() => {
    const range = []
    const lo = spot * 0.9, hi = spot * 1.1
    const step = (hi - lo) / 60
    for (let s = lo; s <= hi; s += step) range.push(Math.round(s))
    const strategyLegs = legsWithGreeks.map(l => ({
      type: l.type, side: l.side, K: l.K, premium: l.greeks.price, qty: l.qty,
    }))
    return strategyPayoff(strategyLegs, range)
  }, [legsWithGreeks, spot])

  return (
    <div className="tool">
      <div className="tool-head">
        <span className="eyebrow">Options</span>
        <h2>Greeks & Strategy Builder</h2>
        <p className="tool-desc">
          Black-Scholes based — enter strikes, expiry, and implied volatility yourself. No live option-chain
          feed is used, so this works the same whether or not your broker's data is connected.
        </p>
      </div>

      <div className="card ob-inputs-row">
        <div className="field">
          <label>Underlying spot price</label>
          <input type="number" className="mono" value={spot} onChange={e => setSpot(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Risk-free rate (%)</label>
          <input type="number" step="0.1" className="mono" value={rate} onChange={e => setRate(Number(e.target.value))} />
        </div>
      </div>

      <div className="legs">
        {legs.map(leg => {
          const withG = legsWithGreeks.find(x => x.id === leg.id)
          return (
            <div className="leg-card card" key={leg.id}>
              <div className="leg-row">
                <select value={leg.side} onChange={e => updateLeg(leg.id, { side: e.target.value })}>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
                <select value={leg.type} onChange={e => updateLeg(leg.id, { type: e.target.value })}>
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                </select>
                <div className="field-inline">
                  <label>Strike</label>
                  <input type="number" className="mono" value={leg.K} onChange={e => updateLeg(leg.id, { K: Number(e.target.value) })} />
                </div>
                <div className="field-inline">
                  <label>Days to expiry</label>
                  <input type="number" className="mono" value={leg.days} onChange={e => updateLeg(leg.id, { days: Number(e.target.value) })} />
                </div>
                <div className="field-inline">
                  <label>IV %</label>
                  <input type="number" className="mono" value={leg.iv} onChange={e => updateLeg(leg.id, { iv: Number(e.target.value) })} />
                </div>
                <div className="field-inline">
                  <label>Qty (lots)</label>
                  <input type="number" min="1" className="mono" value={leg.qty} onChange={e => updateLeg(leg.id, { qty: Number(e.target.value) })} />
                </div>
                {legs.length > 1 && (
                  <button className="leg-remove" onClick={() => removeLeg(leg.id)} aria-label="Remove leg">✕</button>
                )}
              </div>
              {withG && (
                <div className="leg-greeks mono">
                  <span>Premium <b>₹{withG.greeks.price.toFixed(2)}</b></span>
                  <span>Δ {withG.greeks.delta.toFixed(3)}</span>
                  <span>Γ {withG.greeks.gamma.toFixed(4)}</span>
                  <span>Θ {withG.greeks.theta.toFixed(2)}</span>
                  <span>Vega {withG.greeks.vega.toFixed(3)}</span>
                </div>
              )}
            </div>
          )
        })}
        <button className="btn-o" onClick={addLeg}>+ Add leg</button>
      </div>

      <div className="card net-greeks-card">
        <h3>Net position</h3>
        <div className="net-greeks mono">
          <div><span className="ngk-label">Net premium</span><span className={netGreeks.premium >= 0 ? 'up' : 'down'}>₹{netGreeks.premium.toFixed(2)}</span></div>
          <div><span className="ngk-label">Delta</span><span>{netGreeks.delta.toFixed(3)}</span></div>
          <div><span className="ngk-label">Gamma</span><span>{netGreeks.gamma.toFixed(4)}</span></div>
          <div><span className="ngk-label">Theta / day</span><span>{netGreeks.theta.toFixed(2)}</span></div>
          <div><span className="ngk-label">Vega</span><span>{netGreeks.vega.toFixed(3)}</span></div>
        </div>
      </div>

      <div className="card payoff-card">
        <h3>Payoff at expiry</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={payoffData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--bdr)" strokeDasharray="3 3" />
            <XAxis dataKey="spot" stroke="var(--txf)" fontSize={11} />
            <YAxis stroke="var(--txf)" fontSize={11} />
            <Tooltip
              contentStyle={{ background: 'var(--surf2)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'var(--txm)' }}
            />
            <ReferenceLine y={0} stroke="var(--txf)" />
            <ReferenceLine x={spot} stroke="var(--acc2)" strokeDasharray="4 4" label={{ value: 'Spot', fill: 'var(--acc2)', fontSize: 11 }} />
            <Line type="monotone" dataKey="pnl" stroke="var(--acc2)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="disclaimer">
        Educational calculator only — not investment advice. Theoretical values from the Black-Scholes model
        can differ from real market premiums, which are also shaped by supply/demand and skew.
      </p>
    </div>
  )
}
