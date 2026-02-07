# 📝 Cara Push ke GitHub

## 1️⃣ Buat Repository di GitHub

1. Buka https://github.com
2. Login dengan akun GitHub Anda
3. Klik tombol **"New"** atau **"+"** → **"New repository"**
4. Isi form:
   - **Repository name**: `tracking-kerja-skripsi`
   - **Description**: `Sistem Tracking Kerja Management - Laravel + React`
   - **Visibility**: Pilih **Private** atau **Public**
   - ❌ **JANGAN** centang "Add a README file" (sudah ada)
5. Klik **"Create repository"**

## 2️⃣ Connect Local ke GitHub

Setelah repository dibuat, GitHub akan menampilkan instruksi. Pilih yang **"push an existing repository"**:

```bash
cd "C:\Users\A S U S\Downloads\Tracking Kerja SKRIPSI"

# Add remote GitHub repository
git remote add origin https://github.com/USERNAME/tracking-kerja-skripsi.git

# Push ke GitHub
git push -u origin master
```

**Ganti `USERNAME`** dengan username GitHub Anda!

### Contoh:
Jika username GitHub adalah `johndoe`, maka:
```bash
git remote add origin https://github.com/johndoe/tracking-kerja-skripsi.git
git push -u origin master
```

## 3️⃣ Autentikasi GitHub

Saat push pertama kali, GitHub akan meminta autentikasi:

### Option A: Personal Access Token (Recommended)
1. Buka GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Pilih scope: `repo` (full control)
4. Copy token yang dihasilkan
5. Saat diminta password, paste token tersebut

### Option B: GitHub CLI
```bash
# Install GitHub CLI
winget install GitHub.cli

# Login
gh auth login

# Push
git push -u origin master
```

## 4️⃣ Update dan Push Perubahan

Setelah koneksi berhasil, untuk update ke depannya:

```bash
# Add semua perubahan
git add .

# Commit dengan pesan
git commit -m "Your commit message here"

# Push ke GitHub
git push
```

## 📊 Status Repository Saat Ini

✅ Git repository sudah diinisialisasi
✅ 2 commit sudah dibuat:
   - Initial commit (144 files)
   - Add README documentation
✅ Semua file sudah di-track oleh Git
✅ .gitignore sudah dikonfigurasi

## 📂 Yang Di-ignore (Tidak akan di-push)

- `node_modules/`
- `vendor/`
- `backend/.env`
- `backend/storage/logs/`
- `frontend/build/`
- File temporary dan cache

## ⚠️ PENTING!

**JANGAN push file `.env`** karena berisi konfigurasi rahasia seperti:
- Database credentials
- API keys
- APP_KEY Laravel

File `.env` sudah ada di `.gitignore` sehingga tidak akan ter-push.

## 🔄 Clone Repository di Komputer Lain

Setelah push ke GitHub, Anda bisa clone di komputer lain:

```bash
git clone https://github.com/USERNAME/tracking-kerja-skripsi.git
cd tracking-kerja-skripsi

# Setup backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed

# Setup frontend
cd ../frontend
npm install
npm run build
```

## 📱 Branches (Opsional)

Untuk development yang lebih terstruktur:

```bash
# Buat branch baru
git checkout -b development

# Switch ke branch
git checkout master

# Merge branch
git merge development
```

## 🆘 Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/tracking-kerja-skripsi.git
```

### Error: "failed to push some refs"
```bash
git pull origin master --allow-unrelated-histories
git push -u origin master
```

### Lihat remote URL
```bash
git remote -v
```

### Ganti remote URL
```bash
git remote set-url origin https://github.com/USERNAME/tracking-kerja-skripsi.git
```

---

**Selamat! Repository Git Anda sudah siap di-push ke GitHub!** 🎉
