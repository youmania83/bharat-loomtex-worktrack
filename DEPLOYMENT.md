# RISON WORKTRACK – Deployment & Production Operations Guide

> **Product:** Rison WorkTrack  
> **Company:** Rison AI Tech  
> **Tagline:** Assign. Track. Improve.  
> **Scale:** 1 Owner/Admin + 7 Core Employees (Scalable to 50–100 employees)

---

## 1. Quick Local Start (Standalone Mode)

The application features a built-in reactive data repository with authentic seed data. You can run and evaluate all 15 workflows immediately without configuring third-party services:

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (verifies 19 assertions across 15 workflows)
npm test

# 3. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. One-Click Evaluation Accounts

Use the **One-Click Instant Evaluation Login** at `/login` or the **Quick Role Switcher** in the top navigation bar to test all user roles and permissions:

| Name | Role | Email | Department |
| :--- | :--- | :--- | :--- |
| **Yogesh Wadhwa** | Admin / Owner | `admin@risonaitech.com` | Executive Management |
| **Rahul Sharma** | Employee | `rahul.sharma@risonaitech.com` | Engineering (Senior Fullstack) |
| **Priya Patel** | Employee | `priya.patel@risonaitech.com` | Product & Design (Lead UI/UX) |
| **Amit Verma** | Employee | `amit.verma@risonaitech.com` | AI Solutions (AI Specialist) |
| **Sneha Reddy** | Employee | `sneha.reddy@risonaitech.com` | Engineering (Frontend Developer) |
| **Vikram Singh** | Employee | `vikram.singh@risonaitech.com` | Quality Assurance (QA Lead) |
| **Ananya Deshmukh** | Employee | `ananya.deshmukh@risonaitech.com` | DevOps & Cloud (Cloud Engineer) |
| **Rohit Kumar** | Employee | `rohit.kumar@risonaitech.com` | Client Success (Data Analyst) |

---

## 3. Connecting to Supabase Cloud

To connect Rison WorkTrack to live Supabase Cloud PostgreSQL:

### Step 1: Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project (e.g. `rison-worktrack`).
2. Select your desired region (e.g. `ap-southeast-1` Singapore or `ap-south-1` Mumbai).

### Step 2: Run Database Schema Migrations
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Open `supabase/schema.sql` (or `supabase/migrations/001_initial_schema.sql`, `002_rls_policies.sql`, and `003_seed_data.sql`).
3. Paste the contents into the SQL Editor and click **Run**.
4. Verify that the 10 tables, indexes, enums, triggers, and RLS policies are created.

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the credentials from **Project Settings -> API**:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1Ni...
DATABASE_URL=postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres
```

---

## 4. Deploying to Vercel

Rison WorkTrack is optimized for one-click zero-config deployment on Vercel:

### Option A: Via Vercel CLI
```bash
npx vercel
```

### Option B: Via GitHub Repository
1. Push your repository to GitHub.
2. In the Vercel Dashboard, click **Add New -> Project**.
3. Import the repository.
4. Add the environment variables:
   - `NEXT_PUBLIC_APP_URL` (your production URL, e.g. `https://worktrack.risonaitech.com`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**.

---

## 5. Security & Privacy Guarantees

1. **Row Level Security (RLS):**
   - Employees can **only query and view** tasks assigned to them, their own time logs, and their personal performance records.
   - Administrative dashboards, company KPIs, and project management controls are blocked at both database and middleware layers for non-admin tokens.
2. **Timer Concurrency Lock:**
   - Starting a task timer automatically validates and pauses any existing running timer for that employee. Multiple simultaneous running timers are strictly prevented.
3. **No Intrusive Surveillance:**
   - No webcam monitoring, secret screenshots, or keystroke loggers. Time is logged solely via employee-initiated task timer events.
4. **Transparent Scoring Formula:**
   $$\text{Score} = (30\% \times \text{Completion Rate}) + (30\% \times \text{On-Time Rate}) + (25\% \times \text{Quality / Approval Rate}) + (15\% \times \text{Progress Consistency})$$
