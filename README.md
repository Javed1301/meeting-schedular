# Schedular (Calendly clone)

Simple meeting scheduler built with Next.js, Clerk, Prisma and Postgres (Neon).  
This README explains the project's purpose, design decisions, how it's implemented, component responsibilities, setup steps, and suggested enhancements.

---

## Project goal

- Provide a minimal, self-hosted scheduling app where users can:
  - Create events (meeting types) with durations and visibility (public/private).
  - Define weekly availability (per-day start/end times, isAvailable flag, minimum gap).
  - Share a unique scheduling link (username-based).
  - Let visitors book time slots that respect availability, existing bookings and event duration.
- Aim to demonstrate full-stack patterns: auth, server actions, DB layer, validation, SSR/CSR interplay.

---

## Tech stack

- Next.js (App Router) — server + client components
- Clerk — authentication & user management
- Prisma — ORM
- PostgreSQL (Neon) — database
- Zod — validation schemas
- Tailwind CSS / shadcn-ui components — UI primitives
- date-fns — date operations
- React Hook Form — forms
- Server Actions / API routes — server operations

---

## How the main features are achieved

- Authentication: Clerk protects routes with `middleware.js` and provides server helpers (`auth`, `currentUser`, `clerkClient`) for server actions.
- Persistence: Prisma models store Users, Events, Bookings, Availability and DayAvailability. DB access via `db.*` in server actions.
- Availability -> slots: `getEventAvailability` + helper `generateAvailableTimeSlots` compute available slots for a date by applying user's availability, event duration, time gap and current bookings.
- Booking flow: client selects a slot -> server action validates with Zod + checks DB for conflicts -> creates Booking and creates a calendar invite (if OAuth token available).
- Username/profile pages: dynamic routes `/[username]` and `/[username]/[eventId]` fetch public user data and public events; uses `generateMetadata` with awaited `params`.

---

## Project structure (key files & responsibilities)

- prisma/schema.prisma
  - DB model definitions: User, Event, Booking, Availability, DayAvailability, DayOfWeek enum.

- middleware.js
  - Clerk middleware using `clerkMiddleware` and a matcher to protect dashboard/availability/event management routes. Returns `Response.redirect(new URL('/sign-in', req.url))` for unauthenticated requests.

- lib/checkUser.js
  - Server helper that uses `currentUser()` and `clerkClient` to sync Clerk user info with the local DB; used by server components that require user context.

- actions/
  - user.js — server actions for user operations (updateUsername, getUserByUsername). Uses `auth()` to get userId.
  - events.js — createEvent, getUserEvents, deleteEvent, getEventDetails, getEventAvailability, and time-slot generation.
  - bookings.js — createBooking: validates booking input, checks conflicts, stores Booking, optionally uses Clerk OAuth tokens for calendar integration.

- app/(main)/dashboard/page.jsx
  - Auth-protected dashboard (client component) showing latest updates and upcoming meetings, and a username form to generate unique scheduling link. Uses `useUser`, `useFetch` hook and `date-fns/format`.

- app/(main)/availability/_components/availability-Form.jsx
  - UI for per-day availability using Controller/Select/Input and Zod-driven form validation. Displays field errors from `formState.errors`.

- components/
  - header.jsx — top-level header; should not call server-only helpers unguarded (avoid `currentUser()` in client-rendered header).
  - event-card.jsx — shows event preview (title, first sentence of description, duration, actions).
  - create-event.jsx / EventForm — modal/drawer for creating events.
  - other UI primitives: Input, Select, Checkbox, Avatar, Button (shadcn-like components).

- app/[username]/page.jsx
  - Public profile: shows user's public events and avatar (renders image via `<AvatarImage src={user.image} />`; fallback renders first letter of name).

- app/[username]/[eventId]/page.jsx
  - Booking page for a specific event: renders availability UI and booking form.

- app/lib/validators.js
  - Zod schemas: bookingSchema, availabilitySchema (with daySchema refine), userSchema, etc.

- hooks/use-fetch.js
  - client hook to call server actions and manage loading/error state.

---

## Setup & local development

1. Clone repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   - DATABASE_URL (Neon/Postgres)
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY (server)
   - CLERK_SIGN_IN_URL / CLERK_SIGN_UP_URL if needed
   - Any OAuth client secrets for calendar integrations

4. Prisma:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init   # or `db push` for quick dev
   ```

5. Start dev server:
   ```bash
   npm run dev
   ```

6. Ensure middleware.js is at project root (or in /src if using src directory) and the matcher covers the protected pages:
   ```js
   export const config = {
     matcher: ["/((?!_next/static|_next/image|favicon.ico|api|public).*)"],
   };
   ```

---

## Common pitfalls & tips

- Server vs Client:
  - Do not use `window` in server components — use `useEffect` and state to read `window.location`.
  - `currentUser()` and `auth()` must be used where Clerk middleware is active; ensure `middleware.js` is detected and the matcher matches the route.

- Middleware:
  - For redirects in middleware, return `Response.redirect(new URL('/sign-in', req.url))`.
  - Ensure `middleware.js` filename and location are correct for Clerk to detect it.

- Zod:
  - Prefer using option object for messages (e.g. `.email({ message: "Invalid email" })`) to avoid deprecation warnings.
  - Watch for typos in `path` when using `.refine()` — e.g., `path: ["endTime"]` (no trailing space).

- Prisma selects:
  - Make sure selected fields match the schema (e.g. use `image` if schema has `image`, not `imageUrl`).

---

## Suggested extra features / components

- Calendar sync details:
  - UI to connect Google/Outlook and view connected accounts; refresh OAuth tokens and show connection status.

- Recurring availability & exceptions:
  - Support for holidays, ad-hoc blocked times and recurring rules.

- Rescheduling / cancellation flow:
  - Allow users and invitees to reschedule or cancel, with email notifications.

- Email notifications:
  - Send emails on booking creation, reschedule, cancellation, with ICS attachments.

- Admin analytics:
  - Dashboard metrics: bookings per week, busiest times, conversion rate.

- Public scheduling page improvements:
  - Allow visitors to filter by date range, timezone selector, and display multiple event types.

- Unit + e2e tests:
  - Tests for availability slot generation logic, booking conflict detection, and API endpoints.

---

- Link for new Section To be created
  -https://chatgpt.com/share/68f39d3b-b218-8012-b838-38ccb294920d

## Final notes

- The repo demonstrates a production-oriented pattern: server actions + Clerk + Prisma + validation.  
- When adding features, keep clear separation between server actions (auth, DB) and client components (UI, interactions).  
- For any runtime issues check:
  - server terminal logs (for server-side console.log),
  - browser console (client errors),
  - middleware detection and matcher configuration.
