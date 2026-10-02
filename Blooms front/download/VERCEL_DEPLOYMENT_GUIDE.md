# 🏫 BLOOMS Junior School - LMS
## Complete Vercel Deployment Guide

---

## 📋 Project Overview

| Item | Details |
|------|---------|
| **Project Name** | BLOOMS Junior School - Learning Management System |
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript 5 |
| **Database** | SQLite via Prisma ORM (production: switch to Turso/PlanetScale) |
| **UI Library** | shadcn/ui (New York style) + Tailwind CSS 4 |
| **Animations** | Framer Motion + CSS Weather Effects |
| **State** | Zustand + TanStack Query |
| **Auth** | NextAuth.js v4 (available) |

---

## 🗂️ Project Structure

```
blooms-junior-school/
├── prisma/
│   └── schema.prisma          # 20 database models
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main SPA entry (login → dashboard)
│   │   ├── layout.tsx         # Root layout with Toaster
│   │   ├── globals.css        # Tailwind + glassmorphism + weather CSS
│   │   └── api/
│   │       ├── seed/route.ts           # Database seeder (POST)
│   │       ├── users/login/route.ts    # User authentication
│   │       ├── users/verify-otp/route.ts
│   │       ├── users/route.ts          # User registration
│   │       ├── students/route.ts        # Student CRUD
│   │       ├── parents/route.ts        # Parent management
│   │       ├── teachers/route.ts        # Teacher CRUD
│   │       ├── fees/route.ts            # Fee records
│   │       ├── fee-payments/route.ts    # Payment verification + auto-receipt
│   │       ├── fee-payments/[id]/route.ts
│   │       ├── fee-reminders/route.ts   # Fee reminders
│   │       ├── receipts/route.ts        # Receipt management
│   │       ├── payslips/route.ts        # Teacher payslips
│   │       ├── teacher-conducts/route.ts
│   │       ├── employment-contracts/route.ts
│   │       ├── schemes-of-work/route.ts
│   │       ├── schoolwork/route.ts      # Assignments
│   │       ├── schoolwork-views/route.ts
│   │       ├── messages/route.ts        # Messaging system
│   │       ├── media/route.ts           # Media gallery
│   │       ├── notifications/route.ts   # Notifications
│   │       ├── announcements/route.ts   # School announcements
│   │       ├── trips-events/route.ts    # Events management
│   │       ├── applications/route.ts   # Job applications
│   │       ├── dashboard/route.ts        # Dashboard stats
│   │       ├── register-student/route.ts
│   │       └── star-ratings/route.ts     # Parent star rating system
│   ├── components/
│   │   ├── blooms/              # Custom components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── StudentsPage.tsx
│   │   │   ├── ParentsPage.tsx
│   │   │   ├── FeesPage.tsx
│   │   │   ├── HRPage.tsx
│   │   │   ├── MessagesPage.tsx
│   │   │   ├── MediaGallery.tsx
│   │   │   ├── SchoolWorkPage.tsx
│   │   │   ├── TripsEvents.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   ├── FloatingBubbles.tsx
│   │   │   └── WeatherEffects.tsx
│   │   └── ui/                 # shadcn/ui components (35+)
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.ts
│   └── lib/
│       ├── db.ts               # Prisma client
│       └── utils.ts            # cn() utility
├── public/
│   ├── blooms-logo.jpeg
│   ├── vesta-logo.jpeg
│   └── logo.svg
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json              # shadcn/ui config
└── .gitignore
```

---

## 🔑 Database Schema (20 Models)

| # | Model | Purpose |
|---|-------|---------|
| 1 | User | System users (login/auth) |
| 2 | Student | Student records with parent linkage |
| 3 | Parent | Parent records with star rating system |
| 4 | Teacher | Teacher records with contracts |
| 5 | Fee | Fee records per student/term |
| 6 | FeePayment | Payment tracking with verification |
| 7 | FeeReminder | Fee reminder messages |
| 8 | Receipt | Auto-generated receipts |
| 9 | Payslip | Teacher salary payslips |
| 10 | TeacherConduct | Performance/conduct records |
| 11 | EmploymentContract | Teacher contracts |
| 12 | SchemeOfWork | Curriculum schemes |
| 13 | SchoolWork | Homework/assignments |
| 14 | SchoolWorkView | Student view tracking |
| 15 | Announcement | School announcements |
| 16 | TripEvent | Trips and school events |
| 17 | MediaItem | Photo/media gallery |
| 18 | Notification | System notifications |
| 19 | Message | Messaging system |
| 20 | Application | Job applications |

---

## 🚀 Vercel Deployment Steps

### Step 1: Prepare Your GitHub Repository

```bash
# Navigate to your project
cd blooms-junior-school

# Initialize git (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: BLOOMS Junior School LMS"

# Create repository on GitHub (via github.com or gh CLI)
gh repo create blooms-junior-school --private --source=. --push

# OR manually:
# 1. Go to https://github.com/new
# 2. Create a new repository named "blooms-junior-school"
# 3. Then run:
git remote add origin https://github.com/YOUR_USERNAME/blooms-junior-school.git
git branch -M main
git push -u origin main
```

