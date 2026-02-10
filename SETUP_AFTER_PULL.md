# Setup Setelah Pull dari Git

Jika Anda baru pull code terbaru atau clone repository ini, ikuti langkah berikut:

## 1. Update Dependencies
```bash
cd backend
composer install
```

## 2. Setup Environment
```bash
# Copy .env.example jika belum ada .env
copy .env.example .env

# Generate app key (jika belum)
php artisan key:generate
```

## 3. Setup Database
```bash
# Pastikan database sudah dibuat di MySQL
# Lalu jalankan migration
php artisan migrate

# PENTING: Seed data departments dan job descriptions
php artisan db:seed --class=DepartmentSeeder
```

## 4. Setup Frontend
```bash
cd ../frontend
npm install
npm run build
```

## 5. Copy Build ke Backend
```bash
# Windows
xcopy build ..\backend\public /E /I /Y

# Atau manual: Copy folder frontend/build/* ke backend/public/
```

## 6. Jalankan Server
```bash
cd ../backend
php artisan serve
```

## Troubleshooting

### Dropdown Job Description Kosong?
Jalankan:
```bash
php artisan db:seed --class=DepartmentSeeder
```

### Error "Table not found"?
Jalankan:
```bash
php artisan migrate
```

### Error 500 atau blank page?
- Cek file `.env` sudah benar
- Jalankan `php artisan key:generate`
- Cek database connection di `.env`
- Cek folder `storage/` dan `bootstrap/cache/` writable

### Password reset tidak bisa?
Pastikan table password_reset_requests sudah ada:
```bash
php artisan migrate
```
