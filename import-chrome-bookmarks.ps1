# Life Companion — Chrome Bookmarks Importer
# Reads Chrome bookmarks from disk and pushes to Supabase

# ─── CONFIG ────────────────────────────────────────────────────
# Set these to your Supabase project values (from Vercel env vars)
$SUPABASE_URL = ""
$SUPABASE_KEY = ""

# Try to read from .env.local if it exists
$envFile = Join-Path $PSScriptRoot ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^NEXT_PUBLIC_SUPABASE_URL=(.+)$") { $SUPABASE_URL = $Matches[1].Trim() }
        if ($_ -match "^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)$") { $SUPABASE_KEY = $Matches[1].Trim() }
    }
}

if (-not $SUPABASE_URL -or -not $SUPABASE_KEY) {
    Write-Host "  [!] Supabase credentials not found." -ForegroundColor Yellow
    Write-Host "  Create a .env.local file in this folder with:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
    Write-Host "    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here"
    Write-Host ""
    exit 1
}

Write-Host "  [OK] Supabase configured: $SUPABASE_URL" -ForegroundColor Green

# ─── FIND CHROME BOOKMARKS ────────────────────────────────────

$chromeBase = "$env:LOCALAPPDATA\Google\Chrome\User Data"
$edgeBase = "$env:LOCALAPPDATA\Microsoft\Edge\User Data"
$allBookmarks = @()
$profiles = @("Default", "Profile 1", "Profile 2", "Profile 3")

function Parse-BookmarkNode {
    param($node, $folder)
    $results = @()
    if ($node.type -eq "url") {
        $results += [PSCustomObject]@{
            title = if ($node.name) { $node.name } else { "Untitled" }
            url = $node.url
            folder = $folder
        }
    }
    if ($node.children) {
        $childFolder = if ($folder) { "$folder / $($node.name)" } else { $node.name }
        foreach ($child in $node.children) {
            $results += Parse-BookmarkNode -node $child -folder $childFolder
        }
    }
    return $results
}

function Read-BookmarksFile {
    param($filePath, $label)
    if (-not (Test-Path $filePath)) { return @() }
    try {
        $data = Get-Content $filePath -Raw | ConvertFrom-Json
        $roots = $data.roots
        $bms = @()
        $bms += Parse-BookmarkNode -node $roots.bookmark_bar -folder "Bookmarks Bar"
        $bms += Parse-BookmarkNode -node $roots.other -folder "Other Bookmarks"
        $bms += Parse-BookmarkNode -node $roots.synced -folder "Mobile Bookmarks"
        if ($bms.Count -gt 0) {
            Write-Host "  Found $($bms.Count) bookmarks in $label" -ForegroundColor Cyan
        }
        return $bms
    } catch {
        return @()
    }
}

Write-Host ""
Write-Host "  Scanning for bookmarks..." -ForegroundColor White

# Check live profiles
foreach ($profile in $profiles) {
    $file = Join-Path $chromeBase "$profile\Bookmarks"
    $allBookmarks += Read-BookmarksFile -filePath $file -label "Chrome $profile"
}

# Check Chrome snapshots (where bookmarks often actually live)
$snapshotsDir = Join-Path $chromeBase "Snapshots"
if (Test-Path $snapshotsDir) {
    $latestSnapshot = Get-ChildItem $snapshotsDir -Directory | Sort-Object Name -Descending | Select-Object -First 1
    if ($latestSnapshot) {
        foreach ($profile in $profiles) {
            $file = Join-Path $latestSnapshot.FullName "$profile\Bookmarks"
            $allBookmarks += Read-BookmarksFile -filePath $file -label "Chrome Snapshot $($latestSnapshot.Name) / $profile"
        }
    }
}

# Check Edge
foreach ($profile in $profiles) {
    $file = Join-Path $edgeBase "$profile\Bookmarks"
    $allBookmarks += Read-BookmarksFile -filePath $file -label "Edge $profile"
}

# Deduplicate by URL
$seen = @{}
$unique = @()
foreach ($bm in $allBookmarks) {
    if (-not $seen.ContainsKey($bm.url)) {
        $seen[$bm.url] = $true
        $unique += $bm
    }
}

Write-Host ""
Write-Host "  Total unique bookmarks found: $($unique.Count)" -ForegroundColor Green

