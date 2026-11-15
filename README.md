# BHARAT LOOMTEX – WORKTRACK
## Complete Employee Task & Productivity Management System

> **Tagline:** Assign. Track. Improve.  
> **Company:** Bharat Loomtex  
> **Owner / Managing Director:** Mr. Sumeet Khungar  
> **Live Production Portal:** [https://bharatloomtex.risonaitech.com](https://bharatloomtex.risonaitech.com)  
> **Target Scale:** Executive Leadership + Department Heads (Scalable to 50–100 employees)  
> **Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn-style UI, Lucide Icons, Recharts, Vercel Blob / PostgreSQL.

---

## 🌟 Overview & Key Capabilities

WorkTrack is a production-ready enterprise task management and productivity analytics software engineered specifically for **Bharat Loomtex**.

- **Dual-Portal Role-Based Access Control:**
  - **Admin / Owner Portal (`/admin`):** Complete employee roster management, project creation, task assignment, multi-view boards, review approval queue, productivity analytics, CSV exports, and Phase 2 AI Operational Briefings.
  - **Employee Workspace (`/employee`):** Filtered task queue (strictly isolated via RLS), interactive live time tracking widget, single-timer concurrency safety lock, progress sliders, blocker reporting, and submit-for-approval workflow.
- **Three Unified Task Views:**
  1. **List View:** Filterable, sortable table with status badges, priority tags, and hour logs.
  2. **Kanban Board:** 5 stage columns (`Not Started`, `In Progress`, `On Hold / Blocked`, `Submitted for Review`, `Completed`).
  3. **Calendar View:** Month grid plotting tasks by deadlines.
- **Task Timer with Concurrency Safety:**
  - Employees can start, pause, resume, and stop timers.
  - Automatically pauses any other running timer for the employee to guarantee no duplicate or fraudulent hours.
- **Transparent Mathematical Performance Score:**
  - **30% Completion Rate** (Completed / Assigned)
  - **30% On-Time Completion** (Finished on/before deadline)
  - **25% Quality / Approval Rate** (Submissions approved without rejection)
  - **15% Work Consistency** (Progress updates across workload)
- **Phase 2 AI Operational & Executive Synthesis:**
  - Real database metrics analyzer generating daily operational briefings and weekly productivity reviews with zero invented activity.
- **In-App Notification Center:**
  - Real-time notifications for task assignments, overdue alerts, approvals, and blockers.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```
*Executes all 19 automated verification tests across the 15 system workflows.*

### 3. Build & Run
```bash
# Build production bundle
npm run build

# Start local server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 👥 Official Bharat Loomtex Personnel

Quick-switch between accounts at `/login` or via the topbar switcher:

| Name | Role | Department & Designation | Email |
| :--- | :--- | :--- | :--- |
| **Mr. Sumeet Khungar** | MD (Admin) | Managing Director • Assigns to Everyone | `admin@bharatloomtex.com` |
| **Meenakshi Khungar** | Director (Manager) | Director • Assigns to 3 Dept Heads | `meenakshi.khungar@bharatloomtex.com` |
| **Chandan Goswani** | Head (Employee) | Production, HR & Design Head | `chandan.goswani@bharatloomtex.com` |
| **Marketing Head** | Head (Employee) | Marketing & Sales (Position Unfulfilled) | `marketing.head@bharatloomtex.com` |
| **Accounts Head** | Head (Employee) | Accounts & Finance Head | `accounts.head@bharatloomtex.com` |

---

## 🗄️ Database Architecture & Migrations

All SQL migrations are organized in `supabase/migrations/`:
- `001_initial_schema.sql`: 10 core PostgreSQL tables, enums, triggers, and performance indexes.
- `002_rls_policies.sql`: Row Level Security policies enforcing multi-role tenant isolation.
- `003_seed_data.sql`: Seed data for Rison AI Tech team, projects, tasks, and notifications.
- `supabase/schema.sql`: Consolidated script for one-click execution in Supabase SQL Editor.

See [DEPLOYMENT.md](file:///Users/yogeshkumarwadhwa/Rison%20Work%20Track/DEPLOYMENT.md) for full deployment instructions.
