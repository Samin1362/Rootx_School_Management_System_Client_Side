# RootX School Management System — Client Side

A comprehensive, cloud-based **multi-tenant SaaS** school management platform built for modern educational institutions. RootX SMS covers every aspect of school administration — from student enrolment and attendance tracking to exam grading workflows, fee collection, payroll, and real-time announcements — all in one secure, role-aware dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Public Landing & Marketing](#public-landing--marketing)
  - [Authentication & Onboarding](#authentication--onboarding)
  - [Role-Based Access Control](#role-based-access-control)
  - [Academic Structure Management](#academic-structure-management)
  - [People Management](#people-management)
  - [Attendance Management](#attendance-management)
  - [Exam & Grade Management](#exam--grade-management)
  - [Fee & Finance Management](#fee--finance-management)
  - [Communication & Announcements](#communication--announcements)
  - [Reports & Analytics](#reports--analytics)
  - [Activity Logs](#activity-logs)
  - [Subscription Management](#subscription-management)
  - [Super Admin Dashboard](#super-admin-dashboard)
- [User Roles](#user-roles)
- [Theme & Design System](#theme--design-system)
- [Routing Structure](#routing-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)

---

## Overview

RootX SMS is a **multi-tenant SaaS** platform where each school operates as an isolated **Organization**. Every data record — students, teachers, classes, attendance, grades, fees — is scoped to an organization, ensuring complete data separation between institutions.

The platform supports **7 distinct user roles** with granular, permission-based access control. A single deployment serves unlimited schools simultaneously, each with its own subscription plan, branding, and settings.

**Key differentiators:**
- **Grade approval workflow** — Teachers submit grades → Moderator reviews → Admin approves → Published to students and parents
- **Real-time subscription change detection** — Background polling detects plan upgrades and notifies users in-app
- **Bilingual interface** — Full English and Bengali (বাংলা) language support via i18n
- **Dark / Light theme** — Persisted per user across all sessions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.2 |
| Build Tool | Vite 7.2 |
| Styling | TailwindCSS v4 + DaisyUI v5 |
| Routing | React Router v7 |
| Server State | TanStack React Query v5 |
| HTTP Client | Axios |
| Authentication | Firebase Auth v12 |
| Forms | React Hook Form v7 |
| Charts | Recharts v3 |
| Icons | React Icons v5 |
| Date Picker | React DatePicker v9 |
| Excel Export | SheetJS (xlsx) |
| i18n | i18next + react-i18next |
| Backend API | Node.js + Express 5 (separate repo) |
| Database | MongoDB Atlas (via backend) |

---

## Project Structure

```
src/
├── assets/                      # Static assets (images, SVGs)
├── components/                  # Shared reusable UI components
│   ├── ConfirmModal.jsx         # Danger/warning/info confirmation dialog
│   ├── EmptyState.jsx           # Zero-data placeholder with optional CTA
│   ├── FirebaseStatus.jsx       # Firebase connectivity indicator (dev)
│   ├── Footer.jsx               # Public site footer
│   ├── LanguageSwitcher.jsx     # EN / BN toggle
│   ├── Loader.jsx               # Full-page loading spinner
│   ├── Logo.jsx                 # Animated RootX logo (multi-size)
│   ├── Notification.jsx         # Toast notification (auto-dismiss)
│   └── PublicNavbar.jsx         # Sticky navbar for public pages
├── config/
│   └── api.js                   # API base URL (localhost / Vercel)
├── contexts/
│   ├── auth/
│   │   ├── AuthContext.jsx
│   │   └── AuthProvider.jsx     # Firebase auth state + DB user sync
│   ├── organization/
│   │   └── OrganizationContext.jsx  # Org + subscription data, 60s polling
│   └── NotificationContext.jsx  # Global toast notification system
├── firebase/
│   └── firebase-config.js       # Firebase app initialization
├── hooks/
│   ├── useAuth.jsx              # Consume AuthContext
│   └── useAxiosSecure.jsx       # Axios instance with x-user-email header
├── layouts/
│   ├── AuthLayout.jsx           # Wrapper for login / register (redirects auth'd users)
│   ├── DashboardLayout.jsx      # Full sidebar + topbar for authenticated users
│   ├── PublicLayout.jsx         # Navbar + footer wrapper for public pages
│   └── SuperAdminDashboardLayout.jsx  # Separate layout for platform admins
├── locales/
│   ├── bn/                      # Bengali translations
│   └── en/                      # English translations
├── pages/
│   ├── AcademicStructure/       # Classes, Sections, Subjects (CRUD)
│   ├── ActivityLogs/            # Paginated audit trail
│   ├── Announcements/           # Create, list, edit announcements
│   ├── AttendanceManagement/    # Mark, history, reports
│   ├── Auth/                    # Login, Register
│   ├── Dashboard/               # Overview / home dashboard
│   ├── ExamManagement/          # Exams CRUD + details
│   ├── FeeManagement/           # Fee structures, student fees, payments, receipts
│   ├── FinanceManagement/       # Expenses, salaries, finance reports
│   ├── GradeManagement/         # Grade entry, submissions, reviews, approvals
│   ├── Landing/                 # Public HomePage + ContactPage
│   ├── Notifications/           # In-app notification centre
│   ├── Organization/            # Organization signup
│   ├── Reports/                 # Attendance, academic, finance, workload reports
│   ├── Results/                 # Published results + report cards
│   ├── Settings/                # Organization settings
│   ├── StudentManagement/       # Students list, details, add
│   ├── Subscription/            # Public plans page + dashboard subscription page
│   ├── SuperAdmin/              # Platform-wide management (super admin only)
│   ├── TeacherManagement/       # Teachers list, details, add
│   ├── UserManagement/          # User roles and access
│   ├── ErrorPage.jsx
│   ├── OrganizationSuspended.jsx
│   └── WaitingForOrganization.jsx
├── utils/                       # Helper utilities
├── App.jsx                      # Root component with context providers
├── i18n.js                      # i18next configuration
├── index.css                    # Global styles, DaisyUI theme definitions
├── main.jsx                     # React + Router + QueryClient bootstrap
└── router.jsx                   # All application routes
```

---

## Features

### Public Landing & Marketing

- **Home Page** (`/`) — Full-screen hero banner with animated gradient headline, floating orb effects, and dual CTA buttons (Get Started Free / Sign In)
- **Stats section** — School count, student count, teacher count, uptime figures
- **Features section** — 6-card grid showcasing platform capabilities
- **Pricing section** — Live subscription plans fetched from the API with monthly/yearly toggle; Professional tier highlighted as most popular
- **CTA banner** — Gradient call-to-action block linking to organization signup
- **Contact page** (`/contact`) — Two-column layout with contact info cards and a send-message form (with animated success state)
- **Sticky navbar** — Scroll-aware glassmorphism navbar with theme toggle, Home/Contact links, and Login button; collapses to hamburger on mobile
- **Footer** — Logo, quick links, contact details, social icons, copyright bar

### Authentication & Onboarding

- **Login** (`/login`) — Email + password authentication via Firebase; role-aware redirect (super admin → super admin dashboard, others → main dashboard); error mapping for all Firebase error codes
- **Register** (`/register`) — New user registration linked to an existing organization
- **Organization Signup** (`/signup`) — Multi-step form to create a new school organization; auto-provisions a 14-day Professional trial subscription
- **Waiting screen** — Shown to users not yet linked to an organization
- **Suspended screen** — Shown when an organization's subscription is suspended

### Role-Based Access Control

Seven roles with layered permissions control every route, sidebar item, and API call:

| Role | Scope |
|------|-------|
| `super_admin` | Full platform access; manages all organizations, subscriptions, plans |
| `org_owner` | Full access within their organization; manages subscription |
| `admin` | All org operations except subscription management |
| `moderator` | Reviews and forwards grade submissions; views reports |
| `teacher` | Marks attendance for own classes; submits and manages own grades |
| `student` | Views own attendance, grades, results, fees, announcements |
| `parent` | Views children's attendance, grades, fees, announcements |

The sidebar dynamically renders only the sections each role is permitted to see.

### Academic Structure Management

- **Classes** — Create, view, edit, and delete school classes; usage limit enforcement per subscription plan
- **Sections** — Manage sections within classes (e.g., Class 10 → Section A, B, C)
- **Subjects** — Assign subjects to classes and link them to specific teachers
- Cascade soft-delete: removing a class deactivates its sections, subjects, and students

### People Management

- **Students** — Add students with auto-generated roll numbers; link to a parent account; manage profile, class, and section; Firebase account created on add
- **Teachers** — Add teachers with subject and class assignments; Firebase account provisioned; view per-teacher details including assigned subjects and attendance records
- **Parents** — Bidirectional link between parent accounts and student records
- **Users** — Assign and change user roles within the organization

### Attendance Management

- **Mark Attendance** (`/dashboard/attendance/mark`) — Teachers select class + section + date and mark each student as Present, Absent, or Late; future dates blocked; upsert logic allows correction
- **Attendance History** (`/dashboard/attendance/history`) — Filter by class, section, and date range; paginated record list
- **Attendance Reports** (`/dashboard/attendance/reports`) — Aggregated status breakdown, per-class breakdown, daily trend chart; teachers see only their assigned classes

### Exam & Grade Management

A structured **6-state workflow** ensures grade integrity:

```
draft → submitted → under_review → approved / rejected → published
```

- **Exams** — Create exams with date, subject, class, section, and total marks; edit and delete
- **Grade Entry** — Teachers fill in per-student marks; auto-calculated letter grade (A+, A, A−, B, C, D, F) and GPA
- **My Submissions** — Teachers track all their own grade submissions and their workflow status
- **Pending Reviews** — Moderators see submitted grades awaiting review; can forward to admin
- **Grade Approval** — Admins approve or reject reviewed submissions; rejected grades return to teacher
- **Published Results** — Students and parents see only published results; includes subject-wise breakdown and GPA
- **Report Cards** — Printable per-student, per-exam report card with all subject results and GPA
- **Notifications** — Automatic in-app notifications on every state transition (submission, review, approval, rejection, publication)

### Fee & Finance Management

- **Fee Structures** — Define monthly fee amounts per class; supports multiple fee types
- **Generate Fees** — Bulk-generate monthly fee records for all students in a class; skips existing records
- **Student Fees** — View and update individual student fee records; track paid, partial, and due amounts
- **Collect Payment** — Record payment with mode (cash, bank transfer, mobile banking) and auto-generate a formatted receipt number (`SLUG-YYYY-NNNNN`)
- **Payment Receipt** — Printable payment receipt view
- **Fee Dues** — List of students with outstanding dues, filterable by class and month
- **Fee Reports** — Monthly fee collection summary broken down by class and payment mode
- **My Fees** — Students view their own fee history and dues
- **Child Fees** — Parents view fee status for their linked children
- **Expenses** — Record and categorize school operational expenses; CRUD
- **Salaries** — Define and generate monthly salary records for staff; bulk generation by role; salary reports by month and role
- **Finance Reports** — Income vs expense summary, net position, fee dues total, salary total, breakdowns by payment mode and expense category

### Communication & Announcements

- **Create Announcement** — Rich targeting options: school-wide, specific class, specific section, or by role; priority levels (normal, important, urgent); optional expiry date
- **Announcements List** — Filter by target and priority; paginated; inline delete and edit
- **Role-based visibility** — Students see only announcements for their class/section; parents see their children's class announcements; teachers see their assigned classes; admins see all
- **Notification fan-out** — Creating an announcement automatically generates in-app notifications for all targeted users

### Reports & Analytics

Four comprehensive report tabs, each with filters and CSV export:

| Report | Content |
|--------|---------|
| **Attendance Report** | Status breakdown (present/absent/late), per-class counts, daily trend; teachers scoped to own classes |
| **Academic Report** | Grade distribution (A+→F), overall pass rate, per-subject breakdown, top 10 performers |
| **Finance Report** | Total income, expenses, fee dues, salary costs, net position; breakdown by payment mode and expense category |
| **Teacher Workload** | Subjects and classes per teacher, grade submissions by status, attendance sessions marked |

- Filters: date range, class, section (context-dependent per tab)
- **CSV Export** — Dedicated export endpoints for Students, Attendance, Fees, and Results; downloaded as formatted `.csv` files

### Activity Logs

- Paginated audit trail of all mutations across the organization
- Each entry shows: action, resource type, user, timestamp, and a before/after changes diff
- Filterable by action type, resource type, user, and date range
- Expandable rows show the raw JSON changes

### Subscription Management

- **My Subscription** (`/dashboard/subscription`) — Visible to `org_owner` only
  - Hero card showing current plan name, status (Trial / Active / Cancelled), billing amount, and period end date with days-remaining countdown
  - **Usage bars** — Real-time progress bars for Students, Classes, Teachers, and Storage vs plan limits; turn orange at 80% and red at 90%
  - **Included features** — Grid of all features in the current plan
  - **Available plans grid** — All 4 plans (Free, Basic, Professional, Enterprise) with monthly/yearly price toggle; current plan highlighted; Upgrade ↑ / Downgrade ↓ buttons
  - **Request modal** — Select billing cycle, add optional reason; submits an upgrade/downgrade request to the admin team
  - **Request status banners** — Pending (yellow), Approved (green), Rejected (red) banners shown in real time
- **Public Plans page** (`/plans`) — Marketing-facing plan comparison with Get Started CTA

### Super Admin Dashboard

A separate layout and route namespace (`/dashboard/super-admin/`) exclusively for the platform operator:

- **Dashboard** — Platform-wide KPIs: total organizations, active subscriptions, revenue, trial conversions
- **Organizations** — List all schools; view details; suspend / reactivate organizations
- **Users** — View all platform users; inspect individual user profiles
- **Subscriptions** — View and manually update any organization's subscription (tier, status, billing cycle, dates)
- **Subscription Requests** — Approve or reject upgrade/downgrade requests submitted by org owners
- **Reactivation Requests** — Handle requests from suspended organizations to be reinstated
- **Plans Management** — Full CRUD for subscription plans (name, tier, pricing, limits, features, active status)
- **Platform Settings** — Global configuration for the SaaS platform
- **Platform Reports** — Aggregated cross-organization analytics

---

## User Roles

### Dashboard Sidebar Navigation by Role

| Section | org_owner | admin | moderator | teacher | student | parent |
|---------|:---------:|:-----:|:---------:|:-------:|:-------:|:------:|
| Overview | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Students | ✓ | ✓ | ✓ | ✓ | — | — |
| Teachers | ✓ | ✓ | ✓ | — | — | — |
| Classes / Sections / Subjects | ✓ | ✓ | ✓ | ✓ | — | — |
| Mark Attendance | ✓ | ✓ | ✓ | ✓ | — | — |
| Attendance Reports | ✓ | ✓ | ✓ | ✓ | — | — |
| Exams | ✓ | ✓ | ✓ | ✓ | — | — |
| Grade Entry | — | — | — | ✓ | — | — |
| Grade Approval | ✓ | ✓ | — | — | — | — |
| Results | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| My Results | — | — | — | — | ✓ | — |
| Fee Structures | ✓ | ✓ | — | — | — | — |
| Collect Payment | ✓ | ✓ | ✓ | — | — | — |
| My Fees | — | — | — | — | ✓ | — |
| Child Fees | — | — | — | — | — | ✓ |
| Expenses / Salaries | ✓ | ✓ | — | — | — | — |
| Announcements | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | ✓ | ✓ | — | — |
| Activity Logs | ✓ | ✓ | — | — | — | — |
| User Management | ✓ | ✓ | — | — | — | — |
| Subscription | ✓ | — | — | — | — | — |

---

## Theme & Design System

The UI is built on **DaisyUI v5** with two custom themes defined in `index.css`:

| Token | `rootxlight` | `rootxdark` |
|-------|-------------|------------|
| Background | Near-white `oklch(0.98 0.005 250)` | Deep navy `oklch(0.22 0.015 260)` |
| Primary | Indigo `oklch(0.55 0.18 260)` | Brighter indigo `oklch(0.60 0.18 260)` |
| Secondary | Cyan/Teal `oklch(0.60 0.16 165)` | Brighter teal `oklch(0.65 0.16 165)` |
| Accent | Yellow `oklch(0.65 0.15 80)` | Brighter yellow `oklch(0.70 0.15 80)` |

**Design patterns used throughout:**
- Glassmorphism cards — `bg-base-100/60 backdrop-blur-sm border border-base-300/50`
- Floating orb backgrounds — animated blurred circles for depth
- Gradient hero sections — `bg-gradient-to-br from-primary via-primary/90 to-secondary`
- Animated text gradients — `bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text`
- Scroll-aware navbar — increases opacity and shadow on scroll
- Staggered `animate-fadeInUp` on list and card rendering
- Progress bars with color thresholds (blue → orange → red)

Theme preference is stored in `localStorage` under the key `rootx-theme` and applied via `data-theme` on `<html>`. It persists across all pages including public and dashboard views.

---

## Routing Structure

```
/                          → Public HomePage (PublicLayout)
/contact                   → Contact Page (PublicLayout)
/login                     → Login (AuthLayout — redirects authenticated users)
/register                  → Register (AuthLayout)
/signup                    → Organization Signup
/plans                     → Public Subscription Plans
/waiting-for-organization  → No org linked yet
/organization-suspended    → Org suspended screen

/dashboard/                → DashboardLayout (authenticated users)
  overview
  students, students/add, students/:id
  teachers, teachers/add, teachers/:id
  classes, classes/add
  sections, sections/add
  subjects, subjects/add
  attendance/mark, attendance/history, attendance/reports
  exams, exams/:examId
  grade-entry, my-submissions, pending-reviews, grade-approval
  grade-submissions/:submissionId
  results, my-results, report-card/:studentId/:examId
  notifications
  fee-structures, student-fees, collect-payment, fee-dues, fee-reports
  receipt/:paymentId, my-fees, child-fees
  expenses, expenses/add, expenses/edit/:id
  salaries, finance-reports
  announcements, announcements/create, announcements/edit/:id
  reports, activity-logs
  users, settings
  subscription                ← org_owner only

/dashboard/super-admin/    → SuperAdminDashboardLayout
  (index)                  → SuperAdminDashboard
  organizations, organizations/:id
  users, users/:id
  subscriptions
  subscription-requests
  reactivation-requests
  plans
  settings
  reports
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A running instance of the RootX backend server
- Firebase project configured

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rootx_school_ms_client_side

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

> Make sure the backend server is running on `http://localhost:3000` before starting the frontend.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

If `VITE_API_BASE_URL` is not set, the app auto-detects:
- `localhost` → `http://localhost:3000`
- Any other host → `https://rootx-school-ms-server.vercel.app`

---

## Available Scripts

```bash
npm run dev        # Start Vite development server with HMR
npm run build      # Production build (output to dist/)
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
```

---

## License

&copy; 2026 Rootx Software Limited. All rights reserved.
