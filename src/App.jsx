import { useState } from 'react'
import Nav from './components/Nav.jsx'
import TickerTape from './components/TickerTape.jsx'
import Watchlist from './components/Watchlist.jsx'
import OptionsBuilder from './components/OptionsBuilder.jsx'
import Compare from './components/Compare.jsx'
import LearnCTA from './components/LearnCTA.jsx'

export default function App() {
  const [active, setActive] = useState('watchlist')

  return (
    <div className="app">
      <Nav active={active} setActive={setActive} />
      <TickerTape />
      <main className="main">
        {active === 'watchlist' && <Watchlist />}
        {active === 'options' && <OptionsBuilder />}
        {active === 'compare' && <Compare />}
        {active === 'learn' && <LearnCTA />}
      </main>
      <footer className="tfoot">
        <span>© {new Date().getFullYear()} Igris Capital · Terminal is informational only, not investment advice</span>
      </footer>
    </div>
  )
}
