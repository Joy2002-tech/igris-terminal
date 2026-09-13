# Igris Terminal

A free, web-based stock analysis toolkit by Igris Capital. Runs entirely in the browser —
nothing to download or install.

**Live tools:**
- **Watchlist** — technical screener (EMA9/21 trend, RSI, ADX/DMI, VWAP) across the full **NIFTY 500**,
  with search by symbol/name/sector. Shows the criteria a stock currently meets — not a buy/sell call.
- **Options Builder** — Black-Scholes Greeks calculator and multi-leg strategy payoff diagram.
  Works from user-entered strike/expiry/IV, so it doesn't depend on a live option-chain feed.
- **Compare & Valuation** — side-by-side fundamentals for two stocks plus a simplified DCF estimate.
- **Learn With Me** — links to weekend (Saturday/Sunday only) 1:1 learning sessions.

## Data source

Market data comes from **Yahoo Finance** via the [`yahoo-finance2`](https://github.com/gadicc/node-yahoo-finance2)
package, called server-side (avoids browser CORS issues). No broker account or personal trading data
is used anywhere in this project.

The NIFTY 500 screener does **not** call Yahoo live on page load — scanning 500 symbols on every visit
isn't practical. Instead:
1. `/api/refresh-screener` runs once per trading day via **Vercel Cron** (see `crons` in `vercel.json`),
   scans the full universe in `data/nifty500.json`, computes indicators, and caches the result.
2. `/api/screener` (what the frontend calls) just reads that cached snapshot — fast, no rate-limit risk.

This means Watchlist data is "as of last close," refreshed daily after market close — not real-time
intraday. `data/nifty500.json` is a point-in-time NIFTY 500 constituent list; NSE rebalances the index
semi-annually, so refresh this file periodically against NSE's official list.

## Tech stack

- Frontend: React + Vite
- Charts: Recharts
- Backend: Vercel serverless functions (`/api`) + Vercel Cron
- Storage: Redis (via [`@upstash/redis`](https://github.com/upstash/redis-js), installed from the
  Vercel Marketplace) — caches the latest screener snapshot
- Indicators: [`technicalindicators`](https://github.com/anandanand84/technicalindicators)

## Required setup (new — do this before deploying)

1. In the Vercel dashboard → your project → **Storage** → add a **Redis** integration (Upstash, from
   the Marketplace). This auto-injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
2. Add a `CRON_SECRET` environment variable yourself (Settings → Environment Variables) — any random
   16+ character string. Vercel automatically sends it as a bearer token when it triggers the cron,
   which is how `/api/refresh-screener` tells a real scheduled run apart from a random request to the URL.
3. After deploying, either wait for the first scheduled run or trigger it manually once:
   `vercel crons run /api/refresh-screener` (or hit the URL yourself with the right `Authorization` header).
   Until the first run completes, Watchlist will show "no screener data yet."

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
