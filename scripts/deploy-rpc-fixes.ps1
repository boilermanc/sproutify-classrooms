# PowerShell script to deploy the RPC fixes to production
# This will apply the migrations and deploy the updated edge function

Write-Host "Deploying RPC fixes to production..." -ForegroundColor Green

Write-Host "1. Applying database migrations..." -ForegroundColor Yellow
supabase db push

Write-Host "2. Deploying updated ai-chat edge function..." -ForegroundColor Yellow
supabase functions deploy ai-chat

Write-Host "3. Deploying test-rpc edge function..." -ForegroundColor Yellow
supabase functions deploy test-rpc

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To test the fixes:" -ForegroundColor Cyan
Write-Host "1. Set your environment variables:" -ForegroundColor White
Write-Host "   `$env:SUPABASE_URL='https://your-project.supabase.co'" -ForegroundColor Gray
Write-Host "   `$env:SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test the RPC function:" -ForegroundColor White
Write-Host "   node test-simple-rpc.js" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Or test via the edge function:" -ForegroundColor White
Write-Host "   curl -X POST https://your-project.supabase.co/functions/v1/test-rpc \" -ForegroundColor Gray
Write-Host "     -H \"Content-Type: application/json\" \" -ForegroundColor Gray
Write-Host "     -d '{\"tower_id\": \"your-tower-id\"}'" -ForegroundColor Gray
