// REPLACE: src/integrations/supabase/types.ts
// Complete updated types file with enhanced scouting system

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      classrooms: {
        Row: {
          created_at: string
          id: string
          kiosk_pin: string
          name: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kiosk_pin: string
          name: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kiosk_pin?: string
          name?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      harvests: {
        Row: {
          created_at: string
          destination: string | null
          harvested_at: string
          id: string
          notes: string | null
          plant_name: string | null
          plant_quantity: number | null
          planting_id: string | null
          teacher_id: string
          tower_id: string
          weight_grams: number
        }
        Insert: {
          created_at?: string
          destination?: string | null
          harvested_at?: string
          id?: string
          notes?: string | null
          plant_name?: string | null
          plant_quantity?: number | null
          planting_id?: string | null
          teacher_id: string
          tower_id: string
          weight_grams: number
        }
        Update: {
          created_at?: string
          destination?: string | null
          harvested_at?: string
          id?: string
          notes?: string | null
          plant_name?: string | null
          plant_quantity?: number | null
          planting_id?: string | null
          teacher_id?: string
          tower_id?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "harvests_planting_id_fkey"
            columns: ["planting_id"]
            isOneToOne: false
            referencedRelation: "plantings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvests_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "towers"
            referencedColumns: ["id"]
          }
        ]
      }
      join_codes: {
        Row: {
          classroom_id: string
          code: string
          created_at: string
          id: string
          is_active: boolean
        }
        Insert: {
          classroom_id: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Update: {
          classroom_id?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "join_codes_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          }
        ]
      }
      pest_catalog: {
        Row: {
          common_locations: string[]
          created_at: string
          description: string
          id: string
          identification_tips: string[]
          name: string
          prevention_tips: string[]
          safe_for_schools: boolean
          scientific_name: string | null
          seasonal_info: string | null
          severity_levels: Json[]
          symptoms: string[]
          treatment_options: Json[]
          type: "disease" | "environmental" | "insect" | "nutrient"
          updated_at: string
        }
        Insert: {
          common_locations?: string[]
          created_at?: string
          description: string
          id?: string
          identification_tips: string[]
          name: string
          prevention_tips: string[]
          safe_for_schools?: boolean
          scientific_name?: string | null
          seasonal_info?: string | null
          severity_levels?: Json[]
          symptoms: string[]
          treatment_options?: Json[]
          type: "disease" | "environmental" | "insect" | "nutrient"
          updated_at?: string
        }
        Update: {
          common_locations?: string[]
          created_at?: string
          description?: string
          id?: string
          identification_tips?: string[]
          name?: string
          prevention_tips?: string[]
          safe_for_schools?: boolean
          scientific_name?: string | null
          seasonal_info?: string | null
          severity_levels?: Json[]
          symptoms?: string[]
          treatment_options?: Json[]
          type?: "disease" | "environmental" | "insect" | "nutrient"
          updated_at?: string
        }
        Relationships: []
      }
      pest_catalog_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_type: "lifecycle" | "pest" | "symptom" | "treatment" | null
          image_url: string
          pest_catalog_id: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_type?: "lifecycle" | "pest" | "symptom" | "treatment" | null
          image_url: string
          pest_catalog_id: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_type?: "lifecycle" | "pest" | "symptom" | "treatment" | null
          image_url?: string
          pest_catalog_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "pest_catalog_images_pest_catalog_id_fkey"
            columns: ["pest_catalog_id"]
            isOneToOne: false
            referencedRelation: "pest_catalog"
            referencedColumns: ["id"]
          }
        ]
      }
      pest_logs: {
        Row: {
          action: string | null
          affected_plants: string[] | null
          created_at: string
          follow_up_date: string | null
          follow_up_needed: boolean
          id: string
          images: string[] | null
          location_on_tower: string | null
          notes: string | null
          observed_at: string
          pest: string
          pest_catalog_id: string | null
          resolved: boolean
          resolved_at: string | null
          severity: number | null
          teacher_id: string
          tower_id: string
          treatment_applied: Json[] | null
        }
        Insert: {
          action?: string | null
          affected_plants?: string[] | null
          created_at?: string
          follow_up_date?: string | null
          follow_up_needed?: boolean
          id?: string
          images?: string[] | null
          location_on_tower?: string | null
          notes?: string | null
          observed_at?: string
          pest: string
          pest_catalog_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: number | null
          teacher_id: string
          tower_id: string
          treatment_applied?: Json[] | null
        }
        Update: {
          action?: string | null
          affected_plants?: string[] | null
          created_at?: string
          follow_up_date?: string | null
          follow_up_needed?: boolean
          id?: string
          images?: string[] | null
          location_on_tower?: string | null
          notes?: string | null
          observed_at?: string
          pest?: string
          pest_catalog_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: number | null
          teacher_id?: string
          tower_id?: string
          treatment_applied?: Json[] | null
        }
        Relationships: [
          {
            foreignKeyName: "pest_logs_pest_catalog_id_fkey"
            columns: ["pest_catalog_id"]
            isOneToOne: false
            referencedRelation: "pest_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pest_logs_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "towers"
            referencedColumns: ["id"]
          }
        ]
      }
      plant_catalog: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          germination_days: number | null
          harvest_days: number | null
          id: string
          image_url: string | null
          is_global: boolean
          name: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          germination_days?: number | null
          harvest_days?: number | null
          id?: string
          image_url?: string | null
          is_global?: boolean
          name: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          germination_days?: number | null
          harvest_days?: number | null
          id?: string
          image_url?: string | null
          is_global?: boolean
          name?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plantings: {
        Row: {
          catalog_id: string | null
          created_at: string
          expected_harvest_date: string | null
          growth_rate: string | null
          id: string
          name: string
          outcome: string | null
          planted_at: string | null
          port_number: number | null
          quantity: number
          seeded_at: string | null
          status: string
          teacher_id: string
          tower_id: string
          updated_at: string
        }
        Insert: {
          catalog_id?: string | null
          created_at?: string
          expected_harvest_date?: string | null
          growth_rate?: string | null
          id?: string
          name: string
          outcome?: string | null
          planted_at?: string | null
          port_number?: number | null
          quantity?: number
          seeded_at?: string | null
          status?: string
          teacher_id: string
          tower_id: string
          updated_at?: string
        }
        Update: {
          catalog_id?: string | null
          created_at?: string
          expected_harvest_date?: string | null
          growth_rate?: string | null
          id?: string
          name?: string
          outcome?: string | null
          planted_at?: string | null
          port_number?: number | null
          quantity?: number
          seeded_at?: string | null
          status?: string
          teacher_id?: string
          tower_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantings_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "plant_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantings_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "towers"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          district: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          school_id: string | null
          school_image_url: string | null
          school_name: string | null
          settings: Json
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          district?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          school_id?: string | null
          school_image_url?: string | null
          school_name?: string | null
          settings?: Json
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          district?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          school_id?: string | null
          school_image_url?: string | null
          school_name?: string | null
          settings?: Json
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          }
        ]
      }
      schools: {
        Row: {
          created_at: string | null
          district: string | null
          id: string
          image_url: string | null
          name: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district?: string | null
          id?: string
          image_url?: string | null
          name: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district?: string | null
          id?: string
          image_url?: string | null
          name?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          classroom_id: string
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          }
        ]
      }
      tower_photos: {
        Row: {
          caption: string | null
          created_at: string
          file_path: string
          id: string
          student_name: string | null
          taken_at: string
          teacher_id: string
          tower_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_path: string
          id?: string
          student_name?: string | null
          taken_at?: string
          teacher_id: string
          tower_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_path?: string
          id?: string
          student_name?: string | null
          taken_at?: string
          teacher_id?: string
          tower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tower_photos_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "towers"
            referencedColumns: ["id"]
          }
        ]
      }
      tower_vitals: {
        Row: {
          created_at: string
          ec: number | null
          id: string
          light_lux: number | null
          ph: number | null
          recorded_at: string
          teacher_id: string
          tower_id: string
        }
        Insert: {
          created_at?: string
          ec?: number | null
          id?: string
          light_lux?: number | null
          ph?: number | null
          recorded_at?: string
          teacher_id: string
          tower_id: string
        }
        Update: {
          created_at?: string
          ec?: number | null
          id?: string
          light_lux?: number | null
          ph?: number | null
          recorded_at?: string
          teacher_id?: string
          tower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tower_vitals_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "towers"
            referencedColumns: ["id"]
          }
        ]
      }
      towers: {
        Row: {
          created_at: string
          id: string
          location: "greenhouse" | "indoor" | "outdoor"
          name: string
          ports: number
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: "greenhouse" | "indoor" | "outdoor"
          name: string
          ports: number
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: "greenhouse" | "indoor" | "outdoor"
          name?: string
          ports?: number
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waste_logs: {
        Row: {
          created_at: string
          grams: number
          id: string
          logged_at: string
          notes: string | null
          plant_name: string | null
          plant_quantity: number | null
          planting_id: string | null
          teacher_id: string
          tower_id: string
        }
        Insert: {
          created_at?: string
          grams: number
          id?: string
          logged_at?: string
          notes?: string | null
          plant_name?: string | null
          plant_quantity?: number | null
          planting_id?: string | null
          teacher_id: string
          tower_id: string
        }
        Update: {
          created_at?: string
          grams?: number
          id?: string
          logged_at?: string
          notes?: string | null
          plant_name?: string | null
          plant_quantity?: number | null
          planting_id?: string | null
          teacher_id?: string
          tower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_logs_planting_id_fkey"
            columns: ["planting_id"]
            isOneToOne: false
            referencedRelation: "plantings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "towers"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "student" | "teacher"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}