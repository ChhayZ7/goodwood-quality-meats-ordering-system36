# GMOS Deployment Guide
## Goodwood Quality Meats Ordering System — Production Handover

---

## 1. Overview

This document covers the steps required to deploy the Goodwood Quality Meats Ordering System (GMOS) from a local development environment to a production environment.

The production stack includes:

- Next.js 16 App Router
- Supabase
- Stripe
- Resend
- Vercel
- GitHub

The recommended hosting platform is Vercel, as it provides direct GitHub integration, automatic deployments, environment variable management, and strong support for Next.js applications.

---

## 2. Prerequisites

Before starting the deployment, ensure access is available to the following:

- GitHub repository containing the GMOS project source code
- Supabase project dashboard
- Stripe dashboard
- Resend dashboard
- Vercel account
- Domain registrar account for `goodwoodqualitymeats.com.au`

The person completing the deployment should have permission to manage production environment variables, DNS settings, authentication URLs, payment webhook settings, and deployment configuration.

---

## 3. Deployment Workflow Summary

The production deployment process follows these major steps:

1. Import the GitHub repository into Vercel
2. Configure Supabase production settings
3. Configure Stripe production payment settings
4. Configure Resend email settings
5. Add environment variables in Vercel
6. Connect the custom domain
7. Deploy the production application
8. Complete post-deployment testing
9. Maintain the system after handover

---

## 4. Deploying to Vercel

### 4.1 Import the GitHub Repository

