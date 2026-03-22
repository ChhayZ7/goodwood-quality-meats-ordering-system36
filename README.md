# 🥩 Goodwood Quality Meats

> A full-stack e-commerce store for a premium meat shop, built with Next.js, Supabase,and Stripe.

---

## Overview

Goodwood Quality Meats is a full-stack e-commerce web application that lets customers browse, filter, and purchase premium meat products online. The app handles user authentication, product management, cart state, checkout with Stripe payments, and order history — all in a single Next.js project.

---

## Features

- Browse and filter products by category (beef, lamb, pork, chicken)
- User authentication via Supabase Auth (email/password + OAuth)
- Shopping cart with persistent state via React Context
- Secure checkout with Stripe Checkout Sessions
- Order confirmation via Stripe webhooks
- Customer order history in a protected dashboard
- Product image storage via Supabase Storage

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js + Javascript + Tailwind CSS | Pages, components, UI |
| Backend | Next.js API routes | REST endpoints in `app/api/` |
| Database | Supabase (PostgreSQL) | Products, orders, users |
| Auth | Supabase Auth | Sessions, JWT, OAuth |
| Payments | Stripe | Checkout sessions + webhooks |
| Storage | Supabase Storage | Product images (S3-compatible) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project — [supabase.com](https://supabase.com)
- A Stripe account — [stripe.com](https://stripe.com)
- AWS account with CLI configured (for deployment)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ChhayZ7/goodwood-quality-meats-ordering-system36.git
cd goodwood-quality-meats-ordering-system36
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file in the project root with the following:

Request Chhay for the access code below
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-default-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key — safe for client |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service role key — server only, never expose to client |
| `STRIPE_SECRET_KEY` | Stripe secret key — server only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key — safe for client |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook dashboard or CLI |
| `NEXT_PUBLIC_URL` | App base URL — update to your production domain |

> **Important:** Never prefix secret keys with `NEXT_PUBLIC_` — they would be exposed in the client bundle.

---

## Project Structure

```
goodwood-meats/
├── app/
│   ├── layout.js                  # Root layout — navbar, footer, providers
│   ├── page.js                    # Homepage — hero, featured products
│   ├── products/
│   │   ├── page.js                # Product listing with category filters
│   │   └── [id]/page.js           # Single product detail page
│   ├── cart/
│   │   └── page.js                # Cart summary and checkout button
│   ├── checkout/
│   │   └── page.js                # Checkout form — creates Stripe session
│   ├── dashboard/
│   │   └── page.js                # Protected — customer order history
│   ├── login/
│   │   └── page.js                # Authentication — sign in / sign up
│   └── api/
│       ├── products/route.js      # GET all products from Supabase
│       ├── orders/route.js        # POST new order, GET order history
│       ├── checkout/route.js      # POST — creates Stripe checkout session
│       └── webhook/route.js       # Stripe webhook — confirms payment, saves order
│
├── components/
│   ├── Navbar.jsx                 # Top nav — logo, links, cart icon, auth state
│   ├── ProductCard.jsx            # Product thumbnail — image, name, price, add to cart
│   ├── CartDrawer.jsx             # Slide-out cart panel
│   ├── CategoryFilter.jsx         # Filter bar — beef, lamb, pork, chicken
│   └── OrderCard.jsx              # Single order row in dashboard history
│
├── lib/
│   ├── supabase.js                # Client-side Supabase instance (public anon key)
│   ├── supabase-server.js         # Server-side Supabase (API routes + server components)
│   ├── supabase-admin.js          # Admin client — storage uploads, service role only
│   └── stripe.js                  # Stripe SDK instance — payments + webhooks
│
├── context/
│   ├── CartContext.jsx            # Cart items, quantities, add/remove/clear
│   └── AuthContext.jsx            # Current user session from Supabase Auth
│
├── hooks/
│   ├── useCart.js                 # Access CartContext — items, addItem, removeItem
│   ├── useAuth.js                 # Access AuthContext — user, signIn, signOut
│   └── useProducts.js             # Fetch and cache products from the API
│
├── public/                        # Static assets — logo, favicon, placeholder images
├── middleware.js                  # Session refresh + protect /dashboard routes
├── next.config.js                 # Image domains, env vars, redirects
├── .env.local                     # All secrets — never committed to git
└── .gitignore
```

### Folder responsibilities

**`app/`** — All pages and backend endpoints. Folders map directly to URL paths. The `api/` subfolder is the backend — no separate server needed.

**`components/`** — Reusable UI pieces. If something appears on more than one page, it lives here.

**`lib/`** — Third-party service clients (Supabase, Stripe). Created once, imported everywhere. Avoids re-initialising connections on every request.

**`context/`** — Global state shared across the whole app without prop drilling. The cart is a good example — adding an item on the product page needs to update the count in the navbar.

**`hooks/`** — Reusable logic extracted from components. `useCart()` and `useAuth()` give any component instant access to shared state.

**`middleware.js`** — Runs before every matched request. Keeps Supabase sessions alive and blocks unauthenticated users from `/dashboard`.

---

## Contributing

Please follow these conventions when working on the codebase:

- **Branches:** `feature/your-feature-name` or `fix/bug-description`
- **Commits:** lowercase imperative — e.g. `add product filter component`
- **Never commit** `.env.local` or any file containing API keys
- All API logic goes in `app/api/` — no backend code in page components
- Shared UI goes in `components/` — do not duplicate across pages

---

*Goodwood Quality Meats — built with Next.js, Supabase, and Stripe*