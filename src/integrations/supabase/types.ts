// src/integrations/supabase/types.ts
// Complete updated types file with harvest, waste, and disease enhancements

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
          preferred_weight_unit: 'grams' | 'ounces' | null // NEW FIELD
        }
        Insert: {
          created_at?: string
          id?: string
          kiosk_pin: string
          name: string
          teacher_id: string
          updated_at?: string
          preferred_weight_unit?: 'grams' | 'ounces' | null // NEW FIELD
        }
        Update: {
          created_at?: string
          id?: string
          kiosk_pin?: string
          name?: string
          teacher_id?: string
          updated_at?: string
          preferred_weight_unit?: 'grams' | 'ounces' | null // NEW FIELD
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
          harvest_method: 'pull' | 'cut' | null // NEW FIELD
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
          harvest_method?: 'pull' | 'cut' | null // NEW FIELD
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
          harvest_method?: 'pull' | 'cut' | null // NEW FIELD
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
          type: "disease" | "environmental" | "nutrient" | "pest" // UPDATED to include 'pest' and 'disease'
          updated_at: string
          // NEW ENHANCED DISEASE SUPPORT COLUMNS
          appearance_details: string | null
          damage_caused: string[] | null
          omri_remedies: string[] | null
          management_strategies: string[] | null
          prevention_methods: string[] | null
          video_url: string | null
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
          type: "disease" | "environmental" | "nutrient" | "pest" // UPDATED
          updated_at?: string
          // NEW ENHANCED DISEASE SUPPORT COLUMNS
          appearance_details?: string | null
          damage_caused?: string[] | null
          omri_remedies?: string[] | null
          management_strategies?: string[] | null
          prevention_methods?: string[] | null
          video_url?: string | null
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
          type?: "disease" | "environmental" | "nutrient" | "pest" // UPDATED
          updated_at?: string
          // NEW ENHANCED DISEASE SUPPORT COLUMNS
          appearance_details?: string | null
          damage_caused?: string[] | null
          omri_remedies?: string[] | null
          management_strategies?: string[] | null
          prevention_methods?: string[] | null
          video_url?: string | null
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
          preferred_weight_unit: 'grams' | 'ounces' | null // NEW FIELD
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
          preferred_weight_unit?: 'grams' | 'ounces' | null // NEW FIELD
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
          preferred_weight_unit?: 'grams' | 'ounces' | null // NEW FIELD
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

// ========================================
// ENHANCED HARVEST & WASTE SYSTEM TYPES
// ========================================

// Helper types for the enhanced system
export type HarvestMethod = 'pull' | 'cut'
export type WeightUnit = 'grams' | 'ounces'
export type PestDiseaseType = 'pest' | 'disease' | 'environmental' | 'nutrient'

// Enhanced interfaces for better type safety
export interface EnhancedHarvest {
  id: string
  teacher_id: string
  tower_id: string
  harvested_at: string
  weight_grams: number
  destination: string | null
  notes: string | null
  created_at: string
  planting_id: string | null
  plant_quantity: number | null
  plant_name: string | null
  harvest_method: HarvestMethod | null
}

export interface EnhancedClassroom {
  id: string
  teacher_id: string
  name: string
  kiosk_pin: string
  created_at: string
  updated_at: string
  preferred_weight_unit: WeightUnit | null
}

export interface EnhancedProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  updated_at: string | null
  school_name: string | null
  district: string | null
  timezone: string | null
  bio: string | null
  phone: string | null
  settings: Json
  school_image_url: string | null
  first_name: string | null
  last_name: string | null
  school_id: string | null
  preferred_weight_unit: WeightUnit | null
}

export interface PlantingWithQuantity {
  id: string
  name: string
  quantity: number
  status: string
  catalog_id?: string | null
}

// ========================================
// PEST & DISEASE SYSTEM TYPES
// ========================================

export interface PestCatalogItem {
  id: string
  name: string
  scientific_name?: string | null
  type: PestDiseaseType
  description: string
  identification_tips: string[]
  appearance_details?: string | null // Enhanced appearance description
  symptoms: string[]
  damage_caused?: string[] | null // What damage this pest/disease causes
  severity_levels: Array<{
    level: number
    description: string
    color: string
    action: string
  }>
  treatment_options: Array<{
    method: string
    safe_for_schools: boolean
    effectiveness: 'low' | 'medium' | 'high'
    location_suitable: string[]
    instructions: string
    materials?: string[]
    precautions?: string[]
  }>
  omri_remedies?: string[] | null // OMRI-approved specific treatments
  management_strategies?: string[] | null // General management approaches
  prevention_methods?: string[] | null // How to prevent this pest/disease
  prevention_tips: string[]
  seasonal_info?: string | null
  video_url?: string | null // URL to educational video
  common_locations: string[]
  safe_for_schools: boolean
  created_at: string
  updated_at: string
}