1. Go to the Vercel dashboard
2. Sign in using the GitHub account connected to the GMOS repository
3. Select **Add New → Project**
4. Import the GMOS GitHub repository
5. Allow Vercel to automatically detect the Next.js framework
6. Leave the default build settings unless project-specific changes are required
7. Do **not** complete the final deployment until the required environment variables have been added (see [Section 8](#8-vercel-environment-variables))

### 4.2 Production Branch

The production deployment should be connected to the `main` branch. After setup, every push to `main` will automatically trigger a new Vercel deployment.

---

## 5. Supabase Production Setup

Supabase is used for the GMOS database, authentication, product records, order records, customer accounts, staff accounts, and admin access.

### 5.1 Supabase Credentials

Go to: **Supabase Dashboard → Project Settings → API**

Collect the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=<SUPABASE_PROJECT_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUPABASE_ANON_PUBLIC_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<SUPABASE_PUBLISHABLE_KEY>
```

> **Important:** Real Supabase keys are not written in this file or committed to GitHub.

### 5.2 Supabase Authentication URL Configuration

Go to: **Supabase Dashboard → Authentication → URL Configuration**

- Set the **Site URL** to:
  ```
  https://goodwoodqualitymeats.com.au
  ```
- Add the following **Redirect URL**:
  ```
  https://goodwoodqualitymeats.com.au/**
  ```

This ensures Supabase authentication redirects work correctly in production instead of redirecting users back to localhost.

### 5.3 Enable pg_cron for Pending Order Cleanup

The system may create `PENDING` orders during checkout. If a customer abandons checkout, these records should be removed automatically after a set period.

If `pg_cron` is not already enabled:

1. Go to **Supabase Dashboard → Database → Extensions**
2. Enable `pg_cron`
3. Run the following SQL in the Supabase SQL Editor:

```sql
SELECT cron.schedule(
  'cleanup-pending-orders',
  '0 * * * *',
  $$
    DELETE FROM orders
    WHERE status = 'PENDING'
    AND created_at < NOW() - INTERVAL '2 hours'
  $$
);
```

This scheduled job runs every hour and deletes pending orders older than two hours.

---

## 6. Stripe Production Setup

Stripe is used to process customer deposit payments during checkout.

### 6.1 Switch Stripe to Live Mode

In the Stripe dashboard, switch from **Test mode** to **Live mode** before collecting production API keys.

### 6.2 Stripe API Keys

Go to: **Stripe Dashboard → Developers → API Keys**

Collect the following live keys:

```env
STRIPE_SECRET_KEY=<STRIPE_SECRET_KEY>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<STRIPE_PUBLISHABLE_KEY>
```

| Mode | Secret Key Prefix | Publishable Key Prefix |
|------|-------------------|------------------------|
| Live | `sk_live_` | `pk_live_` |
| Test | `sk_test_` | `pk_test_` |

> The local development environment may use Stripe test keys, but **production must use Stripe live keys** before accepting real customer payments.

### 6.3 Stripe Webhook Endpoint

Go to: **Stripe Dashboard → Developers → Webhooks → Add endpoint**

- Set the **Endpoint URL** to:
  ```
  https://goodwoodqualitymeats.com.au/api/webhook
  ```
- Select the following event: `payment_intent.succeeded`

After creating the webhook, copy the signing secret and store it in Vercel as:

```env
STRIPE_WEBHOOK_SECRET=<STRIPE_WEBHOOK_SIGNING_SECRET>
```

> The webhook is required so that successful payments can update the related order status in Supabase.

### 6.4 Payment Method Settings

Go to: **Stripe Dashboard → Settings → Payment methods**

**Disable** the following:
- Klarna
- Zip
- Any other buy-now-pay-later methods not required by the business

**Keep enabled:**
- Card
- Apple Pay
- Google Pay
- Link

---

## 7. Resend Production Setup

Resend is used for transactional emails, including order confirmation emails, welcome emails, store notifications, feedback request emails, and pickup reminders.

### 7.1 Resend API Key

Go to: **Resend Dashboard → API Keys**

Collect the API key and add it to Vercel as:

```env
RESEND_API_KEY=<RESEND_API_KEY>
```

### 7.2 Sending Domain

The expected sending domain is:
```
mail.goodwoodqualitymeats.com.au
```

The expected sender email address is:
```
no-reply@mail.goodwoodqualitymeats.com.au
```

Confirm that the sender address in the email template files matches the verified Resend domain. Relevant files include:

- `src/lib/email/feedbackRequest.js`
- `src/lib/email/orderConfirmation.jsx`
- `src/lib/email/`

---

## 8. Vercel Environment Variables

Go to: **Vercel Dashboard → Project → Settings → Environment Variables**

Add the following variables to the **Production** environment:

| Variable | Example Format | Purpose |
|----------|---------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Connects the app to Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase public browser key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | `sb_publishable_...` | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Server-side admin database access |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe server-side payment key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe client-side payment key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Verifies Stripe webhook events |
| `RESEND_API_KEY` | `re_...` | Sends emails through Resend |

---

## 9. Custom Domain Setup

The production domain for GMOS is:
```
https://goodwoodqualitymeats.com.au
```

### 9.1 Add Domain in Vercel

1. Go to **Vercel Dashboard → Project → Settings → Domains**
2. Add the apex domain: `goodwoodqualitymeats.com.au`
3. Add the www domain: `www.goodwoodqualitymeats.com.au`
4. Configure `www.goodwoodqualitymeats.com.au` to redirect to the apex domain

### 9.2 Update DNS Records

Log in to the domain registrar and add the DNS records provided by Vercel. Typical records include:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

DNS propagation can take up to 48 hours, although it is often completed sooner.

### 9.3 SSL Certificate

Vercel automatically provisions and renews the SSL certificate once the DNS records are correctly configured. No manual SSL setup is required.

---

## 10. Final Deployment

After environment variables and domain settings are complete:

1. Go to the Vercel project dashboard
2. Open the **Deployments** tab
3. Redeploy the latest deployment, or push a new commit to the `main` branch
4. Confirm the build completes successfully
5. Open the live production URL
6. Complete the post-deployment testing checklist below

---

## 11. Post-Deployment Testing Checklist

After the first production deployment, the following tests should be completed manually.

### 11.1 Authentication Testing

- Register a new customer account on the live site
- Log in successfully
- Log out successfully
- Confirm the session remains active after refreshing the page
- Test the password reset email flow

### 11.2 Product Catalogue and Cart Testing

- Confirm products load correctly
- Confirm category filtering works
- Confirm stock display works
- Add products to the cart
- Update product quantities in the cart
- Remove products from the cart

### 11.3 Checkout and Payment Testing

- Enter customer details
- Select a valid pickup date and time
- Confirm past dates are blocked
- Confirm Sundays are blocked
- Complete a Stripe payment
- Confirm the order confirmation page loads with correct order details
- Confirm the payment appears in the Stripe dashboard

### 11.4 Stripe Webhook Testing

- Confirm the webhook receives the `payment_intent.succeeded` event
- Confirm the order status changes from `PENDING` to `CONFIRMED` in Supabase
- Confirm the webhook delivery shows as successful in Stripe

### 11.5 Email Testing

- Confirm the order confirmation email is sent
- Confirm the welcome email is sent
- Confirm the store notification email is sent
- Confirm the feedback request email is triggered after order completion
- Confirm pickup reminder email scheduling works

### 11.6 Staff Portal Testing

- Log in as a staff account
- Confirm the orders list loads
- Confirm the inventory page loads
- Confirm the daily preparation page loads
- Update an order status and confirm it saves

### 11.7 Admin Portal Testing

- Log in as an admin account
- Confirm the admin dashboard loads
- Confirm the reports page loads with real data
- Confirm the feedback page loads
- Confirm admin can filter, search, and update orders
- Mark a test order as `COMPLETED` and confirm the feedback request email arrives

### 11.8 Apple Pay and Google Pay Testing

- On a real iPhone in Safari, go to checkout and confirm Apple Pay appears
- On an Android device in Chrome, go to checkout and confirm Google Pay appears

---

## 12. Ongoing Maintenance

### 12.1 Future Deployments

Every push to the `main` branch triggers an automatic deployment on Vercel. No manual deployment steps are required after the initial setup unless environment variables, domain settings, or third-party service settings change.

### 12.2 Database Backups

Supabase should be checked before go-live to confirm that database backups are enabled. A paid Supabase plan may be required depending on the required backup and recovery arrangements.

### 12.3 Stripe Webhook Failures

If a payment succeeds but the order is not confirmed:

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Open the relevant webhook endpoint
3. Check failed events
4. Retry the failed event
5. Cross-check the `order_id` in the webhook metadata with the orders table in Supabase

### 12.4 Pending Order Cleanup

The `pg_cron` job should run every hour and delete `PENDING` orders older than two hours. To verify the job is running, run this query in the Supabase SQL Editor:

```sql
SELECT *
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### 12.5 Updating Product Prices and Images

Product data is managed directly in Supabase. Go to: **Supabase Dashboard → Table Editor → products**

Common fields that may need updates include:

| Field | Description |
|-------|-------------|
| `price_cents` | Fixed product price in cents |
| `price_per_kg_cents` | Per-kilogram price in cents |
| `is_available` | Toggle product visibility |
| `stock_quantity` | Current stock level |
| `image_url` | Public URL of the product image |

Product images can be uploaded through Supabase Storage. The public image URL should then be copied into the relevant product record.

### 12.6 Adding Staff or Admin Accounts

To add a new staff or admin account:

1. Go to **Supabase → Authentication → Users → Invite user**
2. After the user accepts the invite and sets a password, go to **Supabase Dashboard → Table Editor → users**
3. Set the user's `role` to either `STAFF` or `ADMIN`

> Only trusted users should be assigned admin access.

---

## 13. Security Notes

The following security practices must be followed at all times:

- Never commit `.env.local` or real API keys to GitHub
- Never paste production secrets into documentation
- Store all production secrets only in Vercel environment variables
- Keep the Supabase service role key private
- Use Stripe live keys only in production
- Use Stripe test keys only for local development
- Rotate any secret key that may have been exposed
- Restrict admin access to authorised users only
- Confirm Supabase Row Level Security (RLS) policies are active before production use

---

## 14. Environment Summary

| Environment | URL | Stripe Mode | Notes |
|-------------|-----|-------------|-------|
| Local Development | `http://localhost:3000` | Test | Uses `.env.local` |
| Production | `https://goodwoodqualitymeats.com.au` | Live | Uses Vercel environment variables |

---

## 15. Key Files Reference

| File | Purpose |
|------|---------|
| `src/proxy.js` | Middleware that protects routes and refreshes sessions |
| `src/lib/stripe.js` | Stripe helper functions for PaymentIntent and customer handling |
| `src/lib/supabase-server.js` | Server-side Supabase client |
| `src/lib/supabase-admin.js` | Supabase service role client that can bypass RLS |
| `src/lib/email/` | Resend email templates |
| `src/app/api/webhook/route.js` | Stripe webhook handler |
| `src/lib/db/` | Database query functions |

---

## 16. Support Contacts

| Service | Support URL |
|---------|-------------|
| Vercel | https://vercel.com/support |
| Supabase | https://supabase.com/support |
| Stripe | https://support.stripe.com |
| Resend | https://resend.com/support |

---

## 17. Final Handover Statement

This deployment guide supports the final Sprint 5 handover by documenting the production deployment process, environment configuration, third-party service setup, security requirements, post-deployment testing, and ongoing maintenance process for the Goodwood Quality Meats Ordering System.
