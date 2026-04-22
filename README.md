# RankMe

A head-to-head voting app that ranks items using the ELO rating system.

## Features

- Create topics for ranking anything (movies, food, photos…)
- Vote between 2 randomly matched items with ELO scoring
- K-factor: new items gain/lose ELO faster (K=40 < 10 games, K=20 < 30, K=10 after)
- Sessions tracked via cookies — no repeated pairs per browser session
- Similar ELOs are matched preferentially
- Upload images or use text-only items
- Admin panel at a secret URL to delete topics/items

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Prisma** ORM + **Supabase PostgreSQL**
- **Supabase Storage** for images
- **Tailwind CSS**

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/pisanuw/rankme.git
cd rankme
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Storage**, create a new bucket called `rankme-images` and set it to **public**.
3. In **Settings → Database**, copy the connection strings.
4. In **Settings → API**, copy the URL, anon key, and service role key.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Connection pooling URI (port 6543) |
| `DIRECT_URL` | Supabase → Settings → Database → Direct connection URI (port 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role secret key |
| `ADMIN_SECRET` | Choose any string, e.g. `myadminsecret123` |

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

Admin panel: [http://localhost:3000/your-admin-secret](http://localhost:3000/your-admin-secret)

---

## Deploying to Render

1. Push to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
4. Set **Start Command**: `npm start`
5. Add all environment variables from `.env.local` under **Environment**.

---

## Project Structure

```
src/
  app/
    page.tsx                    # Home — list all topics
    layout.tsx                  # Root layout with nav
    topics/
      new/page.tsx              # Create topic form
      [slug]/
        page.tsx                # Topic page (vote + leaderboard)
        VotePanel.tsx           # Client-side voting UI
        add/page.tsx            # Add item form
    [adminSecret]/
      page.tsx                  # Admin page (secret URL)
      AdminPanel.tsx            # Admin UI (delete topics/items)
    api/
      topics/
        route.ts                # GET list, POST create topic
        [slug]/route.ts         # GET topic details
        [slug]/pair/route.ts    # GET next pair to vote on
        [slug]/vote/route.ts    # POST submit vote
        [slug]/items/route.ts   # POST add item
      admin/
        topics/[id]/route.ts    # DELETE topic
        items/[id]/route.ts     # DELETE item
  lib/
    prisma.ts                   # Prisma client singleton
    elo.ts                      # ELO calculation with K-factor
    session.ts                  # Cookie-based session ID
    slug.ts                     # URL slug generator
    supabase.ts                 # Supabase Storage client
```
