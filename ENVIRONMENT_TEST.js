// Environment Variables Test
// Add this to your browser console to verify environment variables are loading

console.log('Environment Variables Test:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('VITE_DB_SCHEMA:', import.meta.env.VITE_DB_SCHEMA);
console.log('VITE_STRIPE_PUBLISHABLE_KEY:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Expected values:
// VITE_SUPABASE_URL: "https://your-project-ref.supabase.co"
// VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// VITE_DB_SCHEMA: "public"
// VITE_STRIPE_PUBLISHABLE_KEY: "pk_live_your_stripe_publishable_key"
