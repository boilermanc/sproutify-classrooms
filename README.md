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

The Kiosk Mode feature simplifies student onboarding, allowing them to join their class and contribute to the project, for example by uploading photos of the tower's progress.

## Key Features

-   **Tower Management:** Add and manage multiple hydroponic towers for your classroom.
-   **Vitals Tracking:** Log and monitor essential water quality metrics like **pH** and **EC**, with color-coded inputs for instant feedback on optimal ranges.
-   **Plant Logging:** Track each plant's lifecycle from seed to harvest, including dates, quantities, and port numbers.
-   **Harvest & Waste Logging:** Record the weight and destination of all harvests and log any plant waste, providing valuable data on tower yield.
-   **Pest Management:** Keep a running log of pest observations and the actions taken to resolve them.
-   **Photo Gallery:** Upload photos for each tower to visually document its growth over time. Students can be credited for their photos.
-   **Comprehensive History:** A centralized view of all historical data for a tower, including vitals, harvests, waste, and pest logs.
-   **Classroom & Student Management:** Create classrooms and generate unique join codes for students.
-   **Kiosk Mode:** A simple, secure interface for students to join a class on a shared device using a join code.
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
-   **Utility:** `nanoid` for generating unique join codes.

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

-- Create other necessary tables
-- (Note: Add tables for towers, plantings, students, classrooms, etc. here)
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

-- Remember to add RLS policies for all tables to ensure data security!
-- Example RLS policy for a table:
-- alter table harvests enable row level security;
-- create policy "Users can manage their own harvests." on harvests
-- for all using (auth.uid() = teacher_id);


---

### Part 4: Project Structure and Future Roadmap

```markdown
---

## Project Structure

The project follows a standard Vite + React structure. Key directories include:


---

## Future Roadmap

-   [ ] **Implement Real Leaderboard Data:** Replace the mock leaderboard data with real, aggregated data from the database using a Supabase RPC function.
-   [ ] **Data Visualization:** Add graphs and charts to the `TowerHistory` component to visualize pH, EC, and harvest trends over time.
-   [ ] **Plant Catalog:** Implement the "Add from Catalog" feature to allow teachers to quickly add common plants with pre-filled data.
-   [ ] **Robust Row Level Security (RLS):** Review and implement comprehensive RLS policies for all tables to ensure data is secure and only accessible by the owner.
-   [ ] **Notifications:** Add a system to notify teachers of important events (e.g., "Expected harvest date is approaching").
