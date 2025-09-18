<#  deploy_school.ps1
Usage:
  powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy_school.ps1 [auto|test|prod] [-Force] [-MergeOnly] [-MergeFirst]
Defaults to 'auto' if no env is provided.

Behavior:
- prod : deploy to production target (prefers branch: main). If not on main, asks for MERGE/OVERRIDE. Always asks for YES before proceeding.
- test : deploy to test target (prefers branch: dev; warns if not)
- auto : CI-friendly; main->prod, else->test
- -Force : bypass confirmation & branch guards (use sparingly)
- -MergeOnly : only merge to main, don't deploy
- -MergeFirst : merge to main first, then deploy
#>

param(
  [ValidateSet('auto','test','prod')]
  [string]$env = 'auto',
  [switch]$Force,
  [switch]$MergeOnly,
  [switch]$MergeFirst
)

# ---------- TARGETS ----------
$Targets = @{
  test = @{
    HostAlias  = 'sproutifyin@100.96.83.5'
    RemotePath = '/srv/www/school/dist'
    Url        = 'http://100.96.83.5:8081/'
    ComposeDir = '/srv/static-sites'
    Service    = 'school'
  }
  prod = @{
    # Correct IONOS IP (.226)
    HostAlias  = 'sweetwaterurbanfarms_u85wi2p2s0m@82.165.209.226'
    RemotePath = '/var/www/vhosts/sweetwaterurbanfarms.com/school.sproutify.app/httpdocs'
    Url        = 'https://school.sproutify.app/'
  }
}
# --------------------------------

$ErrorActionPreference = 'Stop'
$VerbosePreference = 'SilentlyContinue'  # set to 'Continue' for more logs

# Resolve executables explicitly to avoid PS function/alias collisions
$SSH   = (Get-Command ssh.exe  -ErrorAction Stop).Source
$SCP   = (Get-Command scp.exe  -ErrorAction Stop).Source
$RSYNC = (Get-Command rsync.exe -ErrorAction SilentlyContinue).Source  # may be $null on Windows
$GIT   = (Get-Command git.exe  -ErrorAction Stop).Source

# SSH options as separate args (PowerShell quirk)
$SshOptArgs = @(
  '-o','BatchMode=yes',
  '-o','ConnectTimeout=10',
  '-o','StrictHostKeyChecking=accept-new'
)

function Assert-Exit([string]$label) { if ($LASTEXITCODE -ne 0) { throw "$label failed with exit code $LASTEXITCODE" } }
function Local-HasRsync { [bool]$RSYNC }
function Remote-HasRsync([string]$HostAlias) { & $SSH @SshOptArgs $HostAlias "command -v rsync >/dev/null"; return ($LASTEXITCODE -eq 0) }

function Invoke-SSH([string]$HostAlias, [string]$Command, [string]$label) {
  & $SSH @SshOptArgs $HostAlias $Command
  Assert-Exit $label
}

function Copy-Dir-SCP([string]$LocalDir, [string]$HostAlias, [string]$RemoteDir, [string]$label) {
  & $SCP @SshOptArgs -r "$LocalDir/." ("{0}:{1}/" -f $HostAlias, $RemoteDir)
  Assert-Exit $label
}

function Push-Dist([string]$HostAlias, [string]$RemotePath) {
  Write-Host ("Uploading dist/ -> {0}:{1}..." -f $HostAlias, $RemotePath)
  Invoke-SSH $HostAlias ("umask 022 && mkdir -p '{0}'" -f $RemotePath) 'mkdir -p remote'

  $canUseRsync = (Local-HasRsync) -and (Remote-HasRsync $HostAlias)
  if ($canUseRsync) {
    Write-Host "Using rsync (--delete, chmod)…"
    & $RSYNC -azv --delete `
      --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r `
      ./dist/ ("{0}:{1}/" -f $HostAlias, $RemotePath)
    Assert-Exit 'rsync'
  } else {
    Write-Host "rsync not available; using scp + server-side cleanup…"
    Invoke-SSH $HostAlias ("find '{0}' -mindepth 1 -maxdepth 1 -exec rm -rf {{}} +" -f $RemotePath) 'remote clean'
    Copy-Dir-SCP "./dist" $HostAlias "$RemotePath" 'scp copy'
    $chmodDirs  = "find '$RemotePath' -type d -exec chmod 755 {} \;"
    $chmodFiles = "find '$RemotePath' -type f -exec chmod 644 {} \;"
    Invoke-SSH $HostAlias "$chmodDirs && $chmodFiles" 'remote chmod'
  }
}

function Get-CurrentBranch {
  $branch = (& $GIT rev-parse --abbrev-ref HEAD).Trim()
  if (-not $branch) { throw "Could not determine current git branch." }
  return $branch
}

