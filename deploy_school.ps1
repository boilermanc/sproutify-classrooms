<#  deploy_school.ps1
Usage:
  powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy_school.ps1 [auto|test|prod]
Defaults to 'auto' if no env is provided.

auto mode:
- If running in GitHub Actions and GITHUB_REF == refs/heads/main -> prod
- Otherwise -> test
#>

param(
  [ValidateSet('auto','test','prod')]
  [string]$env = 'auto'
)

# ---------- TARGETS (edit prod if needed) ----------
$Targets = @{
  test = @{
    # explicit user@ip to avoid alias issues
    HostAlias  = 'sproutifyin@100.96.83.5'
    RemotePath = '/srv/www/school/dist'
    Url        = 'http://100.96.83.5:8081/'
    ComposeDir = '/srv/static-sites'
    Service    = 'school'
  }
  prod = @{
    # you can keep your SSH alias, or use explicit user@ip:
    HostAlias  = 'sweetwaterurbanfarms_u85wi2p2s0m@82.165.209.228'
    RemotePath = '/var/www/vhosts/sweetwaterurbanfarms.com/school.sproutify.app/httpdocs'
    Url        = 'https://school.sproutify.app/'
  }
}
# ---------------------------------------------------

$ErrorActionPreference = 'Stop'
$VerbosePreference = 'SilentlyContinue'  # set to Continue for more logs

# Resolve executables explicitly to avoid PS function/alias collisions
$SSH   = (Get-Command ssh.exe  -ErrorAction Stop).Source
$SCP   = (Get-Command scp.exe  -ErrorAction Stop).Source
$RSYNC = (Get-Command rsync.exe -ErrorAction SilentlyContinue).Source  # may be $null on Windows

# SSH options as separate args (PowerShell quirk)
$SshOptArgs = @(
  '-o','BatchMode=yes',
  '-o','ConnectTimeout=10',
  '-o','StrictHostKeyChecking=accept-new'
)

function Assert-Exit([string]$label) {
  if ($LASTEXITCODE -ne 0) { throw "$label failed with exit code $LASTEXITCODE" }
}

function Local-HasRsync { [bool]$RSYNC }

function Remote-HasRsync([string]$HostAlias) {
  & $SSH @SshOptArgs $HostAlias "command -v rsync >/dev/null"
  return ($LASTEXITCODE -eq 0)
}

function Invoke-SSH([string]$HostAlias, [string]$Command, [string]$label) {
  & $SSH @SshOptArgs $HostAlias $Command
  Assert-Exit $label
}

function Copy-Dir-SCP([string]$LocalDir, [string]$HostAlias, [string]$RemoteDir, [string]$label) {
  # copy the whole tree; '/.' preserves subfolders like assets/
  & $SCP @SshOptArgs -r "$LocalDir/." ("{0}:{1}/" -f $HostAlias, $RemoteDir)
  Assert-Exit $label
}

function Push-Dist([string]$HostAlias, [string]$RemotePath) {
  Write-Host ("Uploading dist/ -> {0}:{1}..." -f $HostAlias, $RemotePath)

  # ensure target dir exists (umask 022 => group/other can read/execute dirs)
  Invoke-SSH $HostAlias ("umask 022 && mkdir -p '{0}'" -f $RemotePath) 'mkdir -p remote'

  $canUseRsync = (Local-HasRsync) -and (Remote-HasRsync $HostAlias)

  if ($canUseRsync) {
    Write-Host "Using rsync (--delete, chmod)…"
    # trailing slash on source means "copy contents of dist/ into target"
    & $RSYNC -azv --delete `
      --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r `
      ./dist/ ("{0}:{1}/" -f $HostAlias, $RemotePath)
    Assert-Exit 'rsync'
  } else {
    Write-Host "rsync not available; using scp + server-side cleanup…"
    # remove existing contents (not the directory itself)
    Invoke-SSH $HostAlias ("find '{0}' -mindepth 1 -maxdepth 1 -exec rm -rf {{}} +" -f $RemotePath) 'remote clean'
    Copy-Dir-SCP "./dist" $HostAlias "$RemotePath" 'scp copy'
    # ensure readable by nginx: dirs 755, files 644
    $chmodDirs  = "find '$RemotePath' -type d -exec chmod 755 {} \;"
    $chmodFiles = "find '$RemotePath' -type f -exec chmod 644 {} \;"
    Invoke-SSH $HostAlias "$chmodDirs && $chmodFiles" 'remote chmod'
  }
}

# -------- Build locally (always) --------
Write-Host "Building (npm ci && npm run build)…"
npm ci
npm run build
Assert-Exit 'build'

if (-not (Test-Path -LiteralPath './dist/index.html')) {
  throw "dist/ missing or incomplete. Did the build succeed?"
}

# -------- Resolve env (auto) --------
$effective = switch ($env) {
  'test' { 'test' }
  'prod' { 'prod' }
  default {
    if ($env:GITHUB_REF -and $env:GITHUB_REF -eq 'refs/heads/main') { 'prod' } else { 'test' }
  }
}

$target     = $Targets[$effective]
$HostAlias  = $target.HostAlias
$RemotePath = $target.RemotePath
$Url        = $target.Url

Write-Host "Starting deploy"
Write-Host ("Requested env        : {0}" -f $env)
Write-Host ("Effective env        : {0}" -f $effective)
Write-Host ("Host                 : {0}" -f $HostAlias)
Write-Host ("RemotePath           : {0}" -f $RemotePath)

# identity check (ensures we're hitting the right box)
Invoke-SSH $HostAlias "echo connected: \$(hostname) as \$(whoami)" 'ssh identity check'

# upload
Push-Dist $HostAlias $RemotePath

# env-specific post steps
if ($effective -eq 'test' -and $target.ComposeDir -and $target.Service) {
  $restart = ("cd {0} && (docker compose restart {1} || docker-compose restart {1})" -f $target.ComposeDir, $target.Service)
  Invoke-SSH $HostAlias $restart 'restart test container'
} elseif ($effective -eq 'prod') {
  $stamp = (Get-Date -AsUTC -Format s)
  Invoke-SSH $HostAlias ("printf '%s\n' '$stamp' > '{0}/.deployed_utc'" -f $RemotePath) 'write stamp'
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

# optional HTTP HEAD check (uses Invoke-WebRequest, not curl alias)
if ($Url) {
  try {
    $resp = Invoke-WebRequest -Method Head -Uri $Url -UseBasicParsing
    Write-Host ("HTTP check: {0} -> {1}" -f $Url, $resp.StatusCode)
  } catch {
    Write-Warning ("HTTP check failed: {0}" -f $_.Exception.Message)
  }
}

Write-Host ("DEPLOY OK -> {0}" -f $effective)
exit 0
