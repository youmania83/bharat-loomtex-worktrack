# BHARAT LOOMTEX WORKTRACK
## Complete Operating Manual & System User Guide
**Product:** Rison WorkTrack  
**Company:** Bharat Loomtex  
**Live Production Portal:** [https://bharatloomtex.risonaitech.com](https://bharatloomtex.risonaitech.com)  
**Version:** 1.0 (Production Enterprise Edition)  
**Published:** November 2026  

---

## TABLE OF CONTENTS
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [User Roles & Authority Matrix](#2-user-roles--authority-matrix)
3. [Authentication, Login & Daily Shift Tracking](#3-authentication-login--daily-shift-tracking)
4. [Task Orchestration Guide (For Managing Director & Director)](#4-task-orchestration-guide)
5. [Employee Workspace & Execution Guide (For Department Heads)](#5-employee-workspace--execution-guide)
6. [Time Tracking & Concurrency Safety Lock](#6-time-tracking--concurrency-safety-lock)
7. [Review, Approval & Feedback Protocol](#7-review-approval--feedback-protocol)
8. [Productivity Analytics & Transparent Performance Scoring](#8-productivity-analytics--transparent-performance-scoring)
9. [AI Operational & Executive Synthesis Briefings](#9-ai-operational--executive-synthesis-briefings)
10. [Notification Center & Critical Overdue Alerts](#10-notification-center--critical-overdue-alerts)
11. [Data Exporting & Backup Guide](#11-data-exporting--backup-guide)
12. [Frequently Asked Questions & Troubleshooting](#12-frequently-asked-questions--troubleshooting)

---

## 1. SYSTEM OVERVIEW & ARCHITECTURE

**Rison WorkTrack** is an enterprise-grade employee task management, live time auditing, review approval, and productivity analytics software engineered specifically for **Bharat Loomtex**.

### Key System Highlights
- **100% Cloud-Synchronized:** Powered by high-speed persistent storage on Vercel infrastructure, ensuring real-time consistency across all executive and employee sessions.
- **Dedicated Enterprise Portal:** Live on the client-branded address [https://bharatloomtex.risonaitech.com](https://bharatloomtex.risonaitech.com).
- **Strict Role-Based Security:** Complete operational and data isolation between executive leadership and departmental staff.
- **Live Work Time Locks:** Automatic concurrency locks guarantee staff cannot log duplicate or fraudulent task hours.
- **Mathematical Performance Scoring:** Transparent 4-factor scoring model eliminating arbitrary human bias.

---

## 2. USER ROLES & AUTHORITY MATRIX

The organizational hierarchy of Bharat Loomtex is strictly modeled into the system with verified assignment and review permissions:

| Name | Role | Department & Designation | Organizational Rights |
| :--- | :--- | :--- | :--- |
| **Mr. Sumeet Khungar** | Managing Director (`admin`) | Executive Leadership • MD | Universal assignment rights to all personnel; full project creation, approval, and system auditing rights. |
| **Meenakshi Khungar** | Director (`manager`) | Executive Management • Director | Authorized assignment rights to Chandan Goswani, Marketing Head, and Accounts Head; full review and approval authority. |
| **Chandan Goswani** | Head (`employee`) | Production, HR & Design Head | Personal task execution, live timer tracking, progress reporting, blocker reporting, and review submission. |
| **Marketing Head** | Head (`employee`) | Marketing & Sales (Unfulfilled) | Departmental queue management, planning, and task execution. |
| **Accounts Head** | Head (`employee`) | Accounts & Finance Head | Financial task execution, vendor ledger reconciliations, invoice audits, and review submission. |

### Organizational Assignment Boundaries Policy
- **Managing Director (Mr. Sumeet Khungar)** can assign tasks to **anyone** across the company.
- **Director (Meenakshi Khungar)** can assign tasks **strictly to the 3 Department Heads** (Chandan Goswani, Marketing Head, Accounts Head). Attempts to assign tasks outside this hierarchy are blocked by policy.
- **Department Heads** cannot assign tasks to superiors or other peers; their workspace is strictly dedicated to executing assigned deliverables.
- **Data Privacy:** Employees can **never** access another employee's private task queue or administrative metrics.

---

## 3. AUTHENTICATION, LOGIN & DAILY SHIFT TRACKING

### 3.1 Logging In
1. Open your web browser and navigate to:  
   👉 **[https://bharatloomtex.risonaitech.com/login](https://bharatloomtex.risonaitech.com/login)**
2. Enter your registered email address or click your account card in the **Registered Personnel** list:
   - **Mr. Sumeet Khungar (MD):** `admin@bharatloomtex.com`
   - **Meenakshi Khungar (Director):** `meenakshi.khungar@bharatloomtex.com`
   - **Chandan Goswani (Production/HR):** `chandan.goswani@bharatloomtex.com`
   - **Marketing Head:** `marketing.head@bharatloomtex.com`
   - **Accounts Head:** `accounts.head@bharatloomtex.com`
3. Click **Sign In to Workspace**.
4. The system automatically redirects you:
   - Directors & MD &rarr; **Management Operations Center (`/admin/dashboard`)**
   - Department Heads &rarr; **Personal Employee Workspace (`/employee/dashboard`)**

### 3.2 Automatic Shift Clock-In & Clock-Out
- **Shift Clock-In:** The exact second an employee logs into the portal, the system automatically records their shift start timestamp in the central attendance ledger.
- **Shift Clock-Out:** When an employee clicks **Log Out** in the top-right corner:
  1. Any active task timer is automatically paused and saved.
  2. The shift logout timestamp is recorded.
  3. Total shift presence duration is calculated and credited to their daily attendance log.
  4. The employee is redirected to the confirmation screen at `/logout`.

---

## 4. TASK ORCHESTRATION GUIDE
*(For Managing Director & Director)*

### 4.1 Creating & Assigning a New Task
1. Navigate to **Task Management** (`/admin/tasks`) or click **Assign New Task** on the Dashboard.
2. In the modal, fill in the required fields:
   - **Task Title:** Clear, actionable objective (e.g., *"Reconcile Jacquard Yarn Invoices - Lot 402"*).
   - **Detailed Description:** Scope of work, technical specifications, and expected deliverables.
   - **Task Type:**
     - `Project Task`: Bound to a specific manufacturing, sales, or financial project.
     - `Daily Task`: Routine operational assignment.
   - **Project:** Select the associated project (for project tasks).
   - **Assigned Employee:** Select the responsible staff member (filtered automatically by your organizational assignment rights).
   - **Priority Level:** `Low`, `Medium`, `High`, or `Urgent`.
   - **Target Deadline:** Expected completion date.
   - **Estimated Hours:** Expected work duration (e.g., `4.0h`).
3. Click **Create & Assign Task**.
4. The task is instantly created in the cloud and dispatched to the employee's workspace.

### 4.2 Three Unified Task Views
Managers can switch between three views using the toggle in the top-right corner of `/admin/tasks`:
1. **List View:** Comprehensive table displaying priority badges, assignee details, deadline dates, logged vs. estimated hours, and real-time progress bars.
2. **Kanban Board:** Visual cards organized into 5 workflow lanes:
   - `Not Started`
   - `In Progress`
   - `On Hold / Blocked`
   - `Submitted for Review`
   - `Completed`
   - Drag or click any card to inspect full details.
3. **Calendar View:** Interactive monthly grid plotting upcoming task milestones and deadlines.

---

## 5. EMPLOYEE WORKSPACE & EXECUTION GUIDE
*(For Department Heads)*

### 5.1 Navigating Your Workspace
When logged in as a department head:
- **Dashboard (`/employee/dashboard`):** Overview of your assigned workload, active timer widget, quick performance score, and recently assigned deliverables.
- **My Tasks (`/employee/tasks`):** Complete queue of all tasks assigned to you. Use filter tabs to view `All My Tasks`, `In Progress`, `Awaiting Approval`, `Completed`, or `Overdue`.

### 5.2 Working on a Task
1. From `/employee/tasks`, click **Open &rarr;** on any task to open the **Task Details Drawer**.
2. Review the task description, deadline, and estimated hours.
3. Use the **Task Progress Slider** to update your real-time completion percentage (e.g., `25%`, `50%`, `75%`).
4. Add updates in the **Collaboration & Notes** box to document findings or milestones.

### 5.3 Reporting Blockers
If work cannot proceed due to external delays (e.g., raw material delay, pending client approval, machine breakdown):
1. Open the task drawer and scroll to the comment box.
2. Type the exact blocker reason.
3. Check the box: **Flag as Blocker**.
4. Click **Post Update**.
5. The task status instantly switches to `On Hold` and sends an immediate high-priority warning notification to executive management.

### 5.4 Submitting Deliverables for Approval
When work is 100% finished:
1. Open the task drawer.
2. Click the green button: **Submit for Approval**.
3. In the submission modal, enter your completion summary (e.g., *"All 12 invoices reconciled against physical delivery notes. Ledger balance matches."*).
4. Click **Confirm Submission**.
5. The task status changes to `Awaiting Management Approval` (`submitted`), and an instant notification is sent to both the task assigner and the Managing Director.

---

## 6. TIME TRACKING & CONCURRENCY SAFETY LOCK

The built-in task timer accurately records actual active work hours:

### How the Timer Operates
- **Start Timer:** Click the **Start Timer** button inside any task card or drawer. The timer will start counting seconds and display a live indicator.
- **Pause Timer:** Click **Pause** when stepping away from the task or taking a break.
- **Stop Timer:** Click **Stop** when completing the work session. Total elapsed time is automatically converted to decimal hours (e.g., `1h 45m = 1.75h`) and saved to the task record.

### ⚠️ Concurrency Safety Lock
To ensure strict integrity and prevent accidental or fraudulent parallel hour logging:
- An employee can only have **ONE active timer** running at any given moment.
- If an employee starts a timer on Task B while Task A is already running, the system **automatically pauses Task A**, saves its elapsed duration, and begins tracking Task B cleanly.

---

## 7. REVIEW, APPROVAL & FEEDBACK PROTOCOL
*(For Managing Director & Director)*

When an employee submits a deliverable, it enters the **Management Review Queue**.

### Step-by-Step Approval Procedure:
1. Management receives an in-app notification: *"Task Submitted for Review"*.
2. Open **Task Management** (`/admin/tasks`) and filter by `Submitted for Review` (or click the notification link).
3. Click **Open &rarr;** on the submitted task.
4. Review the employee's completion notes, total logged hours, and final deliverables.
5. Choose one of two actions:

#### Option A: Approve & Complete
- Click the green button: **Approve & Complete**.
- **Result:**
  - Task status changes to `Completed`.
  - Final completion timestamp is permanently recorded.
  - The employee's performance score and completion rate are updated.
  - The employee receives an in-app notification: *"Task Approved! 🎉"*.

#### Option B: Return with Feedback
- Click the red button: **Return with Feedback**.
- A modal opens requiring **Revision Reason / Feedback Notes** (e.g., *"Please verify column 4 invoice numbers against voucher #204 before final sign-off."*).
- Click **Return for Revision**.
- **Result:**
  - Task status switches back to `Rejected / Revision Required`.
  - Rejection reason is prominently displayed on the employee's task card.
  - The employee receives an immediate notification to review feedback and resubmit.

---

## 8. PRODUCTIVITY ANALYTICS & TRANSPARENT PERFORMANCE SCORING

Rison WorkTrack calculates employee performance using a transparent, mathematically sound weighted formula to eliminate arbitrary bias:

### The 4-Factor Performance Formula
$$\text{Score} = (0.30 \times \text{Completion}) + (0.30 \times \text{On-Time}) + (0.25 \times \text{Quality}) + (0.15 \times \text{Consistency})$$

1. **Completion Rate (30% Weight):**
   $$\frac{\text{Completed Tasks}}{\text{Total Assigned Tasks}} \times 100$$
2. **On-Time Delivery Rate (30% Weight):**
   $$\frac{\text{Tasks Finished On or Before Deadline}}{\text{Total Completed Tasks}} \times 100$$
3. **Quality & Approval Rate (25% Weight):**
   $$\frac{\text{Tasks Approved Without Correction}}{\text{Total Review Submissions}} \times 100$$
4. **Work Progress Consistency (15% Weight):**
   $$\text{Average Progress Percentage Across Active Workload}$$

### Performance Tiers
- **Star Performer (80% – 100%):** Consistently delivers high-quality work ahead of deadlines.
- **On Track (60% – 79%):** Stable execution meeting core requirements.
- **Needs Attention / Support (< 60%):** Flagged for workload imbalance or recurring deadline risks.

---

## 9. AI OPERATIONAL & EXECUTIVE SYNTHESIS BRIEFINGS

Located at `/admin/ai-reports`, this module analyzes real database records to produce executive briefings:

### Available Reports:
1. **Daily Operational Brief:**
   - Tasks completed today
   - Active tasks in progress
   - Tasks awaiting management approval
   - Overdue tasks requiring immediate escalation
   - Flagged employee blockers
2. **Weekly Productivity Synthesis:**
   - Employee-wise completion scores
   - On-time vs. delayed delivery percentages
   - High-load distribution analysis
   - Management recommendations for the upcoming week

> **Integrity Guarantee:** The AI synthesis engine relies exclusively on verifiable timestamps and database records. It never invents employee activity or assumptions outside system records.

---

## 10. NOTIFICATION CENTER & CRITICAL OVERDUE ALERTS

The Notification Bell in the top navigation bar provides instant visual alerts:
- **Red Alert Badge:** Indicates unread critical items.
- **Automated Overdue Detection:** If a task's deadline passes without completion, an automated critical alert is generated for executive management.
- **36-Hour Delay Warning:** If a high-priority task has under 36 hours remaining and progress is under 40%, the system generates an impending delay risk warning.
- **One-Click Navigation:** Clicking any notification opens the task drawer directly.

---

## 11. DATA EXPORTING & BACKUP GUIDE

### Exporting Records to CSV (Excel)
1. Navigate to **Productivity Analytics** (`/admin/analytics`).
2. Click the **Export to CSV** button in the top-right corner.
3. Your browser downloads a structured CSV file (`bharat-loomtex-performance-YYYY-MM-DD.csv`) containing:
   - Employee codes and full names
   - Total assigned, completed, pending, and overdue counts
   - Completion rate and on-time delivery percentages
   - Total hours logged and final performance scores

### Data Longevity
- All task data, activity audits, notes, and attendance logs are permanently retained in Vercel Cloud Storage. Data does not expire or auto-delete after 6 months or 1 year.

---

## 12. FREQUENTLY ASKED QUESTIONS & TROUBLESHOOTING

#### Q1: What should an employee do if they forget to stop a timer?
**A:** Open the task drawer, pause the timer, and manually adjust the progress notes if needed. When logging out, the system automatically pauses and finalizes any active timer.

#### Q2: Can Meenakshi Khungar assign tasks to the Managing Director?
**A:** No. Under the company's organizational governance policy, Director Meenakshi Khungar is authorized to assign tasks strictly to the three Department Heads (Chandan Goswani, Marketing Head, and Accounts Head).

#### Q3: Why is a task showing as "Overdue"?
**A:** The target deadline date has passed and the task has not been marked as `Completed` or `Submitted for Review`. Management should review the blocker notes or extend the deadline in the task drawer.

#### Q4: How do we access the portal on mobile devices?
**A:** Open [https://bharatloomtex.risonaitech.com](https://bharatloomtex.risonaitech.com) in any mobile browser (Safari, Chrome). The user interface is responsive and automatically adapts to smartphone and tablet screens.

---
*Bharat Loomtex WorkTrack — Engineered for Precision, Accountability, and Productivity.*
