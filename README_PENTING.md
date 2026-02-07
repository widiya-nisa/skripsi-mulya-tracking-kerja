# ⚠️ PENTING - Baca Ini Terlebih Dahulu!

## Sebelum Menjalankan Aplikasi

### 1. Pastikan MySQL Server Sedang Berjalan

Aplikasi ini menggunakan MySQL sebagai database. **MySQL server HARUS berjalan** sebelum menjalankan aplikasi.

#### Cara Menjalankan MySQL:

**Windows:**

- Jika menggunakan XAMPP: Buka XAMPP Control Panel, klik "Start" pada MySQL
- Jika menggunakan WAMP: Buka WAMP, klik "Start All Services"
- Jika MySQL standalone: Buka Services (services.msc), cari "MySQL", klik "Start"
- Command line: `net start MySQL80` (sesuaikan dengan versi Anda)

**Mac:**

```bash
# Jika menggunakan Homebrew
brew services start mysql

# Atau
mysql.server start
```

**Linux:**

```bash
sudo systemctl start mysql
# atau
sudo service mysql start
```

#### Cek MySQL Sudah Berjalan:

```bash
# Coba connect ke MySQL
mysql -u root -p
# Jika berhasil connect, MySQL sudah berjalan
```

### 2. Buat Database

Setelah MySQL berjalan, buat database:

```sql
mysql -u root -p
# Enter password MySQL Anda

CREATE DATABASE tracking_kerja CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Atau bisa menggunakan phpMyAdmin (jika menggunakan XAMPP/WAMP):

1. Buka http://localhost/phpmyadmin
2. Klik tab "Databases"
3. Buat database baru dengan nama: `tracking_kerja`
4. Pilih Collation: `utf8mb4_unicode_ci`

### 3. Konfigurasi .env Backend

Edit file `backend/.env` sesuaikan dengan kredensial MySQL Anda:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracking_kerja
DB_USERNAME=root
DB_PASSWORD=    # Isi dengan password MySQL Anda (kosongkan jika tidak ada password)
```

**PENTING**:

- Jika MySQL Anda punya password, isi `DB_PASSWORD=`
- Jika tidak ada password, biarkan kosong `DB_PASSWORD=`

### 4. Jalankan Migrations

```bash
cd backend
php artisan migrate
```

Jika berhasil, Anda akan melihat output:

```
INFO  Running migrations.
✓ 0001_01_01_000000_create_users_table ......... DONE
✓ 2026_02_05_133745_create_projects_table ...... DONE
✓ 2026_02_05_133751_create_tasks_table ......... DONE
✓ 2026_02_05_133752_create_time_logs_table ..... DONE
```

### 5. Jalankan Aplikasi

**Terminal 1 - Backend:**

```bash
cd backend
php artisan serve
```

Output: `Server running on http://localhost:8000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

Output: Browser akan otomatis membuka `http://localhost:3000`

## Troubleshooting Cepat

### Error: "No connection could be made"

**Solusi**: MySQL server belum berjalan. Jalankan MySQL terlebih dahulu.

### Error: "Access denied for user 'root'"

**Solusi**: Password MySQL salah. Periksa dan update `DB_PASSWORD` di file `.env`

### Error: "Unknown database 'tracking_kerja'"

**Solusi**: Database belum dibuat. Buat database dulu dengan `CREATE DATABASE tracking_kerja;`

### Error: Port 8000 already in use

**Solusi**: Ada aplikasi lain di port 8000. Jalankan dengan port berbeda:

```bash
php artisan serve --port=8001
```

Jangan lupa update di frontend: `frontend/src/services/api.js` ubah URL ke `http://localhost:8001/api`

### Error: Port 3000 already in use

**Solusi**:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## Checklist Sebelum Mulai

- [ ] MySQL server sudah berjalan
- [ ] Database `tracking_kerja` sudah dibuat
- [ ] File `backend/.env` sudah dikonfigurasi dengan benar
- [ ] Migrations sudah di-run (`php artisan migrate`)
- [ ] Composer dependencies sudah di-install (`composer install`)
- [ ] NPM dependencies sudah di-install (`npm install`)

## Kontak & Support

Jika masih ada masalah, silakan:

1. Baca file `PANDUAN.md` untuk panduan lengkap
2. Baca file `INSTALASI.md` untuk langkah instalasi detail
3. Buka issue di repository project

---

**Selamat mencoba! 🚀**

_Tips: Simpan file ini dan baca setiap kali akan menjalankan aplikasi_
