# FineTrack – Live Late Tracking & Fine Management System

A modern, production-grade web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, Realtime, RLS)**.

FineTrack provides two dedicated interfaces:
1. **Admin Dashboard**: Restricted access for managing team members and recording late attendance (fixed ₹100 fine per late day).
2. **Public User Dashboard**: Open to everyone without login to view live late records, cumulative fines, daily attendance, and analytics in realtime.

---

## 🌟 Key Features

### 1. Dual-Interface Architecture
- **Public Dashboard (No Login Required)**:
  - **Public Overview**: Displays total registered people, total late entries, total fines generated (₹), total outstanding fines, the most late person spotlight, and real-time late entry feed.
  - **Daily Late Tracker**: Prominent date selector with Prev/Next day and "Today" quick buttons. Displays who arrived late on the selected date, late duration, and ₹100 fine. Includes an empty state (*"No late entries recorded for this date."*).
  - **Individual Fine Summary**: Searchable directory of registered people showing their Total Late Days and Cumulative Fines ($N \times \text{₹}100$). Clicking any person opens their complete late attendance history with dates, durations, and remarks.
  - **Multi-Filter Engine**: Filter by specific date, date range (Start & End), person name, and sort by newest/oldest/duration.
  - **Live Realtime Updates**: Powered by Supabase Realtime `postgres_changes`. Updates instantly when an admin records, edits, or deletes an entry.

- **Admin Dashboard (Protected via Supabase Auth & RLS)**:
  - **Secure Admin Authentication**: Supports Supabase Auth with administrative role verification.
  - **Overview & Statistics**: Total registered people, total late entries, total fines generated, total fines collected, total outstanding balance, and marked late today.
  - **Manage People**: Add new person, edit full name, activate/deactivate members, delete members with confirmation dialog, search by name, and inspect individual history.
  - **Mark Late Entry Modal**: Searchable person dropdown, date picker, hours & minutes duration, remarks, and fixed ₹100 fine calculation.
  - **Duplicate Prevention**: Strict unique constraint `(person_id, late_date)` enforced at both client and PostgreSQL database levels to prevent double-marking for the same person on the same date.
  - **Late Records Management Table**: Audit, filter, search, sort, edit, delete (with automatic recalculation), and export to CSV.
  - **Payment Tracking**: One-click toggle between "Collected" and "Pending" fine status.

---

## 🔐 Admin Credentials

| Parameter | Value |
|---|---|
| **Email** | `fine@gmail.com` |
| **Password** | `fine@sof.admn` |
| **Auth Provider** | Supabase Auth (Email / Password) |
| **Permissions** | Row Level Security (RLS) `is_admin()` policy |

> Credentials are never hardcoded in frontend source code. Authentication is verified via Supabase Auth and RLS.

---

## 🗄️ Database Design & Supabase Setup

### 1. PostgreSQL Schema
The database uses two normalized tables and dynamic aggregate views:

```sql
-- Table: people
CREATE TABLE public.people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: late_entries
CREATE TABLE public.late_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    late_date DATE NOT NULL,
    late_hours INTEGER NOT NULL DEFAULT 0,
    late_minutes INTEGER NOT NULL DEFAULT 0,
    fine_amount INTEGER NOT NULL DEFAULT 100,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMPTZ,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_person_late_date UNIQUE (person_id, late_date)
);
```

### 2. Fine Calculation Formula
$$\text{Total Fine} = \text{Total Recorded Late Entries} \times \text{₹}100$$
Each late entry represents a late day and incurs a fixed fine of ₹100, regardless of duration.

### 3. Row Level Security (RLS)
- **Public (anon & authenticated)**: Read-only access to people and late entries. Public cannot insert, update, or delete.
- **Admin**: Full read, insert, update, and delete access checked via `public.is_admin()` function matching `fine@gmail.com` or `role = 'admin'`.

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Supabase Database
1. Create a project at [supabase.com](https://supabase.com).
2. In Supabase Dashboard, open **SQL Editor**.
3. Copy and run [`supabase/schema.sql`](supabase/schema.sql).
4. Run [`supabase/admin_setup.sql`](supabase/admin_setup.sql) to register the admin account `fine@gmail.com` / `fine@sof.admn` and sample data.

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Supabase project credentials from **Project Settings > API**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

*(Note: If opened before configuring Supabase, FineTrack automatically provides an Interactive Local Sandbox with full CRUD and duplicate checking so you can test all features immediately!)*

### Step 4: Run Locally
```bash
npm run dev
```

---

## 🧪 Testing Verification Checklist

- [x] **Add a person**: Go to Admin Dashboard > Manage People > Add Person (e.g., "Karan Gupta").
- [x] **Mark late**: Select person, choose date, enter duration (e.g., 25 mins) -> Fixed ₹100 is added.
- [x] **Duplicate prevention**: Attempt to mark the same person late on the same date -> System displays duplicate error and blocks duplicate insertion.
- [x] **Filter by date**: Open Public Dashboard > Daily Late Tracker > Select date -> Only records for that date are displayed.
- [x] **Individual fine totals**: Open Public Dashboard > Individual Summary -> Verified formula $\text{Late Days} \times \text{₹}100$.
- [x] **Delete entry recalculation**: Delete a late entry in Admin Dashboard -> Cumulative totals and outstanding balance immediately recalculate.
- [x] **Public user view**: Open in an incognito window without logging in -> Full access to view records, daily attendance, individual summaries, and charts.
- [x] **Realtime updates**: Open in two side-by-side browser windows; record a late entry in Admin -> Public view updates live.

---

## 📦 Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Deploy!
