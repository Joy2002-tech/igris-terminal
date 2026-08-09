# Igris Terminal

A free, web-based stock analysis toolkit by Igris Capital. Runs entirely in the browser —
nothing to download or install.

**Live tools:**
- **Watchlist** — technical screener (EMA9/21 trend, RSI, ADX/DMI, VWAP) across a fixed list of
  NSE large-caps. Shows the criteria a stock currently meets — not a buy/sell call.
- **Options Builder** — Black-Scholes Greeks calculator and multi-leg strategy payoff diagram.
  Works from user-entered strike/expiry/IV, so it doesn't depend on a live option-chain feed.
- **Compare & Valuation** — side-by-side fundamentals for two stocks plus a simplified DCF estimate.
- **Learn With Me** — links to weekend (Saturday/Sunday only) 1:1 learning sessions.

## Data source

All market data comes from **Yahoo Finance** via the [`yahoo-finance2`](https://github.com/gadicc/node-yahoo-finance2)
package, called server-side from the `/api` serverless functions (avoids browser CORS issues).
No broker account or personal trading data is used anywhere in this project.

## Tech stack

- Frontend: React + Vite
- Charts: Recharts
- Backend: Vercel serverless functions (`/api`)
- Indicators: [`technicalindicators`](https://github.com/anandanand84/technicalindicators)

## Local development

\`\`\`bash
npm install
npm run dev        # frontend on http://localhost:5173
\`\`\`

The `/api` functions need a serverless runtime to run locally. Easiest option is the Vercel CLI:

\`\`\`bash
npm install -g vercel
vercel dev
\`\`\`

## Deploying

This repo deploys straight to **Vercel** (free tier is enough):

1. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, import this repo.
2. Vercel auto-detects the Vite framework and the `/api` functions — no config needed beyond
   what's already in `vercel.json`.
3. Click Deploy. Every push to `main` redeploys automatically.
4. Optional: add a custom domain (e.g. a `terminal.` subdomain of igriscapital.in) under
   Project Settings → Domains.

## Disclaimer

Everything in this terminal is informational and educational only. Nothing here is investment
advice or a recommendation to buy or sell any security. Options and equity markets carry risk —
do your own research or speak with a qualified advisor before acting on anything.
