param(
  [ValidateSet("auto","test","prod")]
  [string]$target = "auto"
)

$ErrorActionPreference = "Stop"
$SITE = "school"

# Figure out branch -> env (main => prod, else => test)
$branch = (git rev-parse --abbrev-ref HEAD) 2>$null
if (-not $branch) { $branch = "unknown" }
if ($target -eq "auto") { $target = $(if ($branch -eq "main") { "prod" } else { "test" }) }

Write-Host "Branch: $branch  Target: $target"

# Hosts/paths (use your SSH aliases)
$TEST = @{
  Host        = "sproutify-test"
  User        = "sproutifyin"
  RemoteDist  = "/srv/www/$SITE/dist"
  ComposeDir  = "/srv/static-sites"
  ServiceName = "school"
}

$PROD = @{
  Host        = "sproutify-prod"
  User        = "sweetwaterurbanfarms_u85wi2p2s0m"
  RemoteDist  = "/var/www/vhosts/sweetwaterurbanfarms.com/school.sproutify.app/httpdocs"
}

Write-Host "Building $SITE..."
npm ci
npm run build

# Build markers
$buildTs = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$gitSha  = (git rev-parse --short HEAD) 2>$null
if (-not $gitSha) { $gitSha = "no-git" }

$txtLines = @(
  "site: $SITE",
  "branch: $branch",
  "built_at_utc: $buildTs",
  "git_sha: $gitSha"
)
$txtLines | Set-Content -Encoding ascii -Path ".\dist\build-info.txt"

$htmlLines = @(
  "<!doctype html><meta charset=""utf-8"">",
  "<pre>site: $SITE",
  "branch: $branch",
  "built_at_utc: $buildTs",
  "git_sha: $gitSha</pre>"
)
$htmlLines | Set-Content -Encoding ascii -Path ".\dist\build-info.html"

# Apache-only for PROD (.htaccess)
if ($target -eq "prod") {
  $htaccess = @(
    "<IfModule mod_headers.c>",
    "  <Files ""index.html"">",
    "    Header set Cache-Control ""no-cache, no-store, must-revalidate""",
    "    Header set Pragma ""no-cache""",
    "    Header set Expires 0",
    "  </Files>",
    "</IfModule>",
    "<IfModule mod_rewrite.c>",
    "  RewriteEngine On",
    "  RewriteBase /",
    "  RewriteCond %{REQUEST_FILENAME} -f [OR]",
    "  RewriteCond %{REQUEST_FILENAME} -d",
    "  RewriteRule ^ - [L]",
    "  RewriteRule . /index.html [L]",
    "</IfModule>"
  )
  $htaccess | Set-Content -Encoding ascii -Path ".\dist\.htaccess"
}

function Push-Dist {
  param(
    [string]$hostAlias,
    [string]$remotePath
  )
  Write-Host ("Uploading dist/ to {0}:{1} (scp)..." -f $hostAlias, $remotePath)
  # ensure remote dir exists and clean it first to mimic --delete behavior
  ssh $hostAlias ("mkdir -p '{0}' && rm -rf '{0}'/*" -f $remotePath)
  # copy files
  scp -r ./dist/. ("{0}:{1}/" -f $hostAlias, $remotePath)
}

switch ($target) {
  "test" {
    Push-Dist -hostAlias $TEST.Host -remotePath $TEST.RemoteDist
    Write-Host "Restarting container (school)..."
    ssh $TEST.Host ("cd {0} && (docker compose restart {1} || docker-compose restart {1})" -f $TEST.ComposeDir, $TEST.ServiceName)
    Write-Host "TEST deploy complete -> http://100.96.83.5:8081"
  }
  "prod" {
    Push-Dist -hostAlias $PROD.Host -remotePath $PROD.RemoteDist
    ssh $PROD.Host ("date -u +%Y-%m-%dT%H:%M:%SZ > {0}/.deployed_utc" -f $PROD.RemoteDist)
    Write-Host "PROD deploy complete -> https://school.sproutify.app/"
  }
  default {
    throw "Unknown target: $target"
  }
}
