# Instalasi Aplikasi Tracking Kerja

## Langkah 1: Setup Database MySQL

1. Pastikan MySQL sudah terinstall dan berjalan
2. Buat database baru:
   ```sql
   CREATE DATABASE tracking_kerja CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## Langkah 2: Setup Backend Laravel

1. Masuk ke folder backend:

   ```bash
   cd backend
   ```

2. Install dependencies PHP:

   ```bash
   composer install
   ```

3. Copy file environment (jika belum ada):

   ```bash
   cp .env.example .env
   ```

4. Edit file `.env` sesuaikan dengan konfigurasi MySQL Anda:

   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=tracking_kerja
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   ```

5. Generate application key:

   ```bash
   php artisan key:generate
   ```

6. Jalankan database migrations:

   ```bash
   php artisan migrate
   ```

7. Jalankan server development:

   ```bash
   php artisan serve
   ```

   Backend akan berjalan di: **http://localhost:8000**

## Langkah 3: Setup Frontend React

1. Buka terminal baru, masuk ke folder frontend:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Jalankan development server:

   ```bash
   npm start
   ```

   Frontend akan berjalan di: **http://localhost:3000**

## Langkah 4: Testing Aplikasi

1. Buka browser ke **http://localhost:3000**
2. Klik "Register" untuk membuat akun baru
3. Login dengan akun yang baru dibuat
4. Mulai membuat proyek dan task

## Troubleshooting

### Error: SQLSTATE[HY000] [2002] Connection refused

- Pastikan MySQL sudah berjalan
- Cek kredensial database di file `.env`

### Error: CORS policy

- Pastikan backend berjalan di port 8000
- Cek konfigurasi CORS di `backend/config/cors.php`

### Error: npm install gagal

- Hapus folder `node_modules` dan `package-lock.json`
- Jalankan `npm install` lagi

### Error: composer install gagal

- Pastikan PHP versi 8.2 atau lebih tinggi
- Jalankan `php --version` untuk cek versi PHP
- Pastikan ekstensi PHP yang diperlukan sudah terinstall

## Ekstensi PHP yang Diperlukan

- PHP >= 8.2
- BCMath PHP Extension
- Ctype PHP Extension
- Fileinfo PHP Extension
- JSON PHP Extension
- Mbstring PHP Extension
- OpenSSL PHP Extension
- PDO PHP Extension
- PDO MySQL Extension
- Tokenizer PHP Extension
- XML PHP Extension

## Port yang Digunakan

- Backend (Laravel): **8000**
- Frontend (React): **3000**
- MySQL: **3306**

## Kredensial Default

Tidak ada kredensial default. Anda harus membuat akun baru melalui halaman register.

## Referensi

- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- MySQL Documentation: https://dev.mysql.com/doc/