export interface PestCatalogImage {
  id: string
  pest_catalog_id: string
  image_url: string
  caption?: string | null
  image_type: 'symptom' | 'pest' | 'treatment' | 'lifecycle' | null
  sort_order: number
  created_at: string
}

export interface PestDiseaseLog {
  id: string
  teacher_id: string
  tower_id: string
  observed_at: string
  pest: string // Can be pest or disease name
  action: string | null
  notes: string | null
  severity: number | null
  created_at: string
  pest_catalog_id: string | null
  affected_plants: string[] | null
  location_on_tower: string | null
  treatment_applied: Json[] | null
  follow_up_needed: boolean
  follow_up_date: string | null
  resolved: boolean
  resolved_at: string | null
  images: string[] | null
}

// Filter types for pest/disease catalog
export type PestDiseaseFilterType = 'all' | 'pest' | 'disease' | 'environmental' | 'nutrient'

// Search and filter interface
export interface PestDiseaseSearchParams {
  query?: string
  type?: PestDiseaseFilterType
  sortBy?: 'name' | 'type' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

// ========================================
// CONSTANTS & LABELS
// ========================================

export const PEST_DISEASE_TYPES = {
  PEST: 'pest' as const,
  DISEASE: 'disease' as const,
  ENVIRONMENTAL: 'environmental' as const,
  NUTRIENT: 'nutrient' as const,
  ALL: 'all' as const,
} as const

export const PEST_DISEASE_TYPE_LABELS = {
  [PEST_DISEASE_TYPES.PEST]: 'Pests',
  [PEST_DISEASE_TYPES.DISEASE]: 'Diseases',
  [PEST_DISEASE_TYPES.ENVIRONMENTAL]: 'Environmental',
  [PEST_DISEASE_TYPES.NUTRIENT]: 'Nutrient',
  [PEST_DISEASE_TYPES.ALL]: 'All Issues',
} as const

// Severity levels for logging
export enum SeverityLevel {
  LOW = 1,
  MODERATE = 2,
  HIGH = 3,
  SEVERE = 4,
  CRITICAL = 5,
}

export const SEVERITY_LABELS = {
  [SeverityLevel.LOW]: 'Low',
  [SeverityLevel.MODERATE]: 'Moderate',
  [SeverityLevel.HIGH]: 'High',
  [SeverityLevel.SEVERE]: 'Severe',
  [SeverityLevel.CRITICAL]: 'Critical',
} as const

export const SEVERITY_COLORS = {
  [SeverityLevel.LOW]: 'text-green-600',
  [SeverityLevel.MODERATE]: 'text-yellow-600',
  [SeverityLevel.HIGH]: 'text-orange-600',
  [SeverityLevel.SEVERE]: 'text-red-600',
  [SeverityLevel.CRITICAL]: 'text-red-800',
} as const

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Convert weight between grams and ounces
 */
export const convertWeight = (weight: number, from: WeightUnit, to: WeightUnit): number => {
  if (from === to) return weight
  if (from === 'grams' && to === 'ounces') return weight * 0.035274
  if (from === 'ounces' && to === 'grams') return weight * 28.3495
  return weight
}

/**
 * Format weight with appropriate unit label
 */
export const formatWeight = (weight: number, unit: WeightUnit): string => {
  return unit === 'grams' ? `${weight.toFixed(0)} g` : `${weight.toFixed(2)} oz`
}

/**
 * Get display label for harvest method
 */
export const getHarvestMethodLabel = (method: HarvestMethod | null): string => {
  switch (method) {
    case 'pull': return 'Pull (Whole Plant)'
    case 'cut': return 'Cut (Partial Harvest)'
    default: return 'Pull (Whole Plant)' // Default fallback
  }
}

/**
 * Get icon name for harvest method (for Lucide React icons)
 */
export const getHarvestMethodIcon = (method: HarvestMethod | null): string => {
  switch (method) {
    case 'pull': return 'Trash2'
    case 'cut': return 'Scissors'
    default: return 'Trash2' // Default fallback
  }
}

/**
 * Generate correct video URL based on pest/disease type and name
 */
export const generateVideoUrl = (name: string, type: PestDiseaseType): string => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '-')
  const bucket = type === 'disease' ? 'disease-videos' : 'pest-videos'
  return `${bucket}/${cleanName}-identification-management.mp4`
}

/**
 * Get appropriate bucket name for the given type
 */
export const getVideoBucket = (type: PestDiseaseType): string => {
  return type === 'disease' ? 'disease-videos' : 'pest-videos'
}

/**
 * Format video filename consistently
 */
export const formatVideoFilename = (name: string): string => {
  return `${name.toLowerCase().replace(/\s+/g, '-')}-identification-management.mp4`
}

/**
 * Type guards for pest/disease distinction
 */
