# BLOOMS Junior School

Backend for the BLOOMS school management system: Next.js 16 App Router API
routes, Prisma ORM, Turso (hosted SQLite), NextAuth credentials login.

This document is the setup sequence. The steps are order-dependent —
running them out of order is the most common way this breaks on a first
attempt, so the reasoning for the order is included, not just the commands.

---

## 1. Create the Turso database

You need the Turso CLI installed once, then a database created.

```bash
# install the CLI (macOS/Linux; see turso.tech/docs for Windows)
curl -sSfL https://get.tur.so/install.sh | bash

# log in (opens a browser)
turso auth login

# create the database
turso db create blooms-junior

# get the two values .env needs
turso db show blooms-junior --url
turso db tokens create blooms-junior
```

The first command gives you `DATABASE_URL` (starts with `libsql://`), the
second gives you `DATABASE_AUTH_TOKEN`. Keep both handy for step 2.

**If you'd rather not set up Turso yet:** local SQLite works with zero
external setup — see the alternate line in `.env.example`. Everything in
this backend runs identically against local SQLite; only `DATABASE_URL`
changes. Turso only matters once you deploy somewhere that isn't your own
machine.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env` and fill in:

- `DATABASE_URL` — the `libsql://...` URL from step 1
- `DATABASE_AUTH_TOKEN` — the token from step 1
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — leave as `http://localhost:3000` for local dev

`.env` is gitignored — confirm with `git check-ignore .env` if you're ever
unsure before committing. It holds the Turso auth token and the NextAuth
secret; either leaking would let someone impersonate the app to your
database or forge login sessions.

## 3. Install dependencies

```bash
npm install
```

This installs everything in `package.json`, including four packages this
backend specifically needs that a stock Next.js+Prisma template wouldn't
have: `@libsql/client` and `@prisma/adapter-libsql` (Turso connectivity),
`@next-auth/prisma-adapter` (links NextAuth to your Prisma tables), and
`bcryptjs` (password hashing for the credentials login).

## 4. Generate the Prisma client

```bash
npx prisma generate
```

This reads `prisma/schema.prisma` and generates the typed database client
that every API route imports via `src/lib/prisma.ts`. Run this again any
time you change `schema.prisma` — generated types otherwise go stale and
TypeScript won't catch the mismatch until runtime.

## 5. Push the schema to Turso

```bash
npm run db:turso:push
```

This generates SQL from `schema.prisma` and applies every table — Student, Staff, Class,
Score, Fee, Payment, Attendance, plus NextAuth's User/Account/Session
tables — inside your Turso database. Nothing exists in Turso until this
runs; step 1 only created an empty database. This command is intended for
the initial empty database. For later schema changes, generate and review a
Prisma migration locally, then apply its SQL to Turso with the Turso CLI.

For local SQLite development, set `DATABASE_URL=file:./db/custom.db` and
use `npm run db:push` instead. That command deliberately does not include
`--accept-data-loss`.

Do not run `db:turso:push` against a database that already contains the
application tables: it generates the complete initial schema from empty.

## 6. Seed sample data

```bash
npm run db:seed
```

Creates one of each entity with real relationships between them: a
headteacher and teacher, a class, a student enrolled in it, a score, a
fee with one partial payment, and an attendance record — so the API
routes have something to return on your very first request instead of
empty arrays.

This also creates the one login you can use immediately:

```
email:    g.wanjiru@bloomsjunior.school
password: changeme123
```

**Only run this once.** The seed script does not check for existing data
first — running it a second time will fail on the second attempt, since
`g.wanjiru@bloomsjunior.school` already exists and both `Staff.email` and
`User.email` are unique constraints. If you need to reset and reseed from
scratch, see `db:reset` below.

## 7. Start the dev server

```bash
npm run dev
```

`npm run dev` only starts Next.js. Database schema changes are explicit, so
starting the server cannot unexpectedly modify a shared Turso database.

The app is now running at `http://localhost:3000`. Sign in at
`http://localhost:3000/login` with the seeded credentials above.

---

## Verifying it actually worked

A quick end-to-end check, in order:

