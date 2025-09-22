# Environment Configuration Guide

## Required Environment Variables

### Supabase Configuration
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional Configuration
```bash
# Database Schema (defaults to 'public')
VITE_DB_SCHEMA=public

# n8n Webhook URL (for user registration notifications)
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/sproutify-registration

# Development/Production Mode
NODE_ENV=development
```

## Fixing the Current Issues

### 1. Multiple GoTrueClient Instances Warning
This is **expected behavior** and not an error. The application uses two Supabase clients:
- Main client (`sb-main-auth-token`) for authenticated users
- Anonymous client (`sb-anonymous-auth-token`) for kiosk login

### 2. n8n Webhook 405 Error
The webhook is failing because `VITE_N8N_WEBHOOK_URL` is not configured. To fix:
1. Set up your n8n webhook endpoint
2. Add `VITE_N8N_WEBHOOK_URL` to your environment variables
3. Or disable webhooks by commenting out webhook calls in the code

### 3. Classrooms API 400 Error
This has been fixed by:
- Removing the incorrect `sb` alias
- Using the proper `supabase` client import
- Fixing the syntax error in the `createClassroom` function

## Next Steps
1. Create a `.env` file with your Supabase credentials
2. Configure the n8n webhook URL if you want registration notifications
3. Test the classroom creation functionality
