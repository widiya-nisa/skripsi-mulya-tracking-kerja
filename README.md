# Sistem Aplikasi Tracking Kerja

Aplikasi web untuk tracking dan monitoring pekerjaan/tugas dengan fitur manajemen proyek, time tracking, dan pelaporan.

## 🚀 Fitur Utama

- **Manajemen User**: Register, login, dan manajemen profil
- **Manajemen Proyek**: Buat dan kelola proyek
- **Manajemen Task**: Buat, update, dan tracking status task
- **Time Tracking**: Catat waktu kerja pada setiap task
- **Dashboard**: Visualisasi progress dan statistik
- **Pelaporan**: Generate laporan kerja harian/mingguan/bulanan
- **Status Tracking**: Monitoring status task (To Do, In Progress, Done)

## 📋 Teknologi yang Digunakan

### Backend

- Laravel 12 (PHP Framework)
- MySQL (Database)
- Laravel Sanctum (Authentication)
- RESTful API

### Frontend

- React.js
- Axios (HTTP Client)
- React Router (Navigation)
- TailwindCSS (Styling)
- Chart.js (Visualisasi Data)

## 🛠️ Instalasi

### Prerequisites

- PHP 8.2 atau lebih tinggi
- Composer
- MySQL Server
- Node.js (v14 atau lebih tinggi)
- npm atau yarn

### Setup Backend

1. Masuk ke direktori backend:

```bash
cd backend
```

2. Install dependencies:

```bash
composer install
```

3. Copy file .env dan konfigurasi database:

```bash
copy .env.example .env
```

4. Edit file `.env` dan sesuaikan konfigurasi database MySQL:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracking_kerja
DB_USERNAME=root
DB_PASSWORD=
```

5. Buat database MySQL:

```sql
CREATE DATABASE tracking_kerja;
```

6. Generate application key:

```bash
php artisan key:generate
```

7. Jalankan migrations:

```bash
php artisan migrate
```

8. Jalankan server:

```bash
php artisan serve
```

Server akan berjalan di `http://localhost:8000`

### Setup Frontend

```bash
cd frontend
npm install
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📁 Struktur Proyek

```
Tracking Kerja SKRIPSI/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🔐 Default Credentials

Setelah instalasi pertama kali, Anda dapat membuat akun baru melalui halaman register.

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user

### Projects

- `GET /api/projects` - Get semua proyek
- `POST /api/projects` - Buat proyek baru
- `PUT /api/projects/:id` - Update proyek
- `DELETE /api/projects/:id` - Hapus proyek

### Tasks

- `GET /api/tasks` - Get semua task
- `POST /api/tasks` - Buat task baru
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Hapus task

### Time Logs

- `GET /api/timelogs` - Get semua time log
- `POST /api/timelogs` - Buat time log baru
- `PUT /api/timelogs/:id` - Update time log
- `DELETE /api/timelogs/:id` - Hapus time log

### Reports

- `GET /api/reports/daily` - Get laporan harian
- `GET /api/reports/weekly` - Get laporan mingguan
- `GET /api/reports/monthly` - Get laporan bulanan

## 🎯 Cara Penggunaan

1. **Register**: Buat akun baru di halaman register
2. **Login**: Masuk dengan credentials Anda
3. **Buat Proyek**: Tambahkan proyek baru dari dashboard
4. **Buat Task**: Tambahkan task ke proyek yang sudah dibuat
5. **Track Time**: Mulai tracking waktu kerja pada task
6. **Monitor Progress**: Lihat progress di dashboard
7. **Generate Report**: Buat laporan kerja sesuai periode

## 📊 Database Schema

### Users

- id, name, email, password, role, created_at, updated_at

### Projects

- id, name, description, status, user_id, created_at, updated_at

### Tasks

- id, title, description, status, priority, project_id, assigned_to, due_date, created_at, updated_at

### TimeLogs

- id, task_id, user_id, start_time, end_time, duration, description, created_at, updated_at

## 🤝 Kontribusi

Proyek ini dibuat untuk keperluan skripsi.

## 📄 License

MIT License

---

**Dibuat untuk Skripsi - Sistem Tracking Kerja**
