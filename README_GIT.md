# 🎯 Tracking Kerja Management System

Sistem manajemen tracking kerja berbasis web menggunakan **Laravel 12** (Backend) dan **React 18** (Frontend) dengan fitur role-based access control.

## 📋 Fitur Utama

### 🔐 Role-Based Access Control
- **Admin**: Manajemen penuh sistem, users, dan departments
- **Manager**: Mengelola target dan progress tim
- **Karyawan**: Upload progress dan lihat target pribadi
- **CEO/Boss**: View-only akses ke semua data

### 💼 Manajemen Department
- Dynamic department management (IT & Operasional)
- Job description per department
- Hierarki Manager → Karyawan

### 🎯 Work Target Management
- Buat dan assign target kerja
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (Pending, In Progress, Completed, Overdue)
- Deadline management

### 📊 Progress Tracking
- Upload progress dengan percentage
- Attachment support (gambar & PDF)
- Comment system dengan replies
- Real-time progress updates

### 📈 Dashboard & Reports
- Statistics per role
- Quick actions berdasarkan role
- Activity logs (10 items per page)
- Responsive design

## 🛠️ Tech Stack

**Backend:**
- Laravel 12
- MySQL
- Laravel Sanctum (Authentication)
- RESTful API

**Frontend:**
- React 18
- TailwindCSS
- React Router DOM
- Axios

## 📦 Installation

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL
- Git

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate key
php artisan key:generate

# Configure database di .env
DB_DATABASE=tracking_kerja
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=DepartmentSeeder
php artisan db:seed --class=KaryawanSeeder
php artisan db:seed --class=ManagerOperasionalTargetSeeder

# Run server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build production
npm run build

# Deploy to backend
Copy-Item -Recurse -Force build\* ..\backend\public\
```

## 👥 Default Users

| Role | Email | Password | Department |
|------|-------|----------|------------|
| Admin | admin@trackingkerja.com | password123 | - |
| Manager IT | ahmad.manager@trackingkerja.com | password123 | IT |
| Manager Operasional | hendra.manager@trackingkerja.com | password123 | Operasional |
| Karyawan IT | budi@trackingkerja.com | password123 | IT |
| Karyawan Operasional | rini@trackingkerja.com | password123 | Operasional |
| CEO/Boss | ceo@trackingkerja.com | password123 | - |

## 📁 Project Structure

```
.
├── backend/                # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Providers/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   └── public/           # Deployed React build
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
└── README.md
```

## 🚀 Usage

1. **Start Backend Server:**
   ```bash
   cd backend
   php artisan serve
   ```
   Backend akan berjalan di `http://127.0.0.1:8000`

2. **Access Application:**
   Buka browser: `http://127.0.0.1:8000`

3. **Login dengan role yang sesuai** (lihat tabel Default Users)

## 📖 API Documentation

### Authentication
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Register (admin only)
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout

### Work Targets
- GET `/api/work-targets` - List targets (role-based)
- POST `/api/work-targets` - Create target
- GET `/api/work-targets/{id}` - Get target detail
- PUT `/api/work-targets/{id}` - Update target
- DELETE `/api/work-targets/{id}` - Delete target
- GET `/api/work-targets/subordinates` - Get subordinates
- GET `/api/work-targets/stats` - Get statistics

### Work Progress
- GET `/api/work-progress` - List progress (role-based)
- POST `/api/work-progress` - Upload progress
- GET `/api/work-progress/{id}` - Get progress detail
- PUT `/api/work-progress/{id}` - Update progress
- DELETE `/api/work-progress/{id}` - Delete progress

### Departments (Admin Only)
- GET `/api/departments` - List departments
- POST `/api/departments` - Create department
- GET `/api/departments/{id}` - Get department detail
- PUT `/api/departments/{id}` - Update department
- DELETE `/api/departments/{id}` - Delete department

### Users (Admin Only)
- GET `/api/users` - List users
- POST `/api/users` - Create user
- GET `/api/users/{id}` - Get user detail
- PUT `/api/users/{id}` - Update user
- DELETE `/api/users/{id}` - Delete user
- GET `/api/users/stats` - Get user statistics

### Activity Logs
- GET `/api/activity-logs` - List activity logs
- GET `/api/activity-logs/stats` - Get log statistics

## 🔒 Security

- Authentication menggunakan Laravel Sanctum
- Password hashing dengan bcrypt
- CORS configuration untuk API
- Role-based middleware untuk authorization
- SQL injection protection (Eloquent ORM)

## 📝 License

This project is proprietary software for Tracking Kerja SKRIPSI.

## 👨‍💻 Developer

Developed as part of SKRIPSI project.

## 📞 Support

For support and questions, please contact the administrator.

---

**Last Updated:** February 7, 2026
**Version:** 1.0.0
