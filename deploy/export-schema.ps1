<#
  Membuat schema-kosong.sql (struktur semua tabel, tanpa data) dari migrasi Laravel, untuk
  diimpor lewat phpMyAdmin di hosting. Hanya dipakai kalau TIDAK ada data dari laptop;
  kalau ada, pakai deploy\prepare-db-import.ps1.

  Skrip ini menyalakan instance MySQL SEMENTARA yang terpisah (data dir di folder temp,
  port 3307, tanpa membaca my.ini Laragon). MySQL/Laragon Anda yang biasa dan database di
  dalamnya (termasuk password root-nya) tidak disentuh. Setelah selesai, instance
  sementara dimatikan dan folder datanya dihapus.

  Pemakaian:
    powershell -ExecutionPolicy Bypass -File deploy\export-schema.ps1
#>
param(
    [string]$Php   = 'C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe',
    [string]$MyBin = 'C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin',
    [string]$Out   = (Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) 'deploy-output\schema-kosong.sql'),
    [int]$Port     = 3307
)

# 'Continue' (bukan 'Stop'): Windows PowerShell 5.1 menganggap log stderr mysqld sebagai error.
# Kegagalan dicek lewat $LASTEXITCODE dan throw eksplisit.
$ErrorActionPreference = 'Continue'
$Backend = Join-Path (Split-Path $PSScriptRoot -Parent) 'portfolio-backend'
$TmpData = Join-Path $env:TEMP 'portfolio-schema-mysql'
$Db      = 'portfolio_schema'

function Test-Port([int]$p) { try { (New-Object Net.Sockets.TcpClient('127.0.0.1', $p)).Close(); $true } catch { $false } }
function Wait-Port([int]$p, [bool]$open, [int]$seconds = 90) {
    foreach ($i in 1..$seconds) { if ((Test-Port $p) -eq $open) { return $true }; Start-Sleep -Seconds 1 }
    return $false
}

if (Test-Port $Port) { throw "Port $Port sudah dipakai. Pakai -Port untuk port lain." }
if (Test-Path $TmpData) { Remove-Item $TmpData -Recurse -Force }

Write-Host 'Menyiapkan instance MySQL sementara...'
& "$MyBin\mysqld.exe" --no-defaults --initialize-insecure "--datadir=$TmpData" --console 2>$null
if ($LASTEXITCODE -ne 0) { throw 'Inisialisasi data dir sementara gagal.' }

$srv = Start-Process -FilePath "$MyBin\mysqld.exe" -PassThru -WindowStyle Hidden -ArgumentList `
    '--no-defaults', "--datadir=`"$TmpData`"", "--port=$Port", '--mysqlx=OFF', '--bind-address=127.0.0.1', '--console'
try {
    if (-not (Wait-Port $Port $true)) { throw 'MySQL sementara tidak mau menyala.' }
    $cli = @('-h', '127.0.0.1', '-P', $Port, '-u', 'root')

    & "$MyBin\mysql.exe" @cli -e "CREATE DATABASE $Db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    if ($LASTEXITCODE -ne 0) { throw 'Gagal membuat database sementara.' }

    # Environment variable mengalahkan isi .env, jadi .env lokal tidak berubah.
    $env:DB_CONNECTION = 'mysql'; $env:DB_HOST = '127.0.0.1'; $env:DB_PORT = "$Port"
    $env:DB_DATABASE = $Db;       $env:DB_USERNAME = 'root'
    Push-Location $Backend
    try { & $Php artisan migrate --force; if ($LASTEXITCODE -ne 0) { throw 'artisan migrate gagal' } } finally { Pop-Location }

    # --skip-add-drop-table: impor ulang ke database yang sudah berisi akan error, bukan menghapus data.
    $dump = @($cli) + @('--no-tablespaces', '--skip-comments', '--set-gtid-purged=OFF', '--no-create-db', '--skip-add-drop-table')
    $schema = & "$MyBin\mysqldump.exe" @dump --no-data $Db
    if ($LASTEXITCODE -ne 0) { throw 'mysqldump (struktur) gagal' }
    # Isi tabel "migrations" ikut dibawa agar Laravel tahu migrasi mana yang sudah dijalankan.
    $migs = & "$MyBin\mysqldump.exe" @dump --no-create-info --skip-triggers $Db migrations
    if ($LASTEXITCODE -ne 0) { throw 'mysqldump (migrations) gagal' }

    New-Item -ItemType Directory -Force -Path (Split-Path $Out) | Out-Null
    [System.IO.File]::WriteAllText($Out, (($schema + $migs) -join "`n") + "`n", (New-Object System.Text.UTF8Encoding $false))

    if (Select-String -Path $Out -Pattern '0900_ai_ci' -Quiet) { Write-Warning 'schema-kosong.sql memakai collation 0900_ai_ci (tidak didukung MariaDB).' }
    Write-Host "Selesai: $Out" -ForegroundColor Green
}
finally {
    $env:DB_CONNECTION = ''; $env:DB_HOST = ''; $env:DB_PORT = ''; $env:DB_DATABASE = ''; $env:DB_USERNAME = ''
    if (Test-Port $Port) { & "$MyBin\mysqladmin.exe" -h 127.0.0.1 -P $Port -u root shutdown 2>$null }
    [void](Wait-Port $Port $false 60)
    if ($srv -and -not $srv.HasExited) { [void]$srv.WaitForExit(30000) }
    if (Test-Path $TmpData) { Remove-Item $TmpData -Recurse -Force -ErrorAction SilentlyContinue }
}
