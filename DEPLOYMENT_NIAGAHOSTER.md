# 🚀 Panduan Deploy ke Niagahoster

## 📋 CHECKLIST PERSIAPAN (Before Upload)

✅ **1. Build Frontend**
```bash
cd frontend
npm run build
```

✅ **2. Verify Build Files di Backend**
Pastikan file-file ini ada:
- `backend/public/index.html`
- `backend/public/static/`
- `backend/public/asset-manifest.json`

✅ **3. Composer Production**
```bash
cd backend
composer install --optimize-autoloader --no-dev
```

✅ **4. Files yang Diupload**
Upload seluruh folder `backend/` ke server termasuk:
- ✅ app/
- ✅ bootstrap/
- ✅ config/
- ✅ database/
- ✅ public/ (dengan React build)
- ✅ routes/
- ✅ storage/
- ✅ vendor/
- ✅ .htaccess (di public/)
- ✅ artisan
- ✅ composer.json
- ❌ JANGAN upload: node_modules/, frontend/, .git/

---

## 🌐 LANGKAH DEPLOYMENT DI NIAGAHOSTER

### **STEP 1: Buat Database di cPanel**

1. Login ke cPanel Niagahoster
2. Buka **MySQL Database Wizard**
3. Buat database baru:
   - Database Name: `tracking_kerja` (atau sesuai preferensi)
   - Create Database

4. Buat user database:
   - Username: `tracking_user` (atau sesuai preferensi)
   - Password: **[GENERATE PASSWORD KUAT]**
   - Create User

5. Assign privileges:
   - Pilih user yang baru dibuat
   - Centang **ALL PRIVILEGES**
   - Make Changes

6. **CATAT CREDENTIALS INI:**
   ```
   DB_HOST=localhost
   DB_DATABASE=namauser_tracking_kerja
   DB_USERNAME=namauser_tracking_user
   DB_PASSWORD=[password yang di-generate]
   ```

---

### **STEP 2: Upload Files**

#### **Struktur Folder di Server:**
```
/home/namauser/
├── public_html/                    ← Akan dikosongkan
├── laravel/                        ← Upload backend ke sini
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   │   ├── index.html             ← React build
│   │   ├── index.php              ← Laravel entry
│   │   ├── .htaccess
│   │   └── static/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env                        ← Buat file ini!
│   └── artisan
```

#### **Upload via File Manager cPanel:**

1. Login cPanel → **File Manager**
2. Navigate ke `/home/namauser/`
3. Buat folder baru: `laravel`
4. Upload file:
   - Zip folder `backend/` di local
   - Upload file zip ke folder `laravel/`
   - Extract zip file
   - Hapus file zip

**ATAU Upload via FTP:**
1. Download FileZilla
2. Connect dengan credentials FTP dari Niagahoster
3. Upload seluruh isi folder `backend/` ke `/home/namauser/laravel/`

---

### **STEP 3: Konfigurasi .env File**

1. Di File Manager, navigate ke `/home/namauser/laravel/`
2. Copy file `.env.production` → rename jadi `.env`
3. Edit file `.env`:

```env
APP_NAME="Tracking Kerja"
APP_ENV=production
APP_KEY=                                    # Generate nanti via Terminal
APP_DEBUG=false
APP_URL=https://yourdomain.com              # Ganti dengan domain Anda

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=namauser_tracking_kerja         # Sesuaikan dengan database cPanel
DB_USERNAME=namauser_tracking_user          # Sesuaikan dengan user database
DB_PASSWORD=PasswordYangKuatDariCPanel      # Password dari database

SESSION_DOMAIN=.yourdomain.com              # Ganti dengan domain Anda
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

4. **SAVE FILE**

---

### **STEP 4: Setup Document Root**

Di cPanel → **Domains** → Pilih domain Anda → Edit:

**Change Document Root to:**
```
/home/namauser/laravel/public
```

**ATAU via Terminal/SSH** (lebih aman):

```bash
cd /home/namauser/public_html

# Backup existing files (jika ada)
mkdir backup
mv * backup/