function Confirm-Prod {
  param([string]$HostAlias, [string]$RemotePath)
  Write-Warning "You are about to DEPLOY TO PRODUCTION"
  Write-Host   "Host    : $HostAlias"
  Write-Host   "Path    : $RemotePath"
  Write-Host   "Branch  : $(Get-CurrentBranch)"
  $ans = Read-Host "Type 'YES' to continue"
  if ($ans -ne 'YES') { throw "Aborted by user." }
}

function Merge-ToMain {
  param([switch]$Force)
  
  $currentBranch = Get-CurrentBranch
  if ($currentBranch -eq 'main') {
    Write-Host "Already on main branch. No merge needed."
    return
  }
  
  Write-Host "Current branch: $currentBranch"
  Write-Host "Preparing to merge $currentBranch to main..."
  
  # Check for uncommitted changes
  $gitStatus = & $GIT status --porcelain
  if ($gitStatus) {
    Write-Warning "Uncommitted changes detected:"
    Write-Host $gitStatus
    if (-not $Force) {
      $ans = Read-Host "Commit these changes first? Type 'YES' to commit, 'SKIP' to stash, or anything else to abort"
      if ($ans -eq 'YES') {
        $commitMsg = Read-Host "Enter commit message (or press Enter for auto-message)"
        if (-not $commitMsg) {
          $commitMsg = "Auto-commit before merge to main - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        & $GIT add .
        & $GIT commit -m $commitMsg
        Assert-Exit 'commit changes'
      } elseif ($ans -eq 'SKIP') {
        & $GIT stash push -m "Auto-stash before merge to main - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        Assert-Exit 'stash changes'
        Write-Host "Changes stashed. Will restore after merge."
      } else {
        throw "Aborted by user."
      }
    } else {
      # Force mode - auto commit
      $commitMsg = "Auto-commit before merge to main - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
      & $GIT add .
      & $GIT commit -m $commitMsg
      Assert-Exit 'commit changes'
    }
  }
  
  # Switch to main branch
  Write-Host "Switching to main branch..."
  & $GIT checkout main
  Assert-Exit 'checkout main'
  
  # Pull latest main
  Write-Host "Pulling latest main..."
  & $GIT pull origin main
  Assert-Exit 'pull main'
  
  # Merge the feature branch
  Write-Host "Merging $currentBranch into main..."
  & $GIT merge $currentBranch --no-ff -m "Merge $currentBranch to main for production deployment"
  Assert-Exit 'merge branch'
  
  # Push to origin
  Write-Host "Pushing merged main to origin..."
  & $GIT push origin main
  Assert-Exit 'push main'
  
  Write-Host "✅ Successfully merged $currentBranch to main"
  
  # Restore stashed changes if any
  $stashList = & $GIT stash list
  if ($stashList -match "Auto-stash before merge to main") {
    Write-Host "Restoring stashed changes..."
    & $GIT stash pop
    Write-Host "✅ Stashed changes restored"
  }
}

# -------- Database Safety Check --------
function Test-DatabaseSafety {
    param([string]$Environment)
    
    Write-Host "Performing database safety checks..."
    
    # Check if we're about to deploy to production
    if ($Environment -eq 'prod') {
        Write-Warning "PRODUCTION DEPLOYMENT DETECTED!"
        
        # Check git branch
        $currentBranch = Get-CurrentBranch
        if ($currentBranch -ne 'main' -and -not $Force) {
            Write-Error "Production deployments should only run from 'main' branch. Current: '$currentBranch'"
            throw "Branch safety check failed"
        }
        
        # Check for uncommitted changes
        $gitStatus = & $GIT status --porcelain
        if ($gitStatus) {
            Write-Warning "Uncommitted changes detected:"
            Write-Host $gitStatus
            $ans = Read-Host "Continue with uncommitted changes? Type 'YES' to continue"
            if ($ans -ne 'YES') { throw "Deployment cancelled due to uncommitted changes" }
        }
        
        # Check for database migration files
        $migrationFiles = Get-ChildItem -Path "supabase/migrations" -Filter "*.sql" | Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-1) }
        if ($migrationFiles) {
            Write-Warning "Recent migration files detected:"
            $migrationFiles | ForEach-Object { Write-Host "  $($_.Name)" }
            $ans = Read-Host "Recent migrations detected. Type 'MIGRATE-PROD' to confirm production migration"
            if ($ans -ne 'MIGRATE-PROD') { throw "Production migration cancelled" }
        }
        
        Write-Host "✅ Production safety checks passed"
    }
}

# Handle MergeOnly mode
if ($MergeOnly) {
  Write-Host "Merge-only mode: Merging to main without deploying..."
  Merge-ToMain -Force:$Force
  Write-Host "✅ Merge completed. Use 'npm run deploy:prod' to deploy from main."
  exit 0
}

