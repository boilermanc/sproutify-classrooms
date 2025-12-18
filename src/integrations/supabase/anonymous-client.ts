// Anonymous Supabase client for kiosk login requests
// This ensures requests are made without authentication headers

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { envConfig } from '@/utils/envValidation';

// Use validated environment configuration
const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = envConfig.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Singleton pattern to prevent multiple client instances
let anonymousSupabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

function createAnonymousSupabaseClient() {
  if (anonymousSupabaseInstance) {
    return anonymousSupabaseInstance;
  }
  
  // Create an anonymous client specifically for kiosk login
  // This client will not store or use any authentication state
  anonymousSupabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false, // Don't persist any session
      autoRefreshToken: false, // Don't auto-refresh tokens
      storageKey: 'sb-anonymous-auth-token', // Use a different storage key to avoid conflicts
      lock: <T>(name: string, _acquireTimeout: number, fn: () => Promise<T>) => fn(), // Disable lock to prevent multi-instance warning
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      },
      detectSessionInUrl: false, // Don't detect sessions in URL
      flowType: 'implicit', // Use implicit flow to avoid token conflicts
      debug: false // Disable debug logging to reduce noise
    },
    global: {
      headers: {
        'Accept': 'application/json'
      }
    },
    // Disable realtime to avoid unnecessary connections
    realtime: {
      enabled: false
    }
  });
  
  return anonymousSupabaseInstance;
}

export const anonymousSupabase = createAnonymousSupabaseClient();
