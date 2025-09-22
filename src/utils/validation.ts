// src/utils/validation.ts
// Comprehensive validation utilities for form inputs and data

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

// Common validation rules
export const ValidationRules = {
  required: <T>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value: T) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value);
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.trim().length >= min,
    message: message || `Must be at least ${min} characters long`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.trim().length <= max,
    message: message || `Must be no more than ${max} characters long`
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value.trim());
    },
    message
  }),

  numeric: (message = 'Must be a valid number'): ValidationRule<string | number> => ({
    validate: (value: string | number) => {
      if (typeof value === 'number') return !isNaN(value);
      return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
    },
    message
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => value >= min,
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => value <= max,
    message: message || `Must be no more than ${max}`
  }),

  range: (min: number, max: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => value >= min && value <= max,
    message: message || `Must be between ${min} and ${max}`
  }),

  pin: (message = 'PIN must be 4-6 digits'): ValidationRule<string> => ({
    validate: (value: string) => {
      const trimmed = value.trim();
      return /^\d{4,6}$/.test(trimmed);
    },
    message
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule<string> => ({
    validate: (value: string) => {
      try {
        new URL(value.trim());
        return true;
      } catch {
        return false;
      }
    },
    message
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule<string> => ({
    validate: (value: string) => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    },
    message
  }),

  password: (message = 'Password must be at least 8 characters with uppercase, lowercase, and number'): ValidationRule<string> => ({
    validate: (value: string) => {
      return value.length >= 8 && 
             /[A-Z]/.test(value) && 
             /[a-z]/.test(value) && 
             /\d/.test(value);
    },
    message
  })
};

// Validation helper functions
export function validateField<T>(
  value: T, 
  rules: ValidationRule<T>[]
): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  validationSchema: Record<keyof T, ValidationRule<T[keyof T]>[]>
): ValidationResult {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(validationSchema)) {
    const fieldValue = data[field];
    const fieldResult = validateField(fieldValue, rules);
    errors.push(...fieldResult.errors.map(error => `${field}: ${error}`));
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Specific validation schemas for common forms
export const ValidationSchemas = {
  studentInvite: {
    name: [ValidationRules.required('Student name is required'), ValidationRules.minLength(1)],
    bulkNames: [ValidationRules.required('At least one student name is required')]
  },

  towerForm: {
    name: [
      ValidationRules.required('Tower name is required'),
      ValidationRules.minLength(1, 'Tower name cannot be empty'),
      ValidationRules.maxLength(100, 'Tower name must be less than 100 characters')
    ],
    ports: [
      ValidationRules.required('Number of ports is required'),
      ValidationRules.numeric('Ports must be a valid number'),
      ValidationRules.range(1, 100, 'Ports must be between 1 and 100')
    ],
    location: [ValidationRules.required('Location is required')]
  },

  milestoneForm: {
    title: [
      ValidationRules.required('Milestone title is required'),
      ValidationRules.minLength(1, 'Title cannot be empty'),
      ValidationRules.maxLength(200, 'Title must be less than 200 characters')
    ],
    description: [
      ValidationRules.maxLength(1000, 'Description must be less than 1000 characters')
    ]
  },

  userRegistration: {
    email: [
      ValidationRules.required('Email is required'),
      ValidationRules.email()
    ],
    firstName: [
      ValidationRules.required('First name is required'),
      ValidationRules.minLength(1, 'First name cannot be empty'),
      ValidationRules.maxLength(50, 'First name must be less than 50 characters')
    ],
    lastName: [
      ValidationRules.required('Last name is required'),
      ValidationRules.minLength(1, 'Last name cannot be empty'),
      ValidationRules.maxLength(50, 'Last name must be less than 50 characters')
    ],
    password: [
      ValidationRules.required('Password is required'),
      ValidationRules.password()
    ],
    schoolName: [
      ValidationRules.required('School name is required'),
      ValidationRules.minLength(1, 'School name cannot be empty'),
      ValidationRules.maxLength(200, 'School name must be less than 200 characters')
    ]
  }
};

// Error handling utilities
export class ValidationError extends Error {
  constructor(
    public errors: string[],
    message = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function createValidationError(errors: string[]): ValidationError {
  return new ValidationError(errors);
}

// Async validation helpers
export async function validateAsync<T>(
  value: T,
  asyncValidator: (value: T) => Promise<boolean>,
  message: string
): Promise<ValidationResult> {
  try {
    const isValid = await asyncValidator(value);
    return {
      isValid,
      errors: isValid ? [] : [message]
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [message]
    };
  }
}

// Common async validators
export const AsyncValidators = {
  uniquePin: async (pin: string, existingPins: Set<string>): Promise<boolean> => {
    return !existingPins.has(pin);
  },

  uniqueEmail: async (email: string, checkFunction: (email: string) => Promise<boolean>): Promise<boolean> => {
    return await checkFunction(email);
  },

  validClassroomCode: async (code: string, checkFunction: (code: string) => Promise<boolean>): Promise<boolean> => {
    return await checkFunction(code);
  }
};
