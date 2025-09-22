// src/utils/envValidation.ts
// Environment variable validation and configuration

export interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_DB_SCHEMA?: string;
  VITE_N8N_WEBHOOK_URL?: string;
  VITE_FEATURE_GARDEN_NETWORK?: string;
  NODE_ENV?: string;
}

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  config: Partial<EnvConfig>;
}

// Required environment variables
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
] as const;

// Optional environment variables with defaults
const OPTIONAL_ENV_VARS = {
  VITE_DB_SCHEMA: 'public',
  VITE_N8N_WEBHOOK_URL: undefined,
  VITE_FEATURE_GARDEN_NETWORK: 'false',
  NODE_ENV: 'development'
} as const;

// Environment variable validators
const ENV_VALIDATORS = {
  VITE_SUPABASE_URL: (value: string): boolean => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname.includes('supabase.co');
    } catch {
      return false;
    }
  },
  
  VITE_SUPABASE_ANON_KEY: (value: string): boolean => {
    // Basic JWT format validation
    return value.length > 50 && value.includes('.');
  },
  
  VITE_DB_SCHEMA: (value: string): boolean => {
    // Schema name validation (alphanumeric + underscore)
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);
  },
  
  VITE_N8N_WEBHOOK_URL: (value: string): boolean => {
    if (!value) return true; // Optional
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  
  VITE_FEATURE_GARDEN_NETWORK: (value: string): boolean => {
    return value === 'true' || value === 'false';
  },
  
  NODE_ENV: (value: string): boolean => {
    return ['development', 'production', 'test'].includes(value);
  }
} as const;

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const config: Partial<EnvConfig> = {};

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = import.meta.env[varName];
    
    if (!value) {
      errors.push(`Missing required environment variable: ${varName}`);
      continue;
    }
    
    const validator = ENV_VALIDATORS[varName];
    if (validator && !validator(value)) {
      errors.push(`Invalid format for environment variable: ${varName}`);
      continue;
    }
    
    config[varName] = value;
  }

  // Check optional variables
  for (const [varName, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    const value = import.meta.env[varName] || defaultValue;
    
    if (value !== undefined) {
      const validator = ENV_VALIDATORS[varName as keyof typeof ENV_VALIDATORS];
      if (validator && !validator(value)) {
        errors.push(`Invalid format for environment variable: ${varName}`);
        continue;
      }
      
      config[varName as keyof EnvConfig] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    config
  };
}

export function getEnvConfig(): EnvConfig {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
  }
  
  return validation.config as EnvConfig;
}

// Safe environment variable getter with fallbacks
export function getEnvVar(
  name: keyof EnvConfig,
  fallback?: string
): string | undefined {
  const value = import.meta.env[name];
  
  if (value) {
    const validator = ENV_VALIDATORS[name];
    if (validator && !validator(value)) {
      console.warn(`Invalid environment variable format: ${name}`);
      return fallback;
    }
    return value;
  }
  
  return fallback;
}

// Environment-specific configuration
export function isDevelopment(): boolean {
  return getEnvVar('NODE_ENV', 'development') === 'development';
}

export function isProduction(): boolean {
  return getEnvVar('NODE_ENV', 'development') === 'production';
}

export function isTest(): boolean {
  return getEnvVar('NODE_ENV', 'development') === 'test';
}

export function isFeatureEnabled(feature: keyof Pick<EnvConfig, 'VITE_FEATURE_GARDEN_NETWORK'>): boolean {
  const value = getEnvVar(feature, 'false');
  return value === 'true';
}

// Configuration object with validated environment variables
export const envConfig = (() => {
  try {
    return getEnvConfig();
  } catch (error) {
    console.error('Failed to load environment configuration:', error);
    // Return minimal config for graceful degradation
    return {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
      VITE_DB_SCHEMA: 'public',
      VITE_N8N_WEBHOOK_URL: undefined,
      VITE_FEATURE_GARDEN_NETWORK: 'false',
      NODE_ENV: 'development'
    };
  }
})();

// Environment validation on module load
if (isDevelopment()) {
  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.warn('Environment validation warnings:', validation.errors);
  }
}

// Export commonly used environment variables
export const {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  VITE_DB_SCHEMA,
  VITE_N8N_WEBHOOK_URL,
  VITE_FEATURE_GARDEN_NETWORK,
  NODE_ENV
} = envConfig;
