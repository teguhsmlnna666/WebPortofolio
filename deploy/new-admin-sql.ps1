<#
  Membuat admin.sql: perintah SQL untuk menambah akun admin ke database di hosting.
  File ini diimpor lewat phpMyAdmin (setelah schema-kosong.sql, atau setelah
  database-import.sql kalau ingin menambah admin baru). Password di-hash bcrypt di
  sini, sehingga password asli tidak pernah disimpan di file maupun di repo.

  Pemakaian:
    powershell -ExecutionPolicy Bypass -File deploy\new-admin-sql.ps1
#>
param(
    # Tiga parameter ini opsional; kalau kosong, ditanyakan lewat prompt.
    [string]$Name,
    [string]$Email,
    [securestring]$Password,
    [string]$Php = 'C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe',
    [string]$Out = (Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) 'deploy-output\admin.sql')
)

$ErrorActionPreference = 'Stop'

$name  = if ($Name)  { $Name }  else { Read-Host 'Nama admin' }
$email = if ($Email) { $Email } else { Read-Host 'Email admin (dipakai untuk login)' }
if ($Password) { $pw1 = $Password; $pw2 = $Password }
else {
    $pw1 = Read-Host 'Password (min. 8 karakter)' -AsSecureString
    $pw2 = Read-Host 'Ulangi password'            -AsSecureString
}

function ConvertTo-Plain($s) {
    $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }
}
$plain = ConvertTo-Plain $pw1
if ($plain -ne (ConvertTo-Plain $pw2)) { throw 'Password tidak sama.' }
if ($plain.Length -lt 8)               { throw 'Password minimal 8 karakter.' }
if ($email -notmatch '^[^@\s]+@[^@\s]+\.[^@\s]+$') { throw 'Format email tidak valid.' }

# Password dikirim lewat environment variable, bukan argumen, supaya aman dari masalah quoting.
$env:ADMIN_PW = $plain
# Kutip tunggal di dalam kode PHP: Windows membuang kutip ganda saat meneruskan argumen ke php.exe.
$hash = (& $Php -r "echo password_hash(getenv('ADMIN_PW'), PASSWORD_BCRYPT);").Trim()
$env:ADMIN_PW = ''
if ($hash -notmatch '^\$2y\$') { throw 'Gagal membuat hash password.' }

function Sql($v) { "'" + ($v -replace '\\', '\\' -replace "'", "''") + "'" }

$sql = @"
INSERT INTO ``users`` (``name``, ``email``, ``password``, ``role``, ``created_at``, ``updated_at``)
VALUES ($(Sql $name), $(Sql $email), $(Sql $hash), 'admin', NOW(), NOW());
"@

New-Item -ItemType Directory -Force -Path (Split-Path $Out) | Out-Null
[System.IO.File]::WriteAllText($Out, $sql + "`n", (New-Object System.Text.UTF8Encoding $false))
Write-Host "Selesai: $Out" -ForegroundColor Green
Write-Host 'Impor file ini lewat phpMyAdmin SETELAH file database utama, lalu hapus dari komputer/chat jika perlu.'
