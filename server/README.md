# Memomed API Server

Express + SQLite backend that exposes authenticated endpoints for the Memomed app. Designed for a single account with email/password login, but easy to extend later.

## Features

- JWT auth (`/auth/login`) with bcrypt-hashed passwords.
- CRUD for treatments (`/api/treatments`).
- Intake logs listing + status updates (`/api/intake-logs`).
- Product catalogue + simple orders (`/api/products`, `/api/orders`).
- SQLite migrations run automatically on boot.
- Seed script that provisions a user + demo data.

## Getting started

```bash
cd server
cp .env.example .env
# edit ADMIN_EMAIL / ADMIN_PASSWORD / JWT_SECRET as needed
npm install
npm run seed   # creates the user + demo data
npm run dev    # starts API on http://localhost:4000
```

### Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (default `4000`) |
| `JWT_SECRET` | Secret used for signing JWTs (change this in production) |
| `ADMIN_EMAIL` | Email for the seed user |
| `ADMIN_PASSWORD` | Plain password for the seed user (used only during seeding) |

### Deploying

1. Build: `npm run build`. Upload `dist/` + `package.json` + `package-lock.json` to Render/Fly.
2. Provision a persistent volume for the `data/` directory (it stores `memomed.db`).
3. Set the same env vars (including `JWT_SECRET`).
4. Run `npm run seed` once (or provide your own provisioning script) to create the user and sample data.

### Front-end integration

Point the Vite app to the API via an env var:

```
# memomed-smart-refill-main WEBAPP/.env.local
VITE_API_URL=http://localhost:4000
```

Then, from React Query (or fetch) include the JWT token returned from `/auth/login`:

```ts
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/treatments`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

Feel free to add more routes (reports, reminders etc.) inside `src/index.ts` and re-run `npm run build`.
