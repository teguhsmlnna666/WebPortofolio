<#
  Mengubah export phpMyAdmin dari database lokal menjadi file yang bisa diimpor ke database
  yang dibuat lewat hPanel.

  Masalah yang diselesaikan: export phpMyAdmin biasanya diawali "CREATE DATABASE ..." dan
  "USE ...". Di shared hosting, user database hanya boleh bekerja di database yang dibuat
  lewat hPanel, sehingga impor gagal dengan error #1044 (Access denied).

  Yang dilakukan:
    - membuang CREATE DATABASE / USE / DROP DATABASE
    - mengosongkan data tabel sisa pengembangan: personal_access_tokens (token login dev)
      dan sessions. Struktur tabelnya tetap dibuat.
  Isi data lain (reports, report_blocks, projects, users, messages, ...) tidak diubah.
  File sumber tidak dimodifikasi.

  Pemakaian:
    powershell -ExecutionPolicy Bypass -File deploy\prepare-db-import.ps1
    powershell -ExecutionPolicy Bypass -File deploy\prepare-db-import.ps1 -Source D:\lokasi\export.sql
#>
param(
    [string]$Source = (Join-Path (Split-Path $PSScriptRoot -Parent) 'schema.sql'),
    [string]$Out    = (Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) 'deploy-output\database-import.sql'),
    [string[]]$ClearDataOf = @('personal_access_tokens', 'sessions')
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path $Source)) { throw "File sumber tidak ditemukan: $Source" }

$lines  = [System.IO.File]::ReadAllLines($Source, (New-Object System.Text.UTF8Encoding $false))
$result = New-Object 'System.Collections.Generic.List[string]'
$dropped  = 0          # baris CREATE/USE/DROP DATABASE yang dibuang
$cleared  = @{}        # tabel -> jumlah baris data yang dibuang
$skipFor  = $null      # sedang melewati blok INSERT milik tabel ini

foreach ($l in $lines) {
    if ($skipFor) {
        if ($l -match '^\(') { $cleared[$skipFor]++ }
        # Satu baris tuple tidak pernah berakhir dengan ';' kecuali tuple terakhir (newline di data di-escape).
        if ($l.TrimEnd().EndsWith(';')) { $skipFor = $null }
        continue
    }
    if ($l -match '^(CREATE DATABASE|DROP DATABASE|USE)\s') { $dropped++; continue }
    if ($l -match '^INSERT INTO `([^`]+)`' -and $ClearDataOf -contains $Matches[1]) {
        $skipFor = $Matches[1]; if (-not $cleared.ContainsKey($skipFor)) { $cleared[$skipFor] = 0 }
        if ($l -match '^\(') { $cleared[$skipFor]++ }
        if ($l.TrimEnd().EndsWith(';')) { $skipFor = $null }
        continue
    }
    $result.Add($l)
}
if ($skipFor) { throw "Blok INSERT untuk $skipFor tidak berakhir dengan ';' (file rusak?)" }

New-Item -ItemType Directory -Force -Path (Split-Path $Out) | Out-Null
[System.IO.File]::WriteAllText($Out, ([string]::Join("`n", $result) + "`n"), (New-Object System.Text.UTF8Encoding $false))

Write-Host "Sumber : $Source"
Write-Host "Hasil  : $Out" -ForegroundColor Green
Write-Host "Dibuang: $dropped baris CREATE/USE/DROP DATABASE"
foreach ($k in $cleared.Keys) { Write-Host ("Dikosongkan: {0} ({1} baris data dev)" -f $k, $cleared[$k]) }

$left = [System.IO.File]::ReadAllLines($Out) | Where-Object { $_ -match '^(CREATE DATABASE|USE\s)|DEFINER=|CREATE (TRIGGER|VIEW|PROCEDURE|FUNCTION)' }
if ($left) { Write-Warning ("Masih ada baris yang mungkin ditolak hosting:`n" + (($left | Select-Object -First 5) -join "`n")) }
