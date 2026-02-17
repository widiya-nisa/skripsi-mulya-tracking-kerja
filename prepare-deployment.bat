@echo off
echo ========================================
echo  PERSIAPAN DEPLOYMENT KE NIAGAHOSTER
echo ========================================
echo.

echo [1/5] Checking frontend build...
if exist "backend\public\index.html" (
    echo   ✓ Frontend build found
) else (
    echo   ✗ Frontend build NOT found
    echo   Run: cd frontend ^&^& npm run build
    pause
    exit /b 1
)

echo.
echo [2/5] Cleaning temporary files...
if exist "backend\bootstrap\cache\*.php" (
    del /q "backend\bootstrap\cache\*.php" 2>nul
    echo   ✓ Cache cleared
)

echo.
echo [3/5] Checking required files...
if exist "backend\.env.production" (
    echo   ✓ .env.production exists
) else (
    echo   ✗ .env.production NOT found
    pause
    exit /b 1
)

if exist "backend\public\.htaccess" (
    echo   ✓ .htaccess exists
) else (
    echo   ✗ .htaccess NOT found
    pause
    exit /b 1
)

echo.
echo [4/5] Creating deployment package...
echo   Creating backend-deploy.zip...

if exist "backend-deploy.zip" (
    del /q "backend-deploy.zip"
)

powershell -Command "Compress-Archive -Path 'backend\*' -DestinationPath 'backend-deploy.zip' -Force"

if exist "backend-deploy.zip" (
    echo   ✓ Package created: backend-deploy.zip
) else (
    echo   ✗ Failed to create package
    pause
    exit /b 1
)

echo.
echo [5/5] Deployment package ready!
echo.
echo ========================================
echo  NEXT STEPS:
echo ========================================
echo 1. Upload backend-deploy.zip ke server
echo 2. Extract di folder /home/user/laravel/
echo 3. Buat file .env dari .env.production
echo 4. Run: php artisan key:generate
echo 5. Run: php artisan migrate --force
echo 6. Run: php artisan db:seed --force
echo.
echo Full guide: DEPLOYMENT_NIAGAHOSTER.md
echo ========================================
echo.
pause
