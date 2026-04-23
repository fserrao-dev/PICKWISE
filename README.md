# PICKWISE — eLearning Platform

A full-stack, production-ready eLearning platform built with Next.js 14, Prisma, NextAuth.js v5, and Tailwind CSS.

## Features

- **Admin Panel** — Full course/module/lesson CRUD, YouTube embed support, analytics dashboard with charts, student enrollment management, broadcast notifications
- **Student Portal** — Course catalog, lesson player with embedded YouTube, quizzes after each lesson, progress tracking, gamification (points + badges), leaderboard, completion certificates
- **Quiz System** — Multiple-choice quizzes (3–10 questions), immediate feedback with explanations, retake support, 10 pts per correct answer
- **Certificates** — Auto-generated PDF on 100% course completion, downloadable from dashboard and profile
- **Gamification** — Points leaderboard, 4 badge types (First Lesson, Perfect Score, Course Champion, Top 3)
- **Email Notifications** — Welcome, enrollment confirmation, and course completion emails via Resend
- **Dark Mode** — Full Tailwind dark mode support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL (Neon / Railway) |
| ORM | Prisma 7 |
| Auth | NextAuth.js v5 (credentials) |
| Styling | Tailwind CSS + Radix UI |
| Charts | Recharts |
| Email | Resend |
| Certificates | @react-pdf/renderer |
| Deployment | Vercel |

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd pickwise
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g. from Neon or Railway) |
| `NEXTAUTH_SECRET` | Random secret string (min 32 chars) — run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL (e.g. `http://localhost:3000`) |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) |
| `NEXT_PUBLIC_APP_URL` | Same as `NEXTAUTH_URL` |

### 3. Initialize the database

```bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@pickwise.com | Admin1234! |
| Student | student1@pickwise.com | Student1234! |
| Student | student2@pickwise.com | Student1234! |
| Student | student3@pickwise.com | Student1234! |

## Project Structure

```
/app
  /(student)         # Student-facing routes (grouped layout)
    /dashboard       # Student dashboard
    /courses         # Course catalog + detail + lesson player
    /leaderboard     # Points leaderboard
    /profile         # Profile, badges, quiz history, certificates
  /admin             # Admin panel (sidebar layout)
    /dashboard       # Analytics dashboard
    /courses         # Course + module + lesson management
    /students        # Student list + enrollment
    /notifications   # Send notifications
  /login             # Login page
  /register          # Registration page
  /api/auth          # NextAuth.js API route
  /actions           # Server actions (auth, courses, enrollment, notifications)

/components
  /ui                # Radix UI primitives (Button, Card, Dialog, etc.)
  /admin             # Admin-specific components
  /student           # Student-specific components
  /shared            # Navbar, Sidebar, SessionProvider

/lib
  auth.ts            # NextAuth configuration
  prisma.ts          # Prisma client singleton
  email.ts           # Resend email helpers
  certificate.ts     # PDF certificate generation
  points.ts          # Points, badges, notifications logic
  utils.ts           # cn(), extractYoutubeId(), formatDate()

/prisma
  schema.prisma      # Database schema
  seed.ts            # Seed script
```

## Deploying to Vercel

1. Push your code to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Add all environment variables from `.env.example` in the Vercel dashboard.
4. Vercel will auto-detect Next.js and run `prisma generate && next build`.
5. After first deploy, run the seed against your production DB:

```bash
DATABASE_URL=<prod-url> npm run db:seed
```

> **Tip:** Use [Neon](https://neon.tech) for a free serverless PostgreSQL database that works great with Vercel.

## Database Commands

```bash
npm run db:push      # Push schema changes (no migration history)
npm run db:migrate   # Create a migration (dev only)
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio GUI
```
