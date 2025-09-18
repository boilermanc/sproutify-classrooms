// Anonymous Supabase client for kiosk login requests
// This ensures requests are made without authentication headers

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use local Supabase URL for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

// Create an anonymous client specifically for kiosk login
// This client will not store or use any authentication state
export const anonymousSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
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
