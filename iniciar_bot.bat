@echo off
echo ========================================================
echo PREPARANDO EL BOT AUTOMATICO DE DISCORD
echo ========================================================
echo Instalando dependencias (esto solo tomara unos segundos)...
call cmd /c npm install
echo.
echo Iniciando el bot...
node bot.js
pause
