# Database

SQL migrations are the source of truth for the schema. The NestJS backend uses TypeORM entities that mirror these tables (`synchronize: false`).

## Prerequisites

- PostgreSQL 14+ (local install or managed instance)

## Apply migrations

```bash
# Windows PowerShell example
$env:DATABASE_URL = "postgresql://user:pass@localhost:5432/insurexp"
psql $env:DATABASE_URL -f database/migrations/001_initial.sql
```

## Optional dev seed

After the migration:

```bash
psql $env:DATABASE_URL -f database/seeds/001_dev.sql
```

Seed creates:

- Hospital `Apollo Multispecialty`
- Cashier `test@insurexp.com` / password `changeme`
- Sample services and one patient

## Connection string

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` to match your Postgres instance.
