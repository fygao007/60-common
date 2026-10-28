@echo off
chcp 936 >nul
echo ========================================
echo 正在从 GitHub 拉取最新更新...
echo ========================================
echo.

cd /d "%~dp0"
git pull

echo.
echo ========================================
if %errorlevel% equ 0 (
    echo 更新成功！
) else (
    echo 更新失败，请检查网络或是否有本地修改冲突。
)
echo ========================================
echo.
pause