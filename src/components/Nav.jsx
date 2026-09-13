import PawnMark from './PawnMark.jsx'

const TABS = [
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'options', label: 'Options Builder' },
  { id: 'compare', label: 'Compare & Valuation' },
  { id: 'learn', label: 'Learn With Me' },
]

export default function Nav({ active, setActive }) {
  return (
    <nav className="tnav">
      <div className="tnav-logo">
        <PawnMark size={18} />
        <div className="tnav-logo-text">
          <span className="tnav-name">IGRIS <span>TERMINAL</span></span>
          <span className="tnav-sub">by Igris Capital</span>
        </div>
      </div>
      <div className="tnav-links">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tnav-link ${active === t.id ? 'active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
