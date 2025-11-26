# 🚀 Weaver Master Launch Checklist

This is the master list to get Weaver from "dev" to "production ready". It merges all previous roadmaps and includes critical missing pieces for launch.

## 🟢 Phase 1: Marketing & Public Pages (The "Front Door")
*Before you can sell, you need a place to sell.*

- [ ] **Landing Page (`app/page.tsx`)**
    - [ ] **Hero Section:** clear value prop ("Write novels with AI"), CTA button ("Start Writing for Free").
    - [ ] **Features Section:** High-level overview (AI Co-writer, World Building, Export).
    - [ ] **Pricing Section:** Display Free vs Pro tiers. **Crucial:** Use real Stripe Price IDs here.
    - [ ] **FAQ Section:** Common questions (Credits, Ownership, Refunds).
    - [ ] **Footer:** Links to Login, Blog, Privacy, Terms.

- [ ] **Blog System (`app/blog/...`)**
    - [ ] Create `app/blog/page.tsx` (List of articles).
    - [ ] Create `app/blog/[slug]/page.tsx` (Individual article render).
    - [ ] **Content:** Add 3-5 placeholder articles about "AI Writing" to help SEO.

- [ ] **Legal Pages (Required for Stripe)**
    - [ ] `app/privacy/page.tsx`: Privacy Policy.
    - [ ] `app/terms/page.tsx`: Terms of Service.
    - [ ] *Note: Stripe often audits these before enabling payments.*

---

## 💳 Phase 2: Stripe Payment Setup (The "Money")
*You cannot launch without testing this flow.*

### A. Dashboard Setup (Manual Actions)
- [ ] **Create Products in Stripe:**
    - Go to Stripe Dashboard -> Products.
    - Create "Free Tier" (0$/mo).
    - Create "Pro Weaver" (e.g., $20/mo).
    - Copy the **Price IDs** (starts with `price_...`) for use in your `.env` and Pricing component.
- [ ] **Setup Webhooks:**
    - Go to Developers -> Webhooks.
    - Add Endpoint: `https://your-domain.com/api/webhooks/stripe`.
    - **Events to listen for:**
        - `checkout.session.completed` (User paid).
        - `customer.subscription.deleted` (User cancelled).
        - `invoice.payment_succeeded` (Recurring payment).
- [ ] **Configure Customer Portal:**
    - Go to Settings -> Customer Portal.
    - Enable "Allow customers to cancel subscriptions".
    - Enable "Allow customers to update payment methods".
    - Save configuration.

### B. Code Integration
- [ ] **Verify Webhook Handler:** Ensure `app/api/webhooks/stripe/route.ts` handles the specific Price IDs you just created.
- [ ] **Billing Page:** `app/dashboard/settings/billing/page.tsx`
    - [ ] Show current plan (Free/Pro).
    - [ ] Show "Manage Subscription" button (links to Stripe Customer Portal).

---

## 🛡️ Phase 3: Security & Infrastructure (Critical Missing Items)
*Items identified as missing from previous audits.*

- [ ] **Middleware Protection (`middleware.ts`)**
    - [ ] Create `middleware.ts` in root.
    - [ ] Logic: If user visits `/dashboard/*` and has no session token, redirect to `/login`.
    - [ ] Protect `/api/*` routes (except webhooks/public endpoints).

- [ ] **Error Handling**
    - [ ] Create `app/not-found.tsx`: Custom 404 page (keep users in your app).
    - [ ] Create `app/error.tsx`: Global error boundary (catch crashes gracefully).

- [ ] **Authentication Polish**
    - [ ] **Forgot Password Flow:** Add "Forgot Password" link on login.
    - [ ] Create `app/reset-password/page.tsx` and API route for email token handling.

---

## 🛠️ Phase 4: Core Features Completion
*Finishing the actual product.*

- [ ] **Book Writer Updates**
    - [ ] **Quick Add World Items:** The "+" buttons in the sidebar need to actually save to the DB.
    - [ ] **Chapter Deletion:** Ensure UI allows deleting chapters.
- [ ] **Credit System Frontend**
    - [ ] Ensure UI updates immediately when credits are used (handled by your recent PR, verify in `UserContext`).
    - [ ] Add "Low Credit" warning if user tries to generate with 0 credits.

---

## 🚀 Phase 5: Production "Ship It" Polish
*The final coat of paint.*

- [ ] **SEO Metadata**
    - [ ] Add `export const metadata` to `layout.tsx`.
    - [ ] Add `sitemap.ts` and `robots.ts` generators.
    - [ ] Add OpenGraph images (for Twitter/social sharing cards).

- [ ] **Analytics**
    - [ ] Install PostHog or Google Analytics to track signups and usage.

- [ ] **Final Database Migration**
    - [ ] Run `npx prisma migrate deploy` on production DB.

---

## 🧹 Clean Up
- [ ] **Merge/Delete Old Roadmaps:**
    - [ ] Consolidate `COMPLETION_ROADMAP.md` and `progress.md` into this file or archive them.