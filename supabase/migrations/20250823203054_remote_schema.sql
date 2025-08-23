create type "public"."app_role" as enum ('admin', 'teacher', 'student');


  create table "public"."classrooms" (
    "id" uuid not null default gen_random_uuid(),
    "teacher_id" uuid not null,
    "name" text not null,
    "kiosk_pin" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."classrooms" enable row level security;


  create table "public"."harvests" (
    "id" uuid not null default gen_random_uuid(),
    "teacher_id" uuid not null,
    "tower_id" uuid not null,
    "harvested_at" date not null default now(),
    "weight_grams" integer not null,
    "destination" text,
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "planting_id" uuid,
    "plant_quantity" integer default 1,
    "plant_name" text
      );


alter table "public"."harvests" enable row level security;


  create table "public"."join_codes" (
    "id" uuid not null default gen_random_uuid(),
    "classroom_id" uuid not null,
    "code" text not null,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."join_codes" enable row level security;


  create table "public"."pest_logs" (
    "id" uuid not null default gen_random_uuid(),
    "teacher_id" uuid not null,
    "tower_id" uuid not null,
    "observed_at" timestamp with time zone not null default now(),
    "pest" text not null,
    "action" text,
    "notes" text,
    "severity" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."pest_logs" enable row level security;


  create table "public"."plant_catalog" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "germination_days" integer,
    "harvest_days" integer,
    "image_url" text,
    "is_global" boolean not null default false,
    "teacher_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "category" text
      );


alter table "public"."plant_catalog" enable row level security;


  create table "public"."plantings" (
    "id" uuid not null default gen_random_uuid(),
    "teacher_id" uuid not null,
    "tower_id" uuid not null,
    "port_number" integer,
    "catalog_id" uuid,
    "name" text not null,
    "quantity" integer not null default 1,
    "seeded_at" date,
    "planted_at" date,
    "growth_rate" text,
    "expected_harvest_date" date,
    "outcome" text,
    "status" text not null default 'active'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."plantings" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "avatar_url" text,
    "updated_at" timestamp with time zone default now(),
    "school_name" text,
    "district" text,
    "timezone" text,
    "bio" text,
    "phone" text,
    "settings" jsonb not null default '{}'::jsonb,
    "school_image_url" text,
    "first_name" text,
    "last_name" text,
    "school_id" uuid
      );



  create table "public"."schools" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "district" text,
    "timezone" text,
    "image_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."students" (
    "id" uuid not null default gen_random_uuid(),
    "classroom_id" uuid not null,
    "display_name" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."students" enable row level security;


  create table "public"."tower_photos" (
    "id" uuid not null default gen_random_uuid(),
    "teacher_id" uuid not null,
    "tower_id" uuid not null,
    "file_path" text not null,
    "caption" text,
    "student_name" text,
    "taken_at" date not null default now(),
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."tower_photos" enable row level security;


  create table "public"."tower_vitals" (
    "id" uuid not null default gen_random_uuid(),
    "teacher_id" uuid not null,
    "tower_id" uuid not null,
    "recorded_at" timestamp with time zone not null default now(),
    "ph" numeric,
    "ec" numeric,
    "light_lux" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."tower_vitals" enable row level security;


  create table "public"."towers" (
    "id" uuid not null default gen_random_uuid(),
    "teacher_id" uuid not null,
    "name" text not null,
    "ports" integer not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."towers" enable row level security;


  create table "public"."user_roles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "role" app_role not null,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."waste_logs" (
    "id" uuid not null default gen_random_uuid(),
    "teacher_id" uuid not null,
    "tower_id" uuid not null,
    "logged_at" date not null default now(),
    "grams" integer not null,
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "planting_id" uuid,
    "plant_name" text,
    "plant_quantity" integer default 1
      );


alter table "public"."waste_logs" enable row level security;

CREATE UNIQUE INDEX classrooms_pkey ON public.classrooms USING btree (id);

CREATE UNIQUE INDEX harvests_pkey ON public.harvests USING btree (id);

CREATE INDEX idx_harvests_teacher_id ON public.harvests USING btree (teacher_id);

CREATE INDEX idx_harvests_tower_id ON public.harvests USING btree (tower_id);

CREATE INDEX idx_pest_logs_teacher_id ON public.pest_logs USING btree (teacher_id);

CREATE INDEX idx_pest_logs_tower_id ON public.pest_logs USING btree (tower_id);

CREATE INDEX idx_plantings_teacher_id ON public.plantings USING btree (teacher_id);

CREATE INDEX idx_plantings_tower_id ON public.plantings USING btree (tower_id);

CREATE INDEX idx_tower_photos_teacher_id ON public.tower_photos USING btree (teacher_id);

CREATE INDEX idx_tower_photos_tower_id ON public.tower_photos USING btree (tower_id);

CREATE INDEX idx_tower_vitals_teacher_id ON public.tower_vitals USING btree (teacher_id);

CREATE INDEX idx_tower_vitals_tower_id_recorded_at ON public.tower_vitals USING btree (tower_id, recorded_at DESC);

CREATE INDEX idx_towers_teacher_id ON public.towers USING btree (teacher_id);

CREATE INDEX idx_waste_logs_teacher_id ON public.waste_logs USING btree (teacher_id);

CREATE INDEX idx_waste_logs_tower_id ON public.waste_logs USING btree (tower_id);

CREATE UNIQUE INDEX join_codes_code_key ON public.join_codes USING btree (code);

CREATE UNIQUE INDEX join_codes_pkey ON public.join_codes USING btree (id);

CREATE UNIQUE INDEX pest_logs_pkey ON public.pest_logs USING btree (id);

CREATE UNIQUE INDEX plant_catalog_pkey ON public.plant_catalog USING btree (id);

CREATE UNIQUE INDEX plantings_pkey ON public.plantings USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX schools_pkey ON public.schools USING btree (id);

CREATE UNIQUE INDEX students_pkey ON public.students USING btree (id);

CREATE UNIQUE INDEX tower_photos_pkey ON public.tower_photos USING btree (id);

CREATE UNIQUE INDEX tower_vitals_pkey ON public.tower_vitals USING btree (id);

CREATE UNIQUE INDEX towers_pkey ON public.towers USING btree (id);

CREATE UNIQUE INDEX unique_global_plant_name ON public.plant_catalog USING btree (name) WHERE (teacher_id IS NULL);

CREATE UNIQUE INDEX unique_teacher_plant_name ON public.plant_catalog USING btree (name, teacher_id) WHERE (teacher_id IS NOT NULL);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

CREATE UNIQUE INDEX user_roles_user_id_role_key ON public.user_roles USING btree (user_id, role);

CREATE UNIQUE INDEX waste_logs_pkey ON public.waste_logs USING btree (id);

alter table "public"."classrooms" add constraint "classrooms_pkey" PRIMARY KEY using index "classrooms_pkey";

alter table "public"."harvests" add constraint "harvests_pkey" PRIMARY KEY using index "harvests_pkey";

alter table "public"."join_codes" add constraint "join_codes_pkey" PRIMARY KEY using index "join_codes_pkey";

alter table "public"."pest_logs" add constraint "pest_logs_pkey" PRIMARY KEY using index "pest_logs_pkey";

alter table "public"."plant_catalog" add constraint "plant_catalog_pkey" PRIMARY KEY using index "plant_catalog_pkey";

alter table "public"."plantings" add constraint "plantings_pkey" PRIMARY KEY using index "plantings_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."schools" add constraint "schools_pkey" PRIMARY KEY using index "schools_pkey";

alter table "public"."students" add constraint "students_pkey" PRIMARY KEY using index "students_pkey";

alter table "public"."tower_photos" add constraint "tower_photos_pkey" PRIMARY KEY using index "tower_photos_pkey";

alter table "public"."tower_vitals" add constraint "tower_vitals_pkey" PRIMARY KEY using index "tower_vitals_pkey";

alter table "public"."towers" add constraint "towers_pkey" PRIMARY KEY using index "towers_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."waste_logs" add constraint "waste_logs_pkey" PRIMARY KEY using index "waste_logs_pkey";

alter table "public"."classrooms" add constraint "classrooms_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."classrooms" validate constraint "classrooms_teacher_id_fkey";

alter table "public"."harvests" add constraint "harvests_planting_id_fkey" FOREIGN KEY (planting_id) REFERENCES plantings(id) ON DELETE SET NULL not valid;

alter table "public"."harvests" validate constraint "harvests_planting_id_fkey";

alter table "public"."harvests" add constraint "harvests_tower_id_fkey" FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE not valid;

alter table "public"."harvests" validate constraint "harvests_tower_id_fkey";

alter table "public"."join_codes" add constraint "join_codes_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE not valid;

alter table "public"."join_codes" validate constraint "join_codes_classroom_id_fkey";

alter table "public"."join_codes" add constraint "join_codes_code_key" UNIQUE using index "join_codes_code_key";

alter table "public"."pest_logs" add constraint "pest_logs_tower_id_fkey" FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE not valid;

alter table "public"."pest_logs" validate constraint "pest_logs_tower_id_fkey";

alter table "public"."plant_catalog" add constraint "plant_catalog_category_check" CHECK ((category = ANY (ARRAY['Leafy Green'::text, 'Herb'::text]))) not valid;

alter table "public"."plant_catalog" validate constraint "plant_catalog_category_check";

alter table "public"."plant_catalog" add constraint "plant_catalog_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."plant_catalog" validate constraint "plant_catalog_teacher_id_fkey";

alter table "public"."plantings" add constraint "plantings_catalog_id_fkey" FOREIGN KEY (catalog_id) REFERENCES plant_catalog(id) ON DELETE SET NULL not valid;

alter table "public"."plantings" validate constraint "plantings_catalog_id_fkey";

alter table "public"."plantings" add constraint "plantings_tower_id_fkey" FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE not valid;

alter table "public"."plantings" validate constraint "plantings_tower_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL not valid;

alter table "public"."profiles" validate constraint "profiles_school_id_fkey";

alter table "public"."students" add constraint "students_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE not valid;

alter table "public"."students" validate constraint "students_classroom_id_fkey";

alter table "public"."tower_photos" add constraint "tower_photos_tower_id_fkey" FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE not valid;

alter table "public"."tower_photos" validate constraint "tower_photos_tower_id_fkey";

alter table "public"."tower_vitals" add constraint "tower_vitals_tower_id_fkey" FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE not valid;

alter table "public"."tower_vitals" validate constraint "tower_vitals_tower_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_role_key" UNIQUE using index "user_roles_user_id_role_key";

alter table "public"."waste_logs" add constraint "waste_logs_planting_id_fkey" FOREIGN KEY (planting_id) REFERENCES plantings(id) ON DELETE SET NULL not valid;

alter table "public"."waste_logs" validate constraint "waste_logs_planting_id_fkey";

alter table "public"."waste_logs" add constraint "waste_logs_tower_id_fkey" FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE not valid;

alter table "public"."waste_logs" validate constraint "waste_logs_tower_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."classrooms" to "anon";

grant insert on table "public"."classrooms" to "anon";

grant references on table "public"."classrooms" to "anon";

grant select on table "public"."classrooms" to "anon";

grant trigger on table "public"."classrooms" to "anon";

grant truncate on table "public"."classrooms" to "anon";

grant update on table "public"."classrooms" to "anon";

grant delete on table "public"."classrooms" to "authenticated";

grant insert on table "public"."classrooms" to "authenticated";

grant references on table "public"."classrooms" to "authenticated";

grant select on table "public"."classrooms" to "authenticated";

grant trigger on table "public"."classrooms" to "authenticated";

grant truncate on table "public"."classrooms" to "authenticated";

grant update on table "public"."classrooms" to "authenticated";

grant delete on table "public"."classrooms" to "service_role";

grant insert on table "public"."classrooms" to "service_role";

grant references on table "public"."classrooms" to "service_role";

grant select on table "public"."classrooms" to "service_role";

grant trigger on table "public"."classrooms" to "service_role";

grant truncate on table "public"."classrooms" to "service_role";

grant update on table "public"."classrooms" to "service_role";

grant delete on table "public"."harvests" to "anon";

grant insert on table "public"."harvests" to "anon";

grant references on table "public"."harvests" to "anon";

grant select on table "public"."harvests" to "anon";

grant trigger on table "public"."harvests" to "anon";

grant truncate on table "public"."harvests" to "anon";

grant update on table "public"."harvests" to "anon";

grant delete on table "public"."harvests" to "authenticated";

grant insert on table "public"."harvests" to "authenticated";

grant references on table "public"."harvests" to "authenticated";

grant select on table "public"."harvests" to "authenticated";

grant trigger on table "public"."harvests" to "authenticated";

grant truncate on table "public"."harvests" to "authenticated";

grant update on table "public"."harvests" to "authenticated";

grant delete on table "public"."harvests" to "service_role";

grant insert on table "public"."harvests" to "service_role";

grant references on table "public"."harvests" to "service_role";

grant select on table "public"."harvests" to "service_role";

grant trigger on table "public"."harvests" to "service_role";

grant truncate on table "public"."harvests" to "service_role";

grant update on table "public"."harvests" to "service_role";

grant delete on table "public"."join_codes" to "anon";

grant insert on table "public"."join_codes" to "anon";

grant references on table "public"."join_codes" to "anon";

grant select on table "public"."join_codes" to "anon";

grant trigger on table "public"."join_codes" to "anon";

grant truncate on table "public"."join_codes" to "anon";

grant update on table "public"."join_codes" to "anon";

grant delete on table "public"."join_codes" to "authenticated";

grant insert on table "public"."join_codes" to "authenticated";

grant references on table "public"."join_codes" to "authenticated";

grant select on table "public"."join_codes" to "authenticated";

grant trigger on table "public"."join_codes" to "authenticated";

grant truncate on table "public"."join_codes" to "authenticated";

grant update on table "public"."join_codes" to "authenticated";

grant delete on table "public"."join_codes" to "service_role";

grant insert on table "public"."join_codes" to "service_role";

grant references on table "public"."join_codes" to "service_role";

grant select on table "public"."join_codes" to "service_role";

grant trigger on table "public"."join_codes" to "service_role";

grant truncate on table "public"."join_codes" to "service_role";

grant update on table "public"."join_codes" to "service_role";

grant delete on table "public"."pest_logs" to "anon";

grant insert on table "public"."pest_logs" to "anon";

grant references on table "public"."pest_logs" to "anon";

grant select on table "public"."pest_logs" to "anon";

grant trigger on table "public"."pest_logs" to "anon";

grant truncate on table "public"."pest_logs" to "anon";

grant update on table "public"."pest_logs" to "anon";

grant delete on table "public"."pest_logs" to "authenticated";

grant insert on table "public"."pest_logs" to "authenticated";

grant references on table "public"."pest_logs" to "authenticated";

grant select on table "public"."pest_logs" to "authenticated";

grant trigger on table "public"."pest_logs" to "authenticated";

grant truncate on table "public"."pest_logs" to "authenticated";

grant update on table "public"."pest_logs" to "authenticated";

grant delete on table "public"."pest_logs" to "service_role";

grant insert on table "public"."pest_logs" to "service_role";

grant references on table "public"."pest_logs" to "service_role";

grant select on table "public"."pest_logs" to "service_role";

grant trigger on table "public"."pest_logs" to "service_role";

grant truncate on table "public"."pest_logs" to "service_role";

grant update on table "public"."pest_logs" to "service_role";

grant delete on table "public"."plant_catalog" to "anon";

grant insert on table "public"."plant_catalog" to "anon";

grant references on table "public"."plant_catalog" to "anon";

grant select on table "public"."plant_catalog" to "anon";

grant trigger on table "public"."plant_catalog" to "anon";

grant truncate on table "public"."plant_catalog" to "anon";

grant update on table "public"."plant_catalog" to "anon";

grant delete on table "public"."plant_catalog" to "authenticated";

grant insert on table "public"."plant_catalog" to "authenticated";

grant references on table "public"."plant_catalog" to "authenticated";

grant select on table "public"."plant_catalog" to "authenticated";

grant trigger on table "public"."plant_catalog" to "authenticated";

grant truncate on table "public"."plant_catalog" to "authenticated";

grant update on table "public"."plant_catalog" to "authenticated";

grant delete on table "public"."plant_catalog" to "service_role";

grant insert on table "public"."plant_catalog" to "service_role";

grant references on table "public"."plant_catalog" to "service_role";

grant select on table "public"."plant_catalog" to "service_role";

grant trigger on table "public"."plant_catalog" to "service_role";

grant truncate on table "public"."plant_catalog" to "service_role";

grant update on table "public"."plant_catalog" to "service_role";

grant delete on table "public"."plantings" to "anon";

grant insert on table "public"."plantings" to "anon";

grant references on table "public"."plantings" to "anon";

grant select on table "public"."plantings" to "anon";

grant trigger on table "public"."plantings" to "anon";

grant truncate on table "public"."plantings" to "anon";

grant update on table "public"."plantings" to "anon";

grant delete on table "public"."plantings" to "authenticated";

grant insert on table "public"."plantings" to "authenticated";

grant references on table "public"."plantings" to "authenticated";

grant select on table "public"."plantings" to "authenticated";

grant trigger on table "public"."plantings" to "authenticated";

grant truncate on table "public"."plantings" to "authenticated";

grant update on table "public"."plantings" to "authenticated";

grant delete on table "public"."plantings" to "service_role";

grant insert on table "public"."plantings" to "service_role";

grant references on table "public"."plantings" to "service_role";

grant select on table "public"."plantings" to "service_role";

grant trigger on table "public"."plantings" to "service_role";

grant truncate on table "public"."plantings" to "service_role";

grant update on table "public"."plantings" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."schools" to "anon";

grant insert on table "public"."schools" to "anon";

grant references on table "public"."schools" to "anon";

grant select on table "public"."schools" to "anon";

grant trigger on table "public"."schools" to "anon";

grant truncate on table "public"."schools" to "anon";

grant update on table "public"."schools" to "anon";

grant delete on table "public"."schools" to "authenticated";

grant insert on table "public"."schools" to "authenticated";

grant references on table "public"."schools" to "authenticated";

grant select on table "public"."schools" to "authenticated";

grant trigger on table "public"."schools" to "authenticated";

grant truncate on table "public"."schools" to "authenticated";

grant update on table "public"."schools" to "authenticated";

grant delete on table "public"."schools" to "service_role";

grant insert on table "public"."schools" to "service_role";

grant references on table "public"."schools" to "service_role";

grant select on table "public"."schools" to "service_role";

grant trigger on table "public"."schools" to "service_role";

grant truncate on table "public"."schools" to "service_role";

grant update on table "public"."schools" to "service_role";

grant delete on table "public"."students" to "anon";

grant insert on table "public"."students" to "anon";

grant references on table "public"."students" to "anon";

grant select on table "public"."students" to "anon";

grant trigger on table "public"."students" to "anon";

grant truncate on table "public"."students" to "anon";

grant update on table "public"."students" to "anon";

grant delete on table "public"."students" to "authenticated";

grant insert on table "public"."students" to "authenticated";

grant references on table "public"."students" to "authenticated";

grant select on table "public"."students" to "authenticated";

grant trigger on table "public"."students" to "authenticated";

grant truncate on table "public"."students" to "authenticated";

grant update on table "public"."students" to "authenticated";

grant delete on table "public"."students" to "service_role";

grant insert on table "public"."students" to "service_role";

grant references on table "public"."students" to "service_role";

grant select on table "public"."students" to "service_role";

grant trigger on table "public"."students" to "service_role";

grant truncate on table "public"."students" to "service_role";

grant update on table "public"."students" to "service_role";

grant delete on table "public"."tower_photos" to "anon";

grant insert on table "public"."tower_photos" to "anon";

grant references on table "public"."tower_photos" to "anon";

grant select on table "public"."tower_photos" to "anon";

grant trigger on table "public"."tower_photos" to "anon";

grant truncate on table "public"."tower_photos" to "anon";

grant update on table "public"."tower_photos" to "anon";

grant delete on table "public"."tower_photos" to "authenticated";

grant insert on table "public"."tower_photos" to "authenticated";

grant references on table "public"."tower_photos" to "authenticated";

grant select on table "public"."tower_photos" to "authenticated";

grant trigger on table "public"."tower_photos" to "authenticated";

grant truncate on table "public"."tower_photos" to "authenticated";

grant update on table "public"."tower_photos" to "authenticated";

grant delete on table "public"."tower_photos" to "service_role";

grant insert on table "public"."tower_photos" to "service_role";

grant references on table "public"."tower_photos" to "service_role";

grant select on table "public"."tower_photos" to "service_role";

grant trigger on table "public"."tower_photos" to "service_role";

grant truncate on table "public"."tower_photos" to "service_role";

grant update on table "public"."tower_photos" to "service_role";

grant delete on table "public"."tower_vitals" to "anon";

grant insert on table "public"."tower_vitals" to "anon";

grant references on table "public"."tower_vitals" to "anon";

grant select on table "public"."tower_vitals" to "anon";

grant trigger on table "public"."tower_vitals" to "anon";

grant truncate on table "public"."tower_vitals" to "anon";

grant update on table "public"."tower_vitals" to "anon";

grant delete on table "public"."tower_vitals" to "authenticated";

grant insert on table "public"."tower_vitals" to "authenticated";

grant references on table "public"."tower_vitals" to "authenticated";

grant select on table "public"."tower_vitals" to "authenticated";

grant trigger on table "public"."tower_vitals" to "authenticated";

grant truncate on table "public"."tower_vitals" to "authenticated";

grant update on table "public"."tower_vitals" to "authenticated";

grant delete on table "public"."tower_vitals" to "service_role";

grant insert on table "public"."tower_vitals" to "service_role";

grant references on table "public"."tower_vitals" to "service_role";

grant select on table "public"."tower_vitals" to "service_role";

grant trigger on table "public"."tower_vitals" to "service_role";

grant truncate on table "public"."tower_vitals" to "service_role";

grant update on table "public"."tower_vitals" to "service_role";

grant delete on table "public"."towers" to "anon";

grant insert on table "public"."towers" to "anon";

grant references on table "public"."towers" to "anon";

grant select on table "public"."towers" to "anon";

grant trigger on table "public"."towers" to "anon";

grant truncate on table "public"."towers" to "anon";

grant update on table "public"."towers" to "anon";

grant delete on table "public"."towers" to "authenticated";

grant insert on table "public"."towers" to "authenticated";

grant references on table "public"."towers" to "authenticated";

grant select on table "public"."towers" to "authenticated";

grant trigger on table "public"."towers" to "authenticated";

grant truncate on table "public"."towers" to "authenticated";

grant update on table "public"."towers" to "authenticated";

grant delete on table "public"."towers" to "service_role";

grant insert on table "public"."towers" to "service_role";

grant references on table "public"."towers" to "service_role";

grant select on table "public"."towers" to "service_role";

grant trigger on table "public"."towers" to "service_role";

grant truncate on table "public"."towers" to "service_role";

grant update on table "public"."towers" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

grant delete on table "public"."waste_logs" to "anon";

grant insert on table "public"."waste_logs" to "anon";

grant references on table "public"."waste_logs" to "anon";

grant select on table "public"."waste_logs" to "anon";

grant trigger on table "public"."waste_logs" to "anon";

grant truncate on table "public"."waste_logs" to "anon";

grant update on table "public"."waste_logs" to "anon";

grant delete on table "public"."waste_logs" to "authenticated";

grant insert on table "public"."waste_logs" to "authenticated";

grant references on table "public"."waste_logs" to "authenticated";

grant select on table "public"."waste_logs" to "authenticated";

grant trigger on table "public"."waste_logs" to "authenticated";

grant truncate on table "public"."waste_logs" to "authenticated";

grant update on table "public"."waste_logs" to "authenticated";

grant delete on table "public"."waste_logs" to "service_role";

grant insert on table "public"."waste_logs" to "service_role";

grant references on table "public"."waste_logs" to "service_role";

grant select on table "public"."waste_logs" to "service_role";

grant trigger on table "public"."waste_logs" to "service_role";

grant truncate on table "public"."waste_logs" to "service_role";

grant update on table "public"."waste_logs" to "service_role";


  create policy "Allow anonymous users to read classrooms for login"
  on "public"."classrooms"
  as permissive
  for select
  to public
using (true);



  create policy "Teachers can manage their classrooms"
  on "public"."classrooms"
  as permissive
  for all
  to authenticated
using ((teacher_id = auth.uid()))
with check ((teacher_id = auth.uid()));



  create policy "Allow anonymous read access to harvests"
  on "public"."harvests"
  as permissive
  for select
  to public
using (true);



  create policy "Teachers manage their harvests"
  on "public"."harvests"
  as permissive
  for all
  to public
using ((teacher_id = auth.uid()))
with check ((teacher_id = auth.uid()));



  create policy "Teachers manage their join codes"
  on "public"."join_codes"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM classrooms c
  WHERE ((c.id = join_codes.classroom_id) AND (c.teacher_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM classrooms c
  WHERE ((c.id = join_codes.classroom_id) AND (c.teacher_id = auth.uid())))));



  create policy "Teachers manage their pest logs"
  on "public"."pest_logs"
  as permissive
  for all
  to public
using ((teacher_id = auth.uid()))
with check ((teacher_id = auth.uid()));



  create policy "Delete own plants"
  on "public"."plant_catalog"
  as permissive
  for delete
  to authenticated
using (((teacher_id = auth.uid()) AND (is_global = false)));



  create policy "Insert own plants"
  on "public"."plant_catalog"
  as permissive
  for insert
  to authenticated
with check (((teacher_id = auth.uid()) AND (COALESCE(is_global, false) = false)));



  create policy "Update own plants"
  on "public"."plant_catalog"
  as permissive
  for update
  to authenticated
using (((teacher_id = auth.uid()) AND (is_global = false)))
with check (((teacher_id = auth.uid()) AND (is_global = false)));



  create policy "View global or own plants"
  on "public"."plant_catalog"
  as permissive
  for select
  to authenticated
using (((is_global = true) OR (teacher_id = auth.uid())));



  create policy "Teachers manage their plantings"
  on "public"."plantings"
  as permissive
  for all
  to public
using ((teacher_id = auth.uid()))
with check ((teacher_id = auth.uid()));



  create policy "Users can insert their own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "Users can view their own profile"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((auth.uid() = id));



  create policy "Teachers manage their students"
  on "public"."students"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM classrooms c
  WHERE ((c.id = students.classroom_id) AND (c.teacher_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM classrooms c
  WHERE ((c.id = students.classroom_id) AND (c.teacher_id = auth.uid())))));



  create policy "Teachers manage their tower photos"
  on "public"."tower_photos"
  as permissive
  for all
  to public
using ((teacher_id = auth.uid()))
with check ((teacher_id = auth.uid()));



  create policy "Teachers manage their tower vitals"
  on "public"."tower_vitals"
  as permissive
  for all
  to public
using ((teacher_id = auth.uid()))
with check ((teacher_id = auth.uid()));



  create policy "Allow anonymous read access to towers"
  on "public"."towers"
  as permissive
  for select
  to public
using (true);



  create policy "Teachers manage their towers"
  on "public"."towers"
  as permissive
  for all
  to public
using ((teacher_id = auth.uid()))
with check ((teacher_id = auth.uid()));



  create policy "Users can delete their own towers"
  on "public"."towers"
  as permissive
  for delete
  to public
using ((auth.uid() = teacher_id));



  create policy "Users can insert their own towers"
  on "public"."towers"
  as permissive
  for insert
  to public
with check ((auth.uid() = teacher_id));



  create policy "Users can update their own towers"
  on "public"."towers"
  as permissive
  for update
  to public
using ((auth.uid() = teacher_id));



  create policy "Users can view their own towers"
  on "public"."towers"
  as permissive
  for select
  to public
using ((auth.uid() = teacher_id));



  create policy "Admins can manage roles"
  on "public"."user_roles"
  as permissive
  for all
  to authenticated
using (has_role(auth.uid(), 'admin'::app_role))
with check (has_role(auth.uid(), 'admin'::app_role));



  create policy "Users can view their own roles"
  on "public"."user_roles"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "Teachers manage their waste logs"
  on "public"."waste_logs"
  as permissive
  for all
  to public
using ((teacher_id = auth.uid()))
with check ((teacher_id = auth.uid()));


CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON public.classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_catalog_updated_at BEFORE UPDATE ON public.plant_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plantings_updated_at BEFORE UPDATE ON public.plantings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_towers_updated_at BEFORE UPDATE ON public.towers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


