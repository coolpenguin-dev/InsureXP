# InsureXP

Healthcare billing and payment workspace: **NestJS** API, **Next.js** cashier UI, **PostgreSQL** schema (SQL migrations). No Docker required.

## Structure

| Path | Description |
|------|-------------|
| `backend/` | NestJS API (`/api/*`), JWT auth, billing, stubs for settlement/payment/credit |
| `frontend/` | Next.js App Router, sidebar shell aligned to reference design |
| `database/` | SQL migrations and optional dev seed |

## Billing module

| Area | What | Where |
|------|------|--------|
| **Cashier login / session** | JWT login, `localStorage` session, **401 → sign out + redirect to `/login`** | `/login`, `AuthProvider`, `apiFetch` |
| **Patient details** | Name + optional insurance/MRN → `POST /api/patients` | `PatientDetailsForm` |
| **Service selection** | `GET /api/services`, dropdown by **category**, qty, **Add item** | Billing tab |
| **Line items** | Rows with **± qty**, remove | Billing tab |
| **Subtotal & save** | Σ (unit × qty); **Save bill** → `POST /api/bills/create` | Billing tab |

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Database setup

1. Create a database (e.g. `insurexp`).
2. Apply the schema and seed:

```bash
psql "postgresql://USER:PASS@localhost:5432/insurexp" -f database/migrations/001_initial.sql
psql "postgresql://USER:PASS@localhost:5432/insurexp" -f database/seeds/001_dev.sql
```

See [`database/README.md`](database/README.md). Dev seed cashier: **`test@insurexp.com`** / **`111111`** (see `database/seeds/001_dev.sql`).

## Run API + UI together

From the **repository root** (one install, one dev command):

```bash
npm install
npm run dev
```

This starts **Nest** on `http://localhost:4000` and **Next.js** on `http://localhost:3000` in one terminal. Use `Ctrl+C` to stop both.

**First-time env files**

- `backend/.env` — copy from `backend/.env.example` (`DATABASE_URL`, `JWT_SECRET`, etc.).
- `frontend/.env.local` — copy from `frontend/.env.example` if you need a non-default API URL.

`npm start` is an alias for `npm run dev`.

### `ERR_CONNECTION_REFUSED` on login (port 4000)

The UI calls `http://localhost:4000/api`. If the browser shows connection refused, the **API process is not listening**—usually because Nest failed during startup.

1. Watch the **`[api]`** lines in the same terminal as `npm run dev`. You should see **`Nest application successfully started`** and no repeating TypeORM errors.
2. Ensure **`backend/.env`** exists with a valid **`DATABASE_URL`** and that **PostgreSQL is running** with the schema applied (see [Database setup](#database-setup)).
3. If you only see **`[web]`** logs or the api process exits, fix the backend error first, then restart `npm run dev`.

### Next.js dev errors on Windows (`ENOENT` / `_buildManifest.js.tmp`)

Turbopack was resolving the **repo root** because of the outer `package-lock.json`. `frontend/next.config.ts` now sets `turbopack.root` to the `frontend` folder. If it still misbehaves:

1. Stop `npm run dev`.
2. Delete `frontend/.next`.
3. Start again.

Fallback (Webpack dev server): from `frontend/` run `npm run dev:webpack`.

## Backend (alone)

```bash
cd backend
npm run start:dev
```

- API base: `http://localhost:4000/api`
- Health: `GET /api/health`
- Auth: `POST /api/auth/login`
- Services (JWT): `GET /api/services`
- Patients (JWT): `POST /api/patients`
- Bills (JWT): `POST /api/bills/create`, `GET /api/bills/:id`, `POST /api/bills/verify`

Settlement, payment, and credit routes return **stub** JSON until integrations are built.

## Frontend (alone)

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` → **Billing** workspace. Point `NEXT_PUBLIC_API_URL` at the API (default `http://localhost:4000/api`).

## Supporting libraries (backend)

- **PDFKit**, **ExcelJS**, **json2csv** — wired in `ReportsService` for future invoice/export endpoints.
- **Redis** — optional; add queues/sessions when needed (`REDIS_URL` in `.env.example`).

## License

Private / UNLICENSED unless otherwise specified.
