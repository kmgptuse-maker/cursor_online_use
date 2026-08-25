-- SkillPath L&D � Supabase schema (optional upgrade from local file store)
-- Run in Supabase SQL Editor when connecting production database.

create type user_role as enum ('employee', 'hr_admin');
create type assessment_status as enum ('not_started', 'draft', 'submitted');
create type plan_status as enum ('pending_hr_review', 'approved', 'rejected');
create type course_progress as enum ('not_started', 'in_progress', 'completed');

create table if not exists employees (
  employee_id text primary key,
  full_name text not null,
  email text not null,
  department text not null,
  job_role text not null,
  years_of_service numeric,
  hire_date date,
  status text default 'Active'
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'employee',
  employee_id text references employees(employee_id),
  display_name text
);

create table if not exists assessment_cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null references employees(employee_id),
  cycle_id uuid references assessment_cycles(id),
  status assessment_status not null default 'not_started',
  scores jsonb not null default '{}',
  submitted_at timestamptz,
  unique (employee_id, cycle_id)
);

create table if not exists learning_plans (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null references employees(employee_id),
  cycle_id uuid references assessment_cycles(id),
  gaps jsonb not null default '[]',
  goals jsonb not null default '[]',
  rationale text,
  timeline_days int default 90,
  status plan_status not null default 'pending_hr_review',
  ai_provider text,
  ai_model text,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists plan_courses (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references learning_plans(id) on delete cascade,
  course_id text not null,
  progress course_progress not null default 'not_started'
);

create table if not exists training_courses (
  course_id text primary key,
  title text not null,
  category text,
  description text,
  duration_hours numeric,
  format text,
  next_session_date date,
  max_seats int,
  status text,
  skills_covered jsonb
);

alter table employees enable row level security;
alter table profiles enable row level security;
alter table assessments enable row level security;
alter table learning_plans enable row level security;
