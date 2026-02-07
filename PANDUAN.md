# Panduan Lengkap - Sistem Tracking Kerja

## Daftar Isi

1. [Persiapan](#persiapan)
2. [Instalasi Backend](#instalasi-backend)
3. [Instalasi Frontend](#instalasi-frontend)
4. [Menjalankan Aplikasi](#menjalankan-aplikasi)
5. [Penggunaan](#penggunaan)
6. [Troubleshooting](#troubleshooting)

## Persiapan

Pastikan sudah terinstall:

- **PHP 8.2+** - [Download](https://www.php.net/downloads)
- **Composer** - [Download](https://getcomposer.org/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/mysql/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **npm** (terinstall otomatis dengan Node.js)

### Cek Versi

```bash
php --version
composer --version
mysql --version
node --version
npm --version
```

## Instalasi Backend

### 1. Buat Database MySQL

Buka MySQL client:

```bash
mysql -u root -p
```

Buat database:

```sql
CREATE DATABASE tracking_kerja CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Konfigurasi Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
composer install

# Copy environment file (sudah ada .env)
# Edit .env sesuaikan dengan kredensial MySQL Anda

# Generate application key (sudah di-generate)
php artisan key:generate

# Jalankan migrations
php artisan migrate

# Seeder (opsional - untuk data dummy)
# php artisan db:seed
```

### 3. Jalankan Backend Server

```bash
php artisan serve
```

Backend akan berjalan di: **http://localhost:8000**

## Instalasi Frontend

### 1. Install Dependencies

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install
```

### 2. Jalankan Frontend Server

```bash
npm start
```

Frontend akan berjalan di: **http://localhost:3000**

Browser akan otomatis terbuka.

## Menjalankan Aplikasi

### Start Backend (Terminal 1)

```bash
cd backend
php artisan serve
```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm start
```

### Akses Aplikasi

Buka browser ke: **http://localhost:3000**

## Penggunaan

### 1. Register & Login

1. Klik tombol **"Register"**
2. Isi form registrasi:
   - Nama lengkap
   - Email (harus valid)
   - Password (minimal 6 karakter)
3. Klik **"Register"** untuk membuat akun
4. Anda akan otomatis masuk ke dashboard

### 2. Membuat Proyek

1. Dari dashboard, klik menu **"Proyek"**
2. Klik tombol **"+ Proyek Baru"**
3. Isi form:
   - Nama Proyek (required)
   - Deskripsi (opsional)
   - Status (Active/Completed/Archived)
   - Tanggal Mulai & Selesai (opsional)
4. Klik **"Simpan"**

### 3. Membuat Task

1. Klik menu **"Tasks"**
2. Pastikan sudah ada proyek
3. Klik **"+ Task Baru"**
4. Isi form:
   - Judul Task (required)
   - Pilih Proyek (required)
   - Deskripsi
   - Status (To Do/In Progress/Done)
   - Prioritas (Low/Medium/High)
   - Due Date
   - Estimasi Jam
5. Klik **"Simpan"**

### 4. Tracking Waktu (Time Log)

1. Klik menu **"Time Logs"**
2. Klik **"+ Log Baru"**
3. Isi form:
   - Pilih Task (required)
   - Waktu Mulai (required)
   - Waktu Selesai (opsional - untuk log yang sudah selesai)
   - Deskripsi (opsional)
4. Klik **"Simpan"**

**Tips**: Jika belum tahu kapan selesai, bisa input waktu mulai saja, nanti bisa di-edit.

### 5. Melihat Laporan

1. Klik menu **"Laporan"**
2. Pilih periode:
   - **Harian** - Laporan hari ini
   - **Mingguan** - Laporan minggu ini
   - **Bulanan** - Laporan bulan ini
3. Lihat statistik:
   - Total time logs
   - Total menit/jam kerja
   - Waktu per proyek
   - Waktu per status task

### 6. Dashboard

Dashboard menampilkan:

- Total Proyek
- Task To Do, In Progress, Done
- Top Proyek bulan ini
- Quick access ke semua menu

## Troubleshooting

### Backend Issues

#### Error: "Class 'PDO' not found"

- Install PHP PDO extension
- Aktifkan di `php.ini`: `extension=pdo_mysql`

#### Error: "SQLSTATE[HY000] [2002] Connection refused"

- Pastikan MySQL sedang berjalan
- Cek kredensial di file `.env`
- Cek port MySQL (default: 3306)

#### Error: "The stream or file could not be opened"

- Jalankan: `chmod -R 775 storage bootstrap/cache`

#### Error: Migration failed

- Drop database dan buat ulang
- Jalankan `php artisan migrate:fresh`

### Frontend Issues

#### Error: "Cannot find module 'tailwindcss'"

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Error: Port 3000 already in use

- Ubah port dengan: `PORT=3001 npm start`
- Atau kill process di port 3000

#### Error: CORS policy

- Pastikan backend running
- Cek `backend/config/cors.php`
- Pastikan frontend URL di allowed_origins

### Database Issues

#### Error: "Access denied for user"

- Cek username & password di `.env`
- Pastikan user punya akses ke database

#### Lupa Password MySQL

- Reset password MySQL
- Update kredensial di `.env`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get user info
- `POST /api/auth/logout` - Logout

### Projects

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project detail
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task detail
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Time Logs

- `GET /api/timelogs` - Get all time logs
- `POST /api/timelogs` - Create time log
- `GET /api/timelogs/{id}` - Get time log detail
- `PUT /api/timelogs/{id}` - Update time log
- `DELETE /api/timelogs/{id}` - Delete time log

### Reports

- `GET /api/reports/dashboard` - Get dashboard stats
- `GET /api/reports/{period}` - Get report (daily/weekly/monthly)

## Tips & Best Practices

1. **Backup Database Rutin**

   ```bash
   mysqldump -u root -p tracking_kerja > backup.sql
   ```

2. **Update Dependencies**

   ```bash
   # Backend
   composer update

   # Frontend
   npm update
   ```

3. **Clear Cache**

   ```bash
   # Laravel cache
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   ```

4. **Production Build**
   ```bash
   # Frontend
   npm run build
   ```

## Support

Untuk pertanyaan atau issue, silakan buka issue di repository atau hubungi developer.

---

**Selamat menggunakan Sistem Tracking Kerja!** 🚀
