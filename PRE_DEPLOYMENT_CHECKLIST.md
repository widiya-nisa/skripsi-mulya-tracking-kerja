# 📦 Pre-Deployment Checklist

## ✅ CHECKLIST SEBELUM UPLOAD

### 1. ✅ Frontend Build
- [x] Frontend sudah di-build (`npm run build`)
- [x] File build di-copy ke `backend/public/`
- [x] File `backend/public/index.html` exists
- [x] Folder `backend/public/static/` exists
- [x] File `backend/public/asset-manifest.json` exists

### 2. ✅ Backend Configuration
- [x] File `.env.production` template sudah dibuat
- [x] File `.htaccess` di `backend/public/` sudah ada
- [x] Composer dependencies production ready (`composer install --optimize-autoloader --no-dev`)

### 3. ✅ Files & Folders yang Diupload
**Upload ke server:**
- ✅ `backend/app/`
- ✅ `backend/bootstrap/`
- ✅ `backend/config/`
- ✅ `backend/database/`
- ✅ `backend/public/` (dengan React build)
- ✅ `backend/routes/`
- ✅ `backend/storage/`
- ✅ `backend/vendor/`
- ✅ `backend/artisan`
- ✅ `backend/composer.json`
- ✅ `backend/composer.lock`

**JANGAN Upload:**
- ❌ `node_modules/`
- ❌ `frontend/`
- ❌ `.git/`
- ❌ `.env` (buat baru di server)
- ❌ `tests/`

### 4. ✅ Database Preparation
- [ ] Database nama sudah disiapkan
- [ ] Database user & password sudah dicatat
- [ ] Migration files ready di `backend/database/migrations/`
- [ ] Seeder ready: `DepartmentSeeder.php`, `AdminSeeder.php`

### 5. ✅ Security Checklist
- [x] `.env.production` template sudah ada
- [ ] Akan set `APP_DEBUG=false` di production
- [ ] Akan set `APP_ENV=production`
- [ ] Akan generate `APP_KEY` yang baru di server
- [ ] Akan ganti password admin default setelah deployment

---

## 📝 CATATAN PENTING

### File yang Harus Dibuat di Server:
1. **`.env`** - Copy dari `.env.production` dan update credentials
2. Generate `APP_KEY` via: `php artisan key:generate`

### Credentials yang Perlu Dicatat:
```
Domain: ___________________________
cPanel URL: ________________________
cPanel Username: ___________________
cPanel Password: ___________________

Database Name: _____________________
Database User: _____________________
Database Password: _________________
Database Host: localhost (biasanya)
```

### Default Admin Login (Setelah Seeding):
```
Email: admin@trackingkerja.com
Password: admin123
⚠️ GANTI PASSWORD SETELAH LOGIN PERTAMA!
```

---

## 🚀 QUICK COMMANDS (Setelah Upload)

### Di Terminal cPanel/SSH:

```bash
# Navigate ke folder Laravel
cd /home/namauser/laravel

# 1. Generate APP_KEY
php artisan key:generate

# 2. Set Permissions
chmod -R 775 storage bootstrap/cache
chown -R namauser:namauser storage bootstrap/cache

# 3. Run Migration
php artisan migrate --force

# 4. Seed Data
php artisan db:seed --class=DatabaseSeeder --force

# 5. Clear & Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## ✅ FINAL CHECK

Sebelum upload, pastikan:
- [x] Backend sudah production-ready
- [x] Frontend sudah built dan di public/
- [x] .htaccess sudah ada
- [x] .env.production template siap
- [x] Dokumentasi deployment lengkap
- [ ] Database credentials sudah dicatat
- [ ] Backup local database (jika ada data penting)

---

## 📂 File yang Sudah Dibuat

1. ✅ `backend/.env.production` - Template untuk production
2. ✅ `backend/public/.htaccess` - Apache configuration
3. ✅ `DEPLOYMENT_NIAGAHOSTER.md` - Full deployment guide

---

## 🎯 NEXT STEPS

1. Zip folder `backend/` untuk mudah upload
2. Login ke cPanel Niagahoster
3. Ikuti panduan di `DEPLOYMENT_NIAGAHOSTER.md`
4. Test website setelah deployment
5. Ganti password admin default

**Good luck with deployment! 🚀**
