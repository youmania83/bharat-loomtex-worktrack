# RISON WORKTRACK
## Complete Employee Task & Productivity Management System

> **Tagline:** Assign. Track. Improve.  
> **Company:** Rison AI Tech  
> **Target Scale:** 1 Owner/Admin + 7 Core Employees (Scalable to 50–100 employees)  
> **Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn-style UI, Lucide Icons, Recharts, Supabase / PostgreSQL.

---

## 🌟 Overview & Key Capabilities

Rison WorkTrack is a production-ready enterprise task management and productivity analytics software engineered specifically for **Rison AI Tech** and its clients.

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

## 👥 Demo & Initial Client Setup (1 Admin + 7 Employees)

Quick-switch between accounts at `/login` or via the topbar switcher:

| Name | Role | Email |
| :--- | :--- | :--- |
| **Yogesh Wadhwa** | Admin / Owner | `admin@risonaitech.com` |
| **Rahul Sharma** | Senior Fullstack Engineer | `rahul.sharma@risonaitech.com` |
| **Priya Patel** | Lead UI/UX Designer | `priya.patel@risonaitech.com` |
| **Amit Verma** | AI Automation Specialist | `amit.verma@risonaitech.com` |
| **Sneha Reddy** | Frontend Developer | `sneha.reddy@risonaitech.com` |
| **Vikram Singh** | QA & Test Automation Lead | `vikram.singh@risonaitech.com` |
| **Ananya Deshmukh** | Backend & Cloud Engineer | `ananya.deshmukh@risonaitech.com` |
| **Rohit Kumar** | Client Solutions & Data Analyst | `rohit.kumar@risonaitech.com` |

---

## 🗄️ Database Architecture & Migrations

All SQL migrations are organized in `supabase/migrations/`:
- `001_initial_schema.sql`: 10 core PostgreSQL tables, enums, triggers, and performance indexes.
- `002_rls_policies.sql`: Row Level Security policies enforcing multi-role tenant isolation.
- `003_seed_data.sql`: Seed data for Rison AI Tech team, projects, tasks, and notifications.
- `supabase/schema.sql`: Consolidated script for one-click execution in Supabase SQL Editor.

See [DEPLOYMENT.md](file:///Users/yogeshkumarwadhwa/Rison%20Work%20Track/DEPLOYMENT.md) for full deployment instructions.
