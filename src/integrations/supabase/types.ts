export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
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
          teacher_id?: string
          tower_id?: string
          weight_grams?: number
        }
        Relationships: [
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
          },
        ]
      }
      pest_logs: {
        Row: {
          action: string | null
          created_at: string
          id: string
          notes: string | null
          observed_at: string
          pest: string
          severity: number | null
          teacher_id: string
          tower_id: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          observed_at?: string
          pest: string
          severity?: number | null
          teacher_id: string
          tower_id: string
        }
        Update: {
          action?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          observed_at?: string
          pest?: string
          severity?: number | null
          teacher_id?: string
          tower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pest_logs_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "towers"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_catalog: {
        Row: {
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
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          district: string | null
          full_name: string | null
          id: string
          phone: string | null
          school_name: string | null
          settings: Json
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          district?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          school_name?: string | null
          settings?: Json
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          district?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          school_name?: string | null
          settings?: Json
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
          name: string
          ports: number
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          ports: number
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
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
          teacher_id: string
          tower_id: string
        }
        Insert: {
          created_at?: string
          grams: number
          id?: string
          logged_at?: string
          notes?: string | null
          teacher_id: string
          tower_id: string
        }
        Update: {
          created_at?: string
          grams?: number
          id?: string
          logged_at?: string
          notes?: string | null
          teacher_id?: string
          tower_id?: string
        }
        Relationships: [
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
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
      app_role: ["admin", "teacher", "student"],
    },
  },
} as const
