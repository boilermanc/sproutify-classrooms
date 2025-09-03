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
      // Garden Network Tables
      classroom_network_settings: {
        Row: {
          id: string
          classroom_id: string
          is_network_enabled: boolean
          visibility_level: 'public' | 'invite_only' | 'network_only'
          share_harvest_data: boolean
          share_photos: boolean
          share_growth_tips: boolean
          display_name: string | null
          bio: string | null
          region: string | null
          grade_level: string | null
          school_type: 'elementary' | 'middle' | 'high' | 'college' | 'other' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          classroom_id: string
          is_network_enabled?: boolean
          visibility_level?: 'public' | 'invite_only' | 'network_only'
          share_harvest_data?: boolean
          share_photos?: boolean
          share_growth_tips?: boolean
          display_name?: string | null
          bio?: string | null
          region?: string | null
          grade_level?: string | null
          school_type?: 'elementary' | 'middle' | 'high' | 'college' | 'other' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          classroom_id?: string
          is_network_enabled?: boolean
          visibility_level?: 'public' | 'invite_only' | 'network_only'
          share_harvest_data?: boolean
          share_photos?: boolean
          share_growth_tips?: boolean
          display_name?: string | null
          bio?: string | null
          region?: string | null
          grade_level?: string | null
          school_type?: 'elementary' | 'middle' | 'high' | 'college' | 'other' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_network_settings_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: true
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          }
        ]
      }
      classroom_connections: {
        Row: {
          id: string
          requester_classroom_id: string
          target_classroom_id: string
          status: 'pending' | 'accepted' | 'declined' | 'blocked'
          connection_type: 'competition' | 'collaboration' | 'mentorship'
          message: string | null
          created_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          requester_classroom_id: string
          target_classroom_id: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          connection_type?: 'competition' | 'collaboration' | 'mentorship'
          message?: string | null
          created_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          requester_classroom_id?: string
          target_classroom_id?: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          connection_type?: 'competition' | 'collaboration' | 'mentorship'
          message?: string | null
          created_at?: string
          accepted_at?: string | null
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
          }
        ]
      }
      network_challenges: {
        Row: {
          id: string
          name: string
          description: string
          challenge_type: 'harvest_weight' | 'plant_variety' | 'growth_rate' | 'sustainability' | 'photo_contest'
          start_date: string
          end_date: string
          is_active: boolean
          created_by: string
          rules: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          challenge_type: 'harvest_weight' | 'plant_variety' | 'growth_rate' | 'sustainability' | 'photo_contest'
          start_date: string
          end_date: string
          is_active?: boolean
          created_by?: string
          rules?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          challenge_type?: 'harvest_weight' | 'plant_variety' | 'growth_rate' | 'sustainability' | 'photo_contest'
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_by?: string
          rules?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      classroom_challenge_participation: {
        Row: {
          id: string
          classroom_id: string
          challenge_id: string
          joined_at: string
          final_score: number | null
          rank: number | null
          data: Json | null
        }
        Insert: {
          id?: string
          classroom_id: string
          challenge_id: string
          joined_at?: string
          final_score?: number | null
          rank?: number | null
          data?: Json | null
        }
        Update: {
          id?: string
          classroom_id?: string
          challenge_id?: string
          joined_at?: string
          final_score?: number | null
          rank?: number | null
          data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "classroom_challenge_participation_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_challenge_participation_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "network_challenges"
            referencedColumns: ["id"]
          }
        ]
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
          full_name?: string | null
          id: string
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
          full_name?: string | null
          id?: string
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
          created_at: string
          district: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          district?: string | null
          id?: string
          name?: string
          updated_at?: string
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
          // NEW FIELDS from our migration:
          student_id: string | null
          grade_level: string | null
          has_logged_in: boolean
          first_login_at: string | null
          last_login_at: string | null
        }
        Insert: {
          classroom_id: string
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string
          // NEW FIELDS:
          student_id?: string | null
          grade_level?: string | null
          has_logged_in?: boolean  // Will default to false
          first_login_at?: string | null
          last_login_at?: string | null
        }
        Update: {
          classroom_id?: string
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          // NEW FIELDS:
          student_id?: string | null
          grade_level?: string | null
          has_logged_in?: boolean
          first_login_at?: string | null
          last_login_at?: string | null
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
          ports?: number
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
          plant_name: string | null
          plant_quantity: number | null
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

// ========================================
// ADDITIONAL INTERFACES FOR THE NEW STUDENT SYSTEM
// ========================================

// Student interface with all the new tracking fields
export interface StudentWithTracking {
  id: string
  classroom_id: string
  display_name: string
  student_id?: string | null
  grade_level?: string | null
  has_logged_in: boolean
  first_login_at?: string | null
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

// For creating new students (teacher adds them)
export interface CreateStudentRequest {
  classroom_id: string
  display_name: string
  student_id?: string | null
  grade_level?: string | null
  // Login tracking fields are set automatically to defaults
}

// For updating existing students 
export interface UpdateStudentRequest {
  display_name?: string
  student_id?: string | null
  grade_level?: string | null
  // Login tracking fields updated separately by kiosk system
}

// For kiosk login tracking updates (internal use)
export interface StudentLoginUpdate {
  has_logged_in: true
  first_login_at?: string  // Only set on first login
  last_login_at: string    // Always updated
}

// Kiosk login request/response types
export interface KioskLoginRequest {
  student_name: string  // Must match display_name exactly
  kiosk_pin: string     // Classroom's kiosk PIN
}

export interface KioskLoginResponse {
  success: boolean
  student_id: string
  classroom_id: string
  classroom_name: string
  is_first_login: boolean
  message: string
}

// ========================================
// GARDEN NETWORK INTERFACES
// ========================================

export interface NetworkSettings {
  id?: string;
  classroom_id: string;
  is_network_enabled: boolean;
  visibility_level: 'public' | 'invite_only' | 'network_only';
  share_harvest_data: boolean;
  share_photos: boolean;
  share_growth_tips: boolean;
  display_name?: string | null;
  bio?: string | null;
  region?: string | null;
  grade_level?: string | null;
  school_type?: 'elementary' | 'middle' | 'high' | 'college' | 'other' | null;
}

export interface ClassroomConnection {
  id: string;
  requester_classroom_id: string;
  target_classroom_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  connection_type: 'competition' | 'collaboration' | 'mentorship';
  message?: string | null;
  created_at: string;
  accepted_at?: string | null;
}

export interface NetworkChallenge {
  id: string;
  name: string;
  description: string;
  challenge_type: 'harvest_weight' | 'plant_variety' | 'growth_rate' | 'sustainability' | 'photo_contest';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: string;
  rules?: Json | null;
  created_at: string;
}

export interface ChallengeParticipation {
  id: string;
  classroom_id: string;
  challenge_id: string;
  joined_at: string;
  final_score?: number | null;
  rank?: number | null;
  data?: Json | null;
}

// ========================================
// VALIDATION HELPERS FOR THE NEW SYSTEM
// ========================================

export const validateStudentName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return "Student name is required";
  if (trimmed.length < 2) return "Student name must be at least 2 characters";
  if (trimmed.length > 100) return "Student name must be less than 100 characters";
  return null;
};

export const validateKioskPin = (pin: string): string | null => {
  const trimmed = pin.trim();
  if (!trimmed) return "Kiosk PIN is required";
  if (!/^\d{4,6}$/.test(trimmed)) return "Kiosk PIN must be 4-6 digits";
  return null;
};

export const validateStudentId = (studentId?: string): string | null => {
  if (!studentId) return null; // Optional field
  const trimmed = studentId.trim();
  if (trimmed.length > 50) return "Student ID must be less than 50 characters";
  return null;
};

export const validateGradeLevel = (grade?: string): string | null => {
  if (!grade) return null; // Optional field
  const trimmed = grade.trim();
  if (trimmed.length > 20) return "Grade level must be less than 20 characters";
  return null;
};

// Helper function to format last login time
export const formatLastLogin = (dateString?: string | null): string => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};