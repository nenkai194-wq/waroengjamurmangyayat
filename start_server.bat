@echo off
echo ========================================================
echo   Server Resmi & Backend Waroeng Jamur Mang Yayat
echo ========================================================
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" /c:"Alamat IPv4"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP: =%
echo ========================================================
echo   AKSES FRONTEND WEBSITE:
echo   - Komputer ini (PC):   http://localhost:8080
echo   - HP / Device Lain:    http://%IP%:8080
echo.
echo   AKSES BACKEND ADMIN PANEL:
echo   - Komputer ini (PC):   http://localhost:8080/admin.html
echo   - HP / Device Lain:    http://%IP%:8080/admin.html
echo ========================================================
echo.
echo Pastikan HP dan PC terhubung ke Wi-Fi / jaringan yang sama!
echo Tekan Ctrl+C untuk menghentikan server.
echo.
python server.py
pause
