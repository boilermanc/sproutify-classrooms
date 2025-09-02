// REPLACE the students table definition in your types file with this:

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

// ========================================
// ALSO REMOVE the entire join_codes table definition since we deleted it:
// ========================================

// DELETE this entire section from your types file:
/*
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
*/

// ========================================
// ADD these additional interfaces for the new student system:
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

// Validation helpers for the new system
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