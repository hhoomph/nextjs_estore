# Deploying nextjs_estore to Vercel + Neon (Free)

This guide walks you through a zero-cost production deployment of this Next.js 16 + Prisma + Better Auth store on **Vercel Hobby** (frontend + serverless) and **Neon Free** (PostgreSQL).

---

## 0. Prerequisites

- A GitHub account.
- A Vercel account (sign up at <https://vercel.com> with GitHub).
- A Neon account (sign up at <https://neon.tech> with GitHub).
- A local clone of this repo with `bun` (or `npm`/`pnpm`) installed.
- `openssl` available (for generating a secret).

---

## 1. Pre-flight checklist (in this repo)

- [ ] `.env` is in `.gitignore` (it is — already covered by `.env*`).
- [ ] **Rotate any API keys that were ever committed to git history.** The old `.env` contains real production-style keys (OpenAI, Anthropic, Resend, Clerk, Knock, GitHub OAuth, Google OAuth). If this repo is or was public, those keys are exposed and must be rotated before you reuse them in production.
- [ ] Only `.env.example` (placeholder values) is tracked.

The repo now contains:

- `vercel.json` — runs `prisma generate && next build` and pins the Vercel region to `iad1` (change this if your Neon DB lives in a different region).
- `package.json` scripts:
  - `vercel-build` — used by Vercel to generate the Prisma client, run migrations, then build.
  - `db:migrate:deploy` — run Prisma migrations against the configured `DATABASE_URL` (use the Neon URL).
  - `db:migrate:status` — show which migrations have been applied.
- `next.config.ts` — production `remotePatterns` is now an allowlist (overridable via `NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS`). Dev still allows `http://localhost:3000`.

---

## 2. Create the Neon database (free)

1. Go to <https://neon.tech> → **Create a project**.
2. Settings:
   - **Name:** `nextjs-estore`
   - **Region:** pick the region that matches `vercel.json#regions` (default `iad1` — US East). If you change the Vercel region, change it here too.
   - **Postgres version:** 16 (default).
3. From the **Dashboard**, copy **both** connection strings:
   - **Pooled** (used at runtime, goes through PgBouncer) → goes into `DATABASE_URL`
   - **Direct** (used for migrations) → goes into `DIRECT_URL`
4. Free tier limits: 0.5 GB storage, 190 compute hours/month, scales to zero.

---

## 3. Push the repo to GitHub

If it is not already on GitHub:

```bash
git init
git add .
git commit -m "chore: prepare for vercel+neon deploy"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

> Do not commit `.env` — only `.env.example` should be tracked.

---

## 4. Create the Vercel project

1. <https://vercel.com> → **Add New… → Project** → **Import** the repo.
2. On the configuration screen:
   - **Framework Preset:** Next.js (auto-detected).
   - **Root Directory:** `./`.
   - **Build Command:** leave the override enabled, set to `npm run vercel-build` (or `bun run vercel-build`).
     - If you skip the override, `vercel.json` still runs `prisma generate && next build` for you; only do this if you do **not** want migrations on every deploy (recommended for stable production DBs — see step 6).
   - **Install Command:** default.
   - **Output Directory:** default.
   - **Node.js Version:** 20 (Project Settings → General → Node Version after creation, or pin via `engines` in `package.json`).

### Environment variables

Set these in **Project Settings → Environment Variables**. Mark each at minimum for **Production**; also enable for **Preview** if you want preview deploys to work.

| Name | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Neon **pooled** URL, with `?sslmode=require&pgbouncer=true&connect_timeout=10` | Runtime, serverless |
| `DIRECT_URL` | Neon **direct** URL, with `?sslmode=require` | Migrations only |
| `BETTER_AUTH_SECRET` | `openssl rand -hex 32` | 64 hex chars |
| `BETTER_AUTH_URL` | `https://YOUR-PROJECT.vercel.app` (placeholder — update after first deploy) | |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | same as above | |
| `ALLOWED_CALLBACK_URLS` | `https://YOUR-PROJECT.vercel.app/api/auth/callback,https://YOUR-PROJECT.vercel.app` | comma-separated |
| `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` | `admin@estore.com` | (change to your real admin) |
| `NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS` | e.g. `lh3.googleusercontent.com,images.unsplash.com,res.cloudinary.com` | Comma-separated. If unset, sensible defaults apply. |
| `OPENAI_API_KEY` | (only if used) | |
| `ANTHROPIC_API_KEY` | (only if used) | |
| `RESEND_API_KEY` | (only if used) | |
| `AI_GATEWAY_API_KEY` | (only if used) | |
| `BLOB_READ_WRITE_TOKEN` | (only if used) | |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | (only if using Google OAuth) | |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | (only if using GitHub OAuth) | |

> **Do not paste your local `.env` file.** It contains `http://localhost:3000` and your local DB password, neither of which works in production.

### Deploy

Click **Deploy**. The first build may fail if the database has no schema yet — that is expected and fixed in step 5.

---

## 5. Apply Prisma migrations to Neon

You have two options. **Option A is recommended for production.**

### Option A — run migrations locally against the Neon URL (one-time)

In your local `.env`, **temporarily** set:

```
DATABASE_URL="<Neon pooled URL>"
DIRECT_URL="<Neon direct URL>"
```

Then:

```bash
bun run db:migrate:deploy
# optional: seed sample data
bun run db:seed
```

Revert your local `.env` back to your local Postgres values so you do not break local dev.

### Option B — run migrations on every Vercel deploy

Leave `vercel-build` as the Build Command. Vercel will run `prisma generate && prisma migrate deploy && next build` on every push.

This is fine for a personal project but builds are slower and a broken migration can take the site down. Use Option A in production and only fall back to B for staging.

---

## 6. Update env vars with the real Vercel URL

After the first successful deploy, Vercel gives you a URL like `https://nextjs-estore.vercel.app`. Go to **Settings → Environment Variables** and update:

- `BETTER_AUTH_URL` → `https://nextjs-estore.vercel.app`
- `NEXT_PUBLIC_BETTER_AUTH_URL` → same
- `ALLOWED_CALLBACK_URLS` → `https://nextjs-estore.vercel.app,https://nextjs-estore.vercel.app/api/auth/callback`

Trigger a redeploy: **Deployments → ⋮ on the latest → Redeploy**.

---

## 7. Update OAuth provider callback URLs (only for providers you actually use)

**Google** — <https://console.cloud.google.com/apis/credentials> → your OAuth client → **Authorized redirect URIs** add:

```
https://nextjs-estore.vercel.app/api/auth/callback/google
```

**GitHub** — Settings → Developer settings → OAuth Apps → your app → **Authorization callback URL**:

```
https://nextjs-estore.vercel.app/api/auth/callback/github
```

---

## 8. Verify

- [ ] `https://nextjs-estore.vercel.app/` loads.
- [ ] Sign-up / sign-in works (writes to the `account` + `user` tables on Neon).
- [ ] Admin login succeeds for the email in `NEXT_PUBLIC_SUPER_ADMIN_EMAILS`.
- [ ] Product pages render (Prisma + Next/Image optimization).
- [ ] AI features (if any) work — requires `OPENAI_API_KEY` or `AI_GATEWAY_API_KEY`.
- [ ] Email features (if any) work — requires `RESEND_API_KEY`.
- [ ] Vercel → Project → **Logs** shows no recurring 5xx.

---

## 9. (Optional) Custom domain

Cheapest path:

1. Register a domain on **Cloudflare Registrar** (~$10/yr at-cost, no markup).
2. Vercel → **Settings → Domains** → add the apex and `www`. Vercel prints the DNS records.
3. Add the records at Cloudflare (an `A` record and a `CNAME`).
4. Vercel auto-provisions Let's Encrypt SSL — free, auto-renewing.
5. Update the three `BETTER_AUTH_URL` / `ALLOWED_CALLBACK_URLS` env vars to the new domain and redeploy.
6. Update OAuth callback URLs in Google/GitHub consoles.

---

## 10. Cost & limits cheat-sheet (free tier)

| Service | Free quota | When you exceed |
|---|---|---|
| Vercel Hobby | 100 GB bandwidth, 6,000 build min/mo, 1 GB blob, 10 s function timeout | $20/mo Pro |
| Vercel Image Optimization | 1,000 source images/mo, then $5 per extra 1,000 | |
| Neon Free | 0.5 GB storage, 190 compute hr/mo, 1 project, 10 branches | $19/mo Launch |
| GitHub | Unlimited public repos | — |

---

## 11. Troubleshooting

- **Build error: "Cannot find module '@prisma/client'"** — your build did not run `prisma generate`. Verify `vercel.json` is committed and the Vercel framework is `nextjs`.
- **Build error: migrations failed on Vercel** — the DB is empty or `DIRECT_URL` is wrong. Use **Option A** (run migrations locally) to bootstrap, then redeploy.
- **`BETTER_AUTH_URL` warnings / 401 on sign-in** — env var still points to `http://localhost:3000`. Update and redeploy.
- **`next/image` 403 on remote images** — the host is not in the allowlist. Add it to `NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS` (comma-separated) and redeploy.
- **Cold starts feel slow on AI routes** — set `export const maxDuration = 60` and `export const runtime = 'nodejs'` on the route, or move the work behind Vercel AI Gateway streaming.
- **Region latency** — Vercel region and Neon region must match. Update `vercel.json#regions` and recreate the Neon project (or move it via a Neon branch + redirect).
- **`dangerouslyAllowSVG: true`** — keep only if you actually serve user-uploaded SVG (e.g. product icons). Otherwise remove it.
