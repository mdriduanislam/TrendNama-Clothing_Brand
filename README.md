# TrendNama Clothing Brand

Monorepo for the TrendNama ecommerce project with separate **client** and **admin** Next.js apps, plus shared seed data.

## Project Structure

- `client/` - Customer-facing ecommerce website
- `admin/` - Admin dashboard for products, orders, and users
- `shared/` - Shared data files used by both apps

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- pnpm
- SQLite (local/shared file)

## Prerequisites

- Node.js 22+
- pnpm 10+

## Local Development

### 1) Install dependencies

```bash
cd client && pnpm install
cd ../admin && pnpm install
```

### 2) Run client app

```bash
cd client
pnpm dev
```

Client runs on `http://localhost:3000` by default.

### 3) Run admin app

```bash
cd admin
pnpm dev -p 3001
```

Admin runs on `http://localhost:3001`.

## Production Build (Local Check)

```bash
cd client && pnpm build
cd ../admin && pnpm build
```

## Vercel Deployment (Current Setup)

Deploy as **two separate Vercel projects** from the same repo:

1. **Client project**
   - Root Directory: `client`
   - Install Command: `pnpm install --frozen-lockfile`
   - Build Command: `pnpm build`
   - Node.js: 22.x

2. **Admin project**
   - Root Directory: `admin`
   - Install Command: `pnpm install --frozen-lockfile`
   - Build Command: `pnpm build`
   - Node.js: 22.x

## Important Note About Data

This project currently uses SQLite file storage. On serverless platforms (like Vercel), write persistence is limited and may reset on redeploy/cold start.

For permanent production data, migrate to a managed database (e.g. Postgres).

## Useful Commands

```bash
# Run lint
cd client && pnpm lint
cd ../admin && pnpm lint

# Start production server locally
cd client && pnpm start
cd ../admin && pnpm start
```

## License

Private project.