if ($unique.Count -eq 0) {
    Write-Host "  No bookmarks to import." -ForegroundColor Yellow
    exit 0
}

# ─── CHECK EXISTING BOOKMARKS IN SUPABASE ─────────────────────

Write-Host ""
Write-Host "  Checking existing bookmarks in Supabase..." -ForegroundColor White

$headers = @{
    "apikey" = $SUPABASE_KEY
    "Authorization" = "Bearer $SUPABASE_KEY"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

try {
    $existing = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/bookmarks?select=url" -Headers $headers -Method Get
    $existingUrls = @{}
    foreach ($bm in $existing) {
        $existingUrls[$bm.url] = $true
    }
    Write-Host "  Found $($existingUrls.Count) existing bookmarks in Supabase" -ForegroundColor Cyan
} catch {
    Write-Host "  Could not check existing bookmarks: $($_.Exception.Message)" -ForegroundColor Yellow
    $existingUrls = @{}
}

# Filter out already-imported
$toImport = @()
foreach ($bm in $unique) {
    if (-not $existingUrls.ContainsKey($bm.url)) {
        $toImport += $bm
    }
}

Write-Host "  New bookmarks to import: $($toImport.Count)" -ForegroundColor Green

if ($toImport.Count -eq 0) {
    Write-Host ""
    Write-Host "  All bookmarks are already imported!" -ForegroundColor Green
    exit 0
}

# ─── MAP FOLDERS TO CATEGORIES ─────────────────────────────────

# Auto-map Chrome folders to bookmark categories
function Get-Category {
    param($folder)
    $lower = $folder.ToLower()
    if ($lower -match "car|auto|restomod|vehicle") { return "cars" }
    if ($lower -match "ai|claude|chatgpt|openai|machine learning") { return "ai" }
    if ($lower -match "tech|dev|tool|code|github|programming") { return "dev-tools" }
    if ($lower -match "learn|course|tutorial|education") { return "learning" }
    if ($lower -match "shop|amazon|buy|store|product") { return "tech" }
    return "uncategorized"
}

# ─── INSERT INTO SUPABASE ──────────────────────────────────────

Write-Host ""
Write-Host "  Importing $($toImport.Count) bookmarks into Supabase..." -ForegroundColor White

$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
$batch = @()
$counter = 0

foreach ($bm in $toImport) {
    $counter++
    $id = "bm-import-$counter-$(Get-Random -Maximum 99999)"
    $batch += @{
        id = $id
        title = $bm.title
        url = $bm.url
        description = $bm.folder
        category = Get-Category -folder $bm.folder
        pinned = $false
        created_at = $timestamp
    }
}

# Insert one at a time to handle failures gracefully
$successCount = 0
$failCount = 0

foreach ($item in $batch) {
    # Build JSON manually to avoid PowerShell serialization issues
    $title = $item.title -replace '\\', '\\\\' -replace '"', '\"' -replace "`r", '' -replace "`n", ' '
    $url = $item.url -replace '\\', '\\\\' -replace '"', '\"'
    $desc = $item.description -replace '\\', '\\\\' -replace '"', '\"' -replace "`r", '' -replace "`n", ' '
    $cat = $item.category

    $json = @"
[{"id":"$($item.id)","title":"$title","url":"$url","description":"$desc","category":"$cat","pinned":false,"created_at":"$timestamp"}]
"@

    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/bookmarks" -Headers $headers -Method Post -Body $bytes | Out-Null
        $successCount++
        if ($successCount % 25 -eq 0) {
            Write-Host "  Imported $successCount / $($batch.Count)..." -ForegroundColor Cyan
        }
    } catch {
        $failCount++
        $errorBody = ""
        try { $errorBody = $_.ErrorDetails.Message } catch {}
        if ($failCount -le 3) {
            Write-Host "  [SKIP] '$($item.title)': $errorBody" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
if ($successCount -gt 0) {
    Write-Host "  Done! Imported $successCount bookmarks." -ForegroundColor Green
}
if ($failCount -gt 0) {
    Write-Host "  Skipped $failCount bookmarks (bad data or duplicates)." -ForegroundColor Yellow
}
Write-Host "  Refresh your Life Companion app to see them." -ForegroundColor White
Write-Host ""
