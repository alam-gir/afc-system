# AFC System

A production app for an Alliance Française-style language school to manage **batches** (course
groups), **teachers**, **students**, and the **class logs** teachers write after each session. Three
portals (Admin, Teacher, Student) behind a single unified login.

This is a real production system reviewed by multiple developers — not a demo. Keep code small,
readable, modular, and consistent. No shortcuts, no unfinished stubs, no `any`.

## Tech stack

- **Next.js** (App Router, already scaffolded in `src/app`) + **React 19** + **TypeScript**
- **PostgreSQL** via Docker (already running, see Environment below) + **Drizzle ORM**
  - Schema-first: hand-write schema in `src/db/schema/*`, generate migrations with
    `drizzle-kit generate`, apply with `drizzle-kit migrate`. **Never hand-write migration SQL.**
- **Auth.js (NextAuth v5)** with a **Credentials** provider — login is `ID + password`, not email.
  One unified login screen for all three roles; the session's role decides which portal/layout
  renders and which routes are authorized.
- **shadcn/ui** for components, **Tailwind CSS v4** for styling
- **zod** for all form validation (client + server), paired with `react-hook-form`
- **next-intl** for i18n (English + French, App Router `[locale]` segment)
- **next-themes** for light/dark/system theme switching
- Package manager: **pnpm**

## Environment

- Postgres runs locally in Docker (container `postgres-local`, already up on port 5432).
- `DATABASE_URL=postgresql://postgres:admin@localhost:5432/af-system`
- Add this to `.env.local` (never commit `.env.local`).

## Domain model

### Batch
`name, startDate, endDate, totalClasses, durationPerClassHours, level, method, classRoom, classTime, description`

- **level**: CEFR-style values — `A1.1, A1.2, A2.1, A2.2, B1.1, B1.2, B2.1, B2.2, C1, C2`
  (placeholder list — confirm exact school vocabulary before launch; must be translated correctly
  into French, not guessed).
- **method**: `Extensive, Intensive, Semi-Intensive, Crash Course` (same caveat as level).
- A batch has **one primary teacher** at a time (nullable, reassignable by admin). Substitutions
  for a one-off missed class are handled at the **class log** level (admin hardwrites a free-text
  teacher name), not by attaching a second teacher to the batch.
- A batch has **many students** via a `batch_enrollments` join table (many-to-many: a student can
  belong to multiple batches over time or concurrently).
- `totalClasses` is a target/expected count for display/progress purposes, not a hard cap enforced
  against the number of class logs.

### Class log
Belongs to exactly one batch. Fields: `chapter, lessons, pages, activities, learningObjectives,
vocabulary, grammar` + `date` + `createdBy` (teacher, or free-text name if admin-authored) +
`createdAt`.

- Teachers can create/edit logs only for batches they are currently assigned to.
- **Edit window**: a teacher may edit a log only within **24 hours of its `createdAt`** (rolling
  window, not calendar-day). After that it's locked for teachers (admin can still edit/delete
  anytime).
- Admin can create a log with a **free-text teacher name** (no FK) for cases where a substitute
  who isn't in the system took the class — this preserves the fact that the assigned teacher was
  absent. Admin can edit or hard-delete any log.

### Teacher / Student
Both: `id (assigned by admin, not auto-generated), password (defaults to id; admin or the user can
change it — user must confirm current password first via their own profile page), name, email,
phone, description`.

- Password changes by the user always require re-entering the current password. Admin-driven
  password resets do not.

### Admin
`name, email, phone` + own profile/password page. Multiple admin accounts allowed, no permission
tiers between them (flat admin role) unless told otherwise later.

## Portals & permissions

### Login
Single login page for all roles: `ID + password`. "Forgot password" shows a static message to
contact the administrator — **no email-based reset flow**.

### Teacher portal
- Sees only batches they're currently assigned to.
- Per batch: sees past class logs (search, filter, date-range filter), can add today's log.
- Can edit a log only if they created it **and** it's within the 24h window (see above).
- Profile page: edit own basic details, change password (requires current password).

### Student portal
- Sees own batch(es) and class logs (search, filter, date-range filter) — read-only, no editing.
- Profile page: edit own basic details, change password (requires current password).

### Admin portal
- **Batches**: list view must support **pagination + filtering** — expect thousands of batches
  over time, so this is not optional polish, it's core. View a batch to see full details, edit,
  view/add/remove students, assign/remove the batch's teacher.
- **Teachers / Students**: manage records (create with admin-assigned ID, edit, deactivate/delete).
- **Class logs**: create (with optional free-text teacher name), edit, hard-delete any log.
- **Delete rule**: hard delete only, gated by a frontend confirmation dialog requiring the user to
  type the literal word `Confirm` before the delete request is sent to the server.
- Own profile/password page, same rules as teacher/student.

## i18n rules

- Primary locale English, secondary **French (France French)** — must be **100% translated**, no
  English strings leaking through when the French locale is active.
- Every user-facing string goes through next-intl message catalogs — no hardcoded UI text in
  components.
- Be precise with French terminology for domain words (chapitre, leçon, objectifs
  d'apprentissage, vocabulaire, grammaire, etc.) — when unsure of the correct term, ask rather than
  guessing, since the user does not read French and cannot self-check translations.

## Theming & branding

- Brand color `#DA2B2C` (Alliance red) — use **sparingly**, as accents (primary buttons, active
  states, key highlights), never as large background fields. Pair with white and a proper dark
  neutral (never pure `#000000` — use a dark slate/gray, e.g. something like `#121212`–`#1a1a1a`
  range, to keep readability comfortable).
- Support light / dark / system, via `next-themes`. Every screen must be checked in both themes.

## Layout

- **Mobile-first**: ~90% of users are on mobile. Design and build the mobile layout first, then
  expand to desktop breakpoints — not the reverse.
- Polish matters: this ships to real users. Use shadcn components consistently rather than
  one-off custom UI.

## Conventions

- No `any`, ever. If a type is genuinely unknown, use `unknown` and narrow it.
- All forms validated with zod schemas shared/mirrored between client and server where practical.
- Prefer small, focused, human-readable files over large multi-purpose ones. Extract shared logic
  into reusable modules once a pattern repeats, not preemptively.
- Server-side authorization checks are mandatory on every mutation (role + ownership + time-window
  checks for log edits) — never rely on the UI hiding a button as the only guard.
- Drizzle: schema lives in `src/db/schema/`, one file per entity/domain concern; migrations are
  always generated via `drizzle-kit generate`, never hand-edited.

## Open items to confirm before/while building

These were resolved with sensible defaults so work can proceed, but flag for the user to confirm:

- Exact `level` and `method` vocabulary for batches (currently placeholder CEFR/Alliance values).
- Timezone to use for "24 hours" log-edit-window and date-range filtering (currently no fixed
  assumption made — needs a decision, likely the school's local timezone).
- Whether student/teacher/admin accounts can be deactivated (soft) in addition to hard-deleted,
  or if hard delete is the only lifecycle action.
