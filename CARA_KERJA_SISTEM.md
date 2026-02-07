# 🎯 PT DIGIMALL - Sales & Marketing Tracking System

## Dokumentasi Cara Kerja Sistem

---

## 📋 **OVERVIEW SISTEM**

Aplikasi ini adalah sistem tracking sales & marketing untuk PT Digimall yang mengelola UMKM di marketplace. Sistem menggunakan **role-based access control** dengan 4 level role.

---

## 👥 **ROLE & AKSES**

### **1. ADMIN** 🔐

**Akses Penuh:**

- ✅ Dashboard (melihat semua metrics)
- ✅ Leads Management
- ✅ UMKM Customers Management
- ✅ Sales Targets
- ✅ Marketing Campaigns
- ✅ **User Management** (Eksklusif Admin)
- ✅ Projects & Tasks

**Tanggung Jawab:**

- Mengelola semua user (Create, Edit, Delete)
- Mengubah role user
- Monitor overall performance
- Full control aplikasi

---

### **2. SALES** 💼

**Akses:**

- ✅ Dashboard
- ✅ Leads Management (manage prospek)
- ✅ UMKM Customers (data customer)
- ✅ Sales Targets (target penjualan pribadi & tim)
- ❌ Marketing Campaigns (read-only)
- ❌ User Management (tidak ada akses)

**Tanggung Jawab:**

- Follow up leads
- Convert leads jadi customer
- Maintain customer relationship
- Achieve sales targets

---

### **3. MARKETING** 📢

**Akses:**

- ✅ Dashboard
- ✅ Leads Management (data leads dari campaign)
- ✅ Marketing Campaigns (kelola campaign)
- ❌ Sales Targets (read-only)
- ❌ User Management (tidak ada akses)

**Tanggung Jawab:**

- Buat & kelola campaign
- Generate leads
- Track ROI campaign
- Monitor budget & reach

---

### **4. DEVELOPER** 💻

**Akses:**

- ✅ Dashboard
- ✅ Projects (development projects)
- ✅ Tasks (task management)
- ❌ Sales & Marketing features (limited)

**Tanggung Jawab:**

- Development projects
- Bug fixes & maintenance
- Technical support

---

## 🚀 **CARA KERJA SISTEM**

### **A. SETUP AWAL (First Time)**

#### **1. Database Setup**

```bash
# Backend terminal
cd backend
php artisan migrate        # Buat semua tabel
php artisan db:seed --class=AdminSeeder  # Create default users
```

#### **2. Start Servers**

```bash
# Terminal 1 - Backend
cd backend
php artisan serve  # Running di http://localhost:8000

# Terminal 2 - Frontend
cd frontend
npm start  # Running di http://localhost:3000
```

---

### **B. DEFAULT USERS (Sudah di-Seed)**

| Email              | Password | Role      |
| ------------------ | -------- | --------- |
| admin@digimall.com | admin123 | **Admin** |
| budi@digimall.com  | password | Sales     |
| siti@digimall.com  | password | Marketing |
| andi@digimall.com  | password | Developer |

---

### **C. ALUR KERJA HARIAN**

#### **👤 ADMIN - Pagi Hari**

1. Login sebagai admin
2. Cek Dashboard → Overall metrics
3. User Management → Cek apakah ada request user baru (kalau ada fitur approval)
4. Tambah user baru untuk karyawan baru:
   - Klik "User Management" di sidebar
   - Klik "Tambah User"
   - Isi: Nama, Email, Password, Pilih Role
   - Submit
5. Karyawan login dengan kredensial yang dibuat admin

---

#### **💼 SALES TEAM - Daily Routine**

1. Login dengan akun sales
2. Dashboard → Cek target & achievement hari ini
3. **Leads:**
   - Buka "Leads" menu
   - Filter status: "New", "Contacted"
   - Follow up via WhatsApp/Phone
   - Update status lead: Qualified → Proposal → Won/Lost
4. **Customers:**
   - Buka "UMKM" menu
   - Cek customer yang perlu di-maintain
   - Update data customer (revenue, products, dll)
5. **Sales Targets:**
   - Monitor pencapaian vs target
   - Lihat ranking tim

---

#### **📢 MARKETING TEAM - Campaign Workflow**

1. Login dengan akun marketing
2. Dashboard → Cek campaign performance
3. **Create Campaign:**
   - Klik "Marketing" menu
   - "Tambah Campaign"
   - Isi: Nama, Type (Social Media/Ads/etc), Budget, Target Reach
   - Submit
4. **Track Campaign:**
   - Update Actual Reach
   - Update Leads Generated
   - Monitor ROI
5. **Leads dari Campaign:**
   - Export leads → Kirim ke Sales Team
   - Sales team follow up

---

### **D. USER MANAGEMENT (Admin Only)**

#### **Cara Menambah User Baru:**

1. Login sebagai admin
2. Sidebar → "User Management"
3. Klik tombol "Tambah User"
4. Form:
   ```
   Nama: [Nama Karyawan]
   Email: [email@digimall.com]
   Password: [temporary_password]
   Role: [Pilih: Admin/Sales/Marketing/Developer]
   ```
