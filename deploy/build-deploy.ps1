<#
  Menyiapkan paket deploy untuk Hostinger shared hosting TANPA terminal di server.

  Hasil (folder ..\..\deploy-output):
    teguh-app.zip   -> backend Laravel + vendor (tanpa dev), .env production
    web-root.zip    -> hasil build React + index.php Laravel + .htaccess
    uploads.zip     -> gambar upload yang sudah ada (opsional)

  Pemakaian (PowerShell, dari folder repo):
    powershell -ExecutionPolicy Bypass -File deploy\build-deploy.ps1
#>
param(
    # Alamat situs setelah online. Dipakai untuk URL API frontend dan APP_URL backend.
    [string]$SiteUrl = 'https://teguhsmln.ifportofolio.com',
    [string]$Php = 'C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe',
    [string]$Out = (Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) 'deploy-output')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$Repo     = Split-Path $PSScriptRoot -Parent
$Frontend = Join-Path $Repo 'portfolio-teguh'
$Backend  = Join-Path $Repo 'portfolio-backend'
$Stage    = Join-Path $Out 'staging'
$StageApp = Join-Path $Stage 'teguh-app'
$StageWeb = Join-Path $Stage 'web-root'
$StageUp  = Join-Path $Stage 'uploads'

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

function Invoke-Robocopy($src, $dst, [string[]]$extra) {
    robocopy $src $dst /E /NFL /NDL /NJH /NJS /NP @extra | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "robocopy gagal ($LASTEXITCODE): $src" }
    $global:LASTEXITCODE = 0
}

# Zip dibuat manual: ZipFile.CreateFromDirectory di Windows PowerShell 5.1 menulis path
# dengan backslash, yang rusak saat di-extract di server Linux (hPanel File Manager).
# $prefix (opsional) menjadi folder teratas di dalam zip.
function New-Zip($sourceDir, $zipPath, [string]$prefix = '') {
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    $base = (Resolve-Path $sourceDir).Path.TrimEnd('\')
    $fs  = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
    $zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        Get-ChildItem -LiteralPath $base -Recurse -Force -File | ForEach-Object {
            $entry = $_.FullName.Substring($base.Length + 1).Replace('\', '/')
            if ($prefix) { $entry = "$prefix/$entry" }
            [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $zip, $_.FullName, $entry, [System.IO.Compression.CompressionLevel]::Optimal)
        }
    } finally { $zip.Dispose(); $fs.Dispose() }
}

function Write-Utf8NoBom($path, $text) {
    [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
}

if (-not (Test-Path $Php)) { throw "PHP tidak ditemukan di $Php (pakai -Php untuk menunjuk php.exe, minimal 8.2)" }
$env:PATH = "$(Split-Path $Php);$env:PATH"

# 1. Frontend -----------------------------------------------------------------
Step 'Build frontend (React/Vite)'
$SiteUrl = $SiteUrl.TrimEnd('/')
# Environment variable mengalahkan file .env.*, jadi build tidak bergantung pada
# portfolio-teguh/.env.production (file itu di-ignore git).
$env:VITE_API_URL     = "$SiteUrl/api"
$env:VITE_STORAGE_URL = "$SiteUrl/storage"
Push-Location $Frontend
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'npm run build gagal' }
} finally {
    Pop-Location
    $env:VITE_API_URL = ''; $env:VITE_STORAGE_URL = ''
}

# 2. Staging bersih -----------------------------------------------------------
Step 'Siapkan folder staging'
if (Test-Path $Stage) { Remove-Item $Stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $StageApp, $StageWeb, $StageUp | Out-Null

# 3. Backend: salin source tanpa vendor/node_modules/.env/data lokal -----------
Step 'Salin source backend'
Invoke-Robocopy $Backend $StageApp @(
    '/XD', "$Backend\vendor", "$Backend\node_modules", "$Backend\public", "$Backend\storage",
           "$Backend\tests", "$Backend\.git", "$Backend\bootstrap\cache",
    '/XF', '.env', '.env.*', 'database.sqlite', '*.log', 'phpunit.xml', '.phpunit.result.cache'
)
foreach ($d in 'bootstrap\cache', 'storage\app\private', 'storage\framework\cache\data',
               'storage\framework\sessions', 'storage\framework\views', 'storage\logs') {
    $p = Join-Path $StageApp $d
    New-Item -ItemType Directory -Force -Path $p | Out-Null
    Set-Content -Path (Join-Path $p '.keep') -Value '' -Encoding ascii
}

# 4. Composer tanpa dev-dependency (sekaligus meregenerasi bootstrap/cache) ----
Step 'composer install --no-dev (butuh internet)'
Push-Location $StageApp
try {
    composer install --no-dev --optimize-autoloader --no-interaction
    if ($LASTEXITCODE -ne 0) { throw 'composer install gagal' }

    $key = (& $Php artisan key:generate --show).Trim()
    if ($key -notmatch '^base64:') { throw "APP_KEY tidak valid: $key" }
} finally { Pop-Location }

# 5. .env production + proteksi folder app ------------------------------------
Step 'Tulis .env production dan proteksi folder'
$template = Get-Content (Join-Path $PSScriptRoot '.env.production.template') -Raw
Write-Utf8NoBom (Join-Path $StageApp '.env') ($template.Replace('__APP_KEY__', $key).Replace('__SITE_URL__', $SiteUrl))
Write-Utf8NoBom (Join-Path $StageApp '.htaccess') "Require all denied`n"

# 6. Web root: hasil build React + entry point Laravel ------------------------
Step 'Susun web root'
Invoke-Robocopy (Join-Path $Frontend 'dist') $StageWeb @()
Copy-Item (Join-Path $PSScriptRoot 'web-root\index.php') (Join-Path $StageWeb 'index.php')
if (-not (Test-Path (Join-Path $StageWeb '.htaccess'))) { throw '.htaccess tidak ada di dist (cek portfolio-teguh/public/.htaccess)' }

# 7. Gambar upload yang sudah ada ---------------------------------------------
Step 'Salin gambar upload'
$pub = Join-Path $Backend 'storage\app\public'
Invoke-Robocopy $pub (Join-Path $StageUp 'storage') @('/XF', '.gitignore')

# 8. Zip ----------------------------------------------------------------------
Step 'Buat zip'
New-Zip $StageApp (Join-Path $Out 'teguh-app.zip') 'teguh-app'
New-Zip $StageWeb (Join-Path $Out 'web-root.zip')
New-Zip $StageUp  (Join-Path $Out 'uploads.zip')

# 9. Verifikasi isi zip -------------------------------------------------------
Step 'Verifikasi zip'
foreach ($z in 'teguh-app.zip', 'web-root.zip', 'uploads.zip') {
    $zp = Join-Path $Out $z
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zp)
    try {
        $names = $zip.Entries | ForEach-Object FullName
        if ($names | Where-Object { $_ -match '\\' }) { throw "$z berisi path dengan backslash" }
        '{0,-16} {1,7:N1} MB  {2,6} entri' -f $z, ((Get-Item $zp).Length / 1MB), $names.Count
    } finally { $zip.Dispose() }
}
Write-Host "`nSelesai. Hasil ada di: $Out" -ForegroundColor Green
