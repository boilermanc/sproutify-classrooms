# PowerShell script to clear Supabase local development cache
# This will reset your local database!

Write-Host "Stopping Supabase..." -ForegroundColor Yellow
supabase stop

Write-Host "Clearing Docker volumes (this will reset your local database!)..." -ForegroundColor Red
docker volume prune -f

Write-Host "Starting Supabase fresh..." -ForegroundColor Green
supabase start

Write-Host "Resetting database and running migrations..." -ForegroundColor Blue
supabase db reset

Write-Host "Restarting edge functions..." -ForegroundColor Cyan
supabase functions serve ai-chat --env-file ./supabase/.env.local

Write-Host "Done! Your local Supabase instance has been reset." -ForegroundColor Green
