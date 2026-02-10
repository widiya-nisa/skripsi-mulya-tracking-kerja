@echo off
echo ==========================================
echo Setup Database Seeder
echo ==========================================
echo.

cd backend

echo Running DepartmentSeeder...
php artisan db:seed --class=DepartmentSeeder

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo SUCCESS! Job descriptions telah ditambahkan
    echo ==========================================
    echo.
    echo Total data:
    echo - IT Department: 7 job descriptions
    echo - Operasional: 7 job descriptions  
    echo - Admin: 1 job description
    echo - CEO: 1 job description
    echo.
) else (
    echo.
    echo ==========================================
    echo ERROR! Seeder gagal dijalankan
    echo ==========================================
    echo.
    echo Pastikan:
    echo 1. Database sudah dibuat
    echo 2. File .env sudah dikonfigurasi
    echo 3. Migration sudah dijalankan (php artisan migrate)
    echo.
)

pause
