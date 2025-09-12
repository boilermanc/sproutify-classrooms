export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      classroom_challenge_participation: {
        Row: {
          challenge_id: string
          classroom_id: string
          data: Json | null
          final_score: number | null
          id: string
          joined_at: string
          rank: number | null
        }
        Insert: {
          challenge_id: string
          classroom_id: string
          data?: Json | null
          final_score?: number | null
          id?: string
          joined_at?: string
          rank?: number | null
        }
        Update: {
          challenge_id?: string
          classroom_id?: string
          data?: Json | null
          final_score?: number | null
          id?: string
          joined_at?: string
          rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "classroom_challenge_participation_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "network_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_challenge_participation_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_connections: {
        Row: {
          accepted_at: string | null
          connection_type: string
          created_at: string
          id: string
          message: string | null
          requester_classroom_id: string
          status: string
          target_classroom_id: string
        }
        Insert: {
          accepted_at?: string | null
          connection_type?: string
          created_at?: string
          id?: string
          message?: string | null
          requester_classroom_id: string
          status?: string
          target_classroom_id: string
        }
        Update: {
          accepted_at?: string | null
          connection_type?: string
          created_at?: string
          id?: string
          message?: string | null
          requester_classroom_id?: string
          status?: string
          target_classroom_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_connections_requester_classroom_id_fkey"
            columns: ["requester_classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_connections_target_classroom_id_fkey"
            columns: ["target_classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_network_settings: {
        Row: {
          bio: string | null
          classroom_id: string
          created_at: string
          display_name: string | null
          grade_level: string | null
          id: string
          is_network_enabled: boolean
          region: string | null
          school_type: string | null
          share_growth_tips: boolean
          share_harvest_data: boolean
          share_photos: boolean
          updated_at: string
          visibility_level: string
        }
        Insert: {
          bio?: string | null
          classroom_id: string
          created_at?: string
          display_name?: string | null
          grade_level?: string | null
          id?: string
          is_network_enabled?: boolean
          region?: string | null
          school_type?: string | null
          share_growth_tips?: boolean
          share_harvest_data?: boolean
          share_photos?: boolean
          updated_at?: string
          visibility_level?: string
        }
        Update: {
          bio?: string | null
          classroom_id?: string
          created_at?: string
          display_name?: string | null
          grade_level?: string | null
          id?: string
          is_network_enabled?: boolean
          region?: string | null
          school_type?: string | null
          share_growth_tips?: boolean
          share_harvest_data?: boolean
          share_photos?: boolean
          updated_at?: string
          visibility_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_network_settings_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: true
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          created_at: string
          educational_package:
            | Database["public"]["Enums"]["educational_package_type"]
            | null
          grade_level: string | null
          id: string
          is_selected_for_network: boolean | null
          kiosk_pin: string
          name: string
          preferred_weight_unit: string | null
          school_id: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          educational_package?:
            | Database["public"]["Enums"]["educational_package_type"]
            | null
          grade_level?: string | null
          id?: string
          is_selected_for_network?: boolean | null
          kiosk_pin: string
          name: string
          preferred_weight_unit?: string | null
          school_id?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          educational_package?:
            | Database["public"]["Enums"]["educational_package_type"]
            | null
          grade_level?: string | null
          id?: string
          is_selected_for_network?: boolean | null
          kiosk_pin?: string
          name?: string
          preferred_weight_unit?: string | null
          school_id?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      content_section: {
        Row: {
          body_md: string | null
          description: string | null
          id: string
          kind: string
          slug: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body_md?: string | null
          description?: string | null
          id?: string
          kind: string
          slug: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body_md?: string | null
          description?: string | null
          id?: string
          kind?: string
          slug?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_section_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      district_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          district_id: string
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          school_id: string | null
          status: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          district_id: string
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          school_id?: string | null
          status?: string | null
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          district_id?: string
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          school_id?: string | null
          status?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_invitations_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_invitations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      district_join_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          district_id: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          district_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          district_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "district_join_codes_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          id: string
          join_code: string
          logo_url: string | null
          max_teachers: number | null
          name: string
          postal_code: string | null
          settings: Json
          state: string | null
          street_address: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          join_code: string
          logo_url?: string | null
          max_teachers?: number | null
          name: string
          postal_code?: string | null
          settings?: Json
          state?: string | null
          street_address?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          join_code?: string
          logo_url?: string | null
          max_teachers?: number | null
          name?: string
          postal_code?: string | null
          settings?: Json
          state?: string | null
          street_address?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      harvests: {
        Row: {
          created_at: string
          destination: string | null
          harvest_method: string | null
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
          harvest_method?: string | null
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
          harvest_method?: string | null
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
          },
        ]
      }
      join_codes: {
        Row: {
          code: string
          created_at: string
          district_id: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          role: string
          school_id: string | null
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          district_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          role: string
          school_id?: string | null
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          district_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          role?: string
          school_id?: string | null
          uses_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "join_codes_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_codes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          bucket: string
          created_at: string
          created_by: string | null
          description: string | null
          duration_s: number | null
          duration_seconds: number | null
          file_size: number | null
          file_type: string | null
          height: number | null
          id: string
          is_active: boolean
          is_published: boolean
          object_path: string
          section_id: string
          thumbnail_url: string | null
          title: string | null
          type: string
          width: number | null
        }
        Insert: {
          bucket: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_s?: number | null
          duration_seconds?: number | null
          file_size?: number | null
          file_type?: string | null
          height?: number | null
          id?: string
          is_active?: boolean
          is_published?: boolean
          object_path: string
          section_id: string
          thumbnail_url?: string | null
          title?: string | null
          type: string
          width?: number | null
        }
        Update: {
          bucket?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_s?: number | null
          duration_seconds?: number | null
          file_size?: number | null
          file_type?: string | null
          height?: number | null
          id?: string
          is_active?: boolean
          is_published?: boolean
          object_path?: string
          section_id?: string
          thumbnail_url?: string | null
          title?: string | null
          type?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "content_section"
            referencedColumns: ["id"]
          },
        ]
      }
      network_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          created_by: string
          description: string
          end_date: string
          id: string
          is_active: boolean
          name: string
          rules: Json | null
          start_date: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          created_by?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          rules?: Json | null
          start_date: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          created_by?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          rules?: Json | null
          start_date?: string
        }
        Relationships: []
      }
      pending_invites: {
        Row: {
          created_at: string
          district_id: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          school_id: string | null
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          email: string
          full_name?: string | null
          id?: string
          role: string
          school_id?: string | null
        }
        Update: {
          created_at?: string
          district_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_invites_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_invites_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      pest_catalog: {
        Row: {
          appearance_details: string | null
          common_locations: string[] | null
          created_at: string
          damage_caused: string[] | null
          description: string
          id: string
          identification_tips: string[] | null
          management_strategies: string[] | null
          name: string
          omri_remedies: string[] | null
          prevention_methods: string[] | null
          prevention_tips: string[] | null
          safe_for_schools: boolean
          scientific_name: string | null
          seasonal_info: string | null
          severity_levels: Json
          symptoms: string[] | null
          treatment_options: Json
          type: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          appearance_details?: string | null
          common_locations?: string[] | null
          created_at?: string
          damage_caused?: string[] | null
          description: string
          id?: string
          identification_tips?: string[] | null
          management_strategies?: string[] | null
          name: string
          omri_remedies?: string[] | null
          prevention_methods?: string[] | null
          prevention_tips?: string[] | null
          safe_for_schools?: boolean
          scientific_name?: string | null
          seasonal_info?: string | null
          severity_levels?: Json
          symptoms?: string[] | null
          treatment_options?: Json
          type: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          appearance_details?: string | null
          common_locations?: string[] | null
          created_at?: string
          damage_caused?: string[] | null
          description?: string
          id?: string
          identification_tips?: string[] | null
          management_strategies?: string[] | null
          name?: string
          omri_remedies?: string[] | null
          prevention_methods?: string[] | null
          prevention_tips?: string[] | null
          safe_for_schools?: boolean
          scientific_name?: string | null
          seasonal_info?: string | null
          severity_levels?: Json
          symptoms?: string[] | null
          treatment_options?: Json
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      pest_catalog_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_type: string | null
          image_url: string
          pest_catalog_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_type?: string | null
          image_url: string
          pest_catalog_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_type?: string | null
          image_url?: string
          pest_catalog_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pest_catalog_images_pest_catalog_id_fkey"
            columns: ["pest_catalog_id"]
            isOneToOne: false
            referencedRelation: "pest_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      pest_logs: {
        Row: {
          action: string | null
          affected_plants: string[] | null
          created_at: string
          follow_up_date: string | null
          follow_up_needed: boolean | null
          id: string
          images: string[] | null
          location_on_tower: string | null
          notes: string | null
          observed_at: string
          pest: string
          pest_catalog_id: string | null
          resolved: boolean | null
          resolved_at: string | null
          severity: number | null
          teacher_id: string
          tower_id: string
          treatment_applied: Json | null
        }
        Insert: {
          action?: string | null
          affected_plants?: string[] | null
          created_at?: string
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          images?: string[] | null
          location_on_tower?: string | null
          notes?: string | null
          observed_at?: string
          pest: string
          pest_catalog_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: number | null
          teacher_id: string
          tower_id: string
          treatment_applied?: Json | null
        }
        Update: {
          action?: string | null
          affected_plants?: string[] | null
          created_at?: string
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          images?: string[] | null
          location_on_tower?: string | null
          notes?: string | null
          observed_at?: string
          pest?: string
          pest_catalog_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: number | null
          teacher_id?: string
          tower_id?: string
          treatment_applied?: Json | null
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
          },
        ]
      }
      plans: {
        Row: {
          code: string
          created_at: string
          id: string
          interval: string | null
          name: string
          stripe_price_id: string | null
          unit_amount: number | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          interval?: string | null
          name: string
          stripe_price_id?: string | null
          unit_amount?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          interval?: string | null
          name?: string
          stripe_price_id?: string | null
          unit_amount?: number | null
        }
        Relationships: []
      }
      plant_catalog: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          germination_days: number | null
          global_plant_id: string | null
          harvest_days: number | null
          id: string
          image_url: string | null
          is_active: boolean
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
          global_plant_id?: string | null
          harvest_days?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
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
          global_plant_id?: string | null
          harvest_days?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_global?: boolean
          name?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_catalog_global_plant_id_fkey"
            columns: ["global_plant_id"]
            isOneToOne: false
            referencedRelation: "plant_catalog"
            referencedColumns: ["id"]
          },
        ]
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
          tower_id: string | null
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
          tower_id?: string | null
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
          tower_id?: string | null
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
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          billing_period: string
          bio: string | null
          district_id: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          max_students: number | null
          max_towers: number | null
          onboarding_completed: boolean | null
          phone: string | null
          preferred_weight_unit: string | null
          school_id: string | null
          school_image_url: string | null
          settings: Json
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          subscription_plan: string | null
          subscription_status: string | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          billing_period?: string
          bio?: string | null
          district_id?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          max_students?: number | null
          max_towers?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferred_weight_unit?: string | null
          school_id?: string | null
          school_image_url?: string | null
          settings?: Json
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          billing_period?: string
          bio?: string | null
          district_id?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          max_students?: number | null
          max_towers?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferred_weight_unit?: string | null
          school_id?: string | null
          school_image_url?: string | null
          settings?: Json
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          current_period_end: string | null
          current_period_start: string | null
          id: string
          meta: Json | null
          plan_id: string | null
          purchased_at: string
          quantity: number | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          meta?: Json | null
          plan_id?: string | null
          purchased_at?: string
          quantity?: number | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          meta?: Json | null
          plan_id?: string | null
          purchased_at?: string
          quantity?: number | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string | null
          district: string | null
          district_id: string | null
          id: string
          image_url: string | null
          name: string
          name_norm: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district?: string | null
          district_id?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_norm?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district?: string | null
          district_id?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_norm?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          classroom_id: string
          created_at: string
          display_name: string
          first_login_at: string | null
          grade_level: string | null
          has_logged_in: boolean
          id: string
          last_login_at: string | null
          student_id: string | null
          updated_at: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          display_name: string
          first_login_at?: string | null
          grade_level?: string | null
          has_logged_in?: boolean
          id?: string
          last_login_at?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          display_name?: string
          first_login_at?: string | null
          grade_level?: string | null
          has_logged_in?: boolean
          id?: string
          last_login_at?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_events: {
        Row: {
          created_at: string | null
          data: Json | null
          event_type: string
          id: string
          stripe_event_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          event_type: string
          id?: string
          stripe_event_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          event_type?: string
          id?: string
          stripe_event_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          active: boolean
          created_at: string
          id: string
          invited_at: string
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          invited_at?: string
          role: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          invited_at?: string
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          },
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
          },
        ]
      }
      towers: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
          ports: number
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
          ports: number
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          ports?: number
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          id: string
          students_count: number | null
          towers_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          students_count?: number | null
          towers_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          students_count?: number | null
          towers_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          district_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          school_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          district_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
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
          },
        ]
      }
    }
    Views: {
      sales_summary: {
        Row: {
          day: string | null
          purchases: number | null
          revenue_cents: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_global_plant_to_classroom: {
        Args: { p_global_plant_id: string; p_teacher_id: string }
        Returns: string
      }
      ensure_usage_tracking: {
        Args: { teacher_id: string }
        Returns: undefined
      }
      get_active_classroom_plants: {
        Args: { p_teacher_id: string }
        Returns: {
          category: string
          description: string
          germination_days: number
          harvest_days: number
          id: string
          name: string
        }[]
      }
      get_classroom_catalog: {
        Args: { p_teacher_id: string }
        Returns: {
          category: string
          created_at: string
          description: string
          germination_days: number
          global_plant_name: string
          harvest_days: number
          id: string
          image_url: string
          is_active: boolean
          is_custom: boolean
          name: string
          updated_at: string
        }[]
      }
      get_global_plants_with_status: {
        Args: { p_teacher_id: string }
        Returns: {
          category: string
          classroom_plant_id: string
          created_at: string
          description: string
          germination_days: number
          harvest_days: number
          id: string
          image_url: string
          is_active_in_classroom: boolean
          is_in_classroom: boolean
          name: string
        }[]
      }
      get_package_features: {
        Args: {
          package_type: Database["public"]["Enums"]["educational_package_type"]
        }
        Returns: Json
      }
      get_user_district_id: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_district_admin: {
        Args: { _district_id: string; _user_id: string }
        Returns: boolean
      }
      is_staff: {
        Args: { uid: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { uid: string }
        Returns: boolean
      }
      remove_plant_from_classroom: {
        Args: { p_plant_id: string; p_teacher_id: string }
        Returns: boolean
      }
      toggle_classroom_plant_active: {
        Args: { p_is_active: boolean; p_plant_id: string; p_teacher_id: string }
        Returns: boolean
      }
      update_usage_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      use_district_join_code: {
        Args: { _code: string }
        Returns: boolean
      }
      validate_district_join_code: {
        Args: { _code: string }
        Returns: {
          district_id: string
          is_valid: boolean
          message: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "teacher"
        | "student"
        | "district_admin"
        | "school_admin"
        | "super_admin"
        | "staff"
      educational_package_type:
        | "base"
        | "elementary"
        | "middle_school"
        | "high_school"
        | "advanced_stem"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "teacher",
        "student",
        "district_admin",
        "school_admin",
        "super_admin",
        "staff",
      ],
      educational_package_type: [
        "base",
        "elementary",
        "middle_school",
        "high_school",
        "advanced_stem",
      ],
    },
  },
} as const
