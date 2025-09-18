// Anonymous Supabase client for kiosk login requests
// This ensures requests are made without authentication headers

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use production Supabase URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rsndonfydqhykowljuyn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbmRvbmZ5ZHFoeWtvd2xqdXlubiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzU0Njc1MzYwLCJleHAiOjIwNzAyNTEzNjB9.7dtJ6VOK_i_enstTjvzDuRAyUACNc78dlCldHjsxt58";

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
      storageKey: 'sb-anonymous-auth-token', // Use a different storage key
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
        'Accept': 'application/json',
        'Content-Type': 'application/json'
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
