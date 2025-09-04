function Test-RemoteHasRsync {
  param([string]$hostAlias)
  $result = ssh $hostAlias "command -v rsync >/dev/null && echo yes || echo no" 2>$null
  return $result -match 'yes'
}

function Push-Dist {
  param(
    [string]$hostAlias,
    [string]$remotePath
  )
  Write-Host ("Uploading dist/ to {0}:{1}..." -f $hostAlias, $remotePath)

  # ensure remote dir exists and set permissive umask for created files/dirs
  ssh $hostAlias ("umask 022 && mkdir -p '{0}'" -f $remotePath)

  if (Test-RemoteHasRsync -hostAlias $hostAlias) {
    Write-Host "Using rsync (with --delete and chmod)..."
    # -a: archive; -v verbose; --delete: sync deletions; --chmod: set perms on upload
    # NOTE: Requires rsync on both sides (most Linux boxes have it).
    rsync -avz --delete `
      --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r `
      ./dist/ ("{0}:{1}/" -f $hostAlias, $remotePath)
  } else {
    Write-Host "rsync not available; falling back to scp + remote chmod..."
    # Clean remote (mimic --delete)
    ssh $hostAlias ("find '{0}' -mindepth 1 -maxdepth 1 -exec rm -rf {{}} +" -f $remotePath)
    # Copy
    scp -r ./dist/. ("{0}:{1}/" -f $hostAlias, $remotePath)
    # Fix perms remotely (dirs 755, files 644)
    ssh $hostAlias @"
find '$remotePath' -type d -exec chmod 755 {} \;
find '$remotePath' -type f -exec chmod 644 {} \;
"@
  }
}
