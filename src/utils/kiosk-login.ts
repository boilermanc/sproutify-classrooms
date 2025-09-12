// Direct fetch utility for kiosk login requests
// This bypasses the Supabase client entirely to avoid any header issues

const SUPABASE_URL = "https://cqrjesmpwaqvmssrdeoc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcmplc21wd2Fxdm1zc3JkZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NzUzNjAsImV4cCI6MjA3MDI1MTM2MH0.7dtJ6VOK_i_enstTjvzDuRAyUACNc78dlCldHjsxt58";

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