```bash
# 1. Confirm the server responds at all
curl -i http://localhost:3000/login

# 2. Confirm a protected route correctly rejects an unauthenticated request
curl -i http://localhost:3000/api/students
# expect: 401 {"error":"Not authenticated"}
```

Getting a 401 on step 2 is the *correct* result, not a bug — it confirms
`requireSession()` in `src/lib/require-auth.ts` is actually enforcing
auth on every route, rather than the routes silently working unprotected.
To get past it, sign in through the browser at `/login` first (this sets
the session cookie `curl` doesn't have), then use the app UI or a tool
like Postman/Insomnia with that cookie to exercise the other endpoints.

## What's implemented

Six entities, each with a full REST-style route pair
(`GET`/`POST` on the collection, `GET`/`PATCH`/`DELETE` on `/[id]`):

| Entity | Route | Notable behavior |
|---|---|---|
| Students | `/api/students` | Search by name/admission no., filter by class |
| Staff | `/api/staff` | `DELETE` deactivates (`active: false`), doesn't hard-delete |
| Classes | `/api/classes` | List includes live student counts |
| Scores | `/api/scores` | `?bulk=true` for whole-class entry in one request |
| Fees | `/api/fees` | Nested `/api/fees/:id/payments` — see below |
| Attendance | `/api/attendance` | `?bulk=true` for whole-class daily marking, upserts safely if resubmitted |

**Fee payments work differently from the other five.** `Fee.status`
(UNPAID/PARTIAL/PAID/WAIVED) is never set directly by a client — it's
recomputed from the actual sum of `Payment` rows every time a payment is
recorded via `POST /api/fees/:id/payments`, inside a database transaction.
This exists specifically so the displayed status can never drift out of
sync with the real payment total.

Every route validates input with Zod (`src/lib/validators/`) and returns
errors in one consistent shape: `{ error: string, details?: unknown }`,
handled centrally in `src/lib/api-response.ts`.

## Known limitation: role checking is coarse

`requireRole()` in `src/lib/require-auth.ts` checks `User.role`, which is
only ever `ADMIN` or `STAFF`. It has no visibility into `Staff.role`
(TEACHER/ADMIN/ACCOUNTANT/HEADTEACHER), even though that richer enum
already exists in the schema. In practice, this means every
`requireRole("ADMIN")` check in the codebase — creating a class, creating
a fee, deleting a student — is really an all-admins-or-nobody check.
There's currently no way to let a HEADTEACHER create classes without also
being a full `ADMIN`, or let an ACCOUNTANT manage fees without full admin
rights elsewhere too.

Fixing this means `requireRole` needs to also load the `Staff.role` for
the session's `staffId` and check against that, not just `User.role`.
Worth doing before this goes to real users if job-title-based permissions
matter to how the school actually operates — right now it's a two-tier
system (admin / everyone else) wearing a four-tier schema.

## Project structure

```
prisma/
  schema.prisma       All models, enums, relations
  seed.ts             Sample data — see step 6
src/
  app/
    api/              Every route described in the table above
    login/page.tsx    Credentials login form
    layout.tsx        Root layout, wraps app in SessionProvider
    providers.tsx      that SessionProvider
    globals.css        Tailwind v4 + CSS variables for shadcn/ui theming
  lib/
    prisma.ts         DB client singleton, wired to Turso via libsql adapter
    auth.ts           NextAuth config -- Credentials provider, JWT sessions
    require-auth.ts   requireSession() / requireRole() route guards
    api-response.ts   Shared success/error response shaping
    validators/       One Zod schema file per entity
  types/
    next-auth.d.ts    Extends NextAuth's types with role/staffId
```

## Common next steps

- **Install shadcn/ui components.** `components.json` is already
  configured (new-york style, neutral base color) but no components are
  installed yet -- the login page uses plain HTML deliberately, for this
  reason. Run e.g. `npx shadcn add button input card table` to start
  building real UI on top of these API routes.
- **Fix the role-checking gap above** before relying on Staff-level roles
  for anything access-control-related.
- **Add rate limiting** to `/api/auth/[...nextauth]` if this becomes
  internet-facing -- the Credentials provider as configured has no
  brute-force protection beyond what NextAuth includes by default.
