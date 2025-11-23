# Progress Tracker: User-Centric Auth & Data Refactor

This file tracks the progress of refactoring the application to centralize authentication and data management around the user model.

## Phase 1: Planning & Analysis (Completed)

- [x] 1.1: Identify all files related to authentication (`auth`, `session`, `user`).
- [x] 1.2: Identify all files related to data models (`book`, `article`, `keyword`, `sitemap`).
- [x] 1.3: Identify all UI components that interact with user or data models.
- [x] 1.4: Define the target data structure for the `User` model and its relationship with other data types.

## Phase 2: Core Model & Type Definition (Completed)

- [x] 2.1: Review and update `lib/types.ts` to define the centralized `User`, `Book`, `Article`, `Keyword`, and `Sitemap` types.

## Phase 3: Backend Refactoring (Auth & API) (Completed)

- [x] 3.1: Analyze `lib/firebase.ts` for existing Firebase auth configuration.
- [x] 3.2: Refactor API routes in `app/api/auth/` (`login`, `logout`, `register`, `session`) to be consistent with the new user model.
- [x] 3.3: Refactor `lib/session.ts` to manage user sessions based on the centralized user model.
- [x] 3.4: Create or refactor API endpoints to fetch data based on the logged-in user (e.g., `GET /api/books`).

## Phase 4: Frontend Refactoring (State Management & UI) (Completed)

- [x] 4.1: Consolidate frontend user state management. Analyze `context/UserContext.tsx` and `lib/userStore.ts` and choose a single source of truth.
- [x] 4.2: Refactor `UserContext.tsx` to use the **split context pattern**, separating the user data context from the authentication actions context to prevent unnecessary re-renders.
- [x] 4.3: Refactor `components/auth/AuthInitializer.tsx` to use the new centralized state management.
- [x] 4.4: Update UI components (`AuthScreen.tsx`, dashboard pages, views) to use the new auth logic and data-fetching methods.

## Phase 5: Verification & Cleanup

- [ ] 5.1: Test the full authentication flow (register, login, logout, session persistence).
- [ ] 5.2: Verify that data is correctly associated with and fetched for the logged-in user.
- [ ] 5.3: Remove any old, unused authentication or data management code.
