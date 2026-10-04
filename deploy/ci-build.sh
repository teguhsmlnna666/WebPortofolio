#!/usr/bin/env bash
# Menyusun hasil build yang siap di-upload ke hosting. Dipakai GitHub Actions
# (.github/workflows/deploy_teguhsmln.yml) dan bisa dijalankan lokal untuk menguji.
#
#   SITE_URL     alamat situs, mis. https://teguhsmln.ifportofolio.com   (wajib)
#   OUT          folder hasil, default: build
#   SKIP_NPM_CI  isi apa saja untuk melewati "npm ci" (uji lokal; pakai node_modules yang ada)
#
# Hasil:
#   $OUT/web-root/   -> isi folder subdomain (React + index.php Laravel + .htaccess)
#   $OUT/teguh-app/  -> backend Laravel + vendor (tanpa dev). TANPA .env: .env hanya ada di server.
set -euo pipefail

SITE_URL="${SITE_URL:?SITE_URL wajib diisi, mis. https://teguhsmln.ifportofolio.com}"
SITE_URL="${SITE_URL%/}"
OUT="${OUT:-build}"
cd "$(dirname "$0")/.."

rm -rf "$OUT"
mkdir -p "$OUT/web-root" "$OUT/teguh-app"

echo "==> Frontend (React/Vite)"
(
  cd portfolio-teguh
  [ -n "${SKIP_NPM_CI:-}" ] || npm ci
  VITE_API_URL="$SITE_URL/api" VITE_STORAGE_URL="$SITE_URL/storage" npm run build
)
cp -a portfolio-teguh/dist/. "$OUT/web-root/"
cp deploy/web-root/index.php "$OUT/web-root/index.php"

echo "==> Backend (Laravel, tanpa vendor/.env/data lokal)"
tar -C portfolio-backend \
  --exclude=./vendor --exclude=./node_modules --exclude=./public --exclude=./storage \
  --exclude=./tests --exclude=./.git --exclude=./bootstrap/cache \
  --exclude=.env --exclude='.env.*' --exclude=database.sqlite --exclude='*.log' \
  -cf - . | tar -C "$OUT/teguh-app" -xf -

# .keep TIDAK boleh kosong (0 byte): server FTP hosting menolak upload file kosong lewat FTPS
# ("425 Unable to build data connection: Operation not permitted"), jadi diisi satu baris baru.
for d in bootstrap/cache storage/app/private storage/framework/cache/data \
         storage/framework/sessions storage/framework/views storage/logs; do
  mkdir -p "$OUT/teguh-app/$d"
  printf '\n' > "$OUT/teguh-app/$d/.keep"
done
printf 'Require all denied\n' > "$OUT/teguh-app/.htaccess"

echo "==> composer install --no-dev"
composer install --no-dev --optimize-autoloader --no-interaction --working-dir="$OUT/teguh-app"

echo "==> Pemeriksaan hasil"
for f in "$OUT/web-root/index.html" "$OUT/web-root/index.php" "$OUT/web-root/.htaccess" \
         "$OUT/teguh-app/artisan" "$OUT/teguh-app/vendor/autoload.php" "$OUT/teguh-app/.htaccess"; do
  [ -f "$f" ] || { echo "GAGAL: file wajib tidak ada: $f"; exit 1; }
done
[ ! -e "$OUT/teguh-app/.env" ] || { echo "GAGAL: .env tidak boleh ikut ter-upload"; exit 1; }
if grep -rqs "127.0.0.1" "$OUT/web-root/assets"; then
  echo "GAGAL: hasil build frontend masih memuat 127.0.0.1 (VITE_API_URL tidak terpakai?)"; exit 1
fi
grep -rqs "$SITE_URL/api" "$OUT/web-root/assets" || { echo "GAGAL: URL API production tidak tertanam di frontend"; exit 1; }

# File 0 byte gagal diunggah lewat FTPS ke server ini (lihat catatan .keep di atas). Hanya peringatan:
# vendor/ tidak ikut diunggah, jadi tidak diperiksa.
EMPTY=$(find "$OUT/web-root" "$OUT/teguh-app" -path "$OUT/teguh-app/vendor" -prune -o -type f -size 0 -print)
if [ -n "$EMPTY" ]; then
  echo "::warning::Ada file 0 byte yang akan diunggah lewat FTP dan bisa gagal (425 ...): isi file-file ini atau hapus dulu."
  echo "$EMPTY"
fi

echo "OK: $OUT/web-root dan $OUT/teguh-app siap di-upload"
