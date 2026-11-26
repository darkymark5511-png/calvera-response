# Calvera Response

Calvera Bay Tactical Response Unit — Next.js app with Supabase Postgres accounts,
server-authoritative progress, and an admin seed script.

## Stack

- Next.js 16 (App Router), TypeScript, React 19
- Supabase Postgres (only database)
- Drizzle ORM + `pg` (node-postgres), pool `max: 1` per serverless instance, SSL required
- Auth: `node:crypto` scrypt (N=16384, r=8, p=1), opaque session tokens stored as SHA-256 hashes
- Rate limiting in Postgres (`game.login_attempts`) because serverless instances do not share memory

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. **No connection strings or
credentials are committed.** `.env*` is git-ignored except `.env.example` (empty values only).

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase **transaction pooler**, port `6543`. Used by the running app on Vercel. |
| `DATABASE_URL_MIGRATE` | Supabase **session pooler**, port `5432` on the pooler host. Used by `drizzle-kit` from a developer machine or CI. |
| `DATABASE_CA_CERT` | Optional. Supabase root CA in PEM form. When set, the pool verifies the pooler's chain (`rejectUnauthorized: true`) instead of encrypting without verification. |
| `ADMIN_USERNAME` | Admin account to create/update. Read only by `db:seed-admin`. |
| `ADMIN_PASSWORD` | Admin password, minimum 12 characters. Read only by `db:seed-admin`. |

Use the direct database host only if the IPv4 add-on is enabled, because Vercel
functions need IPv4. The pooler hosts are IPv4 and need no add-on.

Copy the pooler host from the Supabase **Connect** dialog rather than composing it.
The `aws-N` prefix is a pooler cluster index, not a region name, and a project lives
on exactly one of them — an `aws-0` host pointed at an `aws-1` project fails with
`tenant or user not found`, which looks like a credentials problem but is not.

Note on TLS: `pg` builds its config with `Object.assign({}, config, parse(url))`, so
an `sslmode` parameter inside the connection string replaces the `ssl` option. The
app therefore strips `sslmode`/`ssl*` parameters before handing the string to `pg`
(`src/db/ssl.ts`). Supabase's pooler presents a chain rooted at the Supabase root CA,
which is not in the Node trust store and whose intermediate is sometimes omitted, so
verifying against the system store fails with `SELF_SIGNED_CERT_IN_CHAIN`. TLS is
always on for a remote host; set `DATABASE_CA_CERT` to pin the root and get full
verification. `sslmode=disable` is honoured only for a loopback host.

## Database

All game tables live in the dedicated `game` Postgres schema — never in `public`.
`drizzle.config.ts` sets `schemaFilter: ["game"]` so drizzle-kit never touches
Supabase internal schemas.

Tables: `game.users`, `game.sessions`, `game.progress`, `game.scores`, `game.login_attempts`.

Row Level Security is enabled on every game table inside the migration, with **no
policies**. The app reaches Postgres through the server-side connection, which
bypasses RLS, so the public anon key cannot read or write game data. Keep the
`game` schema out of the Supabase Data API exposed-schemas list.

### Migrations

```bash
npm run db:generate      # generate SQL into /drizzle (commit it)
DATABASE_URL_MIGRATE=… npm run db:migrate   # apply with drizzle-kit migrate
```

- Migrations are generated with drizzle-kit, committed under `/drizzle`, and applied
  with `drizzle-kit migrate`.
- Never run `drizzle-kit push` against production.
- Migrations never run inside the Vercel build command.

### Admin seed

```bash
npm run db:seed-admin
```

Run once after migrations, with `ADMIN_USERNAME` and `ADMIN_PASSWORD` set. The script
upserts the user, forces `role = 'admin'`, and writes a fresh password hash on every
run — rotating the password means running it again. It exits non-zero if either
variable is missing or if the password is shorter than 12 characters. It never runs
at app startup and never inside the build.

No admin username or password appears in source, README, tests, fixtures, comments,
or commit messages.

## API

| Route | Notes |
| --- | --- |
| `POST /api/auth/register` | `username` 3–20 chars `[A-Za-z0-9_]`, `password` 8–72 chars. Usernames are stored lowercase and unique. |
| `POST /api/auth/login` | Sets the `cr_session` cookie. Failures always return `401` with "Username or password is incorrect." |
| `POST /api/auth/logout` | Deletes the session row and clears the cookie. |
| `GET /api/auth/me` | `{ user }` or `{ user: null }`. |
| `GET /api/health` | `200` when the database answers, `503` with code `DB_UNAVAILABLE` otherwise. |

Session cookie: `cr_session`, 32 random bytes base64url (only its SHA-256 hash is
stored), `HttpOnly`, `Secure` in production, `SameSite=Lax`, 30-day expiry.

Login rate limit: 5 failed attempts per 15 minutes, tracked per IP **and** per
username. The sixth attempt returns `429` with code `RATE_LIMIT`.

If `DATABASE_URL` is missing, API routes return `503` with code `DB_UNAVAILABLE`.
Nothing throws at import time, so the client keeps playing offline. Guests play
offline; only signed-in accounts sync progress and scores to the server.

## Phase 2: suspect AI, squad and rules of engagement

Phase 2 is a pure simulation layer under `src/game`, plus one screen that drives it.

| Module | What it owns |
| --- | --- |
| `src/shared/roster.ts` | The eight operators. Every callsign is a surname and is unique. The squad is three. |
| `src/game/ai/awareness.ts` | 0..100 awareness meter with entry and exit thresholds, so states do not flicker. |
| `src/game/perception/visibility.ts` | Sight cone, range, room light, smoke and walls. Night vision is observer-side only — the player's goggles never brighten the world for a suspect. |
| `src/game/ai/suspect.ts` | Per-tick suspect brain: status effects, perception, awareness, mood, aim point. |
| `src/game/ai/squad.ts` | Squad members bound to roster ids, light-beam radio reports, suppression, treatment time. |
| `src/game/commands/radial.ts` | The eight orders, their radio acknowledgements, and who answers each one. |
| `src/game/combat/roe.ts` | Rules-of-engagement verdicts: allowed, blocked, or a lead entry. |
| `src/game/combat/penetration.ts` | Material and caliber penetration table with a per-layer resolver. |
| `src/game/world/range.ts` | The training range: pure `stepRange` / `fire` / `issueRangeCommand` transitions. |

The range lives at `/range` and is reachable from HQ. It is a debugging and
demonstration surface: the awareness meter, the three-operator squad and its radio
traffic, the eight radial orders, the rules-of-engagement lead counter, and a
penetration readout are all visible and drivable without a rendering engine.

Awareness rules:

- A weapon light beam in the suspect's view raises awareness to at least 25 (suspicious).
- A laser dot resting on the body adds 10 points per second.
- Seeing the player adds awareness at a rate scaled by sight confidence.
- With no stimulus, awareness decays 4 points per second.
- Entry thresholds are 25 / 55 / 80; exit thresholds are 15 / 45 / 70.

Lead entries are written when a lethal shot is taken in a non-lethal operation, on
a suspect who is surrendering, on a suspect already down, or on a suspect who was
never positively identified. A teammate in the line of fire blocks the shot instead.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

## Quality gates

Every phase must pass all four before its PR opens:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```