# Handle MergeFirst mode
if ($MergeFirst) {
  Write-Host "Merge-first mode: Merging to main before deploying..."
  Merge-ToMain -Force:$Force
}

# -------- Build locally (always) --------
Write-Host "Building (npm ci && npm run build)…"
npm ci
npm run build
Assert-Exit 'build'

if (-not (Test-Path -LiteralPath './dist/index.html')) { throw "dist/ missing or incomplete. Did the build succeed?" }

# -------- Resolve env (auto/test/prod) --------
$effective = switch ($env) {
  'prod' { 'prod' }
  'test' { 'test' }
  default {
    if ($env:GITHUB_REF) {
      if ($env:GITHUB_REF -eq 'refs/heads/main') { 'prod' }
      else { 'test' }
    } else { 'test' }
  }
}

# Run safety checks after $effective is computed
Test-DatabaseSafety -Environment $effective

$target     = $Targets[$effective]
$HostAlias  = $target.HostAlias
$RemotePath = $target.RemotePath
$Url        = $target.Url

# -------- Branch guardrails --------
$currentBranch = Get-CurrentBranch
if (-not $Force) {
  if ($effective -eq 'prod' -and $currentBranch -ne 'main') {
    Write-Warning "You're attempting to DEPLOY TO PROD from branch '$currentBranch' (not 'main')."
    Write-Host ""
    Write-Host "RECOMMENDED WORKFLOW:"
    Write-Host "1. Create a Pull Request: dev → main"
    Write-Host "2. Review and merge the PR"
    Write-Host "3. Switch to main branch: git checkout main"
    Write-Host "4. Deploy from main: npm run deploy:prod"
    Write-Host ""
    $ans = Read-Host "Type 'OVERRIDE' to deploy anyway (NOT RECOMMENDED), or anything else to cancel"
    if ($ans -ne 'OVERRIDE') { 
      Write-Host "Deployment cancelled. Please follow the recommended workflow above."
      throw "Aborted by user." 
    }
  }
  if ($effective -eq 'test' -and $currentBranch -ne 'dev') {
    Write-Warning "Test deploys typically run from 'dev'. Current branch: '$currentBranch'. Proceeding…"
  }
}

Write-Host "Starting deploy"
Write-Host ("Requested env        : {0}" -f $env)
Write-Host ("Effective env        : {0}" -f $effective)
Write-Host ("Host                 : {0}" -f $HostAlias)
Write-Host ("RemotePath           : {0}" -f $RemotePath)
Write-Host ("Local branch         : {0}" -f $currentBranch)

# Final confirmation for prod (always ask unless -Force)
if ($effective -eq 'prod' -and -not $Force) { Confirm-Prod -HostAlias $HostAlias -RemotePath $RemotePath }

# identity check (ensures we're hitting the right box)
Invoke-SSH $HostAlias "echo connected: \$(hostname) as \$(whoami)" 'ssh identity check'

# upload
Push-Dist $HostAlias $RemotePath

# env-specific post steps
if ($effective -eq 'test' -and $target.ComposeDir -and $target.Service) {
  $restart = ("cd {0} && (docker compose restart {1} || docker-compose restart {1})" -f $target.ComposeDir, $target.Service)
  Invoke-SSH $HostAlias $restart 'restart test container'
} elseif ($effective -eq 'prod') {
  # *** THIS IS THE UPDATED LINE ***
  $stamp = ([DateTime]::UtcNow).ToString("s")
  Invoke-SSH $HostAlias ("printf '%s`n' '$stamp' > '{0}/.deployed_utc'" -f $RemotePath) 'write stamp'
}

# verify on the server
$verifyCmds = @(
  "set -e",
  "cd '$RemotePath'",
  "echo 'PWD:' \$(pwd)",
  "ls -la | sed -n '1,40p'",
  "test -f index.html"
) -join " && "
Invoke-SSH $HostAlias $verifyCmds 'remote verify'

# fast, non-blocking connectivity probe for confirmation
if ($Url) {
  try {
    $uri  = [System.Uri]$Url
    $port = if ($uri.Port -ne -1) { $uri.Port } elseif ($uri.Scheme -eq 'https') { 443 } else { 80 }
    $ok   = Test-NetConnection $uri.DnsSafeHost -Port $port -InformationLevel Quiet
    if ($ok) {
      Write-Host ("CONFIRM: {0} is reachable on port {1}" -f $Url, $port)
    } else {
      Write-Warning ("CONFIRM: {0} NOT reachable on port {1}" -f $Url, $port)
    }
  } catch {
    Write-Warning ("Port check failed: {0}" -f $_.Exception.Message)
  }
}

Write-Host ("DEPLOY OK -> {0}" -f $effective)
exit 0