export const isPest = (item: { type: string }): boolean => item.type === 'pest'
export const isDisease = (item: { type: string }): boolean => item.type === 'disease'

/**
 * Get appropriate terminology based on type
 */
export const getTypeTerminology = (type: PestDiseaseType) => {
  return {
    singular: type === 'disease' ? 'disease' : type === 'pest' ? 'pest' : type,
    plural: type === 'disease' ? 'diseases' : type === 'pest' ? 'pests' : `${type} issues`,
    infestation: type === 'disease' ? 'infection' : type === 'pest' ? 'infestation' : 'issue',
    infestations: type === 'disease' ? 'infections' : type === 'pest' ? 'infestations' : 'issues',
    verbForm: type === 'disease' ? 'is' : 'are',
    lookVerb: type === 'disease' ? 'does' : 'do'
  }
}

// ========================================
// VALIDATION HELPERS
// ========================================

export const isValidHarvestMethod = (method: string): method is HarvestMethod => {
  return method === 'pull' || method === 'cut'
}

export const isValidWeightUnit = (unit: string): unit is WeightUnit => {
  return unit === 'grams' || unit === 'ounces'
}

/**
 * Validate harvest form data
 */
export interface HarvestFormData {
  plant_name: string
  plant_quantity: number
  weight: number
  harvest_method: HarvestMethod
  weight_unit: WeightUnit
  destination?: string
  notes?: string
}

export const validateHarvestForm = (data: Partial<HarvestFormData>): string[] => {
  const errors: string[] = []
  
  if (!data.plant_name?.trim()) errors.push('Plant name is required')
  if (!data.plant_quantity || data.plant_quantity < 1) errors.push('Plant quantity must be at least 1')
  if (!data.weight || data.weight <= 0) errors.push('Weight must be greater than 0')
  if (!data.harvest_method || !isValidHarvestMethod(data.harvest_method)) {
    errors.push('Valid harvest method is required')
  }
  if (!data.weight_unit || !isValidWeightUnit(data.weight_unit)) {
    errors.push('Valid weight unit is required')
  }
  
  return errors
}

/**
 * Validate waste form data
 */
export interface WasteFormData {
  plant_name: string
  plant_quantity: number
  weight: number
  weight_unit: WeightUnit
  reason: string
  notes?: string
}

export const validateWasteForm = (data: Partial<WasteFormData>): string[] => {
  const errors: string[] = []
  
  if (!data.plant_name?.trim()) errors.push('Plant name is required')
  if (!data.plant_quantity || data.plant_quantity < 1) errors.push('Plant quantity must be at least 1')
  if (!data.weight || data.weight <= 0) errors.push('Weight must be greater than 0')
  if (!data.weight_unit || !isValidWeightUnit(data.weight_unit)) {
    errors.push('Valid weight unit is required')
  }
  if (!data.reason?.trim()) errors.push('Reason for waste is required')
  
  return errors
}

// ========================================
// COMMON WASTE REASONS
// ========================================

export const COMMON_WASTE_REASONS = [
  'Pest damage',
  'Disease',
  'Bolted (went to seed)',
  'Overripe/expired',
  'Root rot',
  'Nutrient deficiency',
  'Physical damage',
  'Experimental failure',
  'Poor germination',
  'Overcrowding',
  'Other'
] as const

export type WasteReason = typeof COMMON_WASTE_REASONS[number]

// ========================================
// TYPE GUARDS
// ========================================

export const isEnhancedHarvest = (obj: any): obj is EnhancedHarvest => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' &&
         typeof obj.teacher_id === 'string' &&
         typeof obj.tower_id === 'string'
}

export const isEnhancedClassroom = (obj: any): obj is EnhancedClassroom => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' &&
         typeof obj.teacher_id === 'string' &&
         typeof obj.name === 'string'
}

export const isPlantingWithQuantity = (obj: any): obj is PlantingWithQuantity => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' &&
         typeof obj.name === 'string' &&
         typeof obj.quantity === 'number'
}

export const isPestCatalogItem = (obj: any): obj is PestCatalogItem => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' &&
         typeof obj.name === 'string' &&
         typeof obj.type === 'string' &&
         Array.isArray(obj.identification_tips)
}

/**
 * Get appropriate icon for pest/disease type
 */
export const getTypeIcon = (type: PestDiseaseType): string => {
  switch (type) {
    case 'pest': return 'Bug'
    case 'disease': return 'Leaf'
    case 'nutrient': return 'Droplets'
    case 'environmental': return 'Thermometer'
    default: return 'Bug'
  }
}

/**
 * Get appropriate color class for pest/disease type
 */
export const getTypeColor = (type: PestDiseaseType): string => {
  switch (type) {
    case 'pest': return 'bg-red-100 text-red-800'
    case 'disease': return 'bg-orange-100 text-orange-800'
    case 'nutrient': return 'bg-blue-100 text-blue-800'
    case 'environmental': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
