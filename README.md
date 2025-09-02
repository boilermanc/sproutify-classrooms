# Sproutify School 🌱

A web application designed for teachers to manage classroom hydroponic tower gardens. Sproutify School helps track plant growth, log data, and engage students in the journey from seed to harvest.

---

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Supabase Setup](#supabase-setup)
  - [Local Installation](#local-installation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Future Roadmap](#future-roadmap)

---

## About The Project

Sproutify School addresses the need for a simple yet powerful tool for educators using hydroponic towers in their classrooms. It replaces scattered spreadsheets and notebooks with a centralized, user-friendly dashboard. The application allows teachers to monitor multiple towers, track vital environmental data (pH, EC), manage individual plantings, and record outcomes like harvests and waste.

The Kiosk Mode feature provides secure student access through name-based login with classroom PINs, allowing teachers to control who can participate while tracking student engagement and contributions such as uploading photos of the tower's progress.

## Key Features

-   **Tower Management:** Add and manage multiple hydroponic towers for your classroom.
-   **Vitals Tracking:** Log and monitor essential water quality metrics like **pH** and **EC**, with color-coded inputs for instant feedback on optimal ranges.
-   **Plant Logging:** Track each plant's lifecycle from seed to harvest, including dates, quantities, and port numbers.
-   **Harvest & Waste Logging:** Record the weight and destination of all harvests and log any plant waste, providing valuable data on tower yield.
-   **Pest Management:** Keep a running log of pest observations and the actions taken to resolve them.
-   **Photo Gallery:** Upload photos for each tower to visually document its growth over time. Students can be credited for their photos.
-   **Comprehensive History:** A centralized view of all historical data for a tower, including vitals, harvests, waste, and pest logs.
-   **Classroom & Student Management:** Create classrooms and manage student rosters with teacher-controlled access.
-   **Kiosk Mode:** Students log in with their name and classroom PIN for secure, teacher-controlled access.
-   **Student Activity Tracking:** Monitor which students have participated and track their engagement over time.
-   **Gamified Leaderboard:** Compare your class's harvest totals (by weight and plant count) against fictional district and state leaders to encourage engagement.
-   **Teacher Profiles:** Manage personal and school information, including profile avatars and school logos.

## Tech Stack

This project is built with a modern, robust, and scalable technology stack.

-   **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vitejs.dev/)
-   **UI Framework:** [shadcn/ui](https://ui.shadcn.com/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Backend & Database:** [Supabase](https://supabase.com/)
    -   **Authentication:** Supabase Auth
    -   **Database:** Supabase Postgres
    -   **Storage:** Supabase Storage for all image uploads (avatars, school logos, tower photos)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **State Management:** React Context (`AppStore`)
-   **Student Management:** Teacher-controlled student rosters with login tracking and participation monitoring.

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   `npm` or `yarn`
-   A free [Supabase](https://supabase.com/) account.

### Supabase Setup

1.  **Create a New Project:** Go to your Supabase dashboard and create a new project.
2.  **Get API Keys:** Navigate to `Project Settings` > `API`. You will need the **Project URL** and the **`anon` (public) key**.
3.  **Run SQL Schema:** Navigate to the `SQL Editor` in your Supabase dashboard. Copy the contents of the [Database Schema](#database-schema) section below and run the query to create all the necessary tables and policies.
4.  **Create Storage Buckets:** Navigate to the `Storage` section and create the following public buckets:
    -   `avatars`
    -   `school-logos`
    -   `tower-photos`

### Local Installation

1.  **Clone the repo:**
    ```sh
    git clone https://github.com/your-username/sproutify-school.git
    cd sproutify-school
    ```
2.  **Install NPM packages:**
    ```sh
    npm install
    ```
3.  **Create an environment file:** Create a file named `.env` in the root of the project and add your Supabase keys.
    ```env
    # .env
    VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```
4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Your application should now be running on `http://localhost:5173`.

---

## Database Schema

Run the following SQL in your Supabase project's `SQL Editor` to set up the database tables.

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  school_name text,
  school_image_url text,
  district text,
  phone text,
  bio text,
  timezone text
);
-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Create classrooms table
create table public.classrooms (
  id uuid not null default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kiosk_pin text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint classrooms_pkey primary key (id)
);

-- Create students table with tracking fields
create table public.students (
  id uuid not null default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  display_name text not null,
  student_id text,
  grade_level text,
  has_logged_in boolean not null default false,
  first_login_at timestamp with time zone,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint students_pkey primary key (id),
  constraint students_unique_name_per_classroom unique (classroom_id, display_name)
);

-- Example for harvests:
create table public.harvests (
  id uuid not null default gen_random_uuid (),
  teacher_id uuid not null,
  tower_id uuid not null,
  harvested_at date not null default now(),
  weight_grams integer not null,
  destination text null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  planting_id uuid null,
  plant_quantity integer null default 1,
  plant_name text null,
  constraint harvests_pkey primary key (id)
);

-- Example for waste logs:
create table public.waste_logs (
  id uuid not null default gen_random_uuid (),
  teacher_id uuid not null,
  tower_id uuid not null,
  logged_at date not null default now(),
  grams integer not null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  plant_name text null,
  plant_quantity integer null default 1,
  constraint waste_logs_pkey primary key (id)
);

-- Set up Row Level Security (RLS) for all tables
alter table classrooms enable row level security;
alter table students enable row level security;
alter table harvests enable row level security;
alter table waste_logs enable row level security;

-- Create RLS policies
create policy "Teachers can manage their classrooms" on classrooms
  for all using (auth.uid() = teacher_id);

create policy "Teachers can manage students in their classrooms" on students
  for all using (exists (
    select 1 from classrooms c 
    where c.id = students.classroom_id 
    and c.teacher_id = auth.uid()
  ));

create policy "Allow kiosk access to validate student names" on students
  for select to public using (true);

create policy "Allow kiosk to update login tracking" on students
  for update to public using (true);

create policy "Users can manage their own harvests" on harvests
  for all using (auth.uid() = teacher_id);

create policy "Users can manage their own waste logs" on waste_logs
  for all using (auth.uid() = teacher_id);
```

---

## Project Structure

The project follows a standard Vite + React structure. Key directories include:

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components and routing
│   ├── classrooms/     # Classroom and student management
│   ├── kiosk/          # Student login and kiosk interface
│   ├── help/           # Documentation and help guides
│   └── ...
├── integrations/       # Third-party integrations (Supabase)
└── lib/               # Utility functions and helpers
```

### Key Components:
- **Student Management:** Teacher-controlled student rosters with add/edit/delete functionality
- **Kiosk Login:** Name + PIN based authentication system
- **Activity Tracking:** Monitor student participation and engagement
- **Security:** Row Level Security (RLS) ensures data privacy and access control

---

## Future Roadmap

-   [ ] **Enhanced Student Analytics:** Add detailed engagement metrics and participation reports for teachers.
-   [ ] **Bulk Student Import:** Allow teachers to import student rosters from CSV files or school management systems.
-   [ ] **Parent/Guardian Access:** Provide read-only access for parents to view their child's garden participation.
-   [ ] **Real Leaderboard Data:** Replace the mock leaderboard data with real, aggregated data from the database using a Supabase RPC function.
-   [ ] **Data Visualization:** Add graphs and charts to the `TowerHistory` component to visualize pH, EC, and harvest trends over time.
-   [ ] **Plant Catalog:** Implement the "Add from Catalog" feature to allow teachers to quickly add common plants with pre-filled data.
-   [ ] **Notifications:** Add a system to notify teachers of important events (e.g., "Expected harvest date is approaching").
-   [ ] **Mobile App:** Develop companion mobile apps for easier kiosk access and photo uploads.
-   [ ] **Multi-Language Support:** Add internationalization for diverse classroom environments.