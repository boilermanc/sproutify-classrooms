// Direct fetch utility for kiosk login requests
// This bypasses the Supabase client entirely to avoid any header issues

import { envConfig } from '@/utils/envValidation';

const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = envConfig.VITE_SUPABASE_ANON_KEY;

export async function findClassroomByPin(kioskPin: string) {
  const url = `${SUPABASE_URL}/rest/v1/classrooms?select=id,name&kiosk_pin=eq.${encodeURIComponent(kioskPin)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return { data: data[0], error: null };
    } else {
      return { data: null, error: new Error('No classroom found with this PIN') };
    }
  } catch (error) {
    console.error('Error fetching classroom:', error);
    return { data: null, error };
  }
}
