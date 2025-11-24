# Weaver App Completion Roadmap

This document serves as a comprehensive checklist for finalizing the Weaver application. It breaks down tasks into micro-steps suitable for execution by AI coding assistants.

**Goal:** Complete all frontend-backend plumbing, implement persistence, set up payments (Stripe) and email (Nodemailer), and polish the UI/Markdown rendering.

---

## Phase 1: Core Backend & Infrastructure ✅ COMPLETE

### 1.1. Database & Prisma Service ✅

- [x] **Create Prisma Service:**
  - Create `lib/prisma.ts` to export a singleton `PrismaClient` instance.
  - Ensure it handles connection pooling correctly in development (preventing "too many connections" errors).
- [x] **Verify Schema:**
  - Review `prisma/schema.prisma` to ensure all relations (User -> Profile, User -> Books, Book -> Chapters) are correct.
  - Run `npx prisma generate` and `npx prisma db push` to sync DB.

### 1.2. Email Service (Nodemailer) ✅

- [x] **Setup Nodemailer:**
  - Install `nodemailer` and `@types/nodemailer`.
  - Create `lib/email.ts` service file.
  - Implement `sendEmail({ to, subject, html })` function.
  - Configure transport using environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- [ ] **Create Email Templates:**
  - Create basic HTML templates for:
    - Welcome Email.
    - Password Reset (if applicable).
    - Subscription Confirmation.

### 1.3. Payment Infrastructure (Stripe) ✅

- [x] **Setup Stripe:**
  - Install `stripe` package.
  - Create `lib/stripe.ts` to export Stripe instance.
  - Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `.env`.
