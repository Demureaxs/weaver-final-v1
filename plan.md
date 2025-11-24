# Frontend & Backend Integration Plan

This document outlines the plan to systematically check and integrate each view of the application, ensuring both frontend and backend are correctly "plumbed up" and that all user data is properly filtered.

## Guiding Principles

- **Backend:** All API routes that handle user-specific data must use the `getSession()` function to get the `userId` and then use that `userId` to filter database queries.
- **Frontend:** All views that display user-specific data must fetch it from the corresponding API routes. The user object in the UI should be populated from the session.
- **Types:** All types should be inherited from the Prisma client to ensure type safety from the database to the frontend.

## Plan by View

### 1. Dashboard (`/dashboard`) ✅ COMPLETE

- [x] **Backend (`/api/articles`, `/api/books`):**
  - [x] Verify that `getSession()` is used to get the `userId`.
  - [x] Verify that all Prisma queries are filtered by `userId`.
- [x] **Frontend (`views/DashboardView.tsx`):**
  - [x] Verify that the `user` object from `useUserData()` is used to display the data.
  - [x] Verify that the `articles` and `books` are correctly displayed.

### 2. Book Writer (`/dashboard/book-writer`) 🔄 PARTIAL

- [x] **Backend (`/api/books`):**
  - [x] Already updated and verified.
- [x] **Frontend (`app/dashboard/book-writer/page.tsx`):**
  - [x] Verify that books are fetched from `/api/books`.
  - [x] Verify that the "Create New Book" functionality works.
  - [x] Verify that the "Update Book" functionality works.
  - [x] Verify that the "Delete Book" functionality works.
  - [ ] **Remaining:** Quick Add buttons for world items need onClick handlers

### 3. Keywords (`/dashboard/keywords`) ✅ COMPLETE

- [x] **Backend (`/api/keywords/suggest`, and a new route to update keywords):**
  - [x] Investigate `/api/keywords/suggest` to see if it needs user data.
  - [x] Create a new API route (e.g., `PUT /api/user/keywords`) to update the user's keywords.
- [x] **Frontend (`app/dashboard/keywords/page.tsx`):**
  - [x] Verify that saved keywords are displayed from `user.profile.keywords`.
  - [x] Implement the `toggleKeyword` functionality to call the new API route.

### 4. Sitemap (`/dashboard/sitemap`) ✅ COMPLETE

- [x] **Backend (`/api/sitemap`):**
  - [x] Update the route to use `getSession()` and filter by `userId`.
- [x] **Frontend (`app/dashboard/sitemap/page.tsx` and `views/SitemapView.tsx`):**
  - [x] Investigate and update the frontend to fetch and display the sitemap from the API.
  - [x] Implement CUD (Create, Update, Delete) functionality for the sitemap.

### 5. Generator (`/dashboard/generator`) 🔄 PARTIAL

- [x] **Backend:**
  - [x] Find the API route responsible for article generation.
  - [x] Ensure it correctly associates the generated article with the user.
- [x] **Frontend (`app/dashboard/generator/page.tsx` and `views/GeneratorView.tsx`):**
  - [x] Investigate and verify the frontend functionality for the generator.
  - [ ] **Remaining:** Credits deduction API call needed after generation

## Remaining Tasks

- [ ] Quick Add World Items - Add onClick handlers
- [ ] Credits Deduction - Integrate API calls in Generator and BookWriter