### Step 2: Switch Database for Vercel

> ⚠️ **CRITICAL**: SQLite does NOT work on Vercel's serverless environment (read-only filesystem).
> You MUST switch to a cloud database.

#### Option A: Turso (SQLite-compatible, RECOMMENDED)

1. Sign up at [https://turso.tech](https://turso.tech)
2. Create a new database:
```bash
turso db create blooms-school
turso db show blooms-school --url
```
3. Install the Turso adapter:
```bash
npm install @prisma/adapter-libsql @libsql/client
```
4. Update `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
5. Update `src/lib/db.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

#### Option B: Vercel Postgres

1. Add Vercel Postgres in your Vercel dashboard
2. Update `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
3. Run `npx prisma generate` and push schema

#### Option C: PlanetScale (MySQL)

1. Create database at [https://planetscale.com](https://planetscale.com)
2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Deploy to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository `blooms-junior-school`
3. Configure build settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Build Command** | `npx prisma generate && next build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |
| **Node.js Version** | `18.x` or `20.x` |

4. Add Environment Variables in Vercel Dashboard:

| Variable | Example Value |
|----------|---------------|
| `DATABASE_URL` | `file:/dev/data.db` (local) or your Turso/Postgres URL |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` |

### Step 4: Post-Deploy - Seed the Database

After deployment, visit:
```
https://your-domain.vercel.app/api/seed
```
This will populate your database with sample data.

> ⚠️ For production, remove or protect the seed endpoint to prevent accidental data resets.

---

## 🔐 Environment Variables

Create a `.env.local` file locally:

```env
# Database
DATABASE_URL=file:/home/z/my-project/db/custom.db

# NextAuth (optional, for production auth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# For Vercel deployment:
# DATABASE_URL=libsql://your-db-name.turso.io
# NEXTAUTH_URL=https://your-app.vercel.app
# NEXTAUTH_SECRET=your-production-secret
```

---

## 📦 Dependencies (package.json)

### Core Dependencies
- `next` ^16.1.1
- `react` ^19.0.0
- `react-dom` ^19.0.0
- `typescript` ^5
- `@prisma/client` ^6.11.1
- `prisma` ^6.11.1

### UI & Styling
- `tailwindcss` ^4
- `@tailwindcss/postcss` ^4
- `shadcn/ui` (35+ components in `src/components/ui/`)
- `lucide-react` (icons)
- `framer-motion` ^12.23.2
- `sonner` ^2.0.6 (toasts)
- `next-themes` ^0.4.6

### Data & State
- `zustand` ^5.0.6
- `@tanstack/react-query` ^5.82.0
- `@tanstack/react-table` ^8.21.3

### Forms & Validation
- `react-hook-form` ^7.60.0
- `@hookform/resolvers` ^5.1.1
- `zod` ^4.0.2

### Auth
- `next-auth` ^4.24.11

### Utilities
- `date-fns` ^4.1.0
- `clsx` ^2.1.1
- `tailwind-merge` ^3.3.1
- `sharp` ^0.34.3

---

## 👤 User Roles & Demo Accounts

| Role | Email | Password | Portal Access |
|------|-------|----------|--------------|
| Admin | admin@bloomsjunior.sc.ke | Blooms@2025 | Full system access |
| Parent | parent1@email.com | Blooms@2025 | Children, fees, messages |
| Teacher | teacher1@bloomsjunior.sc.ke | Blooms@2025 | Students, schoolwork, my portal |
| Student | (name login) | N/A | Assignments, media |

---

## 🎨 Design Features

- **Glassmorphism** dark theme with amber (#f59e0b) accent
- **Dynamic weather effects** (rain, snow, aurora, sunset, clouds)
- **Floating bubbles** animation background
- **Role-based navigation** (Admin/Parent/Teacher/Student)
- **Star rating tier system** for parents (Bronze → Diamond)
- **Responsive design** with collapsible sidebar
- **Custom scrollbar** styling
- **VESTA watermark** branding

---

## 📝 Important Notes for Deployment

1. **Database Migration**: You MUST switch from SQLite to a cloud database for Vercel
2. **Seed Endpoint**: Protect `/api/seed` in production (it wipes all data)
3. **File Uploads**: For Vercel, use a cloud storage service (Vercel Blob, AWS S3, Cloudinary) instead of local files
4. **Images**: Replace placeholder URLs in seed data with actual school photos
5. **Authentication**: The current system uses basic email/password. Consider implementing proper NextAuth.js for production
6. **Environment Variables**: Never commit `.env` files to GitHub
7. **Build Size**: The project uses `output: "standalone"` in next.config.ts for optimized builds

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install
# OR
bun install

# Setup database
npx prisma db push
npx prisma generate

# Start development server
npm run dev
# OR
bun run dev

# Visit http://localhost:3000
```

---

## 📞 Support

- **School Email**: bloomsjuniorschool@gmail.com
- **School Phone**: +254 011 450 3664
- **Website**: https://bloomsjunior.sc.ke
- **Built by**: VESTA (powered by Z.ai)
