# Buildium ↔ QBO Custom Integration (Node.js + Next.js)

A production-grade starter for integrating **Buildium** with **QuickBooks Online (QBO)** without third-party middleware.
- **Backend:** Node.js + TypeScript + Express + Prisma (SQLite) + node-cron
- **Frontend (optional UI):** Next.js (App Router) for DLQ review/replay and basic metrics

## Features
- OAuth2 for QBO (auth code) with token refresh
- 5‑minute poller (Buildium → QBO) stub
- DLQ storage + replay endpoint
- Idempotency keys + audit logs tables
- Daily/monthly reconciliation job stubs
- Asia/Manila timezone cron scheduling

## Quick Start
```bash
# 1) Backend
cd backend
cp .env.example .env
# Fill in QBO credentials + Buildium creds
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev

# 2) Frontend (optional UI)
cd ../frontend
npm install
npm run dev
```

### Environment Variables
See `backend/.env.example`.

### Notes
- DB defaults to SQLite for easy start. Swap to Postgres by changing `DATABASE_URL` and re‑running Prisma migrations.
- OAuth redirect should be set to your backend callback, e.g. `http://localhost:4000/oauth/qbo/callback` for your custom app.
