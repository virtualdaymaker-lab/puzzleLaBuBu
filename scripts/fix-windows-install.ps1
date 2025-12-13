<#
Usage: Run from repository root in an elevated PowerShell (Run as Administrator):

  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\scripts\fix-windows-install.ps1

What it does:
- Stops Node processes
- Finds native `.node` files that match tailwind/oxide and attempts to take ownership and delete them
- Removes `node_modules` and `package-lock.json` (if present)
- Clears npm cache and runs `npm ci`
- Starts the dev server `npm run dev`

This is a best-effort helper for Windows systems where native binaries are locked.
#>

Write-Host "Running Windows install fixer (requires Administrator)..."

try {
  Write-Host "Stopping node processes..."
  Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

  $repo = Convert-Path .

  Write-Host "Searching for native tailwind/oxide .node files (this may take a moment)..."
  $found = Get-ChildItem -Path $repo -Recurse -Include '*.node' -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'tailwind|oxide' }

  if (-not $found) { $found = @() }

  if ($found.Count -gt 0) {
    Write-Host "Found $($found.Count) candidate(s). Attempting to remove them (best-effort)..."
    foreach ($f in $found) {
      $full = $f.FullName
      Write-Host "Processing: $full"
      try {
        # Try direct remove first (may succeed without Admin)
        Remove-Item -Force -LiteralPath "$full" -ErrorAction SilentlyContinue
        if (-not (Test-Path $full)) { Write-Host "Removed (direct): $full" ; continue }

        # If direct remove fails, attempt takeown/icacls (Admin required)
        Write-Host "Direct remove failed; attempting takeown/icacls (requires Admin)..."
        & takeown /f "$full" /a 2>&1 | Out-Null
        & icacls "$full" /grant "$($env:USERNAME):F" 2>&1 | Out-Null
        attrib -r -s -h "$full" -ErrorAction SilentlyContinue
        Remove-Item -Force -LiteralPath "$full" -ErrorAction SilentlyContinue
        if (-not (Test-Path $full)) { Write-Host "Removed (takeown/icacls): $full" } else { Write-Warning "Could not remove: $full" }
      } catch {
        Write-Warning "Error removing $full : $_"
      }
    }
  } else {
    Write-Host "No matching native .node files found."
  }

  # Attempt to remove parent directories that may contain the native files
  $patternDirs = @()
  try {
    $patternDirs = Get-ChildItem -Path (Join-Path $repo 'node_modules') -Directory -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match '@tailwindcss' }
  } catch {
    # ignore
  }
  foreach ($d in $patternDirs) {
    try {
      $dpath = $d.FullName
      Write-Host "Attempting to remove directory: $dpath"
      # try direct removal first
      Remove-Item -Recurse -Force -LiteralPath "$dpath" -ErrorAction SilentlyContinue
      if (-not (Test-Path $dpath)) { Write-Host "Removed: $dpath" ; continue }

      # fallback to takeown/icacls (Admin required)
      & takeown /f "$dpath" /r /a 2>&1 | Out-Null
      & icacls "$dpath" /grant "$($env:USERNAME):F" /t 2>&1 | Out-Null
      Remove-Item -Recurse -Force -LiteralPath "$dpath" -ErrorAction SilentlyContinue
      if (-not (Test-Path $dpath)) { Write-Host "Removed after takeown: $dpath" } else { Write-Warning "Could not remove dir: $dpath" }
    } catch {
      Write-Warning "Error removing directory $dpath : $_"
    }
  }

  <#
  Usage: Run from repository root in an elevated PowerShell (Run as Administrator):

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    .\scripts\fix-windows-install.ps1

  What it does:
  - Stops Node processes
  - Finds native `.node` files that match tailwind/oxide and attempts to take ownership and delete them
  - Removes `node_modules` and `package-lock.json` (if present)
  - Clears npm cache and runs `npm ci`
  - Starts the dev server `npm run dev`

  This is a best-effort helper for Windows systems where native binaries are locked.
  #>

  Write-Host "Running Windows install fixer (requires Administrator)..."

  try {
    Write-Host "Stopping node processes..."
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

    $repo = Convert-Path .

    Write-Host "Searching for native tailwind/oxide .node files (this may take a moment)..."
    $found = Get-ChildItem -Path $repo -Recurse -Include '*.node' -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'tailwind|oxide' }

    if (-not $found) { $found = @() }

    if ($found.Count -gt 0) {
      Write-Host "Found $($found.Count) candidate(s). Attempting to remove them (best-effort)..."
      foreach ($f in $found) {
        $full = $f.FullName
        Write-Host "Processing: $full"
        try {
          # Try direct remove first (may succeed without Admin)
          Remove-Item -Force -LiteralPath "$full" -ErrorAction SilentlyContinue
          if (-not (Test-Path $full)) { Write-Host "Removed (direct): $full" ; continue }

          # If direct remove fails, attempt takeown/icacls (Admin required)
          Write-Host "Direct remove failed; attempting takeown/icacls (requires Admin)..."
          & takeown /f "$full" /a 2>&1 | Out-Null
          & icacls "$full" /grant "$($env:USERNAME):F" 2>&1 | Out-Null
          attrib -r -s -h "$full" -ErrorAction SilentlyContinue
          Remove-Item -Force -LiteralPath "$full" -ErrorAction SilentlyContinue
          if (-not (Test-Path $full)) { Write-Host "Removed (takeown/icacls): $full" } else { Write-Warning "Could not remove: $full" }
        } catch {
          Write-Warning "Error removing $full : $_"
        }
      }
    } else {
      Write-Host "No matching native .node files found."
    }

    # Attempt to remove parent directories that may contain the native files
    $patternDirs = @()
    try {
      $patternDirs = Get-ChildItem -Path (Join-Path $repo 'node_modules') -Directory -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match '@tailwindcss' }
    } catch {
      # ignore
    }
    foreach ($d in $patternDirs) {
      try {
        $dpath = $d.FullName
        Write-Host "Attempting to remove directory: $dpath"
        # try direct removal first
        Remove-Item -Recurse -Force -LiteralPath "$dpath" -ErrorAction SilentlyContinue
        if (-not (Test-Path $dpath)) { Write-Host "Removed: $dpath" ; continue }

        # fallback to takeown/icacls (Admin required)
        & takeown /f "$dpath" /r /a 2>&1 | Out-Null
        & icacls "$dpath" /grant "$($env:USERNAME):F" /t 2>&1 | Out-Null
        Remove-Item -Recurse -Force -LiteralPath "$dpath" -ErrorAction SilentlyContinue
        if (-not (Test-Path $dpath)) { Write-Host "Removed after takeown: $dpath" } else { Write-Warning "Could not remove dir: $dpath" }
      } catch {
        Write-Warning "Error removing directory $dpath : $_"
      }
    }

    # Try removing node_modules if it's safe now
    if (Test-Path (Join-Path $repo 'node_modules')) {
      Write-Host "Removing node_modules..."
      try {
        Remove-Item -Recurse -Force -LiteralPath (Join-Path $repo 'node_modules') -ErrorAction SilentlyContinue
      } catch {
        Write-Warning "Remove node_modules failed: $_"
      }
    }

    # Remove lockfile to allow a fresh install
    if (Test-Path (Join-Path $repo 'package-lock.json')) {
      Write-Host "Removing package-lock.json"
      Remove-Item -Force (Join-Path $repo 'package-lock.json') -ErrorAction SilentlyContinue
    }

    Write-Host "Cleaning npm cache (force)..."
    npm cache clean --force | Out-Null

    Write-Host "Installing dependencies with npm ci (fallback to npm install if needed)..."
    $ciOut = npm ci 2>&1
    Write-Host $ciOut
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "npm ci failed with exit code $LASTEXITCODE — trying 'npm install' as a fallback."
      $installOut = npm install 2>&1
      Write-Host $installOut
      if ($LASTEXITCODE -ne 0) {
        Write-Error "npm install also failed (exit code $LASTEXITCODE). Review the output above."
        return
      }
    }

    Write-Host "Dependencies installed successfully. Starting dev server..."
    npm run dev
  } catch {
    Write-Error "Unexpected error: $_"
  }
