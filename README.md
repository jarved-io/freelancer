# SkillBridge Campus

A campus marketplace where any student can hire another student for **any service** — writing help,
tutoring, photography (charged per photo), repairs, design, anything — and any student can list their
own skill with flexible pricing (flat price, per hour, per item, or package tiers). The platform takes a
10% commission on completed orders.

Built with **Next.js (App Router) + PostgreSQL (Prisma) + NextAuth + Tailwind CSS**. This is a real,
deployable app — not a demo.

---

## 1. What you need before you start

- [Node.js](https://nodejs.org) 18 or newer installed on your computer
- A free [GitHub](https://github.com) account
- A free [Vercel](https://vercel.com) account (sign in with GitHub)
- A free PostgreSQL database — the easiest options:
  - [Neon](https://neon.tech) (recommended, generous free tier), or
  - [Vercel Postgres](https://vercel.com/storage/postgres) (created right inside your Vercel project)

---

## 2. Run it on your computer first

```bash
# 1. Install dependencies
npm install

# 2. Copy the example environment file and fill it in
cp .env.example .env
```

Open `.env` and fill in:
- `DATABASE_URL` — your PostgreSQL connection string from Neon/Vercel Postgres
- `NEXTAUTH_SECRET` — generate one by running `openssl rand -base64 32` in your terminal (or use any
  random 32+ character string)
- `NEXTAUTH_URL` — leave as `http://localhost:3000` for now

```bash
# 3. Create the database tables
npx prisma migrate dev --name init

# 4. Add sample listings so the site isn't empty (optional but recommended)
npm run seed

# 5. Start the app
npm run dev
```

Open `http://localhost:3000`. Log in with a seeded account, e.g. `admin@skillbridge.app` /
`password123` (see `prisma/seed.js` for the full list), or just register your own account.

---

## 3. Push it to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repository on GitHub (no README/license — you already have one), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

`.env` is already in `.gitignore`, so your database password and secret will **not** be pushed — good.

---

## 4. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo you just pushed.
2. Before deploying, open **Environment Variables** and add the same three values from your `.env`:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → set this to your future Vercel URL, e.g. `https://your-app.vercel.app`
     (you can update it after the first deploy once you know the exact URL, then redeploy)
3. Click **Deploy**.

Vercel will run `npm install`, then `npm run build` (which runs `prisma generate && next build`)
automatically — no extra config needed.

### First-time database setup on the live database

Your live database also needs its tables created and (optionally) seeded. From your computer, with
`.env` pointed at the **production** `DATABASE_URL** (temporarily, or use a separate `.env.production`):

```bash
npx prisma migrate deploy
npm run seed
```

You only need to do this once (and again whenever you change `prisma/schema.prisma`).

---

## 5. How the marketplace works

- **Any student can list any service** from `/listings/new` — they pick a category (or type their
  own), write a description, and choose how to price it:
  - **Flat price** — one price no matter what (e.g. ₹500 to fix a laptop)
  - **Per item** — priced per unit, buyer picks quantity (e.g. ₹10 per photo)
  - **Per hour** — priced hourly, buyer picks hours (e.g. ₹350/hour tutoring)
  - **Package tiers** — Basic/Standard/Premium style, like a freelancing site
- Buyers browse `/browse`, open a listing, and place an order.
- Orders move through **Pending → Accepted → In Progress → Delivered → Completed** (or Revision
  Requested / Cancelled). Sellers advance the status; buyers accept delivery or request a revision.
- Every order has a **message thread** between buyer and seller.
- On completed orders, the buyer can leave a **star rating and review**, shown on the listing.
- The platform commission is a fixed **10%**, calculated automatically (see `lib/pricing.js`) and shown
  transparently on every order.
- `/dashboard` shows a student's purchases, their own listings, incoming orders on those listings, and
  earnings.
- `/admin` (visible only to users with `isAdmin: true` in the database) shows platform-wide users,
  listings, orders, and commission revenue by category.

To make a user an admin, update their row in the database:
```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'you@college.edu';
```
(You can run this from Neon's SQL editor, or `npx prisma studio` for a visual editor.)

---

## 6. Project structure

```
app/                    Pages and API routes (Next.js App Router)
  api/                  Backend endpoints (auth, listings, orders, messages, reviews)
  browse/               Browse & search all listings
  listings/new/         Create a listing (any category, flexible pricing)
  listings/[id]/        Listing detail + order form
  orders/[id]/          Order detail, status actions, messaging, reviews
  dashboard/            A student's purchases / listings / sales / earnings
  admin/                Platform-wide admin view
  login/, register/     Auth pages
components/             Reusable UI (Navbar, ListingCard, OrderActions, etc.)
lib/                    Prisma client, NextAuth config, pricing/commission logic, categories
prisma/schema.prisma    Database schema
prisma/seed.js          Sample data (writing, tutoring, photography, repairs)
```

## 7. Things intentionally left simple (fair to build next)

- No real payment processing — commission math is fully modeled, but no money actually moves. Adding
  Razorpay/Stripe later means wiring their checkout into `app/api/orders/route.js`.
- No image uploads — listings are text-only for now. Adding photos means wiring a storage provider
  (e.g. Vercel Blob or Cloudinary) into the listing form.
- No campus/email-domain verification — anyone can register with any email. If you want to restrict
  signups to one college, check the email domain in `app/api/register/route.js`.