- [x] **Create Webhook Endpoint:**
  - Create `app/api/webhooks/stripe/route.ts`.
  - Handle events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`.
  - Update user `credits` or `plan` in Prisma based on these events.

---

## Phase 2: Authentication & User Context Plumbing ✅ COMPLETE

### 2.1. Session & User Loading ✅

- [x] **Enhance User API:**
  - Create/Update `app/api/user/me/route.ts`.
  - **Logic:** Fetch user by ID from session. Include `profile`, `articles`, `books`, `sitemap`.
  - **Return:** JSON object with full user data.
- [x] **Update AuthInitializer:**
  - Modify `components/auth/AuthInitializer.tsx`.
  - **Logic:** On mount, call `/api/user/me`.
  - **Action:** Dispatch `LOGIN` with the full user object.

### 2.2. Context Reducer Updates ✅

- [x] **Update Reducer:**
  - Modify `context/UserContext.tsx`.
  - Ensure `UPDATE_USER` action correctly merges nested data (e.g., updating just `profile.credits` without wiping `profile.keywords`).
  - Remove legacy actions if they are fully replaced by `UPDATE_USER`.

---

## Phase 3: Feature Implementation - Books & Writing

### 3.1. Book CRUD API ✅ COMPLETE

- [x] **Create/Update `app/api/books/route.ts`:**
  - `GET`: Return all books for current user.
  - `POST`: Create a new book (Title, Genre, Summary).
  - `PUT`: Update book details.
  - `DELETE`: Remove a book.
- [x] **Create `app/api/books/[bookId]/chapters/route.ts`:**
  - `GET`: Fetch chapters for a book.
  - `POST`: Create a new chapter.
  - `PUT`: Update chapter content/order.
  - `DELETE`: Delete a chapter.

### 3.2. Frontend Integration (BookWriterPage) 🔄 PARTIAL

- [x] **Connect Book List:**
  - In `app/dashboard/book-writer/page.tsx`, replace mock `books` state with data from `UserContext` or `useSWR`/`useEffect` fetch.
- [x] **Connect Chapter Saving:**
  - In `EditableBlock` or parent component, trigger `PUT /api/books/[id]/chapters` on save (debounced).
  - Optimistically update UI via `dispatch({ type: 'UPDATE_USER', ... })`.
- [ ] **Connect Character/World Items:**
  - Ensure "Quick Add" modals call API to persist new characters/world items.

---

## Phase 4: Feature Implementation - Tools ✅ COMPLETE

### 4.1. Keyword Research Persistence ✅

- [x] **API Endpoint:**
  - Create `app/api/user/keywords/route.ts`.
  - `PUT`: Accept array of keyword strings, update `profile.keywords`.
- [x] **Frontend Integration:**
  - In `app/dashboard/keywords/page.tsx` & `KeywordResearchView`.
  - When toggling a keyword:
    1. Call API `PUT`.
    2. Dispatch `UPDATE_USER` to update context immediately.

### 4.2. Sitemap Persistence ✅

- [x] **API Endpoint:**
  - Create `app/api/sitemap/route.ts`.
  - `POST`/`PUT`: Save sitemap URL and links to `Sitemap` and `Link` tables.
- [x] **Frontend Integration:**
  - In `app/dashboard/sitemap/page.tsx`.
  - On "Save" or successful parse, call API.
  - Update `UserContext`.

### 4.3. Credits System 🔄 PARTIAL

- [x] **API Endpoint:**
  - Create `app/api/user/credits/route.ts`.
  - `POST`: Accept `{ amount, type: 'deduct' | 'add' }`.
  - Transactionally update `profile.credits`.
- [ ] **Frontend Integration:**
  - Create helper `deductCredits(amount)` in `lib/utils.ts` or a custom hook.
  - Use this helper in `GeneratorPage` and `BookWriterPage` before performing AI actions.

---

## Phase 5: UI Polish & Markdown Rendering ✅ COMPLETE

### 5.1. SimpleMarkdown Component Fixes ✅

- [x] **Enhance `components/editor/SimpleMarkdown.tsx`:**
  - **Sanitization:** Implement `rehype-sanitize` with a strict schema (allow basic tags, tables, images).
  - **Syntax Highlighting:** Add `react-syntax-highlighter` for code blocks.
  - **GFM Support:** Add `remark-gfm` for tables and strikethrough.
  - **Styling:** Ensure `dark:prose-invert` is applied. Custom styles for tables (borders) and images (max-width).
  - **Links:** Force `target="_blank"` for external links.

### 5.2. Markdown Toolbar ⏭️ SKIPPED

- [ ] **Create `components/editor/MarkdownToolbar.tsx`:**
  - Buttons: Edit (toggle raw/preview), Copy, Download.
  - Sticky positioning at top of editor.
- [ ] **Integrate:**
  - Use this toolbar in `GeneratorPage` and `BookWriterPage` where markdown is displayed.

**Note:** SimpleMarkdown is fully functional, toolbar is optional/low priority.

---

## Phase 6: Payments & Subscriptions (Frontend) ✅ COMPLETE

### 6.1. Pricing Page / Modal ✅

- [x] **Create Pricing UI:**
  - Display plans (Free, Pro, Enterprise).
  - "Upgrade" button triggers Stripe Checkout.
- [x] **Stripe Integration:**
  - Create `app/api/stripe/checkout/route.ts` to generate session URL.
  - Redirect user to Stripe on click.
- [x] **Success/Cancel Pages:**
  - Create `app/dashboard/billing/success` and `cancel` pages.

---

## Remaining Tasks

### Critical

- [ ] **Quick Add World Items** - Wire up onClick handlers in BookWriterPage
- [ ] **Credits Deduction** - Call API after AI generation in Generator and BookWriter

### Optional

- [ ] **Email Templates** - Create HTML templates for welcome/reset/subscription emails
- [ ] **Markdown Toolbar** - Add toolbar component (low priority)

---

## Consistency & Quality Checks

- [x] **API Response Format:** Ensure all API routes return consistent JSON `{ success: boolean, data?: any, error?: string }`.
- [x] **Error Handling:** Ensure all `fetch` calls have `try/catch` and display user-friendly toasts/alerts.
- [x] **Type Safety:** Ensure all frontend components use types from `lib/types.ts` (which should mirror Prisma types).
