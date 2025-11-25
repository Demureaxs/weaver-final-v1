# Weaver Codebase Audit

## 1. Type Safety & Prisma Inheritance
**Status: ✅ Good**
- **Inheritance:** `lib/types.ts` correctly imports and extends Prisma-generated types (`PrismaUser`, `PrismaBook`, etc.).
- **Consistency:** The frontend interfaces (`User`, `Book`) explicitly extend the Prisma types, ensuring that database schema changes (like adding a column) will automatically flag type errors in the frontend if not handled.
- **JSON Handling:** `metadata` in `Article` is typed as `Json`, which is standard for Prisma, but frontend components using it should ensure runtime validation or type narrowing.

## 2. State Management (Context & Reducer)
**Status: ✅ Good**
- **Pattern:** The "Split Context" pattern (State Context + Dispatch Context) is implemented consistently in `UserContext.tsx`.
- **Usage:**
  - `AuthInitializer` consumes only `useUserActions` (avoids re-renders on user updates).
  - `BookWriterPage` consumes both as needed.
- **Optimistic Updates:** The `BookWriterPage` effectively uses local state (`localChapters`, `localCharacters`) for immediate UI feedback while syncing with the backend.

## 3. Security & Authorization
**Status: ⚠️ Critical Issues Found**

### A. Authorization Checks
- **Ownership:** API routes (`/api/books`, `/api/books/[id]`) correctly use `session.userId` to enforce ownership. Users cannot access or edit books they do not own.
- **Session:** `getSession()` is used consistently across reviewed routes.

### B. Credit Deduction (CRITICAL)
**Current Implementation:**
- In `BookWriterPage.tsx`, there is a function `checkAndDeductCredits` that calls `POST /api/user/credits` with `type: 'deduct'.
- This is passed to `EditableBlock` via `onDeductCredit`.

**The Flaw:**
- **Client-Side Trust:** Relying on the frontend to call "deduct credits" *before* or *after* requesting a generation is insecure. A malicious user can easily bypass the deduction call and hit the generation endpoint directly, getting free content.
- **Race Conditions:** If the deduction and generation are separate calls, one might succeed while the other fails.

**Recommendation:**
- **Move to Backend:** The credit deduction **MUST** happen atomically inside the generation API route (e.g., `/api/generate`).
- **Transaction:** Use `prisma.$transaction` to ensure the generation only proceeds if the credit deduction is successful.

## 4. Error Handling
**Status: ⚠️ Needs Improvement**
- **API Routes:** Most routes have basic `try/catch` blocks returning 500 errors.
- **Frontend:**
  - `BookWriterPage` logs errors to console (`console.error`).
  - **Missing:** There is no visible UI feedback (Toasts/Alerts) for many error states (e.g., if saving a paragraph fails, the user might not know).
- **Silent Failures:** In `handleParagraphSave`, if the `fetch` fails, the user is left with the local optimistic update which is now out of sync with the server.

## 5. Infrastructure & Config
**Status: ✅ Satisfactory**
- **Prisma:** Two instances of `lib/prisma.ts` were found (one in `lib/` and one in `example/lib/`). The one in `lib/` is correctly configured as a singleton to prevent connection exhaustion in dev.
- **Next.js:** App Router structure is clean.

## 6. Action Plan
1. **Refactor Credits:** Move `checkAndDeductCredits` logic entirely into the backend API routes for generation (`/api/generate`, `/api/books/.../polish`).
2. **Add Toasts:** Implement a Toast notification system (e.g., `sonner` or `react-hot-toast`) to alert users when auto-saves fail.
3. **Input Validation:** Add Zod validation to API routes to ensure `req.json()` bodies match expected shapes before passing to Prisma.