5. Klik "Tambah"
6. **Informasikan kredensial ke karyawan** via email/chat

#### **Cara Edit User:**

1. User Management page
2. Klik "Edit" pada user yang ingin diubah
3. Update data (nama, email, role)
4. Password: Kosongkan jika tidak ingin mengubah
5. Klik "Update"

#### **Cara Hapus User:**

1. User Management page
2. Klik "Hapus" pada user
3. Konfirmasi delete
4. ⚠️ **Tidak bisa hapus akun sendiri**

---

### **E. SECURITY & PERMISSIONS**

#### **Route Protection:**

- ✅ Semua route butuh login (token-based)
- ✅ `/api/users/*` → Admin only (middleware `role:admin`)
- ✅ Frontend route `/users` → Admin only (AdminRoute component)
- ❌ Non-admin coba akses `/users` → Redirect ke dashboard

#### **API Endpoints:**

```
Public:
POST /api/auth/register  (❌ Bisa di-disable untuk production)
POST /api/auth/login

Protected (All authenticated users):
GET  /api/leads
POST /api/leads
GET  /api/customers
POST /api/customers
GET  /api/marketing
POST /api/marketing

Admin Only:
GET    /api/users        (List all users)
POST   /api/users        (Create user)
PUT    /api/users/{id}   (Update user)
DELETE /api/users/{id}   (Delete user)
GET    /api/users/stats  (User statistics)
```

---

## 🔒 **REKOMENDASI PRODUCTION**

### **1. Disable Public Registration**

Untuk security, **disable** public registration:

**File:** `backend/routes/api.php`

```php
// Comment atau hapus line ini:
// Route::post('/auth/register', [AuthController::class, 'register']);
```

**File:** `frontend/src/pages/Login.js`

```javascript
// Remove link to register page
// Atau hide button "Daftar Sekarang"
```

### **2. Strong Password Policy**

Update validation di `UserController.php`:

```php
'password' => 'required|string|min:8|regex:/[A-Z]/|regex:/[0-9]/',
```

### **3. Email Notification**

Kirim email otomatis saat admin create user baru dengan kredensial temporary.

### **4. Force Password Change**

User pertama kali login harus ganti password.

---

## 📊 **FLOW DIAGRAM**

```
┌──────────────┐
│   REGISTER   │ ❌ Disabled di Production
└──────────────┘

┌──────────────┐
│   ADMIN      │
│   LOGIN      │
└──────┬───────┘
       │
       ├─► Dashboard (Metrics Overview)
       ├─► User Management
       │   ├─► Create User (Sales/Marketing/Developer)
       │   ├─► Edit User Role
       │   └─► Delete User
       ├─► Leads Management
       ├─► Customers Management
       ├─► Sales Targets
       ├─► Marketing Campaigns
       └─► Projects & Tasks

┌──────────────┐
│   SALES      │
│   LOGIN      │
└──────┬───────┘
       │
       ├─► Dashboard
       ├─► Manage Leads
       │   ├─► Follow Up
       │   ├─► Update Status
       │   └─► Convert to Customer
       ├─► View Customers
       └─► Track Sales Targets

┌──────────────┐
│  MARKETING   │
│   LOGIN      │
└──────┬───────┘
       │
       ├─► Dashboard
       ├─► Create Campaign
       ├─► Track Campaign Performance
       └─► View Leads from Campaign

┌──────────────┐
│  DEVELOPER   │
│   LOGIN      │
└──────┬───────┘
       │
       ├─► Dashboard
       ├─► Manage Projects
       └─► Track Tasks
```

---

## 🎓 **TRAINING CHECKLIST**

### **Admin Training:**

- [x] Cara login
- [x] Cara tambah user baru
- [x] Cara edit user & change role
- [x] Cara delete user
- [x] Monitoring overall dashboard

### **Sales Training:**

- [x] Cara manage leads
- [x] Cara update customer data
- [x] Cara lihat sales target
- [x] Filter & search leads

### **Marketing Training:**

- [x] Cara buat campaign
- [x] Cara track campaign performance
- [x] Cara lihat ROI
- [x] Export leads untuk sales team

---

## 🆘 **TROUBLESHOOTING**

### **"Forbidden 403" saat akses User Management**

- ✅ Pastikan login sebagai **admin**
- ✅ Cek localStorage: `user.role === 'admin'`
- ✅ Logout dan login ulang

### **"Cannot create user"**

- ✅ Cek email belum terdaftar
- ✅ Password minimal 6 karakter
- ✅ Role harus valid (admin/sales/marketing/developer)

### **"User tidak bisa login"**

- ✅ Cek email & password benar
- ✅ Cek user sudah di-create oleh admin
- ✅ Backend server running (port 8000)

---

## 📞 **SUPPORT**

Jika ada pertanyaan atau issue:

1. Cek dokumentasi ini
2. Cek console browser (F12) untuk error
3. Cek terminal backend untuk error log
4. Contact IT Team (Developer role)

---

**PT Digimall © 2026**
_Sales & Marketing Tracking System_