# Create symlinks to Laravel public
ln -s /home/namauser/laravel/public/* .
ln -s /home/namauser/laravel/public/.htaccess .
```

---

### **STEP 5: Set File Permissions**

Di cPanel Terminal atau SSH:

```bash
cd /home/namauser/laravel

# Set ownership (ganti 'namauser' dengan username cPanel Anda)
chown -R namauser:namauser storage
chown -R namauser:namauser bootstrap/cache

# Set permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chmod -R 755 public
```

---

### **STEP 6: Generate APP_KEY**

Di Terminal cPanel:

```bash
cd /home/namauser/laravel
php artisan key:generate
```

Output akan update `.env` dengan `APP_KEY` yang baru.

---

### **STEP 7: Run Database Migration**

```bash
cd /home/namauser/laravel

# Check database connection
php artisan migrate:status

# Run migration
php artisan migrate --force

# Seed initial data (admin user & departments)
php artisan db:seed --class=DatabaseSeeder --force
```

**Default Login setelah seeding:**
```
Email: admin@trackingkerja.com
Password: admin123
```

---

### **STEP 8: Clear Cache & Optimize**

```bash
cd /home/namauser/laravel

# Clear all cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## ✅ TESTING

### **1. Test Website**
Buka: `https://yourdomain.com`
- Should load React app (Login page)

### **2. Test API**
```bash
curl https://yourdomain.com/api/auth/me
# Should return: {"message":"Unauthenticated."}
```

### **3. Test Login**
- Login dengan credentials default admin
- Jika berhasil, Anda masuk ke Dashboard

---

## 🔒 SECURITY CHECKLIST

✅ `APP_DEBUG=false` di production  
✅ `APP_ENV=production`  
✅ Password database kuat (min 16 karakter)  
✅ File `.env` tidak accessible via browser (Laravel protected)  
✅ SSL Certificate aktif (HTTPS)  
✅ `storage/` dan `bootstrap/cache/` writable  
✅ Ganti password admin default setelah login  
✅ Backup database secara berkala  

---

## ⚠️ TROUBLESHOOTING

### **Error 500 - Internal Server Error**
```bash
# Temporary enable debug
# Edit .env: APP_DEBUG=true
# Check error, lalu set kembali APP_DEBUG=false
```

**Common causes:**
- `.env` file salah konfigurasi
- `APP_KEY` belum di-generate
- Permissions `storage/` tidak writable
- Database credentials salah

### **Database Connection Failed**
```bash
# Test connection
php artisan tinker
>>> DB::connection()->getPdo();
```

Check:
- Database name correct (prefix `namauser_`)
- Username correct (prefix `namauser_`)
- Password correct
- `DB_HOST=localhost`

### **React App Tidak Load (White Screen)**
Check:
- `backend/public/index.html` exists
- `backend/public/static/` exists
- Browser console for errors
- Clear browser cache

### **API Routes 404**
Check:
- `.htaccess` exists in `public/`
- mod_rewrite enabled (contact Niagahoster support)
- `php artisan route:list` shows API routes

### **CORS Error**
Update `.env`:
```env
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

Then:
```bash
php artisan config:clear
php artisan config:cache
```

---

## 📞 SUPPORT

**Niagahoster Support:**
- Live Chat: https://www.niagahoster.co.id
- Ticket: via cPanel
- Phone: Check website

**Laravel Issues:**
- Documentation: https://laravel.com/docs
- GitHub: Issue tracker

---

## 🔄 UPDATE APPLICATION

Untuk update aplikasi di production:

```bash
# 1. Backup database dulu!
# 2. Upload file yang berubah via FTP
# 3. Di Terminal:

cd /home/namauser/laravel

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Update database (if any migration changes)
php artisan migrate --force

# Re-optimize
php artisan config:cache
php artisan route:cache
```

---

## 📊 DATABASE BACKUP

### **Manual Backup via cPanel:**
1. cPanel → phpMyAdmin
2. Select database `namauser_tracking_kerja`
3. Export → SQL format → Download

### **Scheduled Backup:**
1. cPanel → Backup Wizard
2. Setup automatic daily backup
3. Store to remote location (Google Drive/Dropbox)

---

**🎉 DEPLOYMENT COMPLETE!**

Jika ada masalah, hubungi support Niagahoster atau cek error log:
```bash
tail -f /home/namauser/laravel/storage/logs/laravel.log
